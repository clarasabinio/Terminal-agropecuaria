from django.db import models

class Municipio(models.Model):
    key = models.SlugField(max_length=50, unique=True, verbose_name="Identificador")
    nombre = models.CharField(max_length=100, verbose_name="Nombre Municipio")
    cabecera = models.CharField(max_length=100, verbose_name="Cabecera")
    sheet_id = models.CharField(max_length=150, blank=True, verbose_name="ID de Google Sheets")
    icono = models.CharField(max_length=10, default="🌾", verbose_name="Ícono")

    class Meta:
        verbose_name = "Municipio"
        verbose_name_plural = "Municipios"
        ordering = ['nombre']

    def __str__(self):
        return f"{self.icono} {self.nombre}"


class Contrato(models.Model):
    id_contrato = models.CharField(max_length=50, unique=True, verbose_name="ID Contrato")
    codigo = models.CharField(max_length=50, blank=True, verbose_name="Código")
    municipio = models.ForeignKey(Municipio, on_delete=models.CASCADE, related_name="contratos", verbose_name="Municipio")
    establecimiento = models.CharField(max_length=150, verbose_name="Establecimiento / Campo")
    ubicacion = models.CharField(max_length=200, blank=True, verbose_name="Ubicación")
    arrendador = models.CharField(max_length=150, verbose_name="Arrendador / Propietario")
    arrendatario = models.CharField(max_length=150, default="Administración Rural", verbose_name="Arrendatario")
    campana = models.CharField(max_length=50, default="2024/2025", verbose_name="Campaña")
    superficie_ha = models.DecimalField(max_digits=10, decimal_places=2, default=0.0, verbose_name="Superficie (Ha)")
    cultivo_pactado = models.CharField(max_length=50, default="Soja", verbose_name="Cultivo Pactado")
    modalidad = models.CharField(max_length=50, default="12.0 qq/ha", verbose_name="Modalidad")
    
    kg_pactados = models.DecimalField(max_digits=12, decimal_places=2, default=0.0, verbose_name="Kg Pactados")
    kg_pagados = models.DecimalField(max_digits=12, decimal_places=2, default=0.0, verbose_name="Kg Pagados")
    saldo_kg = models.DecimalField(max_digits=12, decimal_places=2, default=0.0, verbose_name="Saldo en Kg")
    
    precio_tn = models.DecimalField(max_digits=10, decimal_places=2, default=0.0, verbose_name="Precio Tn (USD)")
    total_usd = models.DecimalField(max_digits=12, decimal_places=2, default=0.0, verbose_name="Total USD")
    pagado_usd = models.DecimalField(max_digits=12, decimal_places=2, default=0.0, verbose_name="Pagado USD")
    saldo_usd = models.DecimalField(max_digits=12, decimal_places=2, default=0.0, verbose_name="Saldo USD")
    
    factura_recibida = models.BooleanField(default=False, verbose_name="¿Factura Recibida?")
    estado = models.CharField(max_length=50, default="ACTIVO", verbose_name="Estado")
    fecha_modificacion = models.DateField(auto_now=True, verbose_name="Última Modificación")
    fecha_vencimiento = models.DateField(null=True, blank=True, verbose_name="Fecha de Vencimiento")
    observaciones = models.TextField(blank=True, verbose_name="Observaciones")

    class Meta:
        verbose_name = "Contrato de Arrendamiento"
        verbose_name_plural = "Contratos de Arrendamiento"
        ordering = ['establecimiento']

    def __str__(self):
        return f"{self.establecimiento} ({self.id_contrato})"


class Movimiento(models.Model):
    contrato = models.ForeignKey(Contrato, on_delete=models.CASCADE, related_name="movimientos", verbose_name="Contrato")
    fecha = models.DateField(verbose_name="Fecha de Entrega/Pago")
    remito = models.CharField(max_length=50, blank=True, verbose_name="N° Remito")
    kg_neto = models.DecimalField(max_digits=12, decimal_places=2, default=0.0, verbose_name="Kg Netos")
    chofer = models.CharField(max_length=100, blank=True, verbose_name="Chofer")
    camion = models.CharField(max_length=50, blank=True, verbose_name="Patente Camión")
    observaciones = models.TextField(blank=True, verbose_name="Observaciones")

    class Meta:
        verbose_name = "Movimiento / Entrega"
        verbose_name_plural = "Movimientos y Entregas"
        ordering = ['-fecha', '-id']

    def __str__(self):
        return f"{self.contrato.establecimiento} - {self.fecha} ({self.kg_neto} Kg)"


class CotizacionMercado(models.Model):
    fecha = models.DateTimeField(auto_now=True, verbose_name="Fecha de Actualización")
    dolar_bna_venta = models.DecimalField(max_digits=10, decimal_places=2, default=1535.0, verbose_name="Dólar BNA Venta")
    dolar_bna_compra = models.DecimalField(max_digits=10, decimal_places=2, default=1485.0, verbose_name="Dólar BNA Compra")
    dolar_bna_mayorista = models.DecimalField(max_digits=10, decimal_places=2, default=1514.0, verbose_name="Dólar BNA Mayorista")

    rosario_soja = models.DecimalField(max_digits=12, decimal_places=2, default=342000.0, verbose_name="Soja Rosario ($/Tn)")
    rosario_maiz = models.DecimalField(max_digits=12, decimal_places=2, default=198000.0, verbose_name="Maíz Rosario ($/Tn)")
    rosario_trigo = models.DecimalField(max_digits=12, decimal_places=2, default=245000.0, verbose_name="Trigo Rosario ($/Tn)")
    rosario_girasol = models.DecimalField(max_digits=12, decimal_places=2, default=350000.0, verbose_name="Girasol Rosario ($/Tn)")

    chicago_soja = models.DecimalField(max_digits=10, decimal_places=2, default=382.5, verbose_name="Soja Chicago (USD/Tn)")
    chicago_maiz = models.DecimalField(max_digits=10, decimal_places=2, default=176.4, verbose_name="Maíz Chicago (USD/Tn)")
    chicago_trigo = models.DecimalField(max_digits=10, decimal_places=2, default=215.0, verbose_name="Trigo Chicago (USD/Tn)")
    chicago_girasol = models.DecimalField(max_digits=10, decimal_places=2, default=310.0, verbose_name="Girasol Chicago (USD/Tn)")

    class Meta:
        verbose_name = "Cotización de Mercado"
        verbose_name_plural = "Cotizaciones de Mercado"

    def __str__(self):
        return f"Cotizaciones al {self.fecha.strftime('%d/%m/%Y %H:%M')}"
