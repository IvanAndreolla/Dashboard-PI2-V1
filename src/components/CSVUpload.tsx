import { Upload } from "lucide-react";
import { EnvironmentalData } from "../types";

interface CSVUploadProps {
  boiaId: string;
  onDataLoaded: (data: EnvironmentalData[]) => void;
}

export function CSVUpload({ boiaId, onDataLoaded }: CSVUploadProps) {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());

      const parsedData: EnvironmentalData[] = lines.slice(1).map((line) => {
        const values = line.split(";").map((v) => v.trim());

        return {
          boiaId,
          timestamp: values[0],

          tempAr: parseFloat(values[1]) || 0,
          umidAr: parseFloat(values[2]) || 0,
          pressao: parseFloat(values[3]) || 0,
          indiceUV: parseFloat(values[4]) || 0,

          chuvaAcum: parseFloat(values[5]) || 0,
          ventoVel: parseFloat(values[6]) || 0,
          ventoDir: parseFloat(values[7]) || 0,

          tempAgua: parseFloat(values[8]) || 0,
          phAgua: parseFloat(values[9]) || 0,
          condutivEC: parseFloat(values[10]) || 0,
          turbidez: parseFloat(values[11]) || 0,
        };
      });

      onDataLoaded(parsedData);
    };

    reader.readAsText(file);
  };

  return (
    <div className="flex items-center justify-center p-6 bg-white rounded-lg shadow-md border-2 border-dashed border-blue-300 hover:border-blue-500 transition-colors">
      <label className="flex flex-col items-center cursor-pointer">
        <Upload className="w-12 h-12 text-blue-500 mb-2" />
        <span className="text-sm text-gray-600 mb-1">Carregar CSV da boia</span>
        <span className="text-xs text-gray-400">Separador: ponto e vírgula (;)</span>

        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>
    </div>
  );
}