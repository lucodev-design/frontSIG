import React, { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  PieController,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(PieController, ArcElement, Tooltip, Legend);

export default function GraficoTotalesTrabajadores({ data }) {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 🔥 Si ya existe gráfico → destruirlo antes de crear uno nuevo
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    // ❌ Si no hay data → no crear gráfico
    if (!data || !data.labels || !data.values) return;

    chartInstanceRef.current = new ChartJS(canvasRef.current, {
      type: "pie",
      data: {
        labels: data.labels,
        datasets: [
          {
            data: data.values,
            backgroundColor: ["#1561F0", "#FFA726", "#EF5350", "#66BB6A"],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });

    // Cleanup al desmontar o actualizar
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data]);

  return (
    <div className="card p-3" style={{ width: "100%", height: "300px" }}>
      <h4>Totales por Estado</h4>

      {!data ? (
        <p>No hay datos para mostrar.</p>
      ) : (
        <canvas ref={canvasRef}></canvas>
      )}
    </div>
  );
}
