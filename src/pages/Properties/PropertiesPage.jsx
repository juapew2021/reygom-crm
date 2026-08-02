import { useEffect, useState } from "react";
import api from "../../services/api";
import MainLayout from "../../layouts/MainLayout";
import PropertyForm from "../../components/properties/PropertyForm";
import PropertyPreview from "../../components/properties/PropertyPreview";
import PropertyList from "../../components/properties/PropertyList";
import PropertyMediaUploader from "../../components/properties/PropertyMediaUploader";

function PropertiesPage() {
  const emptyForm = {
    reference_id: "",
    title: "",
    description: "",
    price: "",
    operation_type: "Venta",
    property_type: "Piso",
    status: "Disponible",
    cover_image: "",
    city: "",
    province: "",
    bedrooms: "",
    bathrooms: "",
    built_area: "",
  };

  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await api.get("/properties");
      setProperties(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      console.error(requestError);
      setError("No se han podido cargar los inmuebles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleChange = ({ target: { name, value } }) => {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

const handleSubmit = async (event) => {
  event.preventDefault();

  try {
    setSaving(true);
    setMessage("");
    setError("");

    const { reference_id, ...formWithoutReference } = form;

    const payload = {
      ...formWithoutReference,
      bedrooms: form.bedrooms === "" ? null : Number(form.bedrooms),
      bathrooms: form.bathrooms === "" ? null : Number(form.bathrooms),
      built_area: form.built_area === "" ? null : Number(form.built_area),
      cover_image: form.cover_image || null,
      city: form.city || null,
      province: form.province || null,
    };

    if (editingId) {
      payload.reference_id = reference_id;

      await api.put(`/properties/${editingId}`, payload);

      setMessage("Inmueble actualizado correctamente.");
      await loadProperties();
    } else {
      const createResponse = await api.post("/properties", payload);
      const createdId = createResponse.data?.id;

      if (!createdId) {
        throw new Error(
          "La API creó el inmueble, pero no devolvió su identificador."
        );
      }

      const propertyResponse = await api.get(
        `/properties/${createdId}`
      );

      const createdProperty = propertyResponse.data;

      setEditingId(createdId);

      setForm({
        reference_id: createdProperty.reference_id || "",
        title: createdProperty.title || "",
        description: createdProperty.description || "",
        price: createdProperty.price || "",
        operation_type:
          createdProperty.operation_type || "Venta",
        property_type:
          createdProperty.property_type || "Piso",
        status: createdProperty.status || "Disponible",
        cover_image: createdProperty.cover_image || "",
        city: createdProperty.city || "",
        province: createdProperty.province || "",
        bedrooms: createdProperty.bedrooms ?? "",
        bathrooms: createdProperty.bathrooms ?? "",
        built_area: createdProperty.built_area ?? "",
      });

      setMessage(
        "Inmueble creado correctamente. Ya puedes subir sus fotografías."
      );

      await loadProperties();
    }
  } catch (requestError) {
    console.error(requestError);

    setError(
      requestError.response?.data?.message ||
        requestError.message ||
        "No se ha podido guardar el inmueble."
    );
  } finally {
    setSaving(false);
  }
};

  const handleEdit = (property) => {
    setEditingId(property.id);
    setMessage("");
    setError("");

    setForm({
      reference_id: property.reference_id || "",
      title: property.title || "",
      description: property.description || "",
      price: property.price || "",
      operation_type: property.operation_type || "Venta",
      property_type: property.property_type || "Piso",
      status: property.status || "Disponible",
      cover_image: property.cover_image || "",
      city: property.city || "",
      province: property.province || "",
      bedrooms: property.bedrooms ?? "",
      bathrooms: property.bathrooms ?? "",
      built_area: property.built_area ?? "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "¿Seguro que deseas eliminar este inmueble?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/properties/${id}`);
      setMessage("Inmueble eliminado correctamente.");
      await loadProperties();
    } catch (requestError) {
      console.error(requestError);
      setError("No se ha podido eliminar el inmueble.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
  };

  return (
    <MainLayout>
      <header className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-600">
          Property Publisher
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">
          Publicar inmuebles
        </h1>

        <p className="mt-2 max-w-3xl text-gray-400">
          Construye la presentación que verá el comprador en ReyGom Web.
        </p>
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

      <section className="mb-12 rounded-3xl bg-white p-6 shadow-sm md:p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingId ? "Editar inmueble" : "Nuevo inmueble"}
          </h2>

          <p className="mt-1 text-gray-500">
            Los cambios se reflejan automáticamente en la vista previa.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[1.25fr_0.75fr]">
  <div className="space-y-10">
    <PropertyForm
      form={form}
      editingId={editingId}
      saving={saving}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={cancelEdit}
    />

    <PropertyMediaUploader
      propertyId={editingId}
      onGalleryChange={(images) => {
        const coverImage = images.find(
          (image) => image.is_cover
        );

        if (coverImage) {
          setForm((current) => ({
            ...current,
            cover_image: coverImage.image_url,
          }));
        }
      }}
    />
  </div>

          <PropertyPreview property={form} />
        </div>
      </section>

      <PropertyList
        properties={properties}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </MainLayout>
  );
}

export default PropertiesPage;