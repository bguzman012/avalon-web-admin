# Usa la imagen oficial de Node como base para construir
FROM node:20.10.0 as build

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos necesarios (package.json, package-lock.json)
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos de la aplicación
COPY . .

# Construye la aplicación para producción
RUN npm run build -- --configuration=production

# Usa una imagen más ligera para la implementación
FROM nginx:alpine

# Elimina la configuración por defecto de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia los archivos construidos desde el contenedor de compilación
COPY --from=build /app/dist/avalon-web-admin /usr/share/nginx/html

# Copia tu configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d

# Expone el puerto 80
EXPOSE 80

# Comando para iniciar el servidor nginx
CMD ["nginx", "-g", "daemon off;"]
