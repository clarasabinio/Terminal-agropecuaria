#!/bin/bash
# ==============================================================================
# TERMINAL AGROPECUARIA - LANZADOR DE CONSULTA DE CAMPOS POR MUNICIPIO
# ==============================================================================
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

clear
python3 "$DIR/ver_campos_terminal.py"

echo ""
echo "Presione cualquier tecla para cerrar esta ventana..."
read -n 1 -s -r
