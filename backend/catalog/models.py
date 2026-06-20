from io import BytesIO
from pathlib import Path
from uuid import uuid4

from django.core.files.base import ContentFile
from django.db import models
from django.utils.text import slugify
from PIL import Image, ImageOps


def convert_uploaded_image_to_webp(image_field, prefix="image", quality=82):
    if not image_field or not image_field.name:
        return None

    if image_field.name.lower().endswith(".webp"):
        return None

    try:
        image_field.file.seek(0)
        image = Image.open(image_field.file)
        image = ImageOps.exif_transpose(image)

        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGB")

        image.thumbnail((1400, 1400), Image.Resampling.LANCZOS)

        buffer = BytesIO()
        save_kwargs = {"format": "WEBP", "quality": quality, "method": 6}
        if image.mode == "RGBA":
            save_kwargs["lossless"] = False

        image.save(buffer, **save_kwargs)
        buffer.seek(0)

        base_name = Path(image_field.name).stem or prefix
        safe_name = slugify(base_name, allow_unicode=True) or prefix
        file_name = f"{safe_name}-{uuid4().hex[:8]}.webp"

        return ContentFile(buffer.getvalue(), name=file_name)
    except Exception:
        image_field.file.seek(0)
        return None


def make_unique_slug(instance, value):
    base_slug = slugify(value, allow_unicode=True) or "item"
    slug = base_slug
    model = instance.__class__
    counter = 2

    while model.objects.filter(slug=slug).exclude(pk=instance.pk).exists():
        slug = f"{base_slug}-{counter}"
        counter += 1

    return slug


