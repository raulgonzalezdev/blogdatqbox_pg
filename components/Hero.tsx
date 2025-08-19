export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 mt-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.06),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(0,0,0,0.05),transparent_40%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.07),transparent_40%)]" />
      <div className="relative p-10 md:p-16">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
          Historias, investigación y lanzamientos
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mt-3 max-w-prose">
          Noticias y notas técnicas del equipo. Explora artículos con una lectura clara y enfoque minimalista.
        </p>
      </div>
    </section>
  );
}
