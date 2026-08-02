import { ImagePlus, UploadCloud } from "lucide-react";

function MediaDropzone({
  inputRef,
  dragging,
  disabled,
  onInputChange,
  onDragOver,
  onDragLeave,
  onDrop,
}) {
  const openFilePicker = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={openFilePicker}
      onKeyDown={(event) => {
        if (
          !disabled &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          openFilePicker();
        }
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={[
        "rounded-3xl border-2 border-dashed p-8 text-center transition",
        disabled
          ? "cursor-not-allowed border-gray-200 bg-gray-100 opacity-70"
          : "cursor-pointer",
        !disabled && dragging
          ? "border-red-500 bg-red-50"
          : "",
        !disabled && !dragging
          ? "border-gray-300 bg-gray-50 hover:border-red-400 hover:bg-red-50/40"
          : "",
      ].join(" ")}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={onInputChange}
        disabled={disabled}
        className="hidden"
      />

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
        {dragging ? (
          <ImagePlus size={30} />
        ) : (
          <UploadCloud size={30} />
        )}
      </div>

      <p className="mt-4 text-lg font-bold text-gray-800">
        {dragging
          ? "Suelta las fotografías aquí"
          : "Arrastra fotografías aquí"}
      </p>

      <p className="mt-1 text-sm text-gray-500">
        o haz clic para seleccionarlas desde tu ordenador o móvil
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-500 shadow-sm">
          JPG
        </span>

        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-500 shadow-sm">
          PNG
        </span>

        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-500 shadow-sm">
          WEBP
        </span>

        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-500 shadow-sm">
          Máx. 15 MB
        </span>

        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-500 shadow-sm">
          Hasta 20 archivos
        </span>
      </div>
    </div>
  );
}

export default MediaDropzone;