class Category(models.Model):
    name = models.CharField("اسم التصنيف", max_length=160, unique=True)
    slug = models.SlugField(
        "الرابط المختصر",
        max_length=180,
        unique=True,
        blank=True,
        allow_unicode=True,
        help_text="يُنشأ تلقائياً إذا تركته فارغاً.",
    )
    order = models.PositiveIntegerField("الترتيب", default=0)
    is_active = models.BooleanField("مفعل", default=True)
    created_at = models.DateTimeField("تاريخ الإنشاء", auto_now_add=True)
    updated_at = models.DateTimeField("آخر تحديث", auto_now=True)

    class Meta:
        ordering = ["order", "name"]
        verbose_name = "تصنيف"
        verbose_name_plural = "التصنيفات"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = make_unique_slug(self, self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    STOCK_AVAILABLE = "available"
    STOCK_REQUEST = "request"
    STOCK_OUT = "out_of_stock"

    STOCK_CHOICES = [
        (STOCK_AVAILABLE, "متوفر"),
        (STOCK_REQUEST, "عند الطلب"),
        (STOCK_OUT, "غير متوفر"),
    ]

    COLOR_CHOICES = [
        ("red", "أحمر"),
        ("blue", "أزرق"),
        ("cyan", "سماوي"),
        ("navy", "كحلي"),
    ]

    category = models.ForeignKey(
        Category,
        verbose_name="التصنيف",
        on_delete=models.PROTECT,
        related_name="products",
    )
    name = models.CharField("اسم المنتج", max_length=220)
    slug = models.SlugField(
        "الرابط المختصر",
        max_length=240,
        unique=True,
        blank=True,
        allow_unicode=True,
        help_text="يُنشأ تلقائياً إذا تركته فارغاً.",
    )
    description = models.TextField("وصف المنتج", blank=True)
    image = models.ImageField("صورة المنتج", upload_to="products/", blank=True, null=True)

    price_usd = models.DecimalField(
        "السعر بالدولار",
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
    )
    is_price_visible = models.BooleanField("إظهار السعر", default=True)

    stock_status = models.CharField(
        "حالة التوفر",
        max_length=20,
        choices=STOCK_CHOICES,
        default=STOCK_AVAILABLE,
    )
    color = models.CharField("لون بطاقة المنتج", max_length=20, choices=COLOR_CHOICES, default="blue")

    is_new = models.BooleanField("جديد", default=False)
    is_offer = models.BooleanField("عرض", default=False)
    is_best_seller = models.BooleanField("الأكثر طلباً", default=False)
    is_active = models.BooleanField("مفعل", default=True)

    order = models.PositiveIntegerField("الترتيب", default=0)
    created_at = models.DateTimeField("تاريخ الإنشاء", auto_now_add=True)
    updated_at = models.DateTimeField("آخر تحديث", auto_now=True)

    class Meta:
        ordering = ["order", "-created_at"]
        verbose_name = "منتج"
        verbose_name_plural = "المنتجات"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = make_unique_slug(self, self.name)

        converted_image = convert_uploaded_image_to_webp(self.image, prefix="product")
        if converted_image is not None:
            self.image = converted_image

        super().save(*args, **kwargs)

    def calculated_price_syp(self):
        if self.price_usd is None:
            return None

        settings = StoreSettings.load()
        return int(round(float(self.price_usd) * settings.exchange_rate))

    calculated_price_syp.short_description = "السعر بالليرة السورية"

    def __str__(self):
        return self.name


class StoreSettings(models.Model):
    site_name = models.CharField("اسم الموقع", max_length=180, default="مول صحنايا الطبي")
    english_name = models.CharField("الاسم الإنكليزي", max_length=180, default="SAHNAYA MEDICAL MALL")
    short_name = models.CharField("الاسم المختصر", max_length=50, default="SMM")
    tagline = models.CharField(
        "الشعار النصي",
        max_length=220,
        default="كل ما يلزم الطبيب والمريض تجده هنا",
    )
    whatsapp_number = models.CharField("رقم الواتساب", max_length=40, default="+963945151299")
    location = models.CharField("الموقع المختصر", max_length=220, default="صحنايا")
    address = models.TextField("العنوان التفصيلي", blank=True)
    exchange_rate = models.PositiveIntegerField("سعر صرف الدولار", default=13000)
    logo = models.ImageField("الشعار", upload_to="settings/", blank=True, null=True)
    products_page_size = models.PositiveIntegerField("عدد المنتجات في الصفحة", default=12)

    class Meta:
        verbose_name = "إعدادات المتجر"
        verbose_name_plural = "إعدادات المتجر"

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def __str__(self):
        return self.site_name


class PaymentSettings(models.Model):
    cash_enabled = models.BooleanField("تفعيل الدفع عند الاستلام", default=True)
    cash_description = models.CharField(
        "وصف الدفع عند الاستلام",
        max_length=240,
        default="الدفع عند استلام الطلب بعد تأكيد التوفر والسعر النهائي.",
    )

    sham_cash_enabled = models.BooleanField("تفعيل شام كاش", default=True)
    sham_cash_label = models.CharField("اسم طريقة الدفع", max_length=120, default="شام كاش")
    sham_cash_description = models.CharField(
        "وصف شام كاش",
        max_length=240,
        default="يمكن الدفع عبر شام كاش بعد تأكيد الطلب عبر واتساب.",
    )
    sham_cash_qr = models.ImageField("صورة QR شام كاش", upload_to="payments/", blank=True, null=True)

    whatsapp_enabled = models.BooleanField("تفعيل الطلب عبر واتساب", default=True)
    whatsapp_description = models.CharField(
        "وصف واتساب",
        max_length=240,
        default="الاتفاق وتأكيد الطلب مباشرة عبر واتساب.",
    )

    class Meta:
        verbose_name = "إعدادات الدفع"
        verbose_name_plural = "إعدادات الدفع"

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def __str__(self):
        return "إعدادات الدفع"


class HeroSlide(models.Model):
    eyebrow = models.CharField("النص الصغير فوق العنوان", max_length=120, blank=True)
    title = models.CharField("عنوان الشريحة", max_length=220)
    text = models.TextField("نص الشريحة", blank=True)
    desktop_image = models.ImageField("صورة الديسكتوب", upload_to="hero/", blank=True, null=True)
    mobile_image = models.ImageField("صورة الجوال", upload_to="hero/", blank=True, null=True)
    order = models.PositiveIntegerField("الترتيب", default=0)
    is_active = models.BooleanField("مفعلة", default=True)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "شريحة رئيسية"
        verbose_name_plural = "شرائح الواجهة الرئيسية"

    def __str__(self):
        return self.title
