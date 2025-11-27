import React from "react";
import DataTable from "react-data-table-component";

export default function TablaConsolidado({ data }) {
  const columnas = [
    { name: "Trabajador", selector: (row) => row.apellidos + " " + row.nombre },
    { name: "Sede", selector: (row) => row.sede },
    { name: "Puntualidad", selector: (row) => row.puntualidad },
    { name: "Tardanzas", selector: (row) => row.tardanzas },
    { name: "Faltas", selector: (row) => row.faltas },
  ];

  return (
    <DataTable
      title="Reporte Consolidado"
      columns={columnas}
      data={data}
      pagination
      highlightOnHover
    />
  );
}
