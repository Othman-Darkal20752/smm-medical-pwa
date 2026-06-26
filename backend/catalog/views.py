from django.conf import settings
from django.contrib.auth import authenticate
from django.db.models import Count, Q
from rest_framework import pagination, permissions, viewsets
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response

from .models import Category, HeroSlide, OfferBanner, PaymentSettings, Product, StoreSettings
from .serializers import (
    CategorySerializer,
    HeroSlideSerializer,
    OfferBannerSerializer,
    PaymentSettingsSerializer,
    ProductSerializer,
    StoreSettingsSerializer,
)


class AdminTokenPermission(permissions.BasePermission):
    message = "غير مصرح. تحقق من رمز دخول لوحة الإدارة."

    def has_permission(self, request, view):
        expected_token = getattr(settings, "SMM_ADMIN_API_TOKEN", "")
        if not expected_token:
            return False

        auth_header = request.headers.get("Authorization", "")
        bearer_token = ""
        if auth_header.lower().startswith("bearer "):
            bearer_token = auth_header[7:].strip()

        provided_token = (
            request.headers.get("X-SMM-Admin-Token")
            or bearer_token
            or request.query_params.get("admin_token")
        )

        return provided_token == expected_token


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


class OfferBannerViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OfferBannerSerializer

    def get_queryset(self):
        return OfferBanner.objects.filter(is_active=True).order_by("order", "id")


class AdminCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [AdminTokenPermission]
    authentication_classes = []

    def get_queryset(self):
        return (
            Category.objects.all()
            .annotate(products_count=Count("products", filter=Q(products__is_active=True)))
            .order_by("order", "name")
        )


class AdminProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [AdminTokenPermission]
    authentication_classes = []
    pagination_class = ProductPagination

    def get_queryset(self):
        queryset = Product.objects.all().select_related("category")

        search = self.request.query_params.get("search") or self.request.query_params.get("q")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(category__name__icontains=search)
            )

        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category_id=category)

        return queryset.order_by("order", "-created_at")


class AdminHeroSlideViewSet(viewsets.ModelViewSet):
    serializer_class = HeroSlideSerializer
    permission_classes = [AdminTokenPermission]
    authentication_classes = []
    queryset = HeroSlide.objects.all().order_by("order", "id")


class AdminOfferBannerViewSet(viewsets.ModelViewSet):
    serializer_class = OfferBannerSerializer
    permission_classes = [AdminTokenPermission]
    authentication_classes = []
    queryset = OfferBanner.objects.all().order_by("order", "id")


@api_view(["GET"])
def site_settings(request):
    store = StoreSettings.load()
    payment = PaymentSettings.load()
    context = {"request": request}

    return Response({
        "store": StoreSettingsSerializer(store, context=context).data,
        "payment": PaymentSettingsSerializer(payment, context=context).data,
    })



@api_view(["POST"])
@permission_classes([permissions.AllowAny])
@authentication_classes([])
def admin_login(request):
    username = (request.data.get("username") or "").strip()
    password = request.data.get("password") or ""

    if not username or not password:
        return Response({"detail": "???? ??? ???????? ????? ??????."}, status=400)

    user = authenticate(request, username=username, password=password)

    if not user or not user.is_active or not user.is_staff:
        return Response({"detail": "?????? ?????? ??? ????? ?? ???????? ?? ???? ?????? ???????."}, status=403)

    token = getattr(settings, "SMM_ADMIN_API_TOKEN", "").strip()
    if not token:
        return Response({"detail": "???? ???? ??????? ??? ????? ??? ???????."}, status=500)

    return Response({
        "token": token,
        "username": user.get_username(),
    })


@api_view(["GET", "PATCH", "PUT"])
@permission_classes([AdminTokenPermission])
def admin_site_settings(request):
    store = StoreSettings.load()
    context = {"request": request}

    if request.method == "GET":
        return Response(StoreSettingsSerializer(store, context=context).data)

    serializer = StoreSettingsSerializer(
        store,
        data=request.data,
        partial=request.method == "PATCH",
        context=context,
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["GET", "PATCH", "PUT"])
@permission_classes([AdminTokenPermission])
def admin_payment_settings(request):
    payment = PaymentSettings.load()
    context = {"request": request}

    if request.method == "GET":
        return Response(PaymentSettingsSerializer(payment, context=context).data)

    serializer = PaymentSettingsSerializer(
        payment,
        data=request.data,
        partial=request.method == "PATCH",
        context=context,
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)
