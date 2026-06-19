from django.db.models import Count, Q
from rest_framework import pagination, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Category, HeroSlide, PaymentSettings, Product, StoreSettings
from .serializers import (
    CategorySerializer,
    HeroSlideSerializer,
    PaymentSettingsSerializer,
    ProductSerializer,
    StoreSettingsSerializer,
)


class ProductPagination(pagination.PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 60


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CategorySerializer

    def get_queryset(self):
        return (
            Category.objects.filter(is_active=True)
            .annotate(products_count=Count("products", filter=Q(products__is_active=True)))
            .order_by("order", "name")
        )


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductSerializer
    pagination_class = ProductPagination

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True).select_related("category")

        category = self.request.query_params.get("category")
        if category and category != "الكل":
            if category.isdigit():
                queryset = queryset.filter(category_id=category)
            else:
                queryset = queryset.filter(category__name=category)

        search = self.request.query_params.get("search") or self.request.query_params.get("q")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(category__name__icontains=search)
            )

        if self.request.query_params.get("is_new") == "true":
            queryset = queryset.filter(is_new=True)

        if self.request.query_params.get("is_offer") == "true":
            queryset = queryset.filter(is_offer=True)

        if self.request.query_params.get("is_best_seller") == "true":
            queryset = queryset.filter(is_best_seller=True)

        return queryset.order_by("order", "-created_at")


class HeroSlideViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = HeroSlideSerializer

    def get_queryset(self):
        return HeroSlide.objects.filter(is_active=True).order_by("order", "id")


@api_view(["GET"])
def site_settings(request):
    store = StoreSettings.load()
    payment = PaymentSettings.load()

    context = {"request": request}

    return Response({
        "store": StoreSettingsSerializer(store, context=context).data,
        "payment": PaymentSettingsSerializer(payment, context=context).data,
    })
