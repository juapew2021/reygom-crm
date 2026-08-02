import Card from "../common/Card";
import Badge from "../common/Badge";

function RecentLeads({ leads = [] }) {
  return (
    <Card
      title="Últimos Leads"
      subtitle="Clientes potenciales incorporados recientemente"
    >
      {leads.length === 0 ? (
        <p className="text-gray-500">
          No hay leads registrados.
        </p>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="flex justify-between items-center border-b pb-3"
            >
              <div>
                <p className="font-semibold text-gray-900">
                  {lead.full_name}
                </p>

                <p className="text-sm text-gray-500">
                  {lead.created_at}
                </p>
              </div>

              <Badge>
                {lead.pipeline_stage}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default RecentLeads;