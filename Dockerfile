# Etapa de construcción
FROM node:18-alpine AS build
# Instalar pnpm globalmente
RUN npm install -g pnpm
WORKDIR /app
COPY package*.json ./
RUN pnpm install
COPY . .
RUN pnpm run build

# Etapa de servidor (Nginx)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]