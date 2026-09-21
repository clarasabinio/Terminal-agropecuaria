from django.core.management.base import BaseCommand
from gestion_agro.models import Municipio, Contrato, CotizacionMercado
from datetime import datetime

class Command(BaseCommand):
    help = 'Carga los datos iniciales de municipios y contratos desde las bases consolidadas'

    def handle(self, *args, **options):
        # 1. Crear Municipios
        municipios_data = [
            {
                'key': 'exaltacion',
                'nombre': 'Exaltación de la Cruz',
                'cabecera': 'Capilla del Señor',
                'sheet_id': '14TDx506Vqy2urOyiyn6mtHx7vcc170snJpEozqm4FDQ',
                'icono': '🏛️'
            },
            {
                'key': 'salto',
                'nombre': 'Salto',
                'cabecera': 'Salto',
                'sheet_id': '1i1uAaXBAnjpr8ryUNqeEreix02lcJp70RbwhKbyJIWc',
                'icono': '🌾'
            },
            {
                'key': 'giles',
                'nombre': 'San Andrés de Giles',
                'cabecera': 'San Andrés de Giles',
                'sheet_id': '1herQyCsr6fpyNxjroY74EMw4R-G3v0JfOAWJz3s46ic',
                'icono': '🌻'
            }
        ]

        mun_objs = {}
        for m in municipios_data:
            obj, _ = Municipio.objects.update_or_create(
                key=m['key'],
                defaults=m
            )
            mun_objs[m['key']] = obj
            self.stdout.write(self.style.SUCCESS(f"Municipio registrado: {obj.nombre}"))

        # 2. Contratos Reales Consolidados
        contratos_data = [
            {
                'id_contrato': 'CTR-EX-001',
                'codigo': 'AGRO-EX-01',
                'municipio': mun_objs['exaltacion'],
                'establecimiento': 'Establecimiento La Negrita',
                'ubicacion': 'Capilla del Señor, Exaltación de la Cruz',
                'arrendador': 'Agropecuaria Capilla S.A.',
                'arrendatario': 'Administración Rural',
                'superficie_ha': 350.0,
                'cultivo_pactado': 'Soja',
                'modalidad': '14.0 qq/ha',
                'kg_pactados': 490000.0,
                'kg_pagados': 320000.0,
                'saldo_kg': 170000.0,
                'precio_tn': 298.0,
                'total_usd': 146020.0,
                'pagado_usd': 95360.0,
                'saldo_usd': 50660.0,
                'factura_recibida': True,
                'campana': '2024/2025',
                'estado': 'PARCIAL',
                'fecha_vencimiento': '2026-10-15',
                'observaciones': 'Acopio Cooperativa Capilla del Señor'
            },
            {
                'id_contrato': 'CTR-EX-002',
                'codigo': 'AGRO-EX-02',
                'municipio': mun_objs['exaltacion'],
                'establecimiento': 'Campo Los Cardales',
                'ubicacion': 'Los Cardales, Exaltación de la Cruz',
                'arrendador': 'Sucesión Cardales',
                'arrendatario': 'Cresud S.A.',
                'superficie_ha': 280.0,
                'cultivo_pactado': 'Maíz',
                'modalidad': '38.0 qq/ha',
                'kg_pactados': 1064000.0,
                'kg_pagados': 1064000.0,
                'saldo_kg': 0.0,
                'precio_tn': 185.0,
                'total_usd': 196840.0,
                'pagado_usd': 196840.0,
                'saldo_usd': 0.0,
                'factura_recibida': True,
                'campana': '2024/2025',
                'estado': 'PAGADO',
                'fecha_vencimiento': '2026-08-31',
                'observaciones': 'Liquidación total finalizada'
            },
            {
                'id_contrato': 'CTR-EX-003',
                'codigo': 'AGRO-EX-03',
                'municipio': mun_objs['exaltacion'],
                'establecimiento': 'Chacra El Pavón',
                'ubicacion': 'Pavón, Exaltación de la Cruz',
                'arrendador': 'Fideicomiso Ruta 8 Norte',
                'arrendatario': 'Cerealera del Plata',
                'superficie_ha': 190.0,
                'cultivo_pactado': 'Trigo',
                'modalidad': '24.0 qq/ha',
                'kg_pactados': 456000.0,
                'kg_pagados': 150000.0,
                'saldo_kg': 306000.0,
                'precio_tn': 218.0,
                'total_usd': 99408.0,
                'pagado_usd': 32700.0,
                'saldo_usd': 66708.0,
                'factura_recibida': False,
                'campana': '2025/2026',
                'estado': 'PARCIAL',
                'fecha_vencimiento': '2026-11-30',
                'observaciones': 'Entrega a granel planta Pavón'
            },
            {
                'id_contrato': 'CTR-SA-001',
                'codigo': 'AGRO-SA-01',
                'municipio': mun_objs['salto'],
                'establecimiento': 'Estancia La Invencible',
                'ubicacion': 'Inés Indart, Salto',
                'arrendador': 'Agrícola Ganadera Indart S.A.',
                'arrendatario': 'Los Grobo Agropecuaria',
                'superficie_ha': 650.0,
                'cultivo_pactado': 'Maíz',
                'modalidad': '42.0 qq/ha',
                'kg_pactados': 2730000.0,
                'kg_pagados': 1800000.0,
                'saldo_kg': 930000.0,
                'precio_tn': 182.0,
                'total_usd': 496860.0,
                'pagado_usd': 327600.0,
                'saldo_usd': 169260.0,
                'factura_recibida': True,
                'campana': '2024/2025',
                'estado': 'PARCIAL',
                'fecha_vencimiento': '2026-09-28',
                'observaciones': 'Planta Silos Salto Central'
            },
            {
                'id_contrato': 'CTR-SA-002',
                'codigo': 'AGRO-SA-02',
                'municipio': mun_objs['salto'],
                'establecimiento': 'Lote Arroyo Dulce',
                'ubicacion': 'Arroyo Dulce, Salto',
                'arrendador': 'Familia Rossi Hnos.',
                'arrendatario': 'Administración Rural',
                'superficie_ha': 520.0,
                'cultivo_pactado': 'Soja',
                'modalidad': '15.0 qq/ha',
                'kg_pactados': 780000.0,
                'kg_pagados': 780000.0,
                'saldo_kg': 0.0,
                'precio_tn': 295.0,
                'total_usd': 230100.0,
                'pagado_usd': 230100.0,
                'saldo_usd': 0.0,
                'factura_recibida': True,
                'campana': '2024/2025',
                'estado': 'PAGADO',
                'fecha_vencimiento': '2026-07-31',
                'observaciones': 'Cancelado 100% campaña gruesa'
            },
            {
                'id_contrato': 'CTR-SA-003',
                'codigo': 'AGRO-SA-03',
                'municipio': mun_objs['salto'],
                'establecimiento': 'Campo El Rincón de Berdier',
                'ubicacion': 'Berdier, Salto',
                'arrendador': 'Don Valerio Berdier',
                'arrendatario': 'Cooperativa Agrícola de Salto',
                'superficie_ha': 310.0,
                'cultivo_pactado': 'Trigo',
                'modalidad': '26.0 qq/ha',
                'kg_pactados': 806000.0,
                'kg_pagados': 0.0,
                'saldo_kg': 806000.0,
                'precio_tn': 215.0,
                'total_usd': 173290.0,
                'pagado_usd': 0.0,
                'saldo_usd': 173290.0,
                'factura_recibida': False,
                'campana': '2025/2026',
                'estado': 'PENDIENTE',
                'fecha_vencimiento': '2026-12-15',
                'observaciones': 'Lote de fina próximo a cosecha'
            },
            {
                'id_contrato': 'CTR-GI-001',
                'codigo': 'AGRO-GI-01',
                'municipio': mun_objs['giles'],
                'establecimiento': 'Establecimiento Cucullú',
                'ubicacion': 'Cucullú, San Andrés de Giles',
                'arrendador': 'Agropecuaria Cucullú S.R.L.',
                'arrendatario': 'Administración Rural',
                'superficie_ha': 420.0,
                'cultivo_pactado': 'Soja',
                'modalidad': '13.5 qq/ha',
                'kg_pactados': 567000.0,
                'kg_pagados': 350000.0,
                'saldo_kg': 217000.0,
                'precio_tn': 295.0,
                'total_usd': 167265.0,
                'pagado_usd': 103250.0,
                'saldo_usd': 64015.0,
                'factura_recibida': True,
                'campana': '2024/2025',
                'estado': 'PARCIAL',
                'fecha_vencimiento': '2026-10-20',
                'observaciones': 'Entrega en acopio Giles Ruta 7'
            },
            {
                'id_contrato': 'CTR-GI-002',
                'codigo': 'AGRO-GI-02',
                'municipio': mun_objs['giles'],
                'establecimiento': 'Chacra Villa Ruiz',
                'ubicacion': 'Villa Ruiz, San Andrés de Giles',
                'arrendador': 'Don Horacio Ruiz',
                'arrendatario': 'Molinos Río de la Plata',
                'superficie_ha': 240.0,
                'cultivo_pactado': 'Girasol',
                'modalidad': '11.0 qq/ha',
                'kg_pactados': 264000.0,
                'kg_pagados': 264000.0,
                'saldo_kg': 0.0,
                'precio_tn': 315.0,
                'total_usd': 83160.0,
                'pagado_usd': 83160.0,
                'saldo_usd': 0.0,
                'factura_recibida': True,
                'campana': '2024/2025',
                'estado': 'PAGADO',
                'fecha_vencimiento': '2026-08-15',
                'observaciones': 'Liquidado según fijación Rosario'
            },
            {
                'id_contrato': 'CTR-GI-003',
                'codigo': 'AGRO-GI-03',
                'municipio': mun_objs['giles'],
                'establecimiento': 'Campo Don Segundo',
                'ubicacion': 'Azcuénaga, San Andrés de Giles',
                'arrendador': 'Fideicomiso Azcuénaga Rural',
                'arrendatario': 'Cerealera del Plata',
                'superficie_ha': 480.0,
                'cultivo_pactado': 'Maíz',
                'modalidad': '40.0 qq/ha',
                'kg_pactados': 1920000.0,
                'kg_pagados': 800000.0,
                'saldo_kg': 1120000.0,
                'precio_tn': 180.0,
                'total_usd': 345600.0,
                'pagado_usd': 144000.0,
                'saldo_usd': 201600.0,
                'factura_recibida': False,
                'campana': '2025/2026',
                'estado': 'PARCIAL',
                'fecha_vencimiento': '2026-11-10',
                'observaciones': 'Fijación parcial con BCR'
            }
        ]

        for c in contratos_data:
            dt_venc = None
            if c.get('fecha_vencimiento'):
                dt_venc = datetime.strptime(c['fecha_vencimiento'], '%Y-%m-%d').date()
            c_dict = dict(c)
            c_dict['fecha_vencimiento'] = dt_venc
            obj, _ = Contrato.objects.update_or_create(
                id_contrato=c['id_contrato'],
                defaults=c_dict
            )
            self.stdout.write(self.style.SUCCESS(f"Contrato registrado: {obj.establecimiento} ({obj.id_contrato})"))

        # 3. Cotizaciones de Mercado Iniciales
        CotizacionMercado.objects.get_or_create(
            id=1,
            defaults={
                'dolar_bna_venta': 1535.0,
                'dolar_bna_compra': 1485.0,
                'dolar_bna_mayorista': 1514.0,
                'rosario_soja': 342000.0,
                'rosario_maiz': 198000.0,
                'rosario_trigo': 245000.0,
                'rosario_girasol': 350000.0,
                'chicago_soja': 382.5,
                'chicago_maiz': 176.4,
                'chicago_trigo': 215.0,
                'chicago_girasol': 310.0
            }
        )
        self.stdout.write(self.style.SUCCESS("Cotizaciones iniciales de mercado configuradas."))
        self.stdout.write(self.style.SUCCESS("✓ Carga de datos iniciales finalizada con éxito."))
