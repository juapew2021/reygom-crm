function PropertyCard({ property, onEdit, onDelete }) {
  const formattedPrice = Number(property.price || 0).toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  return (
    <article className="overflow-hidden rounded-3xl bg-white text-gray-800 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="h-56 bg-gray-200">
        {property.cover_image ? (
          <img
            src={property.cover_image}
            alt={property.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            Sin imagen principal
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-red-600">
              {property.operation_type}
            </p>

            <h3 className="mt-2 text-xl font-bold">{property.title}</h3>
          </div>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
            {property.status}
          </span>
        </div>

        <p className="mt-3 text-sm text-gray-500">
          {property.city || "Ubicación pendiente"}
          {property.province ? ` · ${property.province}` : ""}
        </p>

        <p className="mt-4 text-2xl font-extrabold">{formattedPrice}</p>

        <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-gray-100 p-4 text-center">
          <div>
            <p className="text-xs text-gray-500">Habitaciones</p>
            <p className="font-bold">{property.bedrooms ?? "-"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Baños</p>
            <p className="font-bold">{property.bathrooms ?? "-"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">m²</p>
            <p className="font-bold">{property.built_area ?? "-"}</p>
          </div>
        </div>

        <p className="mt-4 text-xs font-bold text-gray-500">
          Ref. {property.reference_id}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onEdit(property)}
            className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            Editar
          </button>

          <a
            href={`https://api.reygom.com/public/properties/${property.id}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-gray-700 px-4 py-2 font-bold text-white hover:bg-gray-800"
          >
            Datos públicos
          </a>

          <button
            type="button"
            onClick={() => onDelete(property.id)}
            className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
}

export default PropertyCard;