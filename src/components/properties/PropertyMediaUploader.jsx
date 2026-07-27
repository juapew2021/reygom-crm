import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, LoaderCircle } from "lucide-react";

import api from "../../services/api";
import MediaDropzone from "./media/MediaDropzone";
import MediaGallery from "./media/MediaGallery";
import MediaPreviewModal from "./media/MediaPreviewModal";
import MediaProgress from "./media/MediaProgress";

const MAX_FILES_PER_UPLOAD = 20;
const MAX_FILE_SIZE = 15 * 1024 * 1024;

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function PropertyMediaUploader({
  propertyId,
  onGalleryChange,
}) {
  const inputRef = useRef(null);

  const [gallery, setGallery] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [draggingFiles, setDraggingFiles] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [actionId, setActionId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedPreviews = useMemo(
    () =>
      selectedFiles.map((item) => ({
        ...item,
        previewUrl: URL.createObjectURL(item.file),
      })),
    [selectedFiles]
  );

  useEffect(() => {
    return () => {
      selectedPreviews.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [selectedPreviews]);

  const notifyGalleryChange = (images) => {
    if (typeof onGalleryChange === "function") {
      onGalleryChange(images);
    }
  };

  const loadGallery = async () => {
    if (!propertyId) {
      setGallery([]);
      return;
    }

    try {
      setLoadingGallery(true);
      setError("");

      const response = await api.get(
        `/properties/${propertyId}/images`
      );

      const images = Array.isArray(response.data)
        ? response.data
        : [];

      setGallery(images);
      notifyGalleryChange(images);
    } catch (requestError) {
      console.error(
        "Error cargando la galería:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "No se pudo cargar la galería del inmueble."
      );
    } finally {
      setLoadingGallery(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, [propertyId]);

  const validateFiles = (files) => {
    const accepted = [];
    const rejected = [];

    files.forEach((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        rejected.push(
          `${file.name}: formato no permitido.`
        );
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        rejected.push(
          `${file.name}: supera el máximo de 15 MB.`
        );
        return;
      }

      accepted.push(file);
    });

    const availableSlots =
      MAX_FILES_PER_UPLOAD - selectedFiles.length;

    if (accepted.length > availableSlots) {
      rejected.push(
        `Solo puedes seleccionar ${MAX_FILES_PER_UPLOAD} fotografías por subida.`
      );
    }

    return {
      accepted: accepted.slice(0, availableSlots),
      rejected,
    };
  };

  const addFiles = (fileList) => {
    setMessage("");
    setError("");

    const files = Array.from(fileList || []);

    if (files.length === 0) {
      return;
    }

    const { accepted, rejected } =
      validateFiles(files);

    const normalized = accepted.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
    }));

    setSelectedFiles((current) => [
      ...current,
      ...normalized,
    ]);

    if (rejected.length > 0) {
      setError(rejected.join(" "));
    }
  };

  const handleInputChange = (event) => {
    addFiles(event.target.files);
    event.target.value = "";
  };

  const handleFilesDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!uploading) {
      setDraggingFiles(true);
    }
  };

  const handleFilesDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDraggingFiles(false);
  };

  const handleFilesDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDraggingFiles(false);

    if (!uploading) {
      addFiles(event.dataTransfer.files);
    }
  };

  const removeSelectedFile = (id) => {
    setSelectedFiles((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const clearSelection = () => {
    setSelectedFiles([]);
    setUploadProgress(0);
    setError("");
  };

  const uploadFiles = async () => {
    if (!propertyId) {
      setError(
        "Primero debes crear el inmueble antes de subir fotografías."
      );
      return;
    }

    if (selectedFiles.length === 0) {
      setError(
        "Selecciona al menos una fotografía."
      );
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setMessage("");
      setError("");

      const data = new FormData();

      selectedFiles.forEach(({ file }) => {
        data.append("images[]", file);
      });

      const response = await api.post(
        `/properties/${propertyId}/images/upload`,
        data,
        {
          onUploadProgress: (progressEvent) => {
            if (!progressEvent.total) {
              return;
            }

            const progress = Math.round(
              (progressEvent.loaded * 100) /
                progressEvent.total
            );

            setUploadProgress(progress);
          },
        }
      );

      const uploadErrors =
        response.data?.errors || [];

      setMessage(
        response.data?.message ||
          "Fotografías subidas correctamente."
      );

      if (uploadErrors.length > 0) {
        setError(
          uploadErrors
            .map(
              (item) =>
                `${item.filename}: ${item.message}`
            )
            .join(" ")
        );
      }

      setSelectedFiles([]);
      setUploadProgress(100);

      await loadGallery();
    } catch (requestError) {
      console.error(
        "Error subiendo fotografías:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "No se pudieron subir las fotografías."
      );
    } finally {
      setUploading(false);
    }
  };

  const setAsCover = async (image) => {
    try {
      setActionId(image.id);
      setError("");
      setMessage("");

      await api.put(
        `/property-images/${image.id}`,
        {
          is_cover: true,
        }
      );

      setMessage(
        "Imagen principal actualizada correctamente."
      );

      await loadGallery();
    } catch (requestError) {
      console.error(
        "Error cambiando la portada:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "No se pudo cambiar la imagen principal."
      );
    } finally {
      setActionId(null);
    }
  };

  const deleteImage = async (image) => {
    const confirmed = window.confirm(
      "¿Seguro que deseas eliminar esta fotografía?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(image.id);
      setError("");
      setMessage("");

      await api.delete(
        `/property-images/${image.id}`
      );

      if (selectedImage?.id === image.id) {
        setSelectedImage(null);
      }

      setMessage("Fotografía eliminada.");
      await loadGallery();
    } catch (requestError) {
      console.error(
        "Error eliminando fotografía:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "No se pudo eliminar la fotografía."
      );
    } finally {
      setActionId(null);
    }
  };

  const handleGalleryDragStart = (
    event,
    index
  ) => {
    setDraggingIndex(index);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "text/plain",
      String(index)
    );
  };

  const handleGalleryDragEnd = () => {
    setDraggingIndex(null);
  };

  const handleGalleryDragOver = (
    event
  ) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const saveGalleryOrder = async (
    orderedImages
  ) => {
    try {
      setError("");
      setMessage("");

      const response = await api.put(
        `/properties/${propertyId}/images/order`,
        {
          image_ids: orderedImages.map(
            (image) => image.id
          ),
        }
      );

      const savedImages =
        response.data?.images || orderedImages;

      setGallery(savedImages);
      notifyGalleryChange(savedImages);

      setMessage(
        response.data?.message ||
          "Orden de fotografías actualizado."
      );
    } catch (requestError) {
      console.error(
        "Error guardando el orden:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "No se pudo guardar el nuevo orden."
      );

      await loadGallery();
    }
  };

  const handleGalleryDrop = async (
    event,
    destinationIndex
  ) => {
    event.preventDefault();

    const sourceIndex = Number(
      event.dataTransfer.getData("text/plain")
    );

    setDraggingIndex(null);

    if (
      Number.isNaN(sourceIndex) ||
      sourceIndex === destinationIndex
    ) {
      return;
    }

    const reordered = [...gallery];
    const [movedImage] = reordered.splice(
      sourceIndex,
      1
    );

    reordered.splice(
      destinationIndex,
      0,
      movedImage
    );

    const normalized = reordered.map(
      (image, index) => ({
        ...image,
        position: index,
      })
    );

    setGallery(normalized);
    notifyGalleryChange(normalized);

    await saveGalleryOrder(normalized);
  };

  const openPreview = (image) => {
    setSelectedImage(image);
  };

  const closePreview = () => {
    setSelectedImage(null);
  };

  const showPreviousImage = () => {
    if (!selectedImage || gallery.length === 0) {
      return;
    }

    const currentIndex = gallery.findIndex(
      (image) => image.id === selectedImage.id
    );

    const previousIndex =
      currentIndex <= 0
        ? gallery.length - 1
        : currentIndex - 1;

    setSelectedImage(gallery[previousIndex]);
  };

  const showNextImage = () => {
    if (!selectedImage || gallery.length === 0) {
      return;
    }

    const currentIndex = gallery.findIndex(
      (image) => image.id === selectedImage.id
    );

    const nextIndex =
      currentIndex >= gallery.length - 1
        ? 0
        : currentIndex + 1;

    setSelectedImage(gallery[nextIndex]);
  };

  if (!propertyId) {
    return (
      <section className="rounded-3xl border border-gray-200 bg-gray-50 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-red-100 p-3 text-red-600">
            <ImagePlus size={24} />
          </div>

          <div>
            <h3 className="font-bold text-gray-800">
              Fotografías del inmueble
            </h3>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Primero publica el inmueble. Después podrás
              editarlo y subir su galería de fotografías.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="space-y-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-red-600">
            Property Media
          </p>

          <h3 className="mt-1 text-xl font-bold text-gray-800">
            Fotografías del inmueble
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Añade, ordena, amplía y administra la
            galería del inmueble.
          </p>
        </div>

        {message && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <MediaDropzone
          inputRef={inputRef}
          dragging={draggingFiles}
          disabled={uploading}
          onInputChange={handleInputChange}
          onDragOver={handleFilesDragOver}
          onDragLeave={handleFilesDragLeave}
          onDrop={handleFilesDrop}
        />

        <MediaProgress
          selectedPreviews={selectedPreviews}
          uploading={uploading}
          uploadProgress={uploadProgress}
          onRemoveSelectedFile={removeSelectedFile}
          onClearSelection={clearSelection}
          onUpload={uploadFiles}
        />

        <div>
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h4 className="font-bold text-gray-800">
                Galería publicada
              </h4>

              <p className="mt-1 text-sm text-gray-500">
                {gallery.length} fotografía
                {gallery.length === 1 ? "" : "s"}.
                Arrastra una tarjeta para cambiar el orden.
              </p>
            </div>

            <button
              type="button"
              onClick={loadGallery}
              disabled={loadingGallery}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-gray-300 px-4 py-2 text-sm font-bold text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingGallery && (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              )}

              Actualizar
            </button>
          </div>

          {loadingGallery ? (
            <div className="flex items-center justify-center rounded-3xl border border-gray-200 bg-gray-50 p-10 text-gray-500">
              <LoaderCircle
                size={22}
                className="mr-2 animate-spin"
              />
              Cargando galería...
            </div>
          ) : (
            <MediaGallery
              images={gallery}
              draggingIndex={draggingIndex}
              actionId={actionId}
              onDragStart={handleGalleryDragStart}
              onDragEnd={handleGalleryDragEnd}
              onDragOver={handleGalleryDragOver}
              onDrop={handleGalleryDrop}
              onPreview={openPreview}
              onSetCover={setAsCover}
              onDelete={deleteImage}
            />
          )}
        </div>
      </section>

      <MediaPreviewModal
        images={gallery}
        selectedImage={selectedImage}
        onClose={closePreview}
        onPrevious={showPreviousImage}
        onNext={showNextImage}
      />
    </>
  );
}

export default PropertyMediaUploader;