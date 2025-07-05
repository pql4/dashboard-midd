# Dashboard Midd 🚀

Dashboard unificado que combina a funcionalidade de gerenciamento de servidores e comandos em uma única aplicação.

## Funcionalidades

### Lista Servidores
- Gerenciamento completo de servidores (CRUD)
- Filtros por status, ambiente e projeto
- Busca por texto
- Visualização em grid e lista
- Exportação para CSV
- Estatísticas em tempo real

### Comandos
- Gerenciamento de comandos úteis (CRUD)
- Busca e ordenação
- Cópia para clipboard
- Interface intuitiva

## Instalação

### Pré-requisitos
- Docker
- Docker Compose

### Passos para instalação

1. **Descompactar o projeto:**
   ```bash
   # Descompactar em /opt/dashboard-midd/
   sudo mkdir -p /opt/dashboard-midd
   sudo tar -xzf dashboard-midd.tar.gz -C /opt/
   sudo chown -R $USER:$USER /opt/dashboard-midd
   cd /opt/dashboard-midd
   ```

2. **Executar o container:**
   ```bash
   docker compose up -d --build
   ```

3. **Acessar a aplicação:**
   ```
   http://IP:4001
   ```

## Estrutura de Dados

### Servidores
- Arquivo: `/opt/dashboard-midd/data/data-server.json`
- Estrutura: Array de objetos com informações dos servidores

### Comandos
- Arquivo: `/opt/dashboard-midd/data/commands.json`
- Estrutura: Array de objetos com comandos e descrições

### Exportações
- Diretório: `/opt/dashboard-midd/export/`
- Arquivos CSV exportados pelo dashboard de servidores

## APIs

### Servidores
- `GET /api/servers` - Listar servidores
- `POST /api/servers` - Salvar servidores
- `POST /api/export` - Exportar CSV
- `GET /api/download/:filename` - Download de arquivo CSV

### Comandos
- `GET /api/commands` - Listar comandos
- `POST /api/commands` - Adicionar comando
- `PUT /api/commands/:id` - Atualizar comando
- `DELETE /api/commands/:id` - Deletar comando

## Navegação

- **Lista Servidores** - Dashboard de gerenciamento de servidores
- **Comandos** - Dashboard de gerenciamento de comandos

## Volumes Docker

```yaml
volumes:
  - ./data:/opt/dashboard-midd/data      # Dados persistentes
  - ./export:/opt/dashboard-midd/export  # Exportações CSV
```

## Logs

Para visualizar os logs do container:
```bash
docker logs dashboard-midd
```

## Backup

Para fazer backup dos dados:
```bash
# Backup dos dados
cp -r /opt/dashboard-midd/data /backup/dashboard-midd-data-$(date +%Y%m%d)

# Backup das exportações
cp -r /opt/dashboard-midd/export /backup/dashboard-midd-export-$(date +%Y%m%d)
```

## Restore

Para restaurar dados de backup:
```bash
# Restaurar dados
cp -r /backup/dashboard-midd-data-YYYYMMDD/* /opt/dashboard-midd/data/

# Restaurar exportações
cp -r /backup/dashboard-midd-export-YYYYMMDD/* /opt/dashboard-midd/export/
```

## Suporte

Para suporte técnico, entre em contato com a equipe de desenvolvimento. 