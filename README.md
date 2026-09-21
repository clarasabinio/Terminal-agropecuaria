# Sistema Agropecuario (Django + Base de Datos Docker)

## 📌 Qué se hizo (Resumen simple)
1. **Migración a Django**: El sistema ahora corre sobre un backend en Django con arquitectura MVC y modelos de datos.
2. **Base de Datos Dockerizada**: Base de datos relacional PostgreSQL lista para levantar con Docker Compose (`docker-compose.yml`).
3. **Panel de Administración**: Acceso a `/admin/` para crear, editar y consultar municipios, contratos y entregas.
4. **Terminal y Chatbot Conectados**: La Terminal Web (`/`) y el Chatbot (`/chatbot/`) consumen la información en vivo desde la base de datos y consultan las cotizaciones del Dólar y Cereales.
5. **Línea de trabajo intacta**: Se conservaron todos los archivos previos (`codigo.gs`, planillas CSV, scripts de consola y fotos) en el proyecto para que el profesor pueda revisar todo el historial.

---

## 🚀 Cómo levantarlo (Paso a Paso)

### ⚠️ Regla de Oro: ¿Dónde ejecutar los comandos?
> **MUY IMPORTANTE**: Abrí la terminal **dentro de la carpeta del proyecto** (`mi-proyecto-antigravity`), que es donde está el archivo `docker-compose.yml`.  
> Si ejecutás `docker compose up -d` en otro lugar (como tu carpeta de inicio o el Escritorio sin entrar a la carpeta), Docker dará error diciendo que no encuentra el archivo `docker-compose.yml`.

---

### Opción 1: Con 1 solo clic (Mac)
Hacé doble clic en el archivo:
👉 **`Iniciar_Django.command`**

---

### Opción 2: Desde la Terminal (2 comandos)

#### 1. Iniciar la Base de Datos con Docker
Parado dentro de la carpeta del proyecto:
```bash
docker compose up -d db
```
*(Levanta PostgreSQL en segundo plano. Si tu máquina no tiene Docker instalado, el sistema funciona automáticamente con la base local SQLite).*

#### 2. Iniciar el servidor Django
```bash
.venv/bin/python manage.py runserver
```

---

## 🌐 Enlaces del Sistema
Una vez iniciado, abrí tu navegador en:
- **🏢 Terminal Agropecuaria**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **💬 Chatbot para Propietarios**: [http://127.0.0.1:8000/chatbot/](http://127.0.0.1:8000/chatbot/)
- **⚙️ Panel de Administración Django**: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)
  - **Usuario**: `admin`
  - **Contraseña**: `admin123`

---

## 🌾 APIs de Mercado Implementadas
- **Dólar BNA (Oficial y Mayorista)**: Consulta en vivo a la API REST de DolarApi.
- **Pizarra Rosario (BCR) y Chicago (CBOT)**: Cotizaciones de Soja, Maíz, Trigo y Girasol con cálculo en tiempo real de equivalencia en dólares.
