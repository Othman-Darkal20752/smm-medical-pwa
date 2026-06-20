from django.contrib import admin

from .models import Category, HeroSlide, PaymentSettings, Product, StoreSettings

admin.site.site_header = "لوحة إدارة مول صحنايا الطبي"
admin.site.site_title = "إدارة SMM"
admin.site.index_title = "إدارة محتوى الموقع"


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "order", "is_active", "updated_at")
    list_editable = ("order", "is_active")
    search_fields = ("name", "slug")
    list_filter = ("is_active",)
    ordering = ("order", "name")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "price_usd",
        "calculated_price_syp",
        "stock_status",
        "is_new",
        "is_offer",
        "is_best_seller",
        "is_active",
        "order",
    )
    list_editable = (
        "price_usd",
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
    ordering = ("order", "-created_at")
    readonly_fields = ("created_at", "updated_at", "calculated_price_syp")
    fieldsets = (
        ("معلومات المنتج", {
            "fields": (
                "category",
                "name",
                "slug",
                "description",
                "image",
            )
        }),
        ("السعر والتوفر", {
            "fields": (
                "price_usd",
                "calculated_price_syp",
                "is_price_visible",
                "stock_status",
            )
        }),
        ("إعدادات الظهور", {
            "fields": (
                "color",
                "is_new",
                "is_offer",
                "is_best_seller",
                "is_active",
                "order",
            )
        }),
        ("معلومات النظام", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )


@admin.register(StoreSettings)
class StoreSettingsAdmin(admin.ModelAdmin):
    fieldsets = (
        ("هوية المتجر", {
            "fields": (
                "site_name",
                "english_name",
                "short_name",
                "tagline",
                "logo",
            )
        }),
        ("معلومات التواصل", {
            "fields": (
                "whatsapp_number",
                "location",
                "address",
            )
        }),
        ("إعدادات الكتالوج", {
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
        ("الدفع عند الاستلام", {
            "fields": (
                "cash_enabled",
                "cash_description",
            )
        }),
        ("شام كاش", {
            "fields": (
                "sham_cash_enabled",
                "sham_cash_label",
                "sham_cash_description",
                "sham_cash_qr",
            )
        }),
        ("واتساب", {
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
    ordering = ("order", "id")
    fieldsets = (
        ("محتوى الشريحة", {
            "fields": (
                "eyebrow",
                "title",
                "text",
            )
        }),
        ("الصور", {
            "fields": (
                "desktop_image",
                "mobile_image",
            )
        }),
        ("إعدادات الظهور", {
            "fields": (
                "order",
                "is_active",
            )
        }),
    )
