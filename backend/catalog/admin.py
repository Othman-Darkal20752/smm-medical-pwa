from django.contrib import admin

from .models import Category, HeroSlide, PaymentSettings, Product, StoreSettings


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "order", "is_active", "updated_at")
    list_editable = ("order", "is_active")
    search_fields = ("name", "slug")
    list_filter = ("is_active",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "price_usd",
        "price_syp",
        "stock_status",
        "is_new",
        "is_offer",
        "is_best_seller",
        "is_active",
        "order",
    )
    list_editable = (
        "price_usd",
        "price_syp",
        "stock_status",
        "is_new",
        "is_offer",
        "is_best_seller",
        "is_active",
        "order",
    )
    search_fields = ("name", "description", "category__name")
    list_filter = (
        "category",
        "stock_status",
        "is_new",
        "is_offer",
        "is_best_seller",
        "is_active",
    )


@admin.register(StoreSettings)
class StoreSettingsAdmin(admin.ModelAdmin):
    fieldsets = (
        ("Brand", {
            "fields": (
                "site_name",
                "english_name",
                "short_name",
                "tagline",
                "logo",
            )
        }),
        ("Contact", {
            "fields": (
                "whatsapp_number",
                "location",
                "address",
            )
        }),
        ("Catalog", {
            "fields": (
                "exchange_rate",
                "products_page_size",
            )
        }),
    )

    def has_add_permission(self, request):
        return not StoreSettings.objects.exists()


@admin.register(PaymentSettings)
class PaymentSettingsAdmin(admin.ModelAdmin):
    fieldsets = (
        ("Cash", {
            "fields": (
                "cash_enabled",
                "cash_description",
            )
        }),
        ("Sham Cash", {
            "fields": (
                "sham_cash_enabled",
                "sham_cash_label",
                "sham_cash_description",
                "sham_cash_qr",
            )
        }),
        ("WhatsApp", {
            "fields": (
                "whatsapp_enabled",
                "whatsapp_description",
            )
        }),
    )

    def has_add_permission(self, request):
        return not PaymentSettings.objects.exists()


@admin.register(HeroSlide)
class HeroSlideAdmin(admin.ModelAdmin):
    list_display = ("title", "eyebrow", "order", "is_active")
    list_editable = ("order", "is_active")
    search_fields = ("title", "eyebrow", "text")
    list_filter = ("is_active",)
