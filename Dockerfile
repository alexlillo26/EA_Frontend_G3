# Etapa de compilación
FROM node:lts as build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build --prod

# Etapa de producción con nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ea-front-end-g3 /usr/share/nginx/html

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
