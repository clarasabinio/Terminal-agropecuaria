import json
import requests
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Municipio, Contrato, Movimiento, CotizacionMercado

def index_view(request):
    """Renderiza la Terminal Agropecuaria."""
    return render(request, 'index.html')

def chatbot_view(request):
    """Renderiza el Chatbot Asistente."""
    return render(request, 'chatbot.html')

def api_contratos(request):
    """Endpoint JSON para listar y crear contratos."""
    if request.method == 'GET':
        contratos = Contrato.objects.select_related('municipio').all()
        data = []
        for c in contratos:
            pct = 0.0
            if c.kg_pactados > 0:
                pct = round(float(c.kg_pagados) / float(c.kg_pactados) * 100, 1)
            data.append({
                'id': c.id_contrato,
                'codigo': c.codigo,
                'municipioKey': c.municipio.key,
                'municipioNombre': c.municipio.nombre,
                'establecimiento': c.establecimiento,
                'ubicacion': c.ubicacion,
                'arrendador': c.arrendador,
                'arrendatario': c.arrendatario,
                'campana': c.campana,
                'superficieHa': float(c.superficie_ha),
                'cultivoPactado': c.cultivo_pactado,
                'modalidad': c.modalidad,
                'kgPactados': float(c.kg_pactados),
                'kgPagados': float(c.kg_pagados),
                'saldoKg': float(c.saldo_kg),
                'precioTn': float(c.precio_tn),
                'totalUSD': float(c.total_usd),
                'pagadoUSD': float(c.pagado_usd),
                'saldoUSD': float(c.saldo_usd),
                'facturaRecibida': c.factura_recibida,
                'porcentajeCumplimiento': pct,
                'estado': c.estado,
                'fechaModificacion': str(c.fecha_modificacion),
                'fechaVencimiento': str(c.fecha_vencimiento) if c.fecha_vencimiento else '',
                'observaciones': c.observaciones
            })
        return JsonResponse({'status': 'ok', 'data': data}, safe=False)

    elif request.method == 'POST':
        try:
            payload = json.loads(request.body.decode('utf-8'))
            mun_key = payload.get('municipioKey', 'exaltacion')
            municipio, _ = Municipio.objects.get_or_create(key=mun_key, defaults={'nombre': mun_key.title()})
            
            contrato, created = Contrato.objects.update_or_create(
                id_contrato=payload.get('id', 'CTR-NEW'),
                defaults={
                    'codigo': payload.get('codigo', ''),
                    'municipio': municipio,
                    'establecimiento': payload.get('establecimiento', 'Campo'),
                    'ubicacion': payload.get('ubicacion', ''),
                    'arrendador': payload.get('arrendador', ''),
                    'arrendatario': payload.get('arrendatario', 'Administración Rural'),
                    'campana': payload.get('campana', '2024/2025'),
                    'superficie_ha': payload.get('superficieHa', 0),
                    'cultivo_pactado': payload.get('cultivoPactado', 'Soja'),
                    'modalidad': payload.get('modalidad', '12.0 qq/ha'),
                    'kg_pactados': payload.get('kgPactados', 0),
                    'kg_pagados': payload.get('kgPagados', 0),
                    'saldo_kg': payload.get('saldoKg', 0),
                    'precio_tn': payload.get('precioTn', 0),
                    'total_usd': payload.get('totalUSD', 0),
                    'pagado_usd': payload.get('pagadoUSD', 0),
                    'saldo_usd': payload.get('saldoUSD', 0),
                    'factura_recibida': bool(payload.get('facturaRecibida', False)),
                    'fecha_vencimiento': payload.get('fechaVencimiento') or None,
                    'observaciones': payload.get('observaciones', '')
                }
            )
            return JsonResponse({'status': 'ok', 'created': created, 'id': contrato.id_contrato})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@csrf_exempt
def api_mercado(request):
    """Endpoint JSON para cotizaciones de mercado (Dólar y Cereales)."""
    if request.method == 'GET':
        market = {
            'dolarBNA': {
                'compra': 1485,
                'venta': 1535,
                'mayorista': 1514,
            },
            'rosario': {
                'soja': 342000,
                'maiz': 198000,
                'trigo': 245000,
                'girasol': 350000,
            },
            'chicago': {
                'soja': 382.5,
                'maiz': 176.4,
                'trigo': 215.0,
                'girasol': 310.0,
            }
        }
        # Intentar consultar DolarApi oficial
        try:
            r_oficial = requests.get('https://dolarapi.com/v1/dolares/oficial', timeout=3)
            if r_oficial.status_code == 200:
                data = r_oficial.json()
                if 'venta' in data: market['dolarBNA']['venta'] = data['venta']
                if 'compra' in data: market['dolarBNA']['compra'] = data['compra']
            
            r_may = requests.get('https://dolarapi.com/v1/dolares/mayorista', timeout=3)
            if r_may.status_code == 200:
                data_m = r_may.json()
                if 'venta' in data_m: market['dolarBNA']['mayorista'] = data_m['venta']
        except Exception:
            pass

        # Si hay cotización guardada en DB, mezclarla
        db_rate = CotizacionMercado.objects.order_by('-fecha').first()
        if db_rate:
            market['rosario']['soja'] = float(db_rate.rosario_soja)
            market['rosario']['maiz'] = float(db_rate.rosario_maiz)
            market['rosario']['trigo'] = float(db_rate.rosario_trigo)
            market['rosario']['girasol'] = float(db_rate.rosario_girasol)
            market['chicago']['soja'] = float(db_rate.chicago_soja)
            market['chicago']['maiz'] = float(db_rate.chicago_maiz)
            market['chicago']['trigo'] = float(db_rate.chicago_trigo)
            market['chicago']['girasol'] = float(db_rate.chicago_girasol)

        return JsonResponse(market)

    elif request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            CotizacionMercado.objects.create(
                dolar_bna_venta=data.get('dolarBNA', {}).get('venta', 1535),
                dolar_bna_compra=data.get('dolarBNA', {}).get('compra', 1485),
                dolar_bna_mayorista=data.get('dolarBNA', {}).get('mayorista', 1514),
                rosario_soja=data.get('rosario', {}).get('soja', 342000),
                rosario_maiz=data.get('rosario', {}).get('maiz', 198000),
                rosario_trigo=data.get('rosario', {}).get('trigo', 245000),
                rosario_girasol=data.get('rosario', {}).get('girasol', 350000),
                chicago_soja=data.get('chicago', {}).get('soja', 382.5),
                chicago_maiz=data.get('chicago', {}).get('maiz', 176.4),
                chicago_trigo=data.get('chicago', {}).get('trigo', 215.0),
                chicago_girasol=data.get('chicago', {}).get('girasol', 310.0),
            )
            return JsonResponse({'status': 'ok'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
