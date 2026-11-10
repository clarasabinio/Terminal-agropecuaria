# 🌾 Terminal Agropecuaria de Consulta y Gestión de Contratos

Sistema integral para administración, consulta pública, liquidación de contratos agrícolas y atención automatizada a propietarios rurales. Desarrollado con **Django**, arquitectura MVC, base de datos relacional y frontend responsivo adaptado para estaciones de trabajo y modo kiosco.

---

## 🌐 1. Acceso Inmediato Online (Sin Instalar Nada)

Para que el profesor o compañeros puedan evaluar y utilizar el sistema de forma inmediata sin necesidad de instalar programas ni dependencias en su computadora:

| Módulo | Enlace Oficial en Vivo | Descripción |
| :--- | :--- | :--- |
| **🏢 Terminal Agropecuaria** | 👉 **[https://clarasabinio.github.io/Terminal-agropecuaria/](https://clarasabinio.github.io/Terminal-agropecuaria/)** | Panel principal con cotizaciones en vivo, métricas consolidadas, búsqueda por municipio y gestión de contratos. |
| **💬 Chatbot de Propietarios** | 👉 **[https://clarasabinio.github.io/Terminal-agropecuaria/chatbot.html](https://clarasabinio.github.io/Terminal-agropecuaria/chatbot.html)** | Asistente de autoservicio para propietarios con consulta de kilos, cobro y simulador de liquidaciones. |
| **📂 Repositorio en GitHub** | 👉 **[https://github.com/clarasabinio/Terminal-agropecuaria](https://github.com/clarasabinio/Terminal-agropecuaria)** | Código fuente, scripts de despliegue, documentación y bases de datos. |

---

## 📌 2. Explicación General del Sistema

La **Terminal Agropecuaria** fue diseñada para resolver la gestión operativa y la transparencia en establecimientos agropecuarios, unificando tres pilares:

### A. Pantalla Principal y Modo Consulta (Invitado)
- **Cotizaciones de Mercado en Vivo:** Consulta automática a la API de **DolarApi** (Dólar Oficial y Mayorista BNA) y pizarra de cereales de la **Bolsa de Comercio de Rosario (BCR)** y **Chicago (CBOT)** para Soja, Maíz, Trigo y Girasol.
- **Métricas Consolidadas:** Resumen instantáneo de hectáreas totales arrendadas, quintales comprometidos, valor estimado de la campaña y balance por municipio (*Salto, San Andrés de Giles, Exaltación de la Cruz*).
- **Semáforos de Vigencia:** Indicadores visuales automáticos (verde: vigente, amarillo: próximo a vencer, rojo: vencido).
- **Fondos Dinámicos de Campo:** Rotación fotográfica de paisajes rurales cada 5 minutos.
- **Seguridad en Modo Invitado:** La consulta pública es de solo lectura estricta; nadie puede alterar datos sin autorización.

### B. Modo Administrador (Gestión y Liquidación)
- **Acceso Protegido:** Ingreso mediante contraseña (`admin123`) o PIN rápido (`1234`).
- **Carga de Contratos:** Formulario para incorporar nuevos acuerdos de arrendamiento por municipio, indicando titular, superficie, cultivo, valor pactado en quintales/ha y condiciones de pago.
- **Registro de Entregas de Cereal:** Asiento de descargas de camiones con cálculo automático de saldos y valorización a precio pizarra de la BCR.
- **Sincronización con Google Sheets:** Comunicación bidireccional mediante `codigo.gs` con hojas de cálculo federadas por municipio.

### C. Chatbot Autónomo para Propietarios Rurales (`/chatbot/`)
- Permite a los dueños de campos consultar el estado de sus contratos sin intervención humana.
- **Seguridad y Privacidad:** Búsqueda obligatoria por apellido con confirmación de titularidad.
- **Simulador de Venta:** El propietario puede ingresar una cantidad específica de kilogramos y simular el monto a cobrar en pesos y dólares según la cotización del día.
- **Comprobante Imprimible:** Generación de recibo oficial de liquidación listo para imprimir o guardar en PDF.

### D. Modo Kiosco Bloqueado (Opcional)
- Bloqueo de pantalla y atajos del sistema operativo para terminales públicas ubicadas en oficinas o acopios de cereal.

---

## 🚀 3. Pasos para Ejecutar el Proyecto en Otra Computadora

Cualquier profesor o compañero puede descargar y ejecutar el sistema en su propia máquina siguiendo cualquiera de las siguientes opciones:

### Paso Previo: Descargar el Código

#### Opción A (Vía Git):
```bash
git clone https://github.com/clarasabinio/Terminal-agropecuaria.git
cd Terminal-agropecuaria
```

#### Opción B (Descarga directa en ZIP):
1. En GitHub, haz clic en el botón verde **`<> Code`** y selecciona **`Download ZIP`**.
2. Descomprime la carpeta en el Escritorio o carpeta de tu preferencia.
3. Abre una terminal dentro de la carpeta descomprimida.

---

### Método 1: Ejecución con 1 solo clic (Exclusivo macOS)
El proyecto incluye scripts ejecutables directos:
- 👉 **`Iniciar_Terminal.command`**: Abre la versión web lista para usar en el navegador.
- 👉 **`Iniciar_Django.command`**: Verifica Python, aplica migraciones y levanta el servidor backend local.
- 👉 **`Iniciar_Chatbot.command`**: Abre directamente el asistente de propietarios.

*(Si macOS muestra aviso de seguridad, haz clic derecho sobre el archivo ➔ Abrir).*

---

### Método 2: Ejecución Backend en Django (macOS, Windows o Linux)

Este método levanta el servidor completo con backend MVC y panel Django Admin:

#### 1. Crear y activar el entorno virtual de Python:
```bash
# Crear entorno virtual
python3 -m venv .venv

# Activar en macOS / Linux:
source .venv/bin/activate

# Activar en Windows (CMD / PowerShell):
.venv\Scripts\activate
```

#### 2. Instalar dependencias:
```bash
pip install -r requirements.txt
```

#### 3. Aplicar migraciones de base de datos:
*(El sistema utiliza automáticamente SQLite local si no hay Docker instalado, garantizando compatibilidad total sin configurar bases de datos externas)*:
```bash
python manage.py migrate
```

#### 4. Iniciar el servidor local:
```bash
python manage.py runserver
```

#### 5. Abrir en el navegador:
- 🏢 **Terminal Agropecuaria**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- 💬 **Chatbot de Propietarios**: [http://127.0.0.1:8000/chatbot/](http://127.0.0.1:8000/chatbot/)
- ⚙️ **Panel Administrador Django**: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

---

### Método 3: Ejecución con Docker Compose (Contenedores)
Si la máquina tiene Docker instalado:
```bash
# Levantar PostgreSQL y Django en segundo plano:
docker compose up -d

# Para detener el servicio:
docker compose down
```

---

### Método 4: Uso Local Inmediato (Sin Servidor / Standalone)
Si no deseas instalar Python ni Docker:
1. Haz doble clic en el archivo **`index.html`** para abrir la **Terminal Web**.
2. Haz doble clic en el archivo **`chatbot.html`** para abrir el **Chatbot de Propietarios**.
Ambos archivos funcionan autónomamente en cualquier navegador moderno (Chrome, Safari, Firefox, Edge).

---

## 🔑 4. Credenciales de Prueba y Acceso

Para probar todas las funciones administrativas:

| Servicio | Usuario / PIN | Contraseña |
| :--- | :--- | :--- |
| **Panel Django Admin (`/admin/`)** | `admin` | `admin123` |
| **Modo Administrador en Terminal Web** | PIN: `1234` | Clave: `admin123` |
| **Apellidos de prueba en Chatbot** | `Terreri` / `González` / `Sabinio` | *(Cualquiera registrado en los contratos)* |

---

## 📁 5. Estructura del Repositorio

```text
├── index.html                   # Interfaz de la Terminal Web interactiva
├── chatbot.html                 # Asistente virtual para propietarios rurales
├── Iniciar_Terminal.command     # Lanzador automático de la Terminal
├── Iniciar_Django.command       # Lanzador automático del servidor Django
├── Iniciar_Chatbot.command      # Lanzador automático del Chatbot
├── Iniciar_Kiosco.command       # Lanzador en modo pantalla completa bloqueada
├── MANUAL_DE_USO.txt            # Manual operativo exhaustivo (8 capítulos)
├── manage.py                    # Gestor CLI de Django
├── requirements.txt             # Librerías de Python requeridas
├── docker-compose.yml           # Orquestación de contenedores (Django + Postgres)
├── Dockerfile                   # Imagen base para Docker
├── codigo.gs                    # Backend de Google Apps Script para Google Sheets
├── agro_terminal/               # Configuración del proyecto Django (settings, urls, wsgi)
├── gestion_agro/                # Aplicación Django (modelos, vistas, cotizaciones BCR)
├── Hojas_Drive_CSV/             # Copias de seguridad de planillas de cálculo municipales
└── Solapas_Por_Establecimiento/ # Exportaciones CSV independientes por campo
```

---

## 📖 6. Manual Exhaustivo del Sistema
Para una explicación paso a paso de cada pantalla, fórmulas de cálculo de quintales, cotizaciones y resolución de problemas, consulta el archivo:
👉 **[MANUAL_DE_USO.txt](MANUAL_DE_USO.txt)**

---

*Desarrollado para la materia y entrega académica del Sistema de Gestión y Liquidación Agropecuaria.*
