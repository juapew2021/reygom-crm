import Card from "../common/Card";

function StatsCard({ title, value, icon: Icon }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 font-semibold">{title}</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{value}</p>
        </div>

        {Icon && (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl">
            <Icon size={32} />
          </div>
        )}
      </div>
    </Card>
  );
}

export default StatsCard;