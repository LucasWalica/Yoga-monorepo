import { ChevronDown, Sparkles } from 'lucide-react'

function Hero() {
  return (
    <section id="inicio" className="relative flex min-h-screen items-center">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2070&auto=format&fit=crop"
          alt="Persona practicando yoga al amanecer"
          className="h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-tinta-950/50" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-32 text-center text-white sm:px-6">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
          <Sparkles size={16} className="text-arena-300" />
          Yoga para todos los niveles
        </div>

        <h1 className="mx-auto max-w-3xl font-serif text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
          Encuentra tu equilibrio,
          <span className="block text-arena-200 italic">una respiración a la vez</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg text-white/90">
          Clases de Hatha, Vinyasa y Yin Yoga en un espacio cálido y acogedor.
          Acompaño tu práctica desde tu primer paso hasta donde quieras llegar.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#clases"
            className="rounded-full bg-terracota-500 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-terracota-600 hover:shadow-xl"
          >
            Ver clases
          </a>
          <a
            href="#horarios"
            className="rounded-full border-2 border-white/80 px-8 py-4 font-semibold text-white transition-colors hover:border-white hover:bg-white hover:text-tinta-950"
          >
            Ver horarios
          </a>
        </div>
      </div>

      <a
        href="#sobre-mi"
        aria-label="Bajar a la sección sobre mí"
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce text-white/70 transition-colors hover:text-white"
      >
        <ChevronDown size={32} />
      </a>
    </section>
  )
}

export default Hero