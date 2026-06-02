# Estágio 1: Build do Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Copia dependências do frontend
COPY package*.json ./
RUN npm install

# Copia o código e faz o build
COPY . .
RUN npm run build

# Estágio 2: Setup do Backend e Produção
FROM node:20-alpine
WORKDIR /app

# Instala dependências do backend
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# Copia o schema do Prisma e gera o client
COPY backend/prisma ./prisma
RUN npx prisma generate

# Copia o restante do código do backend
COPY backend/ ./

# Copia o build do frontend para /app/dist
COPY --from=frontend-builder /app/dist /app/dist

EXPOSE 3001

# Roda as migrações e inicia a aplicação
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]