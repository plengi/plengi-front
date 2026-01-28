#!/bin/bash

echo "🚀 Iniciando despliegue Frontend..."

# 1. Ir al directorio
cd /var/www/plengi-front

# 2. Detener PM2 temporalmente
echo "⏸️  Deteniendo PM2..."
pm2 stop plengi-front 2>/dev/null || true

# 3. Obtener cambios
echo "📥 Obteniendo cambios de Git..."
git pull

# 4. Instalar dependencias si hay cambios en package.json
if git diff HEAD@{1} HEAD --name-only | grep -q "package.json"; then
    echo "📦 Instalando dependencias..."
    npm install --legacy-peer-deps
fi

# 5. Reconstruir si hay cambios relevantes
if git diff HEAD@{1} HEAD --name-only | grep -q -E "\.(js|jsx|ts|tsx|css|json)$"; then
    echo "🔨 Reconstruyendo Next.js..."
    npm run build
fi

# 6. Reiniciar PM2
echo "🔄 Reiniciando PM2..."
pm2 restart plengi-front

# 7. Verificar
echo "✅ Despliegue completado."
echo "📊 Estado:"
pm2 status plengi-front