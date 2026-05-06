import { BoiaConfig, EnvironmentalData } from "../types";

export type AlertaTipo = "critico" | "alerta" | "ok" | "info";

export interface Alerta {
  tipo: AlertaTipo;
  boiaId: string;
  boiaNome: string;
  titulo: string;
  descricao: string;
  timestamp?: string;
}

export function gerarAlertasBoia(
  boia: BoiaConfig,
  data: EnvironmentalData[]
): Alerta[] {
  const dadosBoia = data.filter((leitura) => leitura.boiaId === boia.id);
  const ultima = dadosBoia[dadosBoia.length - 1];

  const alertas: Alerta[] = [];

  if (!boia.habilitada) {
    alertas.push({
      tipo: "info",
      boiaId: boia.id,
      boiaNome: boia.nome,
      titulo: "Boia desabilitada",
      descricao: "Esta boia está desabilitada no painel administrativo.",
    });

    return alertas;
  }

  if (!ultima) {
    alertas.push({
      tipo: "info",
      boiaId: boia.id,
      boiaNome: boia.nome,
      titulo: "Boia sem dados",
      descricao: "Nenhum CSV foi enviado para esta boia.",
    });

    return alertas;
  }

  if (ultima.phAgua < 6 || ultima.phAgua > 9) {
    alertas.push({
      tipo: "critico",
      boiaId: boia.id,
      boiaNome: boia.nome,
      titulo: "pH crítico",
      descricao: `Última leitura: ${ultima.phAgua.toFixed(2)} pH.`,
      timestamp: ultima.timestamp,
    });
  } else if (ultima.phAgua < 6.5 || ultima.phAgua > 8.5) {
    alertas.push({
      tipo: "alerta",
      boiaId: boia.id,
      boiaNome: boia.nome,
      titulo: "pH fora da faixa recomendada",
      descricao: `Última leitura: ${ultima.phAgua.toFixed(2)} pH.`,
      timestamp: ultima.timestamp,
    });
  }

  if (ultima.turbidez > 30) {
    alertas.push({
      tipo: "critico",
      boiaId: boia.id,
      boiaNome: boia.nome,
      titulo: "Turbidez crítica",
      descricao: `Última leitura: ${ultima.turbidez.toFixed(1)} NTU.`,
      timestamp: ultima.timestamp,
    });
  } else if (ultima.turbidez > 15) {
    alertas.push({
      tipo: "alerta",
      boiaId: boia.id,
      boiaNome: boia.nome,
      titulo: "Turbidez elevada",
      descricao: `Última leitura: ${ultima.turbidez.toFixed(1)} NTU.`,
      timestamp: ultima.timestamp,
    });
  }

  if (ultima.tempAgua > 35) {
    alertas.push({
      tipo: "critico",
      boiaId: boia.id,
      boiaNome: boia.nome,
      titulo: "Temperatura da água crítica",
      descricao: `Última leitura: ${ultima.tempAgua.toFixed(1)} °C.`,
      timestamp: ultima.timestamp,
    });
  } else if (ultima.tempAgua > 30) {
    alertas.push({
      tipo: "alerta",
      boiaId: boia.id,
      boiaNome: boia.nome,
      titulo: "Temperatura da água elevada",
      descricao: `Última leitura: ${ultima.tempAgua.toFixed(1)} °C.`,
      timestamp: ultima.timestamp,
    });
  }

  if (alertas.length === 0) {
    alertas.push({
      tipo: "ok",
      boiaId: boia.id,
      boiaNome: boia.nome,
      titulo: "Sem alertas ativos",
      descricao: "A última leitura está dentro dos limites configurados.",
      timestamp: ultima.timestamp,
    });
  }

  return alertas;
}

export function gerarAlertasSistema(
  boias: BoiaConfig[],
  data: EnvironmentalData[]
): Alerta[] {
  return boias.flatMap((boia) => gerarAlertasBoia(boia, data));
}