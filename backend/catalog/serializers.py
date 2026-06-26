from rest_framework import serializers

from .models import Category, HeroSlide, OfferBanner, PaymentSettings, Product, StoreSettings


class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "slug",
            "order",
            "is_active",
            "products_count",
        )
        read_only_fields = ("slug", "products_count")


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        source="category",
        queryset=Category.objects.all(),
        write_only=True,
    )
    price_syp = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "category",
            "category_id",
            "name",
            "slug",
            "description",
            "image",
            "price_usd",
            "price_syp",
            "is_price_visible",
            "stock_status",
            "color",
            "is_new",
            "is_offer",
            "is_best_seller",
            "is_active",
            "order",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("slug", "price_syp", "created_at", "updated_at")

    def get_price_syp(self, obj):
        return obj.calculated_price_syp()


class StoreSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreSettings
        fields = (
            "id",
            "site_name",
            "english_name",
            "short_name",
            "tagline",
            "whatsapp_number",
            "facebook_url",
            "location",
            "address",
            "map_url",
            "shipping_note",
            "exchange_rate",
            "products_page_size",
            "logo",
            "app_icon",
            "static_hero_desktop",
            "static_hero_mobile",
            "show_hero_section",
            "show_offers_section",
            "show_new_products_section",
            "show_best_sellers_section",
            "show_categories_section",
        )
        read_only_fields = ("id",)


class PaymentSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentSettings
        fields = (
            "id",
            "cash_enabled",
            "cash_description",
            "sham_cash_enabled",
            "sham_cash_label",
            "sham_cash_description",
            "sham_cash_qr",
            "whatsapp_enabled",
            "whatsapp_description",
        )
        read_only_fields = ("id",)


class HeroSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroSlide
        fields = (
            "id",
            "eyebrow",
            "title",
            "text",
            "desktop_image",
            "mobile_image",
            "order",
            "is_active",
        )


class OfferBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfferBanner
        fields = (
            "id",
            "title",
            "subtitle",
            "image",
            "link_label",
            "link_url",
            "order",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("created_at", "updated_at")
