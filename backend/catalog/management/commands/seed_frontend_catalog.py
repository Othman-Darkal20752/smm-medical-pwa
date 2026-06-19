import json
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction

from catalog.models import Category, PaymentSettings, Product, StoreSettings


VALID_COLORS = {"red", "blue", "cyan", "navy"}


def usd_from_syp(value, exchange_rate):
    if value in (None, ""):
        return None

    try:
        amount = Decimal(str(value))
        rate = Decimal(str(exchange_rate))
    except Exception:
        return None

    if amount <= 0 or rate <= 0:
        return None

    return (amount / rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


class Command(BaseCommand):
    help = "Seed catalog data from frontend exported JSON."

    def add_arguments(self, parser):
        parser.add_argument(
            "--file",
            default="catalog/fixtures/frontend_catalog.json",
            help="Fixture JSON path relative to backend directory.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        backend_root = Path(__file__).resolve().parents[3]
        fixture_path = backend_root / options["file"]

        if not fixture_path.exists():
            raise FileNotFoundError(f"Fixture not found: {fixture_path}")

        data = json.loads(fixture_path.read_text(encoding="utf8"))

        categories = data.get("categories", [])
        products = data.get("products", [])
        store_info = data.get("storeInfo", {})

        store = StoreSettings.load()
        store.site_name = store_info.get("name") or store.site_name
        store.english_name = store_info.get("englishName") or store.english_name
        store.short_name = store_info.get("shortName") or store.short_name
        store.tagline = store_info.get("tagline") or store.tagline
        store.location = store_info.get("location") or store.location
        store.whatsapp_number = (
            store_info.get("whatsapp")
            or store_info.get("whatsappRaw")
            or store.whatsapp_number
        )
        store.exchange_rate = store.exchange_rate or 13000
        store.save()

        payment = PaymentSettings.load()
        payment.save()

        category_map = {}
        created_categories = 0
        updated_categories = 0

        for order, name in enumerate(categories):
            if not name or name == "الكل":
                continue

            category, created = Category.objects.update_or_create(
                name=name,
                defaults={
                    "order": order,
                    "is_active": True,
                },
            )

            category_map[name] = category

            if created:
                created_categories += 1
            else:
                updated_categories += 1

        created_products = 0
        updated_products = 0

        for order, item in enumerate(products):
            name = item.get("name")
            category_name = item.get("category")

            if not name or not category_name:
                continue

            category = category_map.get(category_name)

            if category is None:
                category, _ = Category.objects.get_or_create(
                    name=category_name,
                    defaults={
                        "order": len(category_map) + 1,
                        "is_active": True,
                    },
                )
                category_map[category_name] = category

            price_usd = item.get("priceUsd") or item.get("price_usd")

            if price_usd in (None, ""):
                price_usd = usd_from_syp(item.get("priceValue"), store.exchange_rate)

            is_price_visible = price_usd is not None
            stock_status = Product.STOCK_AVAILABLE if is_price_visible else Product.STOCK_REQUEST

            color = item.get("tone") or "blue"
            if color not in VALID_COLORS:
                color = "blue"

            product, created = Product.objects.update_or_create(
                name=name,
                defaults={
                    "category": category,
                    "description": item.get("description") or "",
                    "price_usd": price_usd,
                    "is_price_visible": is_price_visible,
                    "stock_status": stock_status,
                    "color": color,
                    "is_new": bool(item.get("is_new")),
                    "is_offer": bool(item.get("is_offer")),
                    "is_best_seller": bool(item.get("is_best_seller")),
                    "is_active": True,
                    "order": order,
                },
            )

            if created:
                created_products += 1
            else:
                updated_products += 1

        self.stdout.write(self.style.SUCCESS("Seed completed."))
        self.stdout.write(f"Categories created: {created_categories}")
        self.stdout.write(f"Categories updated: {updated_categories}")
        self.stdout.write(f"Products created: {created_products}")
        self.stdout.write(f"Products updated: {updated_products}")
        self.stdout.write(f"Exchange rate: {store.exchange_rate}")
