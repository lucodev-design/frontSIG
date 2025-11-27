import React, { useEffect, useRef } from "react";
import { Bar } from "react-chartjs-2";
import Chart from "../../../chartConfig";

export default function GraficoDesempeno({ data }) {
  const chartRef = useRef(null);

  const safeData = {
    puntual: data?.puntual ?? 0,
    tarde: data?.tarde ?? 0,
    faltas: data?.faltas ?? 0,
  };

  useEffect(() => {
    // 🔥 Destruir instancia previa correctamente
    return () => {
      if (chartRef.current && chartRef.current.chartInstance) {
        chartRef.current.chartInstance.destroy();
      }
    };
  }, []);

  if (!data) {
    return (
      <div className="card p-3">
        <h4>Desempeño General</h4>
        <p>No hay datos para mostrar.</p>
      </div>
    );
  }

  const chartData = {
    labels: ["Puntualidad", "Tardanzas", "Faltas"],
    datasets: [
      {
        label: "Desempeño de trabajadores",
        data: [safeData.puntual, safeData.tarde, safeData.faltas],
        backgroundColor: ["#1561F0", "#FFA726", "#EF5350"],
      },
    ],
  };

  return (
    <div className="card p-3">
      <h4>Desempeño General</h4>
      <Bar ref={chartRef} data={chartData} />
    </div>
  );
}
