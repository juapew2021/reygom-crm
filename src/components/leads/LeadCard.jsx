import Card from "../common/Card";
import Badge from "../common/Badge";
import Button from "../common/Button";

function LeadCard({ lead, contact, onEdit, onDelete }) {
  return (
    <Card>
      <div className="space-y-3 text-gray-800">
        <div>
          <h3 className="text-xl font-bold">👤 {lead.full_name}</h3>
          <Badge>{lead.pipeline_stage}</Badge>
        </div>

        <p>📞 {contact.phone || "-"}</p>
        <p>✉️ {contact.email || "-"}</p>

        <p>
          🏠{" "}
          {lead.property_reference
            ? `${lead.property_reference} - ${lead.property_title}`
            : "Sin inmueble asociado"}
        </p>

        <div className="flex gap-2 pt-4">
          <Button variant="edit" onClick={() => onEdit(lead)}>
            Editar
          </Button>

          <Button variant="danger" onClick={() => onDelete(lead.id)}>
            Eliminar
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default LeadCard;