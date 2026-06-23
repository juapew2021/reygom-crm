import MainLayout from '../layouts/MainLayout';

function Dashboard() {
  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">
        Dashboard
      </h1>

      <div className="bg-white rounded-lg p-6 text-black">
        <h2 className="text-xl font-bold mb-4">
          Bienvenido a ReyGom CRM
        </h2>

        <p>
          Sistema de gestión inmobiliaria.
        </p>
      </div>
    </MainLayout>
  );
}

export default Dashboard;
