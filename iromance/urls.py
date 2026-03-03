from django.contrib import admin
from django.urls import path
from iromance_api.views import age_calculator, age_api

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", age_calculator, name="age_calculator"),
    path("api/age/", age_api, name="age_api"),
]