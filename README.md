# Dashboard Hydra — Projeto Águas Vivas (IFSC)

Sistema avançado de telemetria e monitoramento ambiental desenvolvido pela equipe de **Engenharia Eletrônica** do Instituto Federal de Santa Catarina (IFSC).

## 🚀 Arquitetura de Produção (IFSC)
O sistema utiliza uma arquitetura híbrida para máxima performance e segurança:
- **Frontend:** Hospedado no *Cloudflare Pages*.
- **Backend & Banco de Dados:** Rodando em **Podman** em uma Máquina Virtual no IFSC.

## 🛠️ Deploy com Podman
Para subir a stack de dados no servidor do IFSC:

```bash
# Clone o repositório e mude para a branch de deploy
git checkout feat/deploy-hibrido-ifsc

# Suba os containers (Postgres e API)
podman-compose up -d --build
```

## 🌐 Configuração de Ambiente
- `.env.production`: Define a URL da API para o frontend.
- `backend/prisma/schema.prisma`: Schema do banco de dados.
- `podman-compose.yml`: Orquestração dos serviços.

---
**Instituto Federal de Santa Catarina — Campus Florianópolis**
Curso de Engenharia Eletrônica — Projeto Integrador 2
