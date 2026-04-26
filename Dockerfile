# ==========================================
# Etapa 1: Construcción (Build)
# ==========================================
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Instalar pnpm (si usas pnpm, de lo contrario puedes usar npm/yarn)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* ./

# Instalar dependencias
# Se usa --frozen-lockfile dependiendo del gestor que estés usando
RUN npm ci || pnpm install --frozen-lockfile || yarn install --frozen-lockfile

# Copiar el resto del código del proyecto
COPY . .

# Argumentos de entorno para la construcción (API URL, etc.)
ARG EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL

ARG EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB
ENV EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=$EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB

# Construir la aplicación web estática
RUN npx expo export -p web

# ==========================================
# Etapa 2: Producción (Servidor Web Ligero)
# ==========================================
FROM nginx:alpine AS runner

# Copiar la configuración personalizada de Nginx si es necesario para SPA routing
# (Se usa try_files $uri $uri.html para soportar la salida 'static' de Expo Router)
RUN echo "server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files \$uri \$uri.html \$uri/ /index.html; \
    } \
}" > /etc/nginx/conf.d/default.conf

# Copiar los archivos construidos desde la etapa anterior
# Expo por defecto exporta a la carpeta 'dist' cuando se usa 'expo export'
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto 80 dentro del contenedor
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
