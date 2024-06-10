# Usa la imagen oficial de Node como base
FROM node:20.10.0 as build

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos necesarios (package.json, package-lock.json)
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos de la aplicación
COPY . .

# Construye la aplicación
RUN npm run build

# Usa una imagen más ligera para la implementación
FROM nginx:alpine

# Copia los archivos construidos desde el contenedor de compilación
COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expone el puerto 80
EXPOSE 9999

# Comando para iniciar el servidor nginx
CMD ["nginx", "-g", "daemon off;"]
