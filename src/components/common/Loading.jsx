function Loading({ text = "Cargando..." }) {
  return (
    <div className="flex items-center justify-center p-10 text-white">
      <div className="animate-pulse text-lg font-semibold">{text}</div>
    </div>
  );
}

export default Loading;