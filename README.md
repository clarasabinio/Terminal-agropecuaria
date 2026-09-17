# Terminal Agropecuaria de Consulta y Gestión de Contratos

Sistema integral de gestión de contratos de arrendamiento agrícola, fijación de granos con cotizaciones de la **Bolsa de Comercio de Rosario (BCR Pizarra)** y del **Mercado de Chicago (CBOT)**, tipos de cambio oficiales del **Banco Nación (BNA)** y federación de múltiples bases de datos en **Google Sheets** organizadas por Municipio.

---

## 🌾 Bases de Datos Municipales Integradas (Google Sheets)

La Terminal se encuentra conectada a la carpeta compartida de Google Drive que contiene las 3 Hojas de Cálculo oficiales correspondientes a las zonas agropecuarias:

| Municipio / Zona | Google Sheet ID | Enlace Directo | Cabecera / Localidades |
| :--- | :--- | :--- | :--- |
| 🏛️ **Exaltación de la Cruz** | `14TDx506Vqy2urOyiyn6mtHx7vcc170snJpEozqm4FDQ` | [Abrir Planilla](https://docs.google.com/spreadsheets/d/14TDx506Vqy2urOyiyn6mtHx7vcc170snJpEozqm4FDQ/edit) | Capilla del Señor, Los Cardales, Pavón |
| 🌾 **Salto** | `1i1uAaXBAnjpr8ryUNqeEreix02lcJp70RbwhKbyJIWc` | [Abrir Planilla](https://docs.google.com/spreadsheets/d/1i1uAaXBAnjpr8ryUNqeEreix02lcJp70RbwhKbyJIWc/edit) | Salto, Inés Indart, Arroyo Dulce, Berdier |
| 🌻 **San Andrés de Giles** | `1herQyCsr6fpyNxjroY74EMw4R-G3v0JfOAWJz3s46ic` | [Abrir Planilla](https://docs.google.com/spreadsheets/d/1herQyCsr6fpyNxjroY74EMw4R-G3v0JfOAWJz3s46ic/edit) | San Andrés de Giles, Cucullú, Villa Ruiz, Azcuénaga |

*Carpeta contenedora en Google Drive:* `https://drive.google.com/drive/u/0/folders/1gXI7vPM-fuukfDzZcf6ot9urGgU4xxbc`

---

## 💻 Visualización en Terminal (CLI y Web)

El sistema ofrece una doble modalidad de visualización:

### 1. Visualizador en Consola / Terminal macOS
Para inspeccionar rápidamente los campos, hectáreas y saldos diferenciados por municipio directamente en la línea de comandos:

```bash
# Opción A: Ejecutar script de Python
python3 ver_campos_terminal.py

# Opción B: Doble clic en el archivo ejecutable de macOS
./Ver_Campos_Terminal.command
```

El visualizador muestra:
- Tablas con formato ANSI enriquecido para cada uno de los 3 municipios.
- Desglose por campo: código, cultivo, hectáreas, quintales/kilos pactados, kilos liquidados, saldo en USD, factura y estado.
- Subtotales métricos por municipio.
- Resumen consolidado federando las 3 bases de datos (3.440 Ha totales).

### 2. Terminal Web Kiosco Interactiva (`Index.html`)
- **Pestaña de Carga Directa a Google Sheets (`➕ Cargar Nuevo Contrato`)**: Accesible directamente desde la barra de navegación de la terminal. Permite seleccionar la base de datos de destino (Exaltación de la Cruz, Salto o San Andrés de Giles), autogenerar códigos, calcular en tiempo real los kilos a pagar y valorización en USD y ARS (cotización BNA), y cuenta con el **Botón de Carga `[ 🚀 CARGAR CONTRATO A HOJAS DE CÁLCULO ]`** para enviar e impactar el registro inmediatamente en la hoja de cálculo de Google Drive correspondiente.
- **Filtro Dinámico por Municipio**: Selector en la barra de herramientas para filtrar los campos por *Todos*, *Exaltación de la Cruz*, *Salto* o *San Andrés de Giles*.
- **Insignias / Badges Visuales**: Cada tarjeta de contrato exhibe una etiqueta distintiva con el color y escudo de su municipio (`badge-municipio-exaltacion`, `badge-municipio-salto`, `badge-municipio-giles`).
- **Planilla Master Multi-Base**: En la solapa de Planilla de Cálculo, se puede conmutar la vista para inspeccionar cada base de datos municipal o ver la consolidación global.
- **Acceso Directo a Drive**: Botón directo para abrir la hoja de cálculo específica de Google Sheets correspondiente al campo.

---

## 📊 Características y Funcionalidades

- **Cotizaciones en Tiempo Real**:
  - Pizarra de la Bolsa de Comercio de Rosario ($ ARS/Tn).
  - Mercado de Chicago CBOT (USD/Tn) para Soja, Maíz, Trigo y Girasol.
  - Dólar Banco Nación (Venta, Mayorista y Compra).
- **Cálculo de Liquidación Automatizado**: Fijación según precio de pizarra Rosario, cálculo de equivalencia en dólares y conversión de quintales/kilos a dinero.
- **Alertas de Vencimiento de Contratos**: Semáforos visuales (Vigente, Próximo, Advertencia, Crítico, Vencido) para control preventivo de renovaciones.
- **Gestión de Pagos y Comprobantes**: Registro de transferencias, e-cheqs y cheques físicos con carga de comprobantes adjuntos a Google Drive.
- **Control de Facturación**: Seguimiento del estado de entrega de factura de alquiler.
- **Fondos Fotográficos Rotativos**: Carrusel de fotos reales de campo en alta definición con rotación automática cada 5 minutos.
- **Modo Kiosco Bloqueado Estricto**:
  - **Bloqueo de la Computadora**: Al activar el modo kiosco, la pantalla se bloquea por completo, ocultando el Dock de macOS, la barra de menús superior y bloqueando el acceso a otras aplicaciones, pestañas y atajos de teclado (Esc, F5, F11, F12, Cmd+R, Cmd+W, Cmd+T, Cmd+Q, etc.).
  - **Uso Exclusivo de la Terminal**: Cualquier persona solo puede interactuar con la Terminal Agropecuaria.
  - **Desbloqueo con Contraseña de Administrador**: Para salir del Modo Kiosco y volver a usar el resto de la computadora normalmente, se debe presionar **`[ 🔒 Salir de Kiosco ]`** e ingresar la contraseña de Administrador (`admin123` o PIN `1234`). Al ingresar la clave correcta, la terminal se desbloquea o se cierra, restaurando automáticamente el escritorio y todas las aplicaciones de la Mac.
  - **Lanzador de 1 Clic para Mac**: Ejecutable `Iniciar_Kiosco.command` con doble clic para abrir Google Chrome en modo Kiosco dedicado sin configurar nada.

---

## 🚀 Estructura de Archivos

```
mi-proyecto-antigravity/
├── Index.html                  # Terminal Web completa (frontend + emulación local)
├── codigo.gs                   # Backend Apps Script con router multi-municipio
├── ver_campos_terminal.py      # Visor CLI en consola Python con tablas y métricas
├── Ver_Campos_Terminal.command # Lanzador de terminal con doble clic para macOS
├── Iniciar_Kiosco.command      # Lanzador de la Terminal en Modo Kiosco Chrome
├── MANUAL_DE_USO.txt           # Manual exhaustivo de operación y administración
├── README.md                   # Descripción general y documentación de la arquitectura
└── Fotos/                      # Banco fotográfico de alta resolución para carrusel
```
