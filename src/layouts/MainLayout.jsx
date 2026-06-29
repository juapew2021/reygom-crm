import { Link, useNavigate } from "react-router-dom";

function MainLayout({ children }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-brand-black text-white flex">
      <aside className="w-64 bg-black p-6">
        <h1 className="text-2xl font-bold mb-10">
          ReyGom <span className="text-brand-red">CRM</span>
        </h1>

        <nav className="space-y-4">
          <Link
            to="/dashboard"
            className="block hover:text-brand-red transition"
          >
            Dashboard
          </Link>

          <Link
            to="/properties"
            className="block hover:text-brand-red transition"
          >
            Inmuebles
          </Link>

          <Link
            to="/leads"
            className="block hover:text-brand-red transition"
          >
            Leads
          </Link>

          <span className="block text-gray-500">
            Agenda
          </span>

          <span className="block text-gray-500">
            Reportes
          </span>
        </nav>

        <button
          onClick={logout}
          className="mt-10 bg-brand-red hover:bg-red-700 text-white px-5 py-2 rounded font-bold transition"
        >
          Cerrar sesión
        </button>
      </aside>

      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}

export default MainLayout;
