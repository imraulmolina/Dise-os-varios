# Ejecuta un .jsx en Illustrator (COM) e imprime el valor que devuelve la última línea del script.
# Uso: powershell -File correr_jsx.ps1 "C:\ruta\script.jsx"
param([Parameter(Mandatory)][string]$Jsx)
$ai = New-Object -ComObject Illustrator.Application
$ai.DoJavaScriptFile((Resolve-Path $Jsx).Path)
