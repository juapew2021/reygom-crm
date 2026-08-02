const colors = {
  Nuevo: "bg-blue-100 text-blue-700",
  Contactado: "bg-yellow-100 text-yellow-700",
  Visita: "bg-purple-100 text-purple-700",
  Oferta: "bg-orange-100 text-orange-700",
  Negociación: "bg-indigo-100 text-indigo-700",
  "Venta Cerrada": "bg-green-100 text-green-700",
  Perdido: "bg-red-100 text-red-700",
};

function Badge({ children }) {
  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-3
        py-1
        text-xs
        font-semibold
        ${colors[children] || "bg-gray-200 text-gray-700"}
      `}
    >
      {children}
    </span>
  );
}

export default Badge;