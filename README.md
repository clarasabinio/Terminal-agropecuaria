# Terminal Agropecuaria de Consulta y Gestión de Contratos

Sistema integral de gestión de contratos de arrendamiento agrícola, fijación de granos con cotizaciones del Mercado de Chicago (CBOT), tipos de cambio oficiales del Banco Nación (BNA) y sincronización con Google Sheets / Google Apps Script.

## 🌾 Características Principales

- **Fijación de Granos en Vivo**: Cotizaciones CBOT en tiempo real para Soja, Maíz, Trigo y Girasol convertidas automáticamente a pesos según el tipo de cambio oficial BNA.
- **Gestión de Contratos de Alquiler**: Seguimiento de hectáreas, quintales pactados, pagos acumulados, saldo en kilogramos y USD, y alertas automáticas de vencimiento de contratos.
- **Sincronización con Google Sheets**: Integración bidireccional mediante Google Apps Script (`codigo.gs`) con una solapa por cada contrato y una planilla consolidada (*Master*).
- **Fondos Fotográficos Dinámicos**: Carrusel de fotos de alta resolución de cultivos y campos con rotación automática cada 5 minutos y controles manuales.
- **Liquidación y Comprobantes**: Registro de forma de pago (E-cheq, Cheque Físico, Transferencia), control de recepción de facturas y carga de comprobantes.

## 🚀 Archivos del Proyecto

- `Index.html`: Aplicación web interactiva (interfaz visual, lógica de cálculo, gráficos y fondos dinámicos).
- `codigo.gs`: Backend para Google Apps Script encargado de interactuar con la hoja de cálculo de Google Sheets.
