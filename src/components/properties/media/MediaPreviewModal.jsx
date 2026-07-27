import {
  ChevronLeft,
  ChevronRight,
  Star,
  X,
} from "lucide-react";

function MediaPreviewModal({
  images,
  selectedImage,
  onClose,
  onPrevious,
  onNext,
}) {
  if (!selectedImage) {
    return null;
  }

  const currentIndex = images.findIndex(
    (image) => image.id === selectedImage.id
  );

  const hasMultipleImages = images.length > 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Vista ampliada de la fotografía"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-gray-950 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 text-white">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-400">
              Property Media
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h3 className="font-bold">
                Fotografía {currentIndex + 1} de {images.length}
              </h3>

              {selectedImage.is_cover && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                  <Star size={13} fill="currentColor" />
                  Portada
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
            aria-label="Cerrar vista ampliada"
          >
            <X size={22} />
          </button>
        </header>

        <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black">
          <img
            src={selectedImage.image_url}
            alt={`Fotografía ${currentIndex + 1} del inmueble`}
            className="max-h-[76vh] w-full object-contain"
          />

          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={onPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-3 text-white shadow-lg backdrop-blur transition hover:bg-black/80"
                aria-label="Fotografía anterior"
              >
                <ChevronLeft size={28} />
              </button>

              <button
                type="button"
                onClick={onNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-3 text-white shadow-lg backdrop-blur transition hover:bg-black/80"
                aria-label="Fotografía siguiente"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}
        </div>

        <footer className="flex flex-col justify-between gap-3 border-t border-white/10 px-5 py-4 text-sm text-gray-300 sm:flex-row sm:items-center">
          <p>
            Posición en galería:{" "}
            <span className="font-bold text-white">
              {Number(selectedImage.position) + 1}
            </span>
          </p>

          <p className="truncate text-xs text-gray-400">
            {selectedImage.image_url}
          </p>
        </footer>
      </div>
    </div>
  );
}

export default MediaPreviewModal;