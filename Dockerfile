# Usa la imagen oficial de Node.js 20
FROM node:20

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de package.json
COPY client/package.json ./client/
COPY server/package.json ./server/

# Instala las dependencias
RUN cd client && npm install
RUN cd server && npm install

# Copia el resto de los archivos del proyecto
COPY client ./client
COPY server ./server

# Construye la aplicación React
RUN cd client && npm run build

# Expone el puerto que usará el servidor
EXPOSE 8080

# Comando para ejecutar la aplicación
CMD ["node", "server/src/app.js"]