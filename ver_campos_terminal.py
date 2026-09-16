#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
==============================================================================
TERMINAL AGROPECUARIA - VISUALIZADOR DE CAMPOS POR MUNICIPIO EN CONSOLA
==============================================================================
Muestra los campos trabajados vinculados a sus respectivas bases de datos
de Google Sheets en la carpeta oficial de Google Drive.

Hojas de Cálculo Integradas:
1. Exaltación de la Cruz -> ID: 14TDx506Vqy2urOyiyn6mtHx7vcc170snJpEozqm4FDQ
2. Salto                -> ID: 1i1uAaXBAnjpr8ryUNqeEreix02lcJp70RbwhKbyJIWc
3. San Andrés de Giles  -> ID: 1herQyCsr6fpyNxjroY74EMw4R-G3v0JfOAWJz3s46ic
==============================================================================
"""

import sys
import os
import argparse

# Configuración de colores ANSI para la terminal
RESET = "\033[0m"
BOLD = "\033[1m"
DIM = "\033[2m"
ITALIC = "\033[3m"
UNDERLINE = "\033[4m"

# Colores de texto
BLUE = "\033[38;5;39m"
CYAN = "\033[38;5;51m"
GREEN = "\033[38;5;48m"
EMERALD = "\033[38;5;42m"
YELLOW = "\033[38;5;220m"
AMBER = "\033[38;5;214m"
RED = "\033[38;5;196m"
WHITE = "\033[38;5;255m"
GRAY = "\033[38;5;245m"
DARK_GRAY = "\033[38;5;238m"

# Fondos
BG_BLUE = "\033[48;5;24m"
BG_GREEN = "\033[48;5;28m"
BG_AMBER = "\033[48;5;130m"
BG_DARK = "\033[48;5;236m"

BASES_DATOS = [
    {
        "key": "exaltacion",
        "nombre": "Exaltación de la Cruz",
        "provincia": "Buenos Aires",
        "cabecera": "Capilla del Señor",
        "sheet_id": "14TDx506Vqy2urOyiyn6mtHx7vcc170snJpEozqm4FDQ",
        "url": "https://docs.google.com/spreadsheets/d/14TDx506Vqy2urOyiyn6mtHx7vcc170snJpEozqm4FDQ/edit",
        "color": BLUE,
        "bg_color": BG_BLUE,
        "icono": "🏛️",
        "campos": [
            {
                "codigo": "AGRO-EX-01",
                "establecimiento": "Establecimiento La Negrita",
                "localidad": "Capilla del Señor",
                "arrendador": "Agropecuaria Capilla S.A.",
                "arrendatario": "Administración Rural",
                "cultivo": "Soja",
                "modalidad": "14.0 qq/ha",
                "ha": 350,
                "kg_pactados": 490000,
                "kg_pagados": 320000,
                "saldo_kg": 170000,
                "precio_usd_tn": 298.0,
                "total_usd": 146020,
                "pagado_usd": 95360,
                "saldo_usd": 50660,
                "factura": "SI",
                "campana": "2024/2025",
                "estado": "PARCIAL",
                "vencimiento": "2026-10-15",
                "observaciones": "Entrega en Cooperativa Capilla del Señor"
            },
            {
                "codigo": "AGRO-EX-02",
                "establecimiento": "Campo Los Cardales",
                "localidad": "Los Cardales",
                "arrendador": "Sucesión Cardales",
                "arrendatario": "Cresud S.A.",
                "cultivo": "Maíz",
                "modalidad": "38.0 qq/ha",
                "ha": 280,
                "kg_pactados": 1064000,
                "kg_pagados": 1064000,
                "saldo_kg": 0,
                "precio_usd_tn": 185.0,
                "total_usd": 196840,
                "pagado_usd": 196840,
                "saldo_usd": 0,
                "factura": "SI",
                "campana": "2024/2025",
                "estado": "PAGADO",
                "vencimiento": "2026-08-31",
                "observaciones": "Liquidación total finalizada 100%"
            },
            {
                "codigo": "AGRO-EX-03",
                "establecimiento": "Chacra El Pavón",
                "localidad": "Pavón",
                "arrendador": "Fideicomiso Ruta 8 Norte",
                "arrendatario": "Cerealera del Plata",
                "cultivo": "Trigo",
                "modalidad": "24.0 qq/ha",
                "ha": 190,
                "kg_pactados": 456000,
                "kg_pagados": 150000,
                "saldo_kg": 306000,
                "precio_usd_tn": 218.0,
                "total_usd": 99408,
                "pagado_usd": 32700,
                "saldo_usd": 66708,
                "factura": "NO",
                "campana": "2025/2026",
                "estado": "PARCIAL",
                "vencimiento": "2026-11-30",
                "observaciones": "Entrega a granel planta Pavón"
            }
        ]
    },
    {
        "key": "salto",
        "nombre": "Salto",
        "provincia": "Buenos Aires",
        "cabecera": "Salto",
        "sheet_id": "1i1uAaXBAnjpr8ryUNqeEreix02lcJp70RbwhKbyJIWc",
        "url": "https://docs.google.com/spreadsheets/d/1i1uAaXBAnjpr8ryUNqeEreix02lcJp70RbwhKbyJIWc/edit",
        "color": GREEN,
        "bg_color": BG_GREEN,
        "icono": "🌾",
        "campos": [
            {
                "codigo": "AGRO-SA-01",
                "establecimiento": "Estancia La Invencible",
                "localidad": "Inés Indart",
                "arrendador": "Agrícola Ganadera Indart S.A.",
                "arrendatario": "Los Grobo Agropecuaria",
                "cultivo": "Maíz",
                "modalidad": "42.0 qq/ha",
                "ha": 650,
                "kg_pactados": 2730000,
                "kg_pagados": 1800000,
                "saldo_kg": 930000,
                "precio_usd_tn": 182.0,
                "total_usd": 496860,
                "pagado_usd": 327600,
                "saldo_usd": 169260,
                "factura": "SI",
                "campana": "2024/2025",
                "estado": "PARCIAL",
                "vencimiento": "2026-09-28",
                "observaciones": "Planta Silos Salto Central"
            },
            {
                "codigo": "AGRO-SA-02",
                "establecimiento": "Lote Arroyo Dulce",
                "localidad": "Arroyo Dulce",
                "arrendador": "Familia Rossi Hnos.",
                "arrendatario": "Administración Rural",
                "cultivo": "Soja",
                "modalidad": "15.0 qq/ha",
                "ha": 520,
                "kg_pactados": 780000,
                "kg_pagados": 780000,
                "saldo_kg": 0,
                "precio_usd_tn": 295.0,
                "total_usd": 230100,
                "pagado_usd": 230100,
                "saldo_usd": 0,
                "factura": "SI",
                "campana": "2024/2025",
                "estado": "PAGADO",
                "vencimiento": "2026-07-31",
                "observaciones": "Cancelado 100% campaña gruesa"
            },
            {
                "codigo": "AGRO-SA-03",
                "establecimiento": "Campo El Rincón de Berdier",
                "localidad": "Berdier",
                "arrendador": "Don Valerio Berdier",
                "arrendatario": "Cooperativa Agrícola de Salto",
                "cultivo": "Trigo",
                "modalidad": "26.0 qq/ha",
                "ha": 310,
                "kg_pactados": 806000,
                "kg_pagados": 0,
                "saldo_kg": 806000,
                "precio_usd_tn": 215.0,
                "total_usd": 173290,
                "pagado_usd": 0,
                "saldo_usd": 173290,
                "factura": "NO",
                "campana": "2025/2026",
                "estado": "PENDIENTE",
                "vencimiento": "2026-12-15",
                "observaciones": "Lote de fina próximo a cosecha"
            }
        ]
    },
    {
        "key": "giles",
        "nombre": "San Andrés de Giles",
        "provincia": "Buenos Aires",
        "cabecera": "San Andrés de Giles",
        "sheet_id": "1herQyCsr6fpyNxjroY74EMw4R-G3v0JfOAWJz3s46ic",
        "url": "https://docs.google.com/spreadsheets/d/1herQyCsr6fpyNxjroY74EMw4R-G3v0JfOAWJz3s46ic/edit",
        "color": AMBER,
        "bg_color": BG_AMBER,
        "icono": "🌻",
        "campos": [
            {
                "codigo": "AGRO-GI-01",
                "establecimiento": "Establecimiento Cucullú",
                "localidad": "Cucullú",
                "arrendador": "Agropecuaria Cucullú S.R.L.",
                "arrendatario": "Administración Rural",
                "cultivo": "Soja",
                "modalidad": "13.5 qq/ha",
                "ha": 420,
                "kg_pactados": 567000,
                "kg_pagados": 350000,
                "saldo_kg": 217000,
                "precio_usd_tn": 295.0,
                "total_usd": 167265,
                "pagado_usd": 103250,
                "saldo_usd": 64015,
                "factura": "SI",
                "campana": "2024/2025",
                "estado": "PARCIAL",
                "vencimiento": "2026-10-20",
                "observaciones": "Entrega en acopio Giles Ruta 7"
            },
            {
                "codigo": "AGRO-GI-02",
                "establecimiento": "Chacra Villa Ruiz",
                "localidad": "Villa Ruiz",
                "arrendador": "Don Horacio Ruiz",
                "arrendatario": "Molinos Río de la Plata",
                "cultivo": "Girasol",
                "modalidad": "11.0 qq/ha",
                "ha": 240,
                "kg_pactados": 264000,
                "kg_pagados": 264000,
                "saldo_kg": 0,
                "precio_usd_tn": 315.0,
                "total_usd": 83160,
                "pagado_usd": 83160,
                "saldo_usd": 0,
                "factura": "SI",
                "campana": "2024/2025",
                "estado": "PAGADO",
                "vencimiento": "2026-08-15",
                "observaciones": "Liquidado según fijación Rosario"
            },
            {
                "codigo": "AGRO-GI-03",
                "establecimiento": "Campo Don Segundo",
                "localidad": "Azcuénaga",
                "arrendador": "Fideicomiso Azcuénaga Rural",
                "arrendatario": "Cerealera del Plata",
                "cultivo": "Maíz",
                "modalidad": "40.0 qq/ha",
                "ha": 480,
                "kg_pactados": 1920000,
                "kg_pagados": 800000,
                "saldo_kg": 1120000,
                "precio_usd_tn": 180.0,
                "total_usd": 345600,
                "pagado_usd": 144000,
                "saldo_usd": 201600,
                "factura": "NO",
                "campana": "2025/2026",
                "estado": "PARCIAL",
                "vencimiento": "2026-11-10",
                "observaciones": "Fijación parcial con BCR"
            }
        ]
    }
]

def fmt_num(val):
    """Formatea números con separador de miles con punto"""
    return f"{int(val):,}".replace(",", ".")

def fmt_usd(val):
    return f"USD ${int(round(val)):,}".replace(",", ".")

def get_state_badge(estado):
    if estado == "PAGADO":
        return f"{GREEN}{BOLD}✔ PAGADO{RESET}"
    elif estado == "PARCIAL":
        return f"{AMBER}{BOLD}⏳ PARCIAL{RESET}"
    else:
        return f"{RED}{BOLD}✖ PENDIENTE{RESET}"

def get_factura_badge(factura):
    if factura == "SI":
        return f"{GREEN}SI ✅{RESET}"
    return f"{RED}NO ⏳{RESET}"

def print_banner():
    width = 100
    print(f"\n{BOLD}{CYAN}╔{'═' * (width - 2)}╗{RESET}")
    print(f"{BOLD}{CYAN}║{WHITE}{BG_BLUE}{' 🌾 TERMINAL AGROPECUARIA - GESTIÓN MULTI-BASE DE DATOS GOOGLE SHEETS ':^{width-2}}{RESET}{BOLD}{CYAN}║{RESET}")
    print(f"{BOLD}{CYAN}║{' ':^{width-2}}║{RESET}")
    print(f"{BOLD}{CYAN}║{WHITE}  Carpeta Google Drive: {YELLOW}https://drive.google.com/drive/u/0/folders/1gXI7vPM-fuukfDzZcf6ot9urGgU4xxbc{WHITE}{' ' * 4}║{RESET}")
    print(f"{BOLD}{CYAN}╚{'═' * (width - 2)}╝{RESET}\n")

def print_municipio_section(m, idx):
    campos = m["campos"]
    c = m["color"]
    bg = m["bg_color"]
    
    total_ha = sum(item["ha"] for item in campos)
    total_pactado_kg = sum(item["kg_pactados"] for item in campos)
    total_pagado_kg = sum(item["kg_pagados"] for item in campos)
    total_saldo_kg = sum(item["saldo_kg"] for item in campos)
    total_usd = sum(item["total_usd"] for item in campos)
    pagado_usd = sum(item["pagado_usd"] for item in campos)
    saldo_usd = sum(item["saldo_usd"] for item in campos)
    pct = (total_pagado_kg / total_pactado_kg * 100) if total_pactado_kg > 0 else 0
    
    # Encabezado del Municipio y Hoja de Cálculo
    print(f"{BOLD}{WHITE}{bg} {' ' + m['icono'] + ' BASE DE DATOS ' + str(idx) + ': ' + m['nombre'].upper() + ' (' + m['provincia'] + ') ':96}{RESET}")
    print(f"{BOLD}{c}  ├─ Google Sheet ID:{RESET} {WHITE}{BOLD}{m['sheet_id']}{RESET}")
    print(f"{BOLD}{c}  ├─ URL Directa:    {RESET} {UNDERLINE}{GRAY}{m['url']}{RESET}")
    print(f"{BOLD}{c}  └─ Cabecera Rural: {RESET} {WHITE}{m['cabecera']}{RESET}\n")
    
    # Tabla de Campos
    col_w = [12, 28, 14, 9, 7, 13, 13, 14, 13, 11]
    headers = ["CÓDIGO", "ESTABLECIMIENTO", "LOCALIDAD", "CULTIVO", "HAS", "PACTADO (KG)", "PAGADO (KG)", "SALDO (USD)", "FACTURA", "ESTADO"]
    
    header_line = "  " + " │ ".join(f"{h:<{w}}" for h, w in zip(headers, col_w))
    sep_line = "  " + "─┼─".join("─" * w for w in col_w)
    
    print(f"{BOLD}{header_line}{RESET}")
    print(f"{DARK_GRAY}{sep_line}{RESET}")
    
    for row in campos:
        st_badge = get_state_badge(row["estado"])
        fact_badge = get_factura_badge(row["factura"])
        
        line = (
            f"  {BOLD}{row['codigo']:<12}{RESET} │ "
            f"{WHITE}{row['establecimiento']:<28}{RESET} │ "
            f"{GRAY}{row['localidad']:<14}{RESET} │ "
            f"{YELLOW}{row['cultivo']:<9}{RESET} │ "
            f"{row['ha']:>5} Ha │ "
            f"{fmt_num(row['kg_pactados']):>11} Kg │ "
            f"{GREEN}{fmt_num(row['kg_pagados']):>11} Kg{RESET} │ "
            f"{AMBER}{fmt_usd(row['saldo_usd']):>14}{RESET} │ "
            f"{fact_badge:^19} │ "
            f"{st_badge:^19}"
        )
        print(line)
    
    print(f"{DARK_GRAY}{sep_line}{RESET}")
    
    # Resumen del Municipio
    print(f"  {BOLD}{c}∑ TOTALES {m['nombre'].upper()}:{RESET} "
          f"{BOLD}{fmt_num(total_ha)} Ha{RESET} en producción │ "
          f"Pactado: {fmt_num(total_pactado_kg)} Kg ({fmt_num(total_pactado_kg // 100)} qq) │ "
          f"Pagado: {GREEN}{fmt_num(total_pagado_kg)} Kg ({pct:.1f}%){RESET} │ "
          f"Saldo: {AMBER}{fmt_usd(saldo_usd)}{RESET} ({fmt_num(total_saldo_kg)} Kg)")
    print("\n" + "─" * 100 + "\n")

def print_global_summary():
    total_campos = sum(len(m["campos"]) for m in BASES_DATOS)
    total_ha = sum(sum(c["ha"] for c in m["campos"]) for m in BASES_DATOS)
    total_kg_pactados = sum(sum(c["kg_pactados"] for c in m["campos"]) for m in BASES_DATOS)
    total_kg_pagados = sum(sum(c["kg_pagados"] for c in m["campos"]) for m in BASES_DATOS)
    total_saldo_kg = sum(sum(c["saldo_kg"] for c in m["campos"]) for m in BASES_DATOS)
    total_usd = sum(sum(c["total_usd"] for c in m["campos"]) for m in BASES_DATOS)
    total_pagado_usd = sum(sum(c["pagado_usd"] for c in m["campos"]) for m in BASES_DATOS)
    total_saldo_usd = sum(sum(c["saldo_usd"] for c in m["campos"]) for m in BASES_DATOS)
    cumplimiento = (total_kg_pagados / total_kg_pactados * 100) if total_kg_pactados > 0 else 0
    
    print(f"{BOLD}{WHITE}{BG_DARK} {' 📊 RESUMEN CONSOLIDADO - LAS 3 BASES DE DATOS FEDERADAS ':96}{RESET}")
    print(f"{BOLD}{CYAN}  ┌───────────────────────────────┬───────────────────────────────┬───────────────────────────────┐{RESET}")
    print(f"{BOLD}{CYAN}  │{WHITE} Superficie Total en Gestión    {CYAN}│{WHITE} Compromiso Total Granos        {CYAN}│{WHITE} Cumplimiento Global Acumulado  {CYAN}│{RESET}")
    print(f"{BOLD}{CYAN}  │{YELLOW} {fmt_num(total_ha):>10} Hectáreas           {CYAN}│{YELLOW} {fmt_num(total_kg_pactados):>13} Kg ({fmt_num(total_kg_pactados//100)} qq) {CYAN}│{GREEN} {cumplimiento:>11.1f}% completado       {CYAN}│{RESET}")
    print(f"{BOLD}{CYAN}  ├───────────────────────────────┼───────────────────────────────┼───────────────────────────────┤{RESET}")
    print(f"{BOLD}{CYAN}  │{WHITE} Total Pagado a la Fecha        {CYAN}│{WHITE} Saldo Remanente en Granos      {CYAN}│{WHITE} Saldo Remanente en Divisas     {CYAN}│{RESET}")
    print(f"{BOLD}{CYAN}  │{GREEN} {fmt_num(total_kg_pagados):>13} Kg            {CYAN}│{AMBER} {fmt_num(total_saldo_kg):>13} Kg            {CYAN}│{AMBER} {fmt_usd(total_saldo_usd):>17}           {CYAN}│{RESET}")
    print(f"{BOLD}{CYAN}  └───────────────────────────────┴───────────────────────────────┴───────────────────────────────┘{RESET}")
    print(f"\n{BOLD}{GREEN}✔ Todas las 3 bases de datos han sido vinculadas correctamente a la Terminal.{RESET}\n")

def main():
    parser = argparse.ArgumentParser(description="Visualizador de Campos de la Terminal Agropecuaria por Municipio")
    parser.add_argument("--municipio", choices=["exaltacion", "salto", "giles", "todos"], default="todos",
                        help="Filtrar por un municipio específico o ver todos")
    parser.add_argument("--abrir", choices=["exaltacion", "salto", "giles", "drive"],
                        help="Abrir la hoja de cálculo o la carpeta en el navegador web")
    args = parser.parse_args()

    if args.abrir:
        if args.abrir == "drive":
            url = "https://drive.google.com/drive/u/0/folders/1gXI7vPM-fuukfDzZcf6ot9urGgU4xxbc"
        else:
            for m in BASES_DATOS:
                if m["key"] == args.abrir:
                    url = m["url"]
                    break
        print(f"Abriendo en el navegador: {url} ...")
        os.system(f"open '{url}'")
        return

    print_banner()

    filtrados = BASES_DATOS if args.municipio == "todos" else [m for m in BASES_DATOS if m["key"] == args.municipio]

    for idx, m in enumerate(filtrados, 1):
        print_municipio_section(m, idx)

    if args.municipio == "todos":
        print_global_summary()

if __name__ == "__main__":
    main()
