# Dashboard Hydra — Projeto Águas Vivas (IFSC)

Sistema avançado de telemetria e monitoramento ambiental desenvolvido pela equipe de **Engenharia Eletrônica** do Instituto Federal de Santa Catarina (IFSC).

Este arquivo contém o guia completo do sistema, projetado para orientar tanto novos desenvolvedores quanto operadores e mantenedores.

---

## 1. Visão Geral do Projeto
O Dashboard Hydra é uma aplicação desenvolvida para receber, armazenar e exibir dados telemétricos de sensores ambientais em tempo real. A comunicação entre o hardware (sensores) e o servidor é feita via protocolo **MQTT**, enquanto a interface de usuário recebe atualizações instantâneas através de **WebSockets**.

## 2. Tecnologias Envolvidas (Tech Stack)

### 🖥️ Frontend (Interface do Usuário)
A aplicação que o usuário acessa no navegador.
*   **Base:** React (v18.3) com TypeScript.
*   **Estilização:** Tailwind CSS.
*   **Bibliotecas de Destaque:** `react-leaflet` (Mapas), `recharts` (Gráficos), `socket.io-client` (Tempo real).

### ⚙️ Backend (Servidor)
O "cérebro" invisível do sistema.
*   **Ambiente:** Node.js com Express (v5.1.0) em TypeScript.
*   **Comunicação IoT:** `mqtt` (conectado ao broker Shiftr.io).
*   **Tempo Real (Frontend):** `socket.io`.

### 🗄️ Banco de Dados
*   **Sistema:** PostgreSQL (via Docker).
*   **Comunicação:** Prisma ORM.

### 🐳 Infraestrutura
*   **Ferramentas:** Docker & Docker Compose para rodar o sistema de forma isolada e segura.

---

## 3. Arquitetura da Informação (Como Funciona)
1. **Sensores na Água** enviam dados via MQTT (Broker Shiftr.io).
2. **Servidor (Node.js)** capta essa mensagem e a salva no Banco de Dados.
3. **Servidor** avisa a Interface do Usuário imediatamente via Socket.IO.
4. **Interface do Usuário** atualiza os mapas e gráficos sem precisar recarregar a página.

---

## 4. Guia de Instalação e Uso

### 🚀 Instalação Rápida (Servidor do IFSC)

Este projeto foi dockerizado para garantir que tudo instale automaticamente. Siga estes passos em um computador com Linux limpo:

1. **Copie a pasta completa** do projeto para o computador do servidor no IFSC.
2. Abra o **Terminal** dentro da pasta do projeto e execute o script de automação:
   ```bash
   chmod +x instalar_hydra.sh
   ./instalar_hydra.sh
   ```
3. Ative as permissões para não precisar deslogar:
   ```bash
   newgrp docker
   ```
4. Suba o Sistema com um único comando:
   ```bash
   docker compose up -d --build
   ```

### 🔑 Acesso Administrativo
Após ligar o sistema pela primeira vez, acesse a área de administração abrindo o navegador no endereço:

*   **URL:** `http://localhost:3001`
*   **Login Padrão:** `admin@hydra.local`
*   **Senha Padrão:** `admin123`

*(Recomenda-se alterar a senha imediatamente após o primeiro login na aba "Gerenciar Usuários".)*

---

## 5. Guia para Novos Desenvolvedores (Ambiente Local)

Se você vai modificar o código no seu próprio computador, não precisa rodar tudo pelo Docker.

1.  **Suba apenas o Banco de Dados:**
    ```bash
    docker compose up -d postgres
    ```
2.  **Ligue o Backend:**
    *   Entre na pasta: `cd backend`
    *   Instale dependências: `npm install`
    *   Crie as tabelas do banco: `npx prisma db push`
    *   Ligue: `npm run dev`
3.  **Ligue o Frontend:**
    *   Abra outro terminal na pasta raiz (`Dashboard-PI2-V1`).
    *   Instale: `npm install`
    *   Ligue: `npm run dev`

### ⚠️ Pontos de Atenção
*   **Variáveis Secretas (`.env`):** O backend tem um arquivo `.env` com senhas do banco e do MQTT. Nunca o envie para o GitHub.
*   **MQTT (Shiftr.io):** Se o limite do Shiftr.io for atingido, a comunicação com o hardware vai parar. As chaves de acesso estão no arquivo `.env` ou `docker-compose.yml`.
*   **Banco de Dados:** Mexeu na estrutura de dados (pasta `backend/prisma`)? Lembre-se de rodar `npx prisma db push` e reiniciar o backend.

---
**Instituto Federal de Santa Catarina — Campus Florianópolis**
Curso de Engenharia Eletrônica — Projeto Integrador 2