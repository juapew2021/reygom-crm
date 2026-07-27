import {
  Eye,
  GripVertical,
  LoaderCircle,
  Star,
  Trash2,
} from "lucide-react";

function MediaCard({
  image,
  index,
  isDragging,
  isProcessing,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onPreview,
  onSetCover,
  onDelete,
}) {
  return (
    <article
      draggable={!isProcessing}
      onDragStart={(event) => onDragStart(event, index)}
      onDragEnd={onDragEnd}
      onDragOver={(event) => onDragOver(event, index)}
      onDrop={(event) => onDrop(event, index)}
      className={[
        "group overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-200",
        image.is_cover
          ? "border-red-400 ring-2 ring-red-100"
          : "border-gray-200",
        isDragging
          ? "scale-[1.02] opacity-60 shadow-2xl"
          : "hover:-translate-y-1 hover:shadow-xl",
      ].join(" ")}
    >
      <div className="relative h-52 overflow-hidden bg-gray-100">
        <img
          src={image.image_url}
          alt={`Fotografía ${index + 1} del inmueble`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onClick={() => onPreview(image)}
        />

        <button
          type="button"
          onClick={() => onPreview(image)}
          className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100"
          aria-label="Ver fotografía ampliada"
        >
          <span className="rounded-full bg-black/55 p-3 backdrop-blur">
            <Eye size={22} />
          </span>
        </button>

        <div className="absolute left-3 top-3 flex gap-2">
          {image.is_cover && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow">
              <Star size={13} fill="currentColor" />
              Portada
            </span>
          )}

          <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-gray-700 shadow backdrop-blur">
            #{index + 1}
          </span>
        </div>

        <div className="absolute right-3 top-3">
          <span className="flex cursor-grab items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-gray-700 shadow backdrop-blur active:cursor-grabbing">
            <GripVertical size={14} />
            Mover
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-gray-500">
            Posición {Number(image.position) + 1}
          </p>

          {isProcessing && (
            <LoaderCircle
              size={18}
              className="animate-spin text-red-600"
            />
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {!image.is_cover ? (
            <button
              type="button"
              onClick={() => onSetCover(image)}
              disabled={isProcessing}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Star size={17} />
              Hacer portada
            </button>
          ) : (
            <div className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              <Star size={17} fill="currentColor" />
              Portada actual
            </div>
          )}

          <button
            type="button"
            onClick={() => onDelete(image)}
            disabled={isProcessing}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-100 px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={17} />
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
}

export default MediaCard;