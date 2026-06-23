import { useEffect, useState } from "react";
import api from "../../services/api";
import MainLayout from "../../layouts/MainLayout";

function PropertiesPage() {
  const emptyForm = {
    reference_id: "",
    title: "",
    description: "",
    price: "",
    operation_type: "Venta",
    property_type: "Piso",
    status: "Disponible"
  };

  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const loadProperties = async () => {
    const response = await api.get("/properties");
    setProperties(response.data);
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      await api.put(`/properties/${editingId}`, form);
    } else {
      await api.post("/properties", form);
    }

    setForm(emptyForm);
    setEditingId(null);
    loadProperties();
  };

  const handleEdit = (property) => {
    setEditingId(property.id);
    setForm({
      reference_id: property.reference_id || "",
      title: property.title || "",
      description: property.description || "",
      price: property.price || "",
      operation_type: property.operation_type || "Venta",
      property_type: property.property_type || "Piso",
      status: property.status || "Disponible"
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("¿Seguro que deseas eliminar este inmueble?");

    if (!confirmed) return;

    await api.delete(`/properties/${id}`);
    loadProperties();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">
        Gestión de Inmuebles
      </h1>

      <div className="bg-white p-6 rounded shadow mb-8 text-black">
        <h2 className="text-xl font-bold mb-4">
          {editingId ? "Editar inmueble" : "Nuevo inmueble"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <input
              className="border border-gray-400 p-2 rounded text-black w-full"
              placeholder="Referencia"
              value={form.reference_id}
              onChange={(e) => setForm({ ...form, reference_id: e.target.value })}
            />

            <input
              className="border border-gray-400 p-2 rounded text-black w-full"
              placeholder="Título"
              value={form.title}
              required
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <input
              className="border border-gray-400 p-2 rounded text-black w-full"
              placeholder="Precio"
              type="number"
              value={form.price}
              required
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />

            <input
              className="border border-gray-400 p-2 rounded text-black w-full"
              placeholder="Tipo inmueble"
              value={form.property_type}
              onChange={(e) => setForm({ ...form, property_type: e.target.value })}
            />

            <select
              className="border border-gray-400 p-2 rounded text-black w-full"
              value={form.operation_type}
              onChange={(e) => setForm({ ...form, operation_type: e.target.value })}
            >
              <option>Venta</option>
              <option>Alquiler</option>
            </select>

            <select
              className="border border-gray-400 p-2 rounded text-black w-full"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option>Disponible</option>
              <option>Reservado</option>
              <option>Vendido</option>
              <option>Alquilado</option>
              <option>Oculto</option>
            </select>
          </div>

          <textarea
            className="w-full border border-gray-400 mt-4 p-2 rounded text-black"
            placeholder="Descripción"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="bg-red-600 text-white px-6 py-2 rounded font-bold"
            >
              {editingId ? "Guardar cambios" : "Crear inmueble"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-700 text-white px-6 py-2 rounded font-bold"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded shadow p-6 text-black">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th>Referencia</th>
              <th>Título</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {properties.map((property) => (
              <tr key={property.id} className="border-b">
                <td>{property.reference_id}</td>
                <td>{property.title}</td>
                <td>{Number(property.price).toLocaleString("es-ES")} €</td>
                <td>{property.status}</td>
                <td className="flex gap-2 py-2">
                  <button
                    onClick={() => handleEdit(property)}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => handleDelete(property.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}

export default PropertiesPage;
