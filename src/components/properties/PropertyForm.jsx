function PropertyForm({
  form,
  editingId,
  saving,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <form onSubmit={onSubmit} className="property-publisher-form">
      <div className="space-y-8">
        <fieldset>
          <legend className="mb-4 text-lg font-bold text-gray-800">
            Información general
          </legend>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {editingId ? (
              <div className="rounded-2xl border border-gray-300 bg-gray-100 px-4 py-3">
                <span className="block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Referencia ReyGom
                </span>

                <span className="mt-1 block font-bold text-gray-800">
                  {form.reference_id}
                </span>

                <p className="mt-1 text-xs text-gray-500">
                  La referencia es permanente.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                <span className="block text-xs font-bold uppercase tracking-wide text-red-600">
                  RPC automático
                </span>

                <p className="mt-1 font-semibold text-gray-800">
                  La referencia se generará al publicar.
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Ejemplo: RGESVALALB000001
                </p>
              </div>
            )}

            <input
              name="title"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              placeholder="Título del inmueble"
              value={form.title}
              required
              onChange={onChange}
            />

            <input
              name="price"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              placeholder="Precio"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              required
              onChange={onChange}
            />

            <select
              name="property_type"
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              value={form.property_type}
              onChange={onChange}
            >
              <option value="Piso">Piso</option>
              <option value="Casa">Casa</option>
              <option value="Chalet">Chalet</option>
              <option value="Ático">Ático</option>
              <option value="Adosado">Adosado</option>
              <option value="Terreno">Terreno</option>
              <option value="Local">Local</option>
              <option value="Oficina">Oficina</option>
            </select>

            <select
              name="operation_type"
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              value={form.operation_type}
              onChange={onChange}
            >
              <option value="Venta">Venta</option>
              <option value="Alquiler">Alquiler</option>
            </select>

            <select
              name="status"
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              value={form.status}
              onChange={onChange}
            >
              <option value="Disponible">Disponible</option>
              <option value="Reservado">Reservado</option>
              <option value="Vendido">Vendido</option>
              <option value="Alquilado">Alquilado</option>
              <option value="Oculto">Oculto</option>
            </select>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-4 text-lg font-bold text-gray-800">
            Ubicación
          </legend>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              name="city"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              placeholder="Ciudad o municipio"
              value={form.city}
              required
              onChange={onChange}
            />

            <input
              name="province"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              placeholder="Provincia"
              value={form.province}
              required
              onChange={onChange}
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-4 text-lg font-bold text-gray-800">
            Características
          </legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <input
              name="bedrooms"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              placeholder="Habitaciones"
              type="number"
              min="0"
              value={form.bedrooms}
              onChange={onChange}
            />

            <input
              name="bathrooms"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              placeholder="Baños"
              type="number"
              min="0"
              value={form.bathrooms}
              onChange={onChange}
            />

            <input
              name="built_area"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              placeholder="Metros construidos"
              type="number"
              min="0"
              step="0.01"
              value={form.built_area}
              onChange={onChange}
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-4 text-lg font-bold text-gray-800">
            Presentación pública
          </legend>

          <input
            name="cover_image"
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
            placeholder="URL pública de la imagen principal"
            type="url"
            value={form.cover_image}
            onChange={onChange}
          />

          <p className="mt-2 text-sm text-gray-500">
            Próximamente podrás subir fotografías directamente.
          </p>
        </fieldset>

        <fieldset>
          <legend className="mb-4 text-lg font-bold text-gray-800">
            Descripción
          </legend>

          <textarea
            name="description"
            className="min-h-44 w-full resize-y rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
            placeholder="Describe la vivienda, sus espacios, ventajas y entorno..."
            value={form.description}
            onChange={onChange}
          />
        </fieldset>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={saving}
          className="rounded-2xl bg-red-600 px-7 py-3 font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {saving
            ? "Guardando..."
            : editingId
              ? "Guardar cambios"
              : "Publicar inmueble"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl bg-gray-700 px-7 py-3 font-bold text-white hover:bg-gray-800"
          >
            Cancelar edición
          </button>
        )}
      </div>
    </form>
  );
}

export default PropertyForm;