function PropertyPreview({ property }) {
  const image =
    property.cover_image ||
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200";

  const formattedPrice = property.price
    ? Number(property.price).toLocaleString("es-ES", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      })
    : "Precio pendiente";

  return (
    <aside className="xl:sticky xl:top-6">
      <div className="mb-4">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-red-600">
          Vista en tiempo real
        </p>

        <h2 className="mt-1 text-xl font-bold text-gray-800">
          Experiencia del comprador
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Así empezará a verse el inmueble en ReyGom Web.
        </p>
      </div>

      <article className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
        <div className="relative h-72 overflow-hidden bg-gray-200">
          <img
            src={image}
            alt={property.title || "Vista previa del inmueble"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

          <span className="absolute left-5 top-5 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-lg">
            {property.operation_type || "Venta"}
          </span>

          <span className="absolute right-5 top-5 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-gray-700 backdrop-blur">
            {property.status || "Disponible"}
          </span>
        </div>

        <div className="p-6">
          <p className="text-3xl font-extrabold text-gray-900">
            {formattedPrice}
          </p>

          <h3 className="mt-3 text-2xl font-bold text-gray-900">
            {property.title || "Título del inmueble"}
          </h3>

          <p className="mt-2 text-gray-500">
            {property.city || "Ciudad"}
            {property.province ? ` · ${property.province}` : ""}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-gray-100 p-4 text-center">
            <div>
              <p className="text-xs uppercase text-gray-500">Habitaciones</p>
              <p className="mt-1 text-xl font-bold text-gray-800">
                {property.bedrooms || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase text-gray-500">Baños</p>
              <p className="mt-1 text-xl font-bold text-gray-800">
                {property.bathrooms || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase text-gray-500">m²</p>
              <p className="mt-1 text-xl font-bold text-gray-800">
                {property.built_area || "-"}
              </p>
            </div>
          </div>

          <p className="mt-6 line-clamp-5 leading-7 text-gray-600">
            {property.description ||
              "La descripción aparecerá aquí mientras completas la información del inmueble."}
          </p>

          <button
            type="button"
            className="mt-7 w-full rounded-2xl bg-red-600 py-4 font-bold text-white"
          >
            Solicitar información
          </button>
        </div>
      </article>
    </aside>
  );
}

export default PropertyPreview;