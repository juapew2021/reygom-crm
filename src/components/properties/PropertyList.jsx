import PropertyCard from "./PropertyCard";

function PropertyList({ properties, loading, onEdit, onDelete }) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">
          Inmuebles registrados
        </h2>

        <p className="mt-1 text-gray-400">
          {properties.length} inmueble
          {properties.length === 1 ? "" : "s"} en el CRM.
        </p>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white p-8 text-center text-gray-600">
          Cargando inmuebles...
        </div>
      ) : properties.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center text-gray-600">
          Todavía no hay inmuebles registrados.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default PropertyList;