import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

import api from "../../services/api";
import { groupCrawlerMessages, searchCrawlerInBatches } from "../../services/crawlerSearch";
import MainLayout from "../../layouts/MainLayout";

const QUERY_OPTIONS = [
  {
    id: "disponibles",
    label: "Alquileres disponibles",
    description: "Inmuebles en alquiler con estado Disponible.",
  },
  {
    id: "externa",
    label: "Búsqueda externa (portales)",
    description: "Busca pisos de alquiler en Idealista, Fotocasa, Habitaclia, Milanuncios, Wallapop, Pisos.com, API.cat, Fincas Ollé, Finques Bou, La Llave del Hogar, Basmi Finques, Finques Mixoy, Finques El Pallars, GuinotPrunera, Tecnocasa, Donpiso, Engel & Völkers, Lucas Fox, Bcn Advisors, Coldwell Banker, ShBarcelona, aTemporal, Serviguest, AB Apartment Barcelona, Spotahome, HousingAnywhere y Uniplaces.",
  },
];

const EXTERNAL_SOURCES = [
  { id: "idealista", label: "Idealista" },
  { id: "fotocasa", label: "Fotocasa" },
  { id: "habitaclia", label: "Habitaclia" },
  { id: "milanuncios", label: "Milanuncios" },
  { id: "wallapop", label: "Wallapop" },
  { id: "pisoscom", label: "Pisos.com" },
  { id: "apicat", label: "API.cat" },
  { id: "fincasolle", label: "Fincas Ollé" },
  { id: "finquesbou", label: "Finques Bou" },
  { id: "lallave", label: "La Llave del Hogar" },
  { id: "basmi", label: "Basmi Finques" },
  { id: "mixoy", label: "Finques Mixoy" },
  { id: "pallars", label: "Finques El Pallars" },
 { id: "guinotprunera", label: "GuinotPrunera" },
 { id: "tecnocasa", label: "Tecnocasa" },
  { id: "donpiso", label: "Donpiso" },
    { id: "engelvoelkers", label: "Engel & Völkers" },
              { id: "lucasfox", label: "Lucas Fox" },
              { id: "bcnadvisors", label: "Bcn Advisors" },
                { id: "coldwellbanker", label: "Coldwell Banker" },
                { id: "shbarcelona", label: "ShBarcelona" },
            { id: "atemporal", label: "aTemporal" },
            { id: "serviguest", label: "Serviguest" },
        { id: "ab_apartment_barcelona", label: "AB Apartment Barcelona" },
        { id: "spotahome", label: "Spotahome" },
          { id: "housinganywhere", label: "HousingAnywhere" },
          { id: "uniplaces", label: "Uniplaces" },
          { id: "flatio", label: "Flatio" },
          { id: "rentola", label: "Rentola" },
          { id: "kelify", label: "Kelify" },
];

const METRO_CITIES = [
  { id: "Hospitalet de Llobregat", label: "L'Hospitalet de Llobregat" },
  { id: "El Prat de Llobregat", label: "El Prat de Llobregat" },
  { id: "Badalona", label: "Badalona" },
  { id: "Cornella de Llobregat", label: "Cornellà de Llobregat" },
  { id: "Sant Adria de Besos", label: "Sant Adrià de Besòs" },
  { id: "Santa Coloma de Gramenet", label: "Santa Coloma de Gramenet" },
];

const SCRAPER_URL =
  import.meta.env.VITE_SCRAPER_URL ||
  (import.meta.env.VITE_APP_ENV === "DEV"
    ? "/crawler/search"
    : "https://scraper.reygom.com/search");

const OWNER_TYPE_LABELS = {
  particular: "Particular",
  agencia: "Agencia",
  desconocido: "Sin especificar",
};

const DEFAULT_EXTERNAL_FILTERS = {
  rental_kind: "entire",
  room_occupancy: "single",
  include_unconfirmed_occupancy: false,
  city: "Barcelona",
  bedrooms_min: "2",
  bathrooms_min: "1",
  price_min: "1400",
  price_max: "1700",
  owner_only: true,
  long_term: true,
  max_age_hours: "72",
  sources: EXTERNAL_SOURCES.map((source) => source.id),
  metroCities: [],
};

