const API_URL = "http://localhost:3001";

export interface LoginResponse {
  token: string;

  usuario: {
    id: string;
    nome: string;
    email: string;
    role: string;
  };
}

export async function login(
  email: string,
  senha: string
): Promise<LoginResponse> {
  const resposta = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      senha,
    }),
  });

  if (!resposta.ok) {
    const erro = await resposta.json();

    throw new Error(
      erro.error || "Erro ao fazer login"
    );
  }

  return resposta.json();
}

export function salvarToken(token: string) {
  localStorage.setItem("hydra_token", token);
}

export function obterToken() {
  return localStorage.getItem("hydra_token");
}

export function removerToken() {
  localStorage.removeItem("hydra_token");
}

export function salvarUsuario(usuario: any) {
  localStorage.setItem(
    "hydra_usuario",
    JSON.stringify(usuario)
  );
}

export function obterUsuario() {
  const usuario = localStorage.getItem("hydra_usuario");

  if (!usuario) return null;

  return JSON.parse(usuario);
}

export function logout() {
  removerToken();
  localStorage.removeItem("hydra_usuario");
}