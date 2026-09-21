#!/bin/bash
# ==============================================================================
# INICIAR SISTEMA AGROPECUARIO (DJANGO + BASE DE DATOS DOCKER)
# ==============================================================================
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "=========================================================="
echo "🌾 INICIANDO TERMINAL AGROPECUARIA (DJANGO)"
echo "=========================================================="

# 1. Si docker está instalado, levantar base de datos en segundo plano
if command -v docker >/dev/null 2>&1; then
  echo "🐳 Iniciando base de datos PostgreSQL con Docker..."
  docker compose up -d db >/dev/null 2>&1
else
  echo "ℹ️ Docker no detectado en esta máquina: usando base local SQLite."
fi

# 2. Verificar entorno virtual de Python
PYTHON_BIN=".venv/bin/python"
if [ ! -f "$PYTHON_BIN" ]; then
  PYTHON_BIN="python3"
fi

# 3. Aplicar migraciones
echo "⚙️ Verificando base de datos..."
$PYTHON_BIN manage.py migrate >/dev/null 2>&1

# 4. Abrir navegador
echo "🌐 Abriendo Terminal en http://127.0.0.1:8000..."
sleep 1
open "http://127.0.0.1:8000"

# 5. Iniciar servidor Django
echo "🚀 Servidor activo. Presione Ctrl + C para detenerlo."
$PYTHON_BIN manage.py runserver 127.0.0.1:8000
