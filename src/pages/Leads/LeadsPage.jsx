import { useEffect, useState } from "react";
import api from "../../services/api";
import MainLayout from "../../layouts/MainLayout";
import Button from "../../components/common/Button";
import Input from "../../components/forms/Input";
import Select from "../../components/forms/Select";

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
      <h1 className="text-3xl font-bold mb-6">Gestión de Leads</h1>

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
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Inmueble</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {leads.map((lead) => {
              const contact = getContact(lead);

              return (
                <tr key={lead.id} className="border-b">
                  <td>{lead.full_name}</td>
                  <td>{contact.phone || "-"}</td>
                  <td>{contact.email || "-"}</td>
                  <td>
                    {lead.property_reference
                      ? `${lead.property_reference} - ${lead.property_title}`
                      : "-"}
                  </td>
                  <td>{lead.pipeline_stage}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}

export default LeadsPage;
