from django.urls import path
from . import views

urlpatterns = [
    path('', views.index_view, name='index'),
    path('chatbot/', views.chatbot_view, name='chatbot'),
    path('api/contratos/', views.api_contratos, name='api_contratos'),
    path('api/mercado/', views.api_mercado, name='api_mercado'),
]
