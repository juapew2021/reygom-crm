import Card from "../common/Card";
import Badge from "../common/Badge";

function RecentProperties({ properties = [] }) {
  return (
    <Card
      title="Últimos Inmuebles"
      subtitle="Inmuebles añadidos recientemente"
    >
      {properties.length === 0 ? (
        <p className="text-gray-500">
          No hay inmuebles registrados.
        </p>
      ) : (
        <div className="space-y-4">
          {properties.map((property) => (
            <div
              key={property.id}
              className="flex justify-between items-center border-b pb-3"
            >
              <div>
                <p className="font-semibold text-gray-900">
                  {property.reference_id}
                </p>

                <p className="text-sm text-gray-500">
                  {property.title}
                </p>

                <p className="text-red-600 font-bold">
                  € {property.price}
                </p>
              </div>

              <Badge>
                {property.status}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default RecentProperties;