function CrawlerMessages({ title, messages, neutral = false }) {
  const groups = groupCrawlerMessages(messages);
  if (!groups.length) return null;
  return (
    <section className={"mt-6 rounded-2xl border p-4 text-sm " + (neutral ? "border-slate-200 bg-slate-50 text-slate-700" : "border-amber-200 bg-amber-50 text-amber-800")}>
      <h3 className="font-bold">{title}</h3>
      <ul className="mt-2 space-y-2">
        {groups.map((group) => (
          <li key={group.key}>
            <details>
              <summary className="cursor-pointer">
                <span className="font-semibold">{group.sourceLabel}{group.cities.length === 1 ? " (" + group.cities[0] + ")" : " (" + group.cities.length + " municipios)"}:</span>{" "}{group.message}
              </summary>
              {group.cities.length > 1 && <p className="mt-1 pl-4">Municipios: {group.cities.join(", ")}</p>}
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}

function AlquileresPage() {
  const navigate = useNavigate();

  const [queryType, setQueryType] = useState("disponibles");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [externalFilters, setExternalFilters] = useState(DEFAULT_EXTERNAL_FILTERS);
  const [externalResults, setExternalResults] = useState([]);
  const [externalSourceErrors, setExternalSourceErrors] = useState({});
  const [externalSourceNotices, setExternalSourceNotices] = useState({});
  const [externalLoading, setExternalLoading] = useState(false);
  const [externalError, setExternalError] = useState("");
  const [externalQueried, setExternalQueried] = useState(false);
  const [externalProgress, setExternalProgress] = useState({ completed: 0, total: 0 });
  const externalAbort = useRef(null);

  useEffect(() => () => {
    externalAbort.current?.abort();
    externalAbort.current = null;
  }, []);


  useEffect(() => {
    const controller = new AbortController();
    api.get("/properties", { signal: controller.signal }).then((response) => {
      if (!controller.signal.aborted) {
        setProperties(Array.isArray(response.data) ? response.data : []);
      }
    }).catch((requestError) => {
      if (!controller.signal.aborted) {
        console.error("Error cargando inmuebles:", requestError);
        setError("No se han podido cargar los inmuebles.");
      }
    }).finally(() => {
      if (!controller.signal.aborted) { setLoading(false); }
    });
    return () => controller.abort();
  }, []);

  const results = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return properties.filter((property) => {
      const matchesQuery =
        queryType === "disponibles"
          ? property.operation_type === "Alquiler" &&
            property.status === "Disponible"
          : true;

      const matchesSearch =
        normalizedSearch === "" ||
        property.title?.toLowerCase().includes(normalizedSearch) ||
        property.reference_id?.toLowerCase().includes(normalizedSearch) ||
        property.city?.toLowerCase().includes(normalizedSearch) ||
        property.province?.toLowerCase().includes(normalizedSearch);

      return matchesQuery && matchesSearch;
    });
  }, [properties, search, queryType]);

  const handleEdit = (property) => {
    navigate(`/properties/${property.id}`);
  };

  const updateExternalFilter = (field, value) => {
    setExternalFilters((previous) => ({ ...previous, [field]: value }));
  };

  const toggleExternalSource = (sourceId) => {
    setExternalFilters((previous) => {
      const isSelected = previous.sources.includes(sourceId);

      return {
        ...previous,
        sources: isSelected
          ? previous.sources.filter((id) => id !== sourceId)
          : [...previous.sources, sourceId],
      };
    });
  };

  const toggleMetroCity = (cityId) => {
    setExternalFilters((previous) => {
      const current = previous.metroCities || [];
      const isSelected = current.includes(cityId);

      return {
        ...previous,
        metroCities: isSelected
          ? current.filter((id) => id !== cityId)
          : [...current, cityId],
      };
    });
  };

  const handleExternalSearch = async () => {
    if (externalAbort.current) return;
    const controller = new AbortController();
    externalAbort.current = controller;
    try {
      setExternalLoading(true);
      setExternalError("");
      setExternalSourceErrors({});
      setExternalSourceNotices({});
      setExternalResults([]);
      setExternalQueried(true);

      const primaryCity = externalFilters.city.trim() || "Barcelona";
      const extraCities = (externalFilters.metroCities || []).filter(
        (cityName) => cityName.toLowerCase() !== primaryCity.toLowerCase()
      );
      const cities = [primaryCity, ...extraCities];

      const payload = {
        rental_kind: externalFilters.rental_kind,
        room_occupancy: externalFilters.room_occupancy,
        include_unconfirmed_occupancy: externalFilters.include_unconfirmed_occupancy,
        city: primaryCity,
        cities,
        bedrooms_min:
          externalFilters.rental_kind === "room" || externalFilters.bedrooms_min === ""
            ? null
            : Number(externalFilters.bedrooms_min),
        bathrooms_min:
          externalFilters.bathrooms_min === ""
            ? null
            : Number(externalFilters.bathrooms_min),
        price_min:
          externalFilters.price_min === ""
            ? null
            : Number(externalFilters.price_min),
        price_max:
          externalFilters.price_max === ""
            ? null
            : Number(externalFilters.price_max),
        owner_only: externalFilters.owner_only,
        long_term: externalFilters.rental_kind === "room" ? false : externalFilters.long_term,
        max_age_hours: externalFilters.rental_kind === "room" ? null : Number(externalFilters.max_age_hours) || 72,
        sources: externalFilters.rental_kind === "room" ? externalFilters.sources.filter(source => ["fotocasa", "pisoscom"].includes(source)) : externalFilters.sources,
      };

      await searchCrawlerInBatches(payload, {
        endpoint: SCRAPER_URL,
        signal: controller.signal,
        onProgress: (progress) => {
          if (externalAbort.current !== controller) return;
          setExternalResults(progress.listings);
          setExternalSourceErrors(progress.errors);
          setExternalSourceNotices(progress.notices);
          setExternalProgress({ completed: progress.completed, total: progress.total });
        },
      });
    } catch (requestError) {
      if (externalAbort.current !== controller) return;
      if (!controller.signal.aborted) console.error("Error en la búsqueda externa:", requestError);
      setExternalError(
        controller.signal.aborted
          ? "Búsqueda detenida. Se conservan los resultados obtenidos."
          : requestError.message.startsWith("Selecciona")
            ? requestError.message
            : requestError.message === "HTTP 429"
              ? "Otra búsqueda está en curso. Espera a que termine antes de consultar de nuevo."
              : "No se ha podido completar la búsqueda. Se conservan los resultados obtenidos; puedes volver a intentarlo."
      );
    } finally {
      if (externalAbort.current === controller) {
        externalAbort.current = null;
        setExternalLoading(false);
      }
    }
  };

  return (
    <MainLayout>
      <header className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-600">
            Gestión inmobiliaria
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">
            Alquileres
          </h1>

          <p className="mt-2 max-w-3xl text-gray-400">
            Elige el tipo de consulta para ver los inmuebles en alquiler que
            necesitas.
          </p>
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 font-medium text-red-700">
          {error}
        </div>
      )}

      <section className="mb-8 rounded-3xl bg-white p-5 shadow-sm md:p-6">
        <p className="text-sm font-bold uppercase tracking-wide text-gray-500">
          Tipo de consulta
        </p>

        <div className="mt-3 flex flex-wrap gap-3">
          {QUERY_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setQueryType(option.id)}
              className={[
                "rounded-2xl border px-4 py-3 text-left transition",
                queryType === option.id
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-gray-300 bg-white text-gray-700 hover:border-red-300",
              ].join(" ")}
            >
              <span className="block font-bold">{option.label}</span>
              <span className="block text-xs text-gray-500">
                {option.description}
              </span>
            </button>
          ))}
        </div>

        {queryType === "disponibles" && (
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
            <label className="relative">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por título, referencia, ciudad o provincia"
                className="w-full rounded-2xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </label>
          </div>
        )}

        {queryType === "disponibles" && (
          <p className="mt-4 text-sm text-gray-500">
            Mostrando {results.length} alquiler
            {results.length === 1 ? "" : "es"} disponible
            {results.length === 1 ? "" : "s"}.
          </p>
        )}

        {queryType === "externa" && (
          <div className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-gray-700">Qué buscas
                <select className="mt-1 w-full rounded-xl border p-3" value={externalFilters.rental_kind} disabled={externalLoading} onChange={event => setExternalFilters(previous => ({...previous, rental_kind:event.target.value, bedrooms_min:event.target.value === "room" ? "" : "2", bathrooms_min:event.target.value === "room" ? "" : "1", price_min:event.target.value === "room" ? "0" : previous.price_min, sources:event.target.value === "room" ? ["fotocasa","pisoscom"] : EXTERNAL_SOURCES.map(source => source.id)}))}>
                  <option value="entire">Vivienda completa</option><option value="room">Habitación en alquiler</option>
                </select>
              </label>
              {externalFilters.rental_kind === "room" && <label className="block text-gray-700">Para quién
                <select className="mt-1 w-full rounded-xl border p-3" disabled={externalLoading} value={externalFilters.room_occupancy} onChange={event => updateExternalFilter("room_occupancy",event.target.value)}>
                  <option value="single">Una persona</option><option value="couple">Pareja</option>
                </select>
              </label>}
            </div>
            {externalFilters.rental_kind === "room" && <div className="rounded-xl bg-slate-50 p-3 text-sm text-gray-700">
              <p>Habitaciones: Fotocasa y Pisos.com. La compatibilidad se comprueba con el texto del anuncio. Una habitación doble no confirma que admita parejas. La antigüedad y duración de estancia deben confirmarse con el anunciante.</p>
              <label className="mt-2 flex gap-2"><input type="checkbox" checked={externalFilters.include_unconfirmed_occupancy} onChange={event => updateExternalFilter("include_unconfirmed_occupancy",event.target.checked)} />Incluir ocupación sin confirmar (consultar al anunciante)</label>
            </div>}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Ciudad
                </span>
                <input
                  type="text"
                  value={externalFilters.city}
                  onChange={(event) =>
                    updateExternalFilter("city", event.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Habitaciones (mín.)
                </span>
                <input
                  type="number"
                  min="0"
                  disabled={externalFilters.rental_kind === "room"}
                  value={externalFilters.bedrooms_min}
                  onChange={(event) =>
                    updateExternalFilter("bedrooms_min", event.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Baños (mín.)
                </span>
                <input
                  type="number"
                  min="0"
                  value={externalFilters.bathrooms_min}
                  onChange={(event) =>
                    updateExternalFilter("bathrooms_min", event.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Antigüedad máxima (horas)
                </span>
                <input
                  type="number"
                  min="1"
                  max="720"
                  disabled={externalFilters.rental_kind === "room"}
                  value={externalFilters.max_age_hours}
                  onChange={(event) =>
                    updateExternalFilter("max_age_hours", event.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Precio mínimo (€)
                </span>
                <input
                  type="number"
                  min="0"
                  value={externalFilters.price_min}
                  onChange={(event) =>
                    updateExternalFilter("price_min", event.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Precio máximo (€)
                </span>
                <input
                  type="number"
                  min="0"
                  value={externalFilters.price_max}
                  onChange={(event) =>
                    updateExternalFilter("price_max", event.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </label>

              <label className="flex items-center gap-2 self-end pb-2">
                <input
                  type="checkbox"
                  checked={externalFilters.owner_only}
                  onChange={(event) =>
                    updateExternalFilter("owner_only", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Solo particulares
                </span>
              </label>

              <label className="flex items-center gap-2 self-end pb-2">
                <input
                  type="checkbox"
                  disabled={externalFilters.rental_kind === "room"}
                  checked={externalFilters.rental_kind === "room" ? false : externalFilters.long_term}
                  onChange={(event) =>
                    updateExternalFilter("long_term", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Larga estancia
                </span>
              </label>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Portales a consultar
              </span>
              <div className="mt-2 flex flex-wrap gap-3">
                {EXTERNAL_SOURCES.filter(source => externalFilters.rental_kind !== "room" || ["fotocasa", "pisoscom"].includes(source.id)).map((source) => (
                  <label
                    key={source.id}
                    className={[
                      "cursor-pointer rounded-xl border px-3 py-2 text-sm font-medium transition",
                      externalFilters.sources.includes(source.id)
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-gray-300 bg-white text-gray-600 hover:border-red-300",
                    ].join(" ")}
                  >
                    <input
                      type="checkbox"
                      checked={externalFilters.sources.includes(source.id)}
                      onChange={() => toggleExternalSource(source.id)}
                      className="mr-2 h-3 w-3 align-middle"
                    />
                    {source.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Municipios del area metropolitana
              </span>
              <div className="mt-2 flex flex-wrap gap-3">
                {METRO_CITIES.map((metro) => (
                  <label
                    key={metro.id}
                    className={[
                      "cursor-pointer rounded-xl border px-3 py-2 text-sm font-medium transition",
                      (externalFilters.metroCities || []).includes(metro.id)
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-gray-300 bg-white text-gray-600 hover:border-red-300",
                    ].join(" ")}
                  >
                    <input
                      type="checkbox"
                      checked={(externalFilters.metroCities || []).includes(metro.id)}
                      onChange={() => toggleMetroCity(metro.id)}
                      className="mr-2 h-3 w-3 align-middle"
                    />
                    {metro.label}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleExternalSearch}
              disabled={externalLoading}
              className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {externalLoading ? "Consultando portales..." : "Consultar"}
            </button>
                {externalLoading && (
                  <button type="button" onClick={() => externalAbort.current?.abort()} className="ml-3 rounded-xl border border-red-600 px-5 py-3 font-bold text-red-600">
                    Detener búsqueda
                  </button>
                )}
                {externalProgress.total > 0 && (
                  <p role="status" className="mt-3 text-sm text-gray-600">
                    Consultas finalizadas: {externalProgress.completed} de {externalProgress.total} · {externalResults.length} resultados
                  </p>
                )}

            {externalError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 font-medium text-red-700">
                {externalError}
              </div>
            )}
          </div>
        )}
      </section>

      {queryType === "disponibles" && (
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">Resultados</h2>
          </div>

          {loading ? (
            <div className="rounded-3xl bg-white p-8 text-center text-gray-600">
              Cargando alquileres...
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-center text-gray-600">
              No hay alquileres disponibles con estos criterios.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {results.map((property) => (
                <AlquilerCard
                  key={property.id}
                  property={property}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {queryType === "externa" && (
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">
              Resultados externos
            </h2>
          </div>

          {externalLoading && externalResults.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-center text-gray-600">
              Consultando portales externos...
            </div>
          ) : !externalQueried ? (
            <div className="rounded-3xl bg-white p-8 text-center text-gray-600">
              Ajusta los filtros y pulsa «Consultar» para buscar en los
              portales seleccionados.
            </div>
          ) : externalError && externalResults.length === 0 ? null : externalResults.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-center text-gray-600">
              {Object.keys(externalSourceErrors).length > 0 || Object.values(externalSourceNotices).some(notice => notice.kind !== "no_matches")
                ? "No se han obtenido anuncios de los portales que respondieron. Revisa los avisos de la consulta."
                : "No se han encontrado anuncios con estos criterios."}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {externalResults.map((listing, index) => (
                <ExternalListingCard
                  key={`${listing.source}-${listing.url}-${index}`}
                  listing={listing}
                />
              ))}
            </div>
          )}

          <CrawlerMessages title="Portales que no se pudieron consultar" messages={externalSourceErrors} />
          <CrawlerMessages title="Cobertura no configurada" messages={Object.fromEntries(Object.entries(externalSourceNotices).filter(entry => entry[1].kind === "unsupported_city"))} neutral />
          <CrawlerMessages title="Consultas sin resultados" messages={Object.fromEntries(Object.entries(externalSourceNotices).filter(entry => entry[1].kind !== "unsupported_city"))} neutral />
        </section>
      )}
    </MainLayout>
  );
}

function AlquilerCard({ property, onEdit }) {
  const formattedPrice = Number(property.price || 0).toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  return (
    <article className="overflow-hidden rounded-3xl bg-white text-gray-800 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="h-56 bg-gray-200">
        {property.cover_image ? (
          <img
            src={property.cover_image}
            alt={property.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            Sin imagen principal
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-red-600">
              {property.operation_type}
            </p>

            <h3 className="mt-2 text-xl font-bold">{property.title}</h3>
          </div>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
            {property.status}
          </span>
        </div>

        <p className="mt-3 text-sm text-gray-500">
          {property.city || "Ubicación pendiente"}
          {property.province ? ` · ${property.province}` : ""}
        </p>

        <p className="mt-4 text-2xl font-extrabold">{formattedPrice}</p>

        <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-gray-100 p-4 text-center">
          <div>
            <p className="text-xs text-gray-500">Habitaciones</p>
            <p className="font-bold">{property.bedrooms ?? "-"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Baños</p>
            <p className="font-bold">{property.bathrooms ?? "-"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">m²</p>
            <p className="font-bold">{property.built_area ?? "-"}</p>
          </div>
        </div>

        <p className="mt-4 text-xs font-bold text-gray-500">
          Ref. {property.reference_id}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onEdit(property)}
            className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            Editar
          </button>

          <a
            href={`${import.meta.env.VITE_API_URL}/public/properties/${property.id}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-gray-700 px-4 py-2 font-bold text-white hover:bg-gray-800"
          >
            Datos públicos
          </a>
        </div>
      </div>
    </article>
  );
}

function ExternalListingCard({ listing }) {
  const formattedPrice =
    listing.price != null
      ? Number(listing.price).toLocaleString("es-ES", {
          style: "currency",
          currency: "EUR",
          maximumFractionDigits: 0,
        })
      : "Precio no disponible";

  const ownerLabel =
    OWNER_TYPE_LABELS[listing.owner_type] || OWNER_TYPE_LABELS.desconocido;

  return (
    <article className="overflow-hidden rounded-3xl bg-white text-gray-800 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="h-48 bg-gray-200">
        {listing.image ? (
          <img
            src={listing.image}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            Sin imagen
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gray-600">
            {listing.source}
          </span>
          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
            {ownerLabel}
          </span>
        </div>

        <h3 className="mt-3 line-clamp-2 text-lg font-bold">
          {listing.title}
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          {listing.location || "Ubicación no indicada"}
        </p>

        <p className="mt-3 text-xl font-extrabold">{formattedPrice}</p>

        <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-gray-100 p-3 text-center text-sm">
          <div>
            <p className="text-xs text-gray-500">Habitaciones</p>
            <p className="font-bold">{listing.bedrooms ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Baños</p>
            <p className="font-bold">{listing.bathrooms ?? "-"}</p>
          </div>
        </div>

        {listing.rental_kind === "room" && <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">
          <p className="font-bold">{listing.occupancy_status === "confirmed" ? (listing.room_occupancy === "couple" ? "Admite pareja según el anuncio" : "Para una persona según el anuncio") : "Ocupación sin confirmar: consultar"}</p>
          {listing.occupancy_evidence && <p>{listing.occupancy_evidence}</p>}
          {listing.description && <details className="mt-2"><summary>Texto disponible del anuncio</summary><p className="whitespace-pre-line">{listing.description}</p></details>}
        </div>}
        {listing.posted_label && (
          <p className="mt-3 text-xs text-gray-500">{listing.posted_label}</p>
        )}

        <a
          href={listing.url}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-block rounded-xl bg-gray-700 px-4 py-2 font-bold text-white hover:bg-gray-800"
        >
          Ver anuncio
        </a>
      </div>
    </article>
  );
}

export default AlquileresPage;
