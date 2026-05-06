export type StatusBoia =
  | "ok"
  | "alerta"
  | "critico"
  | "offline";

export interface SensorConfig {
  ativo: boolean;

  nome: string;
  unidade: string;

  minAlerta?: number;
  maxAlerta?: number;

  minCritico?: number;
  maxCritico?: number;
}

export interface SensoresBoia {
  tempAgua?: SensorConfig;
  phAgua?: SensorConfig;
  turbidez?: SensorConfig;
  condutivEC?: SensorConfig;

  tempAr?: SensorConfig;
  umidAr?: SensorConfig;
  pressao?: SensorConfig;

  indiceUV?: SensorConfig;

  chuvaAcum?: SensorConfig;

  ventoVel?: SensorConfig;
  ventoDir?: SensorConfig;
}

export interface ComunicacaoBoia {
  mqtt: boolean;
  mqttTopico?: string;

  serial?: boolean;
  can?: boolean;
  lora?: boolean;
}

export interface BoiaConfig {
  id: string;

  nome: string;
  descricao: string;

  instituicao: string;
  responsavel?: string;

  imagem: string;

  local: string;

  latitude: number;
  longitude: number;

  gpsIntegrado: boolean;

  habilitada: boolean;

  status: StatusBoia;

  comunicacao: ComunicacaoBoia;

  sensores: SensoresBoia;
}

export interface EnvironmentalData {
  boiaId: string;

  timestamp: string;

  tempAgua: number;
  phAgua: number;
  turbidez: number;
  condutivEC: number;

  tempAr: number;
  umidAr: number;
  pressao: number;

  indiceUV: number;

  chuvaAcum: number;

  ventoVel: number;
  ventoDir: number;
}