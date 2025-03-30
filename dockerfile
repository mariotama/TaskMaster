# Etapa de construcción
FROM node:18-alpine AS build

WORKDIR /app

# Copiar package.json y package-lock.json para optimizar capas
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar fuentes
COPY . .

# Compilar aplicación
RUN npm run build

# Eliminar dependencias de desarrollo
RUN npm prune --production

# Etapa de producción
FROM node:18-alpine

WORKDIR /app

# Copiar desde etapa de construcción
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./

# Variables de entorno
ENV NODE_ENV=production

# Puerto de aplicación
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "dist/main"]