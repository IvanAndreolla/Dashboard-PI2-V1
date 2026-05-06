// ========================================
// Autor: ivan_junior
// Data: 14/10/2024
// ========================================

import { Waves } from 'lucide-react';
import {
  LineChart, Line,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';

import { EnvironmentalData } from '../types';

interface Props {
  data: EnvironmentalData[];
}

export function HydrosphereSection({ data }: Props) {
  const latest = data[data.length - 1];

  const phChart = data.slice(-20).map((item, i) => ({
    name: `T${i}`,
    ph: item.phAgua,
  }));

  const ecChart = data.slice(-20).map((item, i) => ({
    name: `T${i}`,
    ec: item.condutivEC,
  }));

  return (
    <div className="bg-cyan-50 p-6 rounded-lg shadow">
      <div className="flex items-center gap-2 mb-4">
        <Waves />
        <h2 className="text-xl font-bold">Hidrosfera</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Temperatura da água */}
        <div className="bg-white p-4 rounded shadow text-center">
          <h3>Temperatura da Água</h3>
          <div className="text-3xl font-bold text-cyan-600">
            {latest?.tempAgua.toFixed(1)}°C
          </div>
        </div>

        {/* pH */}
        <div className="bg-white p-4 rounded shadow">
          <h3>pH</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={phChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 14]} />
              <Tooltip />
              <Line dataKey="ph" stroke="#06b6d4" />
            </LineChart>
          </ResponsiveContainer>
          <div className="text-center text-xl mt-2">
            {latest?.phAgua.toFixed(2)}
          </div>
        </div>

        {/* EC */}
        <div className="bg-white p-4 rounded shadow">
          <h3>Condutividade</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={ecChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line dataKey="ec" stroke="#0891b2" />
            </LineChart>
          </ResponsiveContainer>
          <div className="text-center text-xl mt-2">
            {latest?.condutivEC.toFixed(0)} µS/cm
          </div>
        </div>

        {/* Turbidez */}
        <div className="bg-white p-4 rounded shadow text-center">
          <h3>Turbidez</h3>
          <div className="text-2xl font-bold">
            {latest?.turbidez.toFixed(1)} NTU
          </div>
        </div>

      </div>
    </div>
  );
}