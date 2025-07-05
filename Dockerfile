FROM node:18-alpine

WORKDIR /app

# Criar diretórios para dados
RUN mkdir -p /opt/dashboard-midd/data
RUN mkdir -p /opt/dashboard-midd/export

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar todas as dependências
RUN npm install

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Expor porta
EXPOSE 4001

# Comando para iniciar a aplicação
CMD ["npm", "start"] 