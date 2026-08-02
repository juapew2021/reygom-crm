import { useEffect, useState } from "react";
import {
  ArrowLeft,
  LoaderCircle,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../../services/api";
import MainLayout from "../../layouts/MainLayout";
import PropertyForm from "../../components/properties/PropertyForm";
import PropertyPreview from "../../components/properties/PropertyPreview";
import PropertyMediaUploader from "../../components/properties/PropertyMediaUploader";

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

function PropertyEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditing = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [propertyId, setPropertyId] = useState(
    id || null
  );

  const [loading, setLoading] = useState(
    isEditing
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProperty = async (
    targetPropertyId
  ) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/properties/${targetPropertyId}`
      );

      const property = response.data;

      setPropertyId(property.id);

      setForm({
        reference_id:
          property.reference_id || "",
        title: property.title || "",
        description:
          property.description || "",
        price: property.price || "",
        operation_type:
          property.operation_type || "Venta",
        property_type:
          property.property_type || "Piso",
        status:
          property.status || "Disponible",
        cover_image:
          property.cover_image || "",
        city: property.city || "",
        province: property.province || "",
        bedrooms:
          property.bedrooms ?? "",
        bathrooms:
          property.bathrooms ?? "",
        built_area:
          property.built_area ?? "",
      });
    } catch (requestError) {
      console.error(
        "Error cargando inmueble:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "No se pudo cargar el inmueble."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadProperty(id);
    }
  }, [id]);

  const handleChange = ({
    target: { name, value },
  }) => {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const buildPayload = () => {
    const {
      reference_id,
      ...formWithoutReference
    } = form;

    const payload = {
      ...formWithoutReference,
      bedrooms:
        form.bedrooms === ""
          ? null
          : Number(form.bedrooms),

      bathrooms:
        form.bathrooms === ""
          ? null
          : Number(form.bathrooms),

      built_area:
        form.built_area === ""
          ? null
          : Number(form.built_area),

      cover_image:
        form.cover_image || null,

      city:
        form.city || null,

      province:
        form.province || null,
    };

    if (propertyId) {
      payload.reference_id = reference_id;
    }

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const payload = buildPayload();

      if (propertyId) {
        await api.put(
          `/properties/${propertyId}`,
          payload
        );

        setMessage(
          "Inmueble actualizado correctamente."
        );

        await loadProperty(propertyId);

        return;
      }

      const createResponse =
        await api.post(
          "/properties",
          payload
        );

      const createdId =
        createResponse.data?.id;

      if (!createdId) {
        throw new Error(
          "La API creó el inmueble, pero no devolvió su identificador."
        );
      }

      setPropertyId(createdId);

      await loadProperty(createdId);

      setMessage(
        "Inmueble creado correctamente. Ya puedes subir sus fotografías."
      );

      navigate(
        `/properties/${createdId}`,
        { replace: true }
      );
    } catch (requestError) {
      console.error(
        "Error guardando inmueble:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "No se ha podido guardar el inmueble."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/properties");
  };

  const handleGalleryChange = (
    images
  ) => {
    const coverImage = images.find(
      (image) => image.is_cover
    );

    setForm((current) => ({
      ...current,
      cover_image:
        coverImage?.image_url || "",
    }));
  };

  return (
    <MainLayout>
      <header className="mb-8">
        <Link
          to="/properties"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 transition hover:text-white"
        >
          <ArrowLeft size={18} />
          Volver a inmuebles
        </Link>

        <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-red-600">
          Property Publisher
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">
          {propertyId
            ? "Editar inmueble"
            : "Publicar inmueble"}
        </h1>

        <p className="mt-2 max-w-3xl text-gray-400">
          {propertyId
            ? "Actualiza la ficha, la galería y la presentación pública del inmueble."
            : "Crea una nueva ficha inmobiliaria y prepara su presentación para ReyGom Web."}
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

      {loading ? (
        <div className="flex min-h-[420px] items-center justify-center rounded-3xl bg-white p-8 text-gray-600">
          <LoaderCircle
            size={24}
            className="mr-3 animate-spin text-red-600"
          />

          Cargando inmueble...
        </div>
      ) : (
        <section className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              {propertyId
                ? "Información del inmueble"
                : "Nuevo inmueble"}
            </h2>

            <p className="mt-1 text-gray-500">
              Los cambios se reflejan automáticamente en la vista previa.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="space-y-10">
              <PropertyForm
                form={form}
                editingId={propertyId}
                saving={saving}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />

              <PropertyMediaUploader
                propertyId={propertyId}
                onGalleryChange={
                  handleGalleryChange
                }
              />
            </div>

            <PropertyPreview
              property={form}
            />
          </div>
        </section>
      )}
    </MainLayout>
  );
}

export default PropertyEditorPage;