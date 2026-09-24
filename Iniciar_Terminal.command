#!/bin/bash
# ==============================================================================
# TERMINAL AGROPECUARIA - ABRIR EN NAVEGADOR (GITHUB PAGES)
# ==============================================================================
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

URL="https://clarasabinio.github.io/Terminal-agropecuaria/"

echo "=========================================================="
echo "🌾 ABRIENDO TERMINAL AGROPECUARIA (GITHUB PAGES)"
echo "=========================================================="
echo "🌐 URL: $URL"
echo "=========================================================="

open "$URL"
