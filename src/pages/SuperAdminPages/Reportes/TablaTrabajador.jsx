import React from "react";
import DataTable from "react-data-table-component";

export default function TablaTrabajador({ data }) {
  const columnas = [
    { name: "Fecha", selector: (row) => row.fecha },
    { name: "Entrada", selector: (row) => row.hora_entrada },
    { name: "Salida", selector: (row) => row.hora_salida },
    { name: "Estado", selector: (row) => row.estado },
    { name: "Sede", selector: (row) => row.sede },
  ];

  return (
    <DataTable
      title="Reporte por Trabajador"
      columns={columnas}
      data={data}
      pagination
      highlightOnHover
    />
  );
}
