import { BoiaConfig, EnvironmentalData, SensorConfig, SensoresBoia } from "../types";

export type AlertaTipo = "critico" | "alerta" | "ok" | "info";

export interface Alerta {
  tipo: AlertaTipo;
  boiaId: string;
  boiaNome: string;
  titulo: string;
  descricao: string;
  timestamp?: string;
  sensor?: string;
}

function sensorAtivo(sensor?: SensorConfig) {
  return sensor?.ativo === true;
}

function verificarLimites(
  nomeBoia: string,
  boiaId: string,
  sensorKey: keyof SensoresBoia,
  sensor: SensorConfig | undefined,
  valor: number,
  timestamp: string
): Alerta[] {
  if (!sensorAtivo(sensor) || valor == null) return [];

  const alertas: Alerta[] = [];

  // Checagem de níveis Críticos (Prioridade Máxima)
  if (sensor?.minCritico !== undefined && valor < sensor.minCritico) {
    alertas.push({
      tipo: "critico",
      boiaId,
      boiaNome: nomeBoia,
      titulo: `${sensor.nome} em nível crítico`,
      descricao: `Valor abaixo do limite crítico (${valor.toFixed(2)} ${sensor.unidade})`,
      timestamp,
      sensor: String(sensorKey),
    });
  } else if (sensor?.maxCritico !== undefined && valor > sensor.maxCritico) {
    alertas.push({
      tipo: "critico",
      boiaId,
      boiaNome: nomeBoia,
      titulo: `${sensor.nome} em nível crítico`,
      descricao: `Valor acima do limite crítico (${valor.toFixed(2)} ${sensor.unidade})`,
      timestamp,
      sensor: String(sensorKey),
    });
  }
  // Se já gerou crítico, não gera alerta de atenção para o mesmo sensor
  else if (sensor?.minAlerta !== undefined && valor < sensor.minAlerta) {
    alertas.push({
      tipo: "alerta",
      boiaId,
      boiaNome: nomeBoia,
      titulo: `${sensor.nome} em atenção`,
      descricao: `Valor abaixo da faixa recomendada (${valor.toFixed(2)} ${sensor.unidade})`,
      timestamp,
      sensor: String(sensorKey),
    });
  } else if (sensor?.maxAlerta !== undefined && valor > sensor.maxAlerta) {
    alertas.push({
      tipo: "alerta",
      boiaId,
      boiaNome: nomeBoia,
      titulo: `${sensor.nome} em atenção`,
      descricao: `Valor acima da faixa recomendada (${valor.toFixed(2)} ${sensor.unidade})`,
      timestamp,
      sensor: String(sensorKey),
    });
  }

  return alertas;
}

export function gerarAlertasBoia(
  boia: BoiaConfig,
  data: EnvironmentalData[]
): Alerta[] {
  const dadosBoia = (data || []).filter((item) => item.boiaId === boia.id);
  
  if (!boia.habilitada) return [];

  if (dadosBoia.length === 0) {
    return [{
      tipo: "info",
      boiaId: boia.id,
      boiaNome: boia.nome,
      titulo: "Aguardando Dados",
      descricao: "Nenhuma telemetria recebida até o momento.",
    }];
  }

  const ultima = dadosBoia[dadosBoia.length - 1];
  const alertas: Alerta[] = [];

  // Mapeamento dinâmico de todos os sensores configurados
  const keys = Object.keys(boia.sensores) as (keyof SensoresBoia)[];
  
  keys.forEach(key => {
    const valor = ultima[key as keyof EnvironmentalData];
    if (typeof valor === 'number') {
      alertas.push(...verificarLimites(boia.nome, boia.id, key, boia.sensores[key], valor, ultima.timestamp));
    }
  });

  // Se houver um alerta manual travado (sticky), e a leitura atual for OK, 
  // adicionamos uma nota de que há um alerta aguardando reconhecimento.
  if (boia.alertaAtivo && boia.alertaTipo && !alertas.some(a => a.tipo === "critico" || a.tipo === "alerta")) {
    alertas.push({
      tipo: boia.alertaTipo,
      boiaId: boia.id,
      boiaNome: boia.nome,
      titulo: `Alerta Persistente (${boia.alertaTipo})`,
      descricao: "Esta estação detectou uma anomalia anteriormente e aguarda reconhecimento manual do administrador.",
      timestamp: ultima.timestamp,
    });
  }

  if (alertas.length === 0) {
    alertas.push({
      tipo: "ok",
      boiaId: boia.id,
      boiaNome: boia.nome,
      titulo: "Operação Normal",
      descricao: "Todos os parâmetros dentro da normalidade.",
      timestamp: ultima.timestamp,
    });
  }

  return alertas;
}

export function calcularStatusBoia(ultima: EnvironmentalData | undefined, boia: BoiaConfig): "ok" | "alerta" | "critico" | "offline" {
  if (!boia.habilitada) return "offline";

  // Se houver um alerta manual travado (sticky), ele ganha prioridade
  if (boia.alertaAtivo && boia.alertaTipo) {
    return boia.alertaTipo;
  }

  if (!ultima) return "offline";

  // Verificação de timeout (15 min)
  try {
    const agora = new Date();
    const ts = new Date(ultima.timestamp.includes('T') ? ultima.timestamp : ultima.timestamp.replace(" ", "T"));
    if (isNaN(ts.getTime()) || (agora.getTime() - ts.getTime()) / 1000 / 60 > 15) return "offline";
  } catch { return "offline"; }

  const alertas = gerarAlertasBoia(boia, [ultima]);
  
  if (alertas.some(a => a.tipo === "critico")) return "critico";
  if (alertas.some(a => a.tipo === "alerta")) return "alerta";
  
  return "ok";
}

export function gerarAlertasSistema(
  boias: BoiaConfig[],
  data: EnvironmentalData[]
): Alerta[] {
  return (boias || [])
    .filter(b => b.habilitada)
    .flatMap((boia) => {
       const alertas = gerarAlertasBoia(boia, data);
       // Filtrar apenas alertas reais (não OK/Info) para a visão geral do sistema se desejado, 
       // ou retornar tudo. Vamos retornar tudo e as páginas filtram.
       return alertas;
    });
}
