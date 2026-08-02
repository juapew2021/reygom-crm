import { useEffect, useState } from "react";
import api from "../../services/api";
import MainLayout from "../../layouts/MainLayout";
import Button from "../../components/common/Button";
import Input from "../../components/forms/Input";
import Select from "../../components/forms/Select";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/common/EmptyState";
import LeadCard from "../../components/leads/LeadCard";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Toast from "../../components/common/Toast";

function LeadsPage() {
  const emptyForm = {
    full_name: "",
    phone: "",
    email: "",
    pipeline_stage: "Nuevo",
    property_interest_id: ""
  };

  const [leads, setLeads] = useState([]);
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState("");

  const loadLeads = async () => {
    const response = await api.get("/leads");
    setLeads(response.data);
  };

  const loadProperties = async () => {
    const response = await api.get("/properties");
    setProperties(response.data);
  };

  useEffect(() => {
    loadLeads();
    loadProperties();
  }, []);

  const getContact = (lead) => {
    try {
      return typeof lead.contact_info === "string"
        ? JSON.parse(lead.contact_info)
        : lead.contact_info;
    } catch {
      return {};
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      full_name: form.full_name,
      contact_info: {
        phone: form.phone,
        email: form.email
      },
      pipeline_stage: form.pipeline_stage,
      property_interest_id: form.property_interest_id || null
    };

    if (editingId) {
      await api.put(`/leads/${editingId}`, payload);
      setToast("Lead actualizado correctamente");
    } else {
      await api.post("/leads", payload);
      setToast("Lead creado correctamente");
    }

    setForm(emptyForm);
    setEditingId(null);
    loadLeads();
  };

  const handleEdit = (lead) => {
    const contact = getContact(lead);

    setEditingId(lead.id);
    setForm({
      full_name: lead.full_name || "",
      phone: contact.phone || "",
      email: contact.email || "",
      pipeline_stage: lead.pipeline_stage || "Nuevo",
      property_interest_id: lead.property_interest_id || ""
    });
  };

  const confirmDelete = async () => {
    await api.delete(`/leads/${deleteId}`);
    setDeleteId(null);
    setToast("Lead eliminado correctamente");
    loadLeads();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <MainLayout>
      <Toast message={toast} />

      <PageHeader
        title="Gestión de Leads"
        subtitle="Administra clientes potenciales y oportunidades comerciales."
      />

      <div className="bg-white p-6 rounded shadow mb-8 text-black">
        <h2 className="text-xl font-bold mb-4">
          {editingId ? "Editar lead" : "Nuevo lead"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Nombre completo"
              value={form.full_name}
              required
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />

            <Input
              placeholder="Teléfono"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <Select
              value={form.pipeline_stage}
              onChange={(e) => setForm({ ...form, pipeline_stage: e.target.value })}
            >
              <option>Nuevo</option>
              <option>Contactado</option>
              <option>Visita</option>
              <option>Oferta</option>
              <option>Negociación</option>
              <option>Venta Cerrada</option>
              <option>Perdido</option>
            </Select>

            <Select
              className="md:col-span-2"
              value={form.property_interest_id}
              onChange={(e) => setForm({ ...form, property_interest_id: e.target.value })}
            >
              <option value="">Sin inmueble asociado</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.reference_id} - {property.title}
                </option>
              ))}
            </Select>
          </div>

          <div className="mt-4 flex gap-3">
            <Button type="submit">
              {editingId ? "Guardar cambios" : "Crear lead"}
            </Button>

            {editingId && (
              <Button variant="secondary" onClick={cancelEdit}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </div>

      {leads.length === 0 ? (
        <EmptyState
          icon="👥"
          title="Todavía no tienes leads"
          description="Crea tu primer lead para empezar a gestionar oportunidades comerciales."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {leads.map((lead) => {
            const contact = getContact(lead);

            return (
              <LeadCard
                key={lead.id}
                lead={lead}
                contact={contact}
                onEdit={handleEdit}
                onDelete={setDeleteId}
              />
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        title="Eliminar lead"
        message="¿Seguro que deseas eliminar este lead?"
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </MainLayout>
  );
}

export default LeadsPage;