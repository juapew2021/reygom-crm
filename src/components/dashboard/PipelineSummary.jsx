import Card from "../common/Card";
import Badge from "../common/Badge";

function PipelineSummary({ pipeline = {} }) {
  const stages = Object.entries(pipeline);

  return (
    <Card title="Pipeline comercial" subtitle="Leads agrupados por estado">
      {stages.length === 0 ? (
        <p className="text-gray-500">Todavía no hay datos de pipeline.</p>
      ) : (
        <div className="space-y-3">
          {stages.map(([stage, total]) => (
            <div key={stage} className="flex items-center justify-between">
              <Badge>{stage}</Badge>
              <span className="text-gray-900 font-bold">{total}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default PipelineSummary;