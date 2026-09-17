#!/bin/bash
# ==============================================================================
# TERMINAL AGROPECUARIA - LANZADOR NATIVO MODO KIOSCO MAC
# ==============================================================================
# Este script inicia la Terminal Agropecuaria en Modo Kiosco Estricto.
# Bloquea la pantalla completa y restringe el acceso al resto de la computadora.
# Para salir y volver al escritorio de la Mac:
# 1. Hacer clic en "[ 🔒 Salir de Kiosco ]" en la terminal.
# 2. Escribir la clave de Administrador: admin123 (o PIN: 1234).
# 3. Elegir "Cerrar Terminal" o "Desbloquear y Usar Computadora".
# ==============================================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
exec "${DIR}/Iniciar_Kiosco.command" "$@"
