from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, HeroSlideViewSet, ProductViewSet, site_settings

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("products", ProductViewSet, basename="product")
router.register("hero-slides", HeroSlideViewSet, basename="hero-slide")

urlpatterns = [
    path("", include(router.urls)),
    path("settings/", site_settings, name="site-settings"),
]
