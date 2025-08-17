# Stage 1: Build Angular app
FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx ng build --configuration production

# Stage 2: Serve with nginx
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*

# 👇 copy เฉพาะ browser เพราะ Angular 17+ จะ build ออกมาแบบนี้
COPY --from=builder /app/dist/browser /usr/share/nginx/html

RUN chmod -R 755 /usr/share/nginx/html

# 👇 copy custom config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
