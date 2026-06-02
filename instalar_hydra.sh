#!/bin/bash

# Script de Instalação Automática - Dashboard Hydra (Engenharia Eletrônica IFSC)

echo "--------------------------------------------------------"
echo "Iniciando instalação do Docker e Docker Compose..."
echo "--------------------------------------------------------"

# 1. Atualiza o sistema
sudo apt-get update

# 2. Instala dependências básicas
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# 3. Adiciona a chave oficial do Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes

# 4. Configura o repositório
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Instala o Docker Engine e Docker Compose
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 6. Adiciona o usuário atual ao grupo docker (para não precisar usar sudo depois)
sudo usermod -aG docker $USER

echo ""
echo "--------------------------------------------------------"
echo "Instalação concluída com sucesso!"
echo "IMPORTANTE: Para aplicar as permissões, reinicie o computador"
echo "ou rode o comando: newgrp docker"
echo "--------------------------------------------------------"
echo "Para subir o sistema Hydra, basta rodar:"
echo "docker compose up -d --build"
echo "--------------------------------------------------------"
