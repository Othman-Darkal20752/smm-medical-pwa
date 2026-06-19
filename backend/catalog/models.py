from django.db import models
from django.utils.text import slugify


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
    name = models.CharField(max_length=160, unique=True)
    slug = models.SlugField(max_length=180, unique=True, blank=True, allow_unicode=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "name"]
        verbose_name_plural = "Categories"

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
        (STOCK_AVAILABLE, "Available"),
        (STOCK_REQUEST, "On request"),
        (STOCK_OUT, "Out of stock"),
    ]

    COLOR_CHOICES = [
        ("red", "Red"),
        ("blue", "Blue"),
        ("cyan", "Cyan"),
        ("navy", "Navy"),
    ]

    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products",
    )
    name = models.CharField(max_length=220)
    slug = models.SlugField(max_length=240, unique=True, blank=True, allow_unicode=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="products/", blank=True, null=True)

    price_usd = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    price_syp = models.PositiveBigIntegerField(blank=True, null=True)
    is_price_visible = models.BooleanField(default=True)

    stock_status = models.CharField(
        max_length=20,
        choices=STOCK_CHOICES,
        default=STOCK_AVAILABLE,
    )
    color = models.CharField(max_length=20, choices=COLOR_CHOICES, default="blue")

    is_new = models.BooleanField(default=False)
    is_offer = models.BooleanField(default=False)
    is_best_seller = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = make_unique_slug(self, self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class StoreSettings(models.Model):
    site_name = models.CharField(max_length=180, default="مول صحنايا الطبي")
    english_name = models.CharField(max_length=180, default="SAHNAYA MEDICAL MALL")
    short_name = models.CharField(max_length=50, default="SMM")
    tagline = models.CharField(
        max_length=220,
        default="كل ما يلزم الطبيب والمريض تجده هنا",
    )
    whatsapp_number = models.CharField(max_length=40, default="+963945151299")
    location = models.CharField(max_length=220, default="صحنايا")
    address = models.TextField(blank=True)
    exchange_rate = models.PositiveIntegerField(default=13000)
    logo = models.ImageField(upload_to="settings/", blank=True, null=True)
    products_page_size = models.PositiveIntegerField(default=12)

    class Meta:
        verbose_name = "Store settings"
        verbose_name_plural = "Store settings"

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
    cash_enabled = models.BooleanField(default=True)
    cash_description = models.CharField(
        max_length=240,
        default="الدفع عند استلام الطلب بعد تأكيد التوفر والسعر النهائي.",
    )

    sham_cash_enabled = models.BooleanField(default=True)
    sham_cash_label = models.CharField(max_length=120, default="شام كاش")
    sham_cash_description = models.CharField(
        max_length=240,
        default="يمكن الدفع عبر شام كاش بعد تأكيد الطلب عبر واتساب.",
    )
    sham_cash_qr = models.ImageField(upload_to="payments/", blank=True, null=True)

    whatsapp_enabled = models.BooleanField(default=True)
    whatsapp_description = models.CharField(
        max_length=240,
        default="الاتفاق وتأكيد الطلب مباشرة عبر واتساب.",
    )

    class Meta:
        verbose_name = "Payment settings"
        verbose_name_plural = "Payment settings"

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def __str__(self):
        return "Payment settings"


class HeroSlide(models.Model):
    eyebrow = models.CharField(max_length=120, blank=True)
    title = models.CharField(max_length=220)
    text = models.TextField(blank=True)
    desktop_image = models.ImageField(upload_to="hero/", blank=True, null=True)
    mobile_image = models.ImageField(upload_to="hero/", blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.title
