import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";

import api from "../../services/api";
import MainLayout from "../../layouts/MainLayout";
import PropertyList from "../../components/properties/PropertyList";

function PropertiesListPage() {
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Todos");
  const [operationType, setOperationType] = useState("Todos");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/properties");

      setProperties(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (requestError) {
      console.error(
        "Error cargando inmuebles:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "No se han podido cargar los inmuebles."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const filteredProperties = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return properties.filter((property) => {
      const matchesSearch =
        normalizedSearch === "" ||
        property.title
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        property.reference_id
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        property.city
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        property.province
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        status === "Todos" ||
        property.status === status;

      const matchesOperation =
        operationType === "Todos" ||
        property.operation_type === operationType;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesOperation
      );
    });
  }, [
    properties,
    search,
    status,
    operationType,
  ]);

  const handleEdit = (property) => {
    navigate(`/properties/${property.id}`);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "¿Seguro que deseas eliminar este inmueble?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      await api.delete(`/properties/${id}`);

      setMessage(
        "Inmueble eliminado correctamente."
      );

      await loadProperties();
    } catch (requestError) {
      console.error(
        "Error eliminando inmueble:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "No se ha podido eliminar el inmueble."
      );
    }
  };

  return (
    <MainLayout>
      <header className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-600">
            Gestión inmobiliaria
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">
            Inmuebles
          </h1>

          <p className="mt-2 max-w-3xl text-gray-400">
            Consulta, filtra y administra todos los
            inmuebles registrados en ReyGom.
          </p>
        </div>

        <Link
          to="/properties/new"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
        >
          <Plus size={20} />
          Publicar inmueble
        </Link>
      </header>

      {message && (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 font-medium text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 font-medium text-red-700">
          {error}
        </div>
      )}

      <section className="mb-8 rounded-3xl bg-white p-5 shadow-sm md:p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px_220px]">
          <label className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Buscar por título, referencia, ciudad o provincia"
              className="w-full rounded-2xl border border-gray-300 py-3 pl-11 pr-4 text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </label>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          >
            <option value="Todos">
              Todos los estados
            </option>
            <option value="Disponible">
              Disponible
            </option>
            <option value="Reservado">
              Reservado
            </option>
            <option value="Vendido">
              Vendido
            </option>
            <option value="Alquilado">
              Alquilado
            </option>
            <option value="Oculto">
              Oculto
            </option>
          </select>

          <select
            value={operationType}
            onChange={(event) =>
              setOperationType(
                event.target.value
              )
            }
            className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          >
            <option value="Todos">
              Todas las operaciones
            </option>
            <option value="Venta">
              Venta
            </option>
            <option value="Alquiler">
              Alquiler
            </option>
          </select>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Mostrando {filteredProperties.length} de{" "}
          {properties.length} inmueble
          {properties.length === 1 ? "" : "s"}.
        </p>
      </section>

      <PropertyList
        properties={filteredProperties}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </MainLayout>
  );
}

export default PropertiesListPage;