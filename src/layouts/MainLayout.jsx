import { Link, useLocation, useNavigate } from "react-router-dom";

function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const appVersion =
    import.meta.env.VITE_APP_VERSION || "0.5.0-dev";

  const appEnvironment =
    import.meta.env.VITE_APP_ENV || "DEV";

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const linkClass = (path) =>
    [
      "block rounded-xl px-3 py-2 transition",
      location.pathname.startsWith(path)
        ? "bg-white/10 font-bold text-brand-red"
        : "text-white hover:bg-white/5 hover:text-brand-red",
    ].join(" ");

  return (
    <div className="min-h-screen bg-brand-black text-white">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-black p-6">
        <h1 className="mb-10 text-2xl font-bold">
          ReyGom{" "}
          <span className="text-brand-red">
            CRM
          </span>
        </h1>

        <nav className="space-y-2">
          <Link
            to="/dashboard"
            className={linkClass("/dashboard")}
          >
            Dashboard
          </Link>

          <Link
            to="/properties"
            className={linkClass("/properties")}
          >
            Inmuebles
          </Link>

          <Link
            to="/leads"
            className={linkClass("/leads")}
          >
            Leads
          </Link>

          <span className="block rounded-xl px-3 py-2 text-gray-500">
            Agenda
          </span>

          <span className="block rounded-xl px-3 py-2 text-gray-500">
            Reportes
          </span>
        </nav>

        <div className="mt-auto pt-8">
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-xl bg-brand-red px-5 py-3 font-bold text-white transition hover:bg-red-700"
          >
            Cerrar sesión
          </button>

          <div className="mt-2 text-center text-xs text-slate-400">
            <div>CRM {appEnvironment}</div>
            <div>v{appVersion}</div>
          </div>
        </div>
      </aside>

      <main className="min-h-screen pl-64">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default MainLayout;