from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('', include('hello_azure.urls')),
    path('admin/', admin.site.urls),
]
