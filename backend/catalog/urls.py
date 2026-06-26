from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminCategoryViewSet,
    AdminHeroSlideViewSet,
    AdminOfferBannerViewSet,
    AdminProductViewSet,
    admin_login,
    CategoryViewSet,
    HeroSlideViewSet,
    OfferBannerViewSet,
    ProductViewSet,
    admin_payment_settings,
    admin_site_settings,
    site_settings,
)

public_router = DefaultRouter()
public_router.register("categories", CategoryViewSet, basename="category")
public_router.register("products", ProductViewSet, basename="product")
public_router.register("hero-slides", HeroSlideViewSet, basename="hero-slide")
public_router.register("offer-banners", OfferBannerViewSet, basename="offer-banner")

admin_router = DefaultRouter()
admin_router.register("categories", AdminCategoryViewSet, basename="admin-category")
admin_router.register("products", AdminProductViewSet, basename="admin-product")
admin_router.register("hero-slides", AdminHeroSlideViewSet, basename="admin-hero-slide")
admin_router.register("offer-banners", AdminOfferBannerViewSet, basename="admin-offer-banner")

urlpatterns = [
    path("", include(public_router.urls)),
    path("settings/", site_settings, name="site-settings"),
    path("admin/login/", admin_login, name="admin-login"),
    path("admin/settings/", admin_site_settings, name="admin-site-settings"),
    path("admin/payment-settings/", admin_payment_settings, name="admin-payment-settings"),
    path("admin/", include(admin_router.urls)),
]
