export interface EnvironmentalData {
  boiaId: string;
  timestamp: string;

  lat?: number;
  lon?: number;
  alt?: number;

  tempAr: number;
  umidAr: number;
  pressao: number;
  indiceUV: number;

  chuvaAcum: number;
  ventoVel: number;
  ventoDir: number;

  tempAgua: number;
  phAgua: number;
  condutivEC: number;
  turbidez: number;
}
