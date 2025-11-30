
# Imagen base
FROM node:20-alpine

# Setear directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar package.json + package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar el resto del código
COPY . .
RUN rm -f .env


# Exponer el puerto configurado
EXPOSE 9090

# Variable para entorno
ENV NODE_ENV=production

# Comando de inicio
CMD ["node", "src/server.js"]
