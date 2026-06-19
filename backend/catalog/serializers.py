from rest_framework import serializers

from .models import Category, HeroSlide, PaymentSettings, Product, StoreSettings


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


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)

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


class StoreSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreSettings
        fields = (
            "site_name",
            "english_name",
            "short_name",
            "tagline",
            "whatsapp_number",
            "location",
            "address",
            "exchange_rate",
            "logo",
            "products_page_size",
        )


class PaymentSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentSettings
        fields = (
            "cash_enabled",
            "cash_description",
            "sham_cash_enabled",
            "sham_cash_label",
            "sham_cash_description",
            "sham_cash_qr",
            "whatsapp_enabled",
            "whatsapp_description",
        )


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
