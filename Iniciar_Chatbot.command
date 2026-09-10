#!/bin/bash
# ==============================================================================
# ASISTENTE VIRTUAL DE PROPIETARIOS RURALES (CHATBOT AGRO)
# ==============================================================================
# Este archivo inicia el Chatbot en el navegador web para que los propietarios
# rurales puedan consultar sus kilos por vender, monto a cobrar y fecha de pago.
# ==============================================================================

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "=========================================================="
echo "🌾 INICIANDO CHATBOT PARA PROPIETARIOS RURALES"
echo "=========================================================="

# 1. Comprobar y levantar el servidor local en puerto 8080 si no está activo
SERVER_PORT=8080
if ! lsof -i :$SERVER_PORT -sTCP:LISTEN >/dev/null 2>&1; then
  echo "🚀 Iniciando servidor local en el puerto $SERVER_PORT..."
  python3 -m http.server $SERVER_PORT > /dev/null 2>&1 &
  sleep 1
else
  echo "✅ Servidor local ya activo en el puerto $SERVER_PORT."
fi

URL="http://localhost:8080/Chatbot.html"

echo "🌐 Abriendo Chatbot de Consulta en el navegador..."
echo "👉 URL: $URL"

open "$URL"

echo "=========================================================="
echo "✅ Chatbot iniciado exitosamente."
echo "=========================================================="
