import {
  Building2,
  Users,
  CalendarDays,
  Euro,
} from "lucide-react";

import StatsCard from "./StatsCard";

function StatsGrid({ dashboard }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <StatsCard
        title="Inmuebles"
        value={dashboard?.properties_count ?? 0}
        icon={Building2}
      />

      <StatsCard
        title="Leads"
        value={dashboard?.leads_count ?? 0}
        icon={Users}
      />

      <StatsCard
        title="Visitas"
        value={dashboard?.visits_today ?? 0}
        icon={CalendarDays}
      />

      <StatsCard
        title="Ventas"
        value={dashboard?.sales_count ?? 0}
        icon={Euro}
      />
    </div>
  );
}

export default StatsGrid;