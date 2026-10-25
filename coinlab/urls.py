from django.urls import path

from . import views

app_name = "coinlab"

urlpatterns = [
    path("", views.index, name="index"),
]
