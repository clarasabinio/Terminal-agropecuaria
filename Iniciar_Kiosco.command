#!/bin/bash
# ==============================================================================
# TERMINAL AGROPECUARIA - LANZADOR DE MODO KIOSCO BLOQUEADO (macOS)
# ==============================================================================
# Este archivo abre la aplicación en pantalla completa sin barras de direcciones,
# pestañas ni menús, y restaura todo el sistema automáticamente al salir.
# ==============================================================================

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# Función de restauración automática al salir (Cmd+Q o cerrar)
cleanup() {
  echo ""
  echo "🔄 Restaurando visibilidad de la barra inferior (Dock)..."
  osascript -e 'tell application "System Events" to set autohide of dock preferences to false' 2>/dev/null
  echo "✅ Sistema restaurado a su estado normal."
  echo "=========================================================="
  echo "Sesión de Kiosco finalizada."
  echo "=========================================================="
}
trap cleanup EXIT INT TERM

echo "=========================================================="
echo "🌾 INICIANDO TERMINAL AGROPECUARIA EN MODO KIOSCO"
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

URL="http://localhost:8080/Index.html?kiosk=1"

# 2. Ocultar la ventana de la Terminal para no distraer
osascript -e 'tell application "Terminal" to set miniaturized of window 1 to true' 2>/dev/null &

# 3. Ocultar el Dock durante la sesión de pantalla completa
osascript -e 'tell application "System Events" to set autohide of dock preferences to true' 2>/dev/null &

# 4. Localizar Google Chrome
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

if [ -f "$CHROME_PATH" ]; then
  echo "🔒 Abriendo en Google Chrome a pantalla completa..."
  echo "📌 Para salir presione Cmd + Q o use el botón [🔒 Salir de Kiosco] con PIN."
  
  KIOSK_PROFILE="/tmp/agro_kiosk_profile"
  mkdir -p "$KIOSK_PROFILE"

  # Ocultar otras apps de fondo
  osascript -e 'tell application "System Events" to set visible of every process whose visible is true and name does not contain "Google Chrome" and name is not "Terminal" to false' 2>/dev/null &

  # Ejecutar Chrome en Kiosco (bloquea el script hasta que el usuario cierre con Cmd+Q o el botón)
  "$CHROME_PATH" \
    --kiosk \
    --app="$URL" \
    --user-data-dir="$KIOSK_PROFILE" \
    --no-first-run \
    --no-default-browser-check \
    --disable-pinch \
    --overscroll-history-navigation=0 \
    --disable-features=TranslateUI \
    --disable-session-crashed-bubble \
    --kiosk-printing \
    --window-position=0,0

  osascript -e 'tell application "Google Chrome" to activate' 2>/dev/null &
else
  echo "⚠️ Abriendo con el navegador predeterminado..."
  open "$URL"
fi
