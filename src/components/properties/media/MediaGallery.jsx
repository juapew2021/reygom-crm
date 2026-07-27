import MediaCard from "./MediaCard";

function MediaGallery({
  images,
  draggingIndex,
  actionId,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onPreview,
  onSetCover,
  onDelete,
}) {
  if (!images.length) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
        Este inmueble todavía no tiene fotografías.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {images.map((image, index) => (
        <MediaCard
          key={image.id}
          image={image}
          index={index}
          isDragging={draggingIndex === index}
          isProcessing={actionId === image.id}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onPreview={onPreview}
          onSetCover={onSetCover}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default MediaGallery;