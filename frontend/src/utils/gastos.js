export const TIPO_OPTIONS = [
  { value: "MO", label: "M.O." },
  { value: "MAT", label: "MAT" },
  { value: "CON", label: "CON" },
  { value: "IND", label: "IND" },
];

export const PARTIDA_OPTIONS = [
  "Preliminares",
  "Cimentación",
  "Albañilería y muros",
  "Estructuras y Losas",
  "Instalaciones",
  "Aplanados",
  "Recubrimientos",
  "Pintura y Acabados",
  "Cancelería",
  "Herrería",
  "Carpintería",
  "Indirectos",
];

export const formatCurrency = (value) => {
  const number = Number(value);
  if (Number.isNaN(number)) {
    return "-";
  }
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(number);
};
