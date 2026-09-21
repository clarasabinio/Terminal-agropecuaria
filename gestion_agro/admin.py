from django.contrib import admin
from .models import Municipio, Contrato, Movimiento, CotizacionMercado

@admin.register(Municipio)
class MunicipioAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'key', 'cabecera', 'icono', 'sheet_id')
    search_fields = ('nombre', 'cabecera')

class MovimientoInline(admin.TabularInline):
    model = Movimiento
    extra = 1

@admin.register(Contrato)
class ContratoAdmin(admin.ModelAdmin):
    list_display = (
        'establecimiento', 'codigo', 'municipio', 'arrendador', 
        'cultivo_pactado', 'superficie_ha', 'saldo_kg', 'saldo_usd', 
        'estado', 'fecha_vencimiento'
    )
    list_filter = ('municipio', 'cultivo_pactado', 'campana', 'estado', 'factura_recibida')
    search_fields = ('establecimiento', 'codigo', 'arrendador', 'arrendatario')
    inlines = [MovimientoInline]

@admin.register(Movimiento)
class MovimientoAdmin(admin.ModelAdmin):
    list_display = ('contrato', 'fecha', 'remito', 'kg_neto', 'chofer', 'camion')
    list_filter = ('fecha', 'contrato__municipio')
    search_fields = ('remito', 'chofer', 'contrato__establecimiento')

@admin.register(CotizacionMercado)
class CotizacionMercadoAdmin(admin.ModelAdmin):
    list_display = ('fecha', 'dolar_bna_venta', 'rosario_soja', 'rosario_maiz', 'chicago_soja')
