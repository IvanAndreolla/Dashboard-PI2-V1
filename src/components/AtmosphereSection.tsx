// ========================================
// Autor: ivan_junior
// Data: 14/10/2024
// ========================================

import { Cloud, Wind, Droplets, Sun } from 'lucide-react';
import {
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';

import { EnvironmentalData } from '../types';

interface AtmosphereSectionProps {
  data: EnvironmentalData[];
}

export function AtmosphereSection({ data }: AtmosphereSectionProps) {
  const latestData = data[data.length - 1];

  const tempChartData = data.slice(-20).map((item, index) => ({
    name: `T${index + 1}`,
    temperatura: item.tempAr,
  }));

  const rainChartData = data.slice(-15).map((item, index) => ({
    name: `T${index + 1}`,
    chuva: item.chuvaAcum,
  }));

  const getUVLevel = (index: number) => {
    if (index <= 2) return 'Baixo';
    if (index <= 5) return 'Moderado';
    if (index <= 7) return 'Alto';
    if (index <= 10) return 'Muito Alto';
    return 'Extremo';
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  return (
    <div className="bg-gradient-to-b from-sky-50 to-blue-50 p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Cloud className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Atmosfera</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Temperatura */}
        <div className="bg-white p-5 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Temperatura do Ar</h3>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={tempChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="temperatura" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>

          <div className="text-center mt-4">
            <span className="text-2xl font-bold text-blue-600">
              {latestData?.tempAr.toFixed(1)}°C
            </span>
          </div>
        </div>

        {/* UV */}
        <div className="bg-white p-5 rounded-lg shadow text-center">
          <Sun className="w-10 h-10 mx-auto text-yellow-500" />
          <div className="text-3xl font-bold mt-4">{latestData?.indiceUV.toFixed(1)}</div>
          <div>{getUVLevel(latestData?.indiceUV || 0)}</div>
        </div>

        {/* Chuva */}
        <div className="bg-white p-5 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Precipitação</h3>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={rainChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="chuva" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>

          <div className="text-center mt-4">
            <span className="text-2xl font-bold text-blue-600">
              {latestData?.chuvaAcum.toFixed(2)} mm
            </span>
          </div>
        </div>

        {/* Vento */}
        <div className="bg-white p-5 rounded-lg shadow text-center">
          <Wind className="w-10 h-10 mx-auto text-blue-600" />
          <div className="text-2xl mt-4">
            {getWindDirection(latestData?.ventoDir || 0)}
          </div>
          <div>{latestData?.ventoVel.toFixed(1)} km/h</div>
        </div>

      </div>
    </div>
  );
}