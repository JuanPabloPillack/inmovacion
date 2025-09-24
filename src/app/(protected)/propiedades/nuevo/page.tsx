import FormularioInmueble from "@/components/FormularioInmueble";

export default function NuevoInmueblePage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Publicar nuevo inmueble</h1>
      <FormularioInmueble />
    </div>
  );
}
