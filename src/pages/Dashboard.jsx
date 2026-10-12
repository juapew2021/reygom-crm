import { useEffect, useState } from "react";

import MainLayout from "../layouts/MainLayout";
import PageHeader from "../components/common/PageHeader";
import StatsGrid from "../components/dashboard/StatsGrid";
import PipelineSummary from "../components/dashboard/PipelineSummary";
import RecentLeads from "../components/dashboard/RecentLeads";
import RecentProperties from "../components/dashboard/RecentProperties";
import api from "../services/api";
import { mergeVisibleProperties, mergeVisibleLeads } from "../services/dashboardSummary";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      api.get("/dashboard", { signal: controller.signal }),
      api.get("/properties", { signal: controller.signal }),
      api.get("/leads", { signal: controller.signal }),
    ]).then(([summary, properties, leads]) => {
      if (!controller.signal.aborted) {
        setDashboard(mergeVisibleLeads(mergeVisibleProperties(summary.data, properties.data), leads.data));
      }
    }).catch(() => {
      if (!controller.signal.aborted) {
        setError("No se pudo cargar el resumen del dashboard. Vuelve a intentarlo.");
      }
    });
    return () => controller.abort();
  }, []);

  return (
    <MainLayout>
      <PageHeader
        title="Dashboard"
        subtitle="Resumen general de actividad comercial e inmobiliaria."
      />

      {error && <p role="alert" className="mb-6 text-red-400">{error}</p>}
      {!dashboard && !error && <p role="status">Cargando dashboard...</p>}
      {dashboard && <>
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
      </>}
    </MainLayout>
  );
}

export default Dashboard;