# Dockerfile para EA_Frontend_G3 (Angular)

# Etapa 1: Construir la aplicación Angular
FROM node:20-alpine AS build
# O usa node:20-slim o node:20 si prefieres una imagen base de Node más completa,
# pero node:20-alpine es ligera y debería funcionar si la red de la VM está estable.

# Imprimir versiones para diagnóstico
RUN node -v
RUN npm -v

WORKDIR /app

# Copia package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias. 
# 'npm ci' es generalmente preferido para builds si tienes un package-lock.json sólido.
# Si da problemas, puedes volver a 'npm install --verbose'.
RUN npm ci --verbose
# RUN npm install --verbose # Alternativa

# Copia el resto del código fuente de la aplicación Angular
# (incluyendo angular.json, tsconfig.json, src/, etc.)
COPY . .

# Construye la aplicación Angular para producción.
# Este comando usa la configuración de 'production' de tu angular.json.
RUN npm run build --prod 
# Alternativamente, si 'ng' está disponible (ej. npx ng build ...):
# RUN npx ng build --configuration production

# DIAGNÓSTICO (opcional pero muy útil):
# Esta línea te mostrará la estructura exacta de tu carpeta /app/dist/ después del build.
# Así puedes verificar que '/app/dist/ea-front-end-g3' existe y tiene los archivos.
RUN ls -laR /app/dist/
RUN echo "Contenido de /app/dist/ea-front-end-g3/ (si existe):" && ls -laR /app/dist/ea-front-end-g3/ || echo "Carpeta /app/dist/ea-front-end-g3/ no encontrada"

# Etapa 2: Servir la aplicación con Nginx
FROM nginx:alpine

# Copia tu configuración personalizada de Nginx.
# Este archivo nginx.conf debe estar en la raíz del contexto de build de EA_Frontend_G3.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# --- LÍNEA CRÍTICA CORREGIDA ---
# Copia los archivos estáticos construidos desde la etapa 'build'.
# Usamos la ruta de salida 'dist/ea-front-end-g3' que especificaste en angular.json.
# El '/.' al final de la ruta de origen copia el CONTENIDO de esa carpeta.
COPY --from=build /app/dist/ea-front-end-g3/browser/. /usr/share/nginx/html/

# Nginx escucha en el puerto 80 por defecto (según tu nginx.conf debería ser 'listen 80;')
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]