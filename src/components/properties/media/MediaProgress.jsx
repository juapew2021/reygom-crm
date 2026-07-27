import {
  LoaderCircle,
  UploadCloud,
  X,
} from "lucide-react";

function MediaProgress({
  selectedPreviews,
  uploading,
  uploadProgress,
  onRemoveSelectedFile,
  onClearSelection,
  onUpload,
}) {
  if (!selectedPreviews.length) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h4 className="font-bold text-gray-800">
            Fotografías seleccionadas
          </h4>

          <p className="mt-1 text-sm text-gray-500">
            {selectedPreviews.length} archivo
            {selectedPreviews.length === 1 ? "" : "s"} pendiente
            {selectedPreviews.length === 1 ? "" : "s"} de subir.
          </p>
        </div>

        <button
          type="button"
          onClick={onClearSelection}
          disabled={uploading}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-gray-300 px-4 py-2 text-sm font-bold text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X size={16} />
          Limpiar selección
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {selectedPreviews.map((item, index) => (
          <article
            key={item.id}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100"
          >
            <img
              src={item.previewUrl}
              alt={item.file.name}
              className="h-36 w-full object-cover"
            />

            <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-white">
              #{index + 1}
            </span>

            <button
              type="button"
              onClick={() =>
                onRemoveSelectedFile(item.id)
              }
              disabled={uploading}
              aria-label={`Quitar ${item.file.name}`}
              className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-gray-700 shadow transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={16} />
            </button>

            <div className="p-3">
              <p
                className="truncate text-sm font-semibold text-gray-700"
                title={item.file.name}
              >
                {item.file.name}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {(item.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </article>
        ))}
      </div>

      {uploading && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-4 text-sm font-semibold text-gray-600">
            <span className="inline-flex items-center gap-2">
              <LoaderCircle
                size={17}
                className="animate-spin text-red-600"
              />
              Subiendo fotografías...
            </span>

            <span>{uploadProgress}%</span>
          </div>

          <div
            className="h-3 overflow-hidden rounded-full bg-gray-200"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={uploadProgress}
          >
            <div
              className="h-full rounded-full bg-red-600 transition-all duration-300"
              style={{
                width: `${uploadProgress}%`,
              }}
            />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onUpload}
        disabled={
          uploading ||
          selectedPreviews.length === 0
        }
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-4 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {uploading ? (
          <>
            <LoaderCircle
              size={20}
              className="animate-spin"
            />
            Subiendo...
          </>
        ) : (
          <>
            <UploadCloud size={20} />
            Subir fotografías
          </>
        )}
      </button>
    </section>
  );
}

export default MediaProgress;