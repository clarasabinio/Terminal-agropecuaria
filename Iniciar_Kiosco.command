#!/bin/bash
# ==============================================================================
# TERMINAL AGROPECUARIA - LANZADOR DE MODO KIOSCO BLOQUEADO (macOS)
# ==============================================================================
# Este archivo bloquea el acceso al escritorio y abre la aplicación en pantalla
# completa sin barras de direcciones, pestañas ni menús del sistema.
# ==============================================================================

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "=========================================================="
echo "🌾 INICIANDO TERMINAL AGROPECUARIA EN MODO KIOSCO BLOQUEADO"
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

# 2. Ocultar la ventana de la Terminal para que no quede detrás
osascript -e 'tell application "Terminal" to set miniaturized of window 1 to true' 2>/dev/null &

# 3. Ocultar automáticamente el Dock de macOS durante el Kiosco
osascript -e 'tell application "System Events" to set autohide of dock preferences to true' 2>/dev/null &

# 4. Localizar Google Chrome
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

if [ -f "$CHROME_PATH" ]; then
  echo "🔒 Abriendo en Google Chrome con modo Kiosco Estricto..."
  echo "📌 Para salir del modo Kiosco presione Cmd + Q o use el botón de salida con PIN en pantalla."
  
  # Directorio temporal aislado para perfil exclusivo de kiosco
  KIOSK_PROFILE="/tmp/agro_kiosk_profile"
  mkdir -p "$KIOSK_PROFILE"

  # Ocultar otras aplicaciones abiertas
  osascript -e 'tell application "System Events" to set visible of every process whose visible is true and name does not contain "Google Chrome" and name is not "Terminal" to false' 2>/dev/null &

  # Ejecutar Chrome en Kiosco bloqueado a pantalla completa
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

  # Forzar foco al frente tras el arranque
  osascript -e 'tell application "Google Chrome" to activate' 2>/dev/null &
else
  echo "⚠️ Google Chrome no fue encontrado en /Applications. Abriendo con el navegador predeterminado..."
  open "$URL"
fi

echo "=========================================================="
echo "Sesión de Kiosco finalizada."
echo "=========================================================="
