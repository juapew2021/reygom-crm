import { useEffect, useState } from "react";

import MainLayout from "../layouts/MainLayout";
import PageHeader from "../components/common/PageHeader";
import StatsGrid from "../components/dashboard/StatsGrid";
import PipelineSummary from "../components/dashboard/PipelineSummary";
import RecentLeads from "../components/dashboard/RecentLeads";
import RecentProperties from "../components/dashboard/RecentProperties";
import api from "../services/api";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    api.get("/dashboard").then((response) => {
      setDashboard(response.data);
    });
  }, []);

  return (
    <MainLayout>
      <PageHeader
        title="Dashboard"
        subtitle="Resumen general de actividad comercial e inmobiliaria."
      />

      <div className="mb-8">
        <StatsGrid dashboard={dashboard} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <PipelineSummary pipeline={dashboard?.pipeline} />

        <RecentLeads
          leads={dashboard?.latest_leads || []}
        />

        <RecentProperties
          properties={dashboard?.latest_properties || []}
        />
      </div>
    </MainLayout>
  );
}

export default Dashboard;