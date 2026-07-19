#!/bin/sh
# Regenera los PNGs de icons/ a partir de los SVG fuente.
# Herramienta local, NO forma parte de la app. Requiere rsvg-convert
# (brew install librsvg). Ejecutar desde la raíz del repo.
set -e
rsvg-convert -w 180 -h 180 icons/icon-solid.svg    -o icons/icon-180.png
rsvg-convert -w 192 -h 192 icons/icon-solid.svg    -o icons/icon-192.png
rsvg-convert -w 512 -h 512 icons/icon-solid.svg    -o icons/icon-512.png
rsvg-convert -w 512 -h 512 icons/icon-maskable.svg -o icons/icon-maskable-512.png
echo "Íconos regenerados."
