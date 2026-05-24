# ====================================================================
# Dockerfile - Frontend React (multi-etapa)
# Etapa 1: construccion con Node 20
# Etapa 2: servidor Nginx para archivos estaticos
# ====================================================================

# Etapa 1: construccion
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install --silent
COPY public ./public
COPY src ./src
RUN npm run build

# Etapa 2: servir con Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
