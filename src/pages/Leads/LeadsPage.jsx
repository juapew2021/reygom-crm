import { useEffect, useState } from "react";
import api from "../../services/api";
import MainLayout from "../../layouts/MainLayout";
import Button from "../../components/common/Button";
import Input from "../../components/forms/Input";
import Select from "../../components/forms/Select";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/common/EmptyState";
import LeadCard from "../../components/leads/LeadCard";

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    await api.post("/leads", {
      full_name: form.full_name,
      contact_info: {
        phone: form.phone,
        email: form.email
      },
      pipeline_stage: form.pipeline_stage,
      property_interest_id: form.property_interest_id || null
    });

    setForm(emptyForm);
    loadLeads();
  };

  const getContact = (lead) => {
    try {
      return typeof lead.contact_info === "string"
        ? JSON.parse(lead.contact_info)
        : lead.contact_info;
    } catch {
      return {};
    }
  };

  return (
    <MainLayout>
      <PageHeader
  title="Gestión de Leads"
  subtitle="Administra clientes potenciales y oportunidades comerciales."
/>

      <div className="bg-white p-6 rounded shadow mb-8 text-black">
        <h2 className="text-xl font-bold mb-4">Nuevo lead</h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Nombre completo"
              value={form.full_name}
              required
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />

            <Input
              className="border border-gray-400 p-2 rounded"
              placeholder="Teléfono"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <Input
              className="border border-gray-400 p-2 rounded"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <Select
              className="border border-gray-400 p-2 rounded"
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
              className="border border-gray-400 p-2 rounded md:col-span-2"
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

          <Button className="mt-4" onClick={handleSubmit}>
            Crear lead
          </Button>
        </form>
      </div>

      <div className="bg-white rounded shadow p-6 text-black overflow-x-auto">
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
          onEdit={(lead) => console.log("Editar", lead)}
          onDelete={(id) => console.log("Eliminar", id)}
        />
      );
    })}
  </div>
)}
      </div>
    </MainLayout>
  );
}

export default LeadsPage;
