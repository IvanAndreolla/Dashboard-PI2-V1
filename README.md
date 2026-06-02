# Dashboard Hydra — Projeto Águas Vivas (IFSC)

Sistema avançado de telemetria e monitoramento ambiental desenvolvido pela equipe de **Engenharia Eletrônica** do Instituto Federal de Santa Catarina (IFSC).

## 🚀 Guia de Instalação Rápida (Servidor IFSC)

Este projeto foi dockerizado para garantir que todas as dependências (Node.js, PostgreSQL, bibliotecas) sejam instaladas automaticamente.

### Passo 1: Preparar o Computador
Copie a pasta completa do projeto para o computador do servidor no IFSC.

### Passo 2: Instalação Automática (Apenas na primeira vez)
Abra o terminal dentro da pasta do projeto e execute o script de automação que criamos. Ele instalará o Docker e o Docker Compose para você:

```bash
# Dá permissão de execução ao script
chmod +x instalar_hydra.sh

# Executa a instalação (pode pedir sua senha do Linux)
./instalar_hydra.sh
```

### Passo 3: Ativar Permissões
Para que o sistema funcione sem precisar deslogar do computador, rode:
```bash
newgrp docker
```

### Passo 4: Subir o Sistema
Agora basta um único comando para compilar o site e ligar o banco de dados:
```bash
docker compose up -d --build
```

---

## 🛠️ Informações Técnicas

- **Frontend:** React + TypeScript + Tailwind CSS (Vite)
- **Backend:** Node.js + Express
- **Banco de Dados:** PostgreSQL (via Prisma ORM)
- **Comunicação:** MQTT (Shiftr.io) e WebSockets (Socket.IO)
- **Infraestrutura:** Docker & Docker Compose

## 🔑 Acesso Administrativo
Após subir o sistema pela primeira vez, você pode acessar a área de administração em:
**URL:** `http://localhost:3001`
**Login Padrão:** `admin@hydra.local`
**Senha Padrão:** `admin123`

*Recomenda-se alterar a senha imediatamente após o primeiro login na aba "Gerenciar Usuários".*

## 📁 Estrutura de Arquivos Importante
- `Dockerfile`: Regras de compilação da imagem do sistema.
- `docker-compose.yml`: Configurações de rede, portas e senhas do banco de dados e MQTT.
- `instalar_hydra.sh`: Script de setup inicial do Linux.

---
**Instituto Federal de Santa Catarina — Campus Florianópolis**  
Curso de Engenharia Eletrônica — Projeto Integrador 2
