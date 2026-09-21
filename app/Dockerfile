FROM node:20-alpine

# Definir directorio de trabajo
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json antes que el código
COPY package*.json ./

# Instalar dependencias (solo en la imagen base)
RUN npm install

# Exponer el puerto
EXPOSE 3000

# Comando por defecto (ESM)
CMD ["npm", "run", "dev"]
