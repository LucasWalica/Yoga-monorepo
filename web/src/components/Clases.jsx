import { Flame, Moon, Sun, Waves } from 'lucide-react'

const clases = [
  {
    icon: Sun,
    title: 'Hatha Yoga',
    level: 'Todos los niveles',
    duration: '60 min',
    description:
      'Clase clásica y pausada que combina posturas simples con respiración consciente. Ideal para principiantes o para quienes buscan una práctica suave.',
  },
  {
    icon: Flame,
    title: 'Vinyasa Flow',
    level: 'Intermedio',
    duration: '75 min',
    description:
      'Secuencias dinámicas que fluyen al ritmo de la respiración. Perfecta para soltar energía, ganar fuerza y mejorar la movilidad.',
  },
  {
    icon: Moon,
    title: 'Yin Yoga',
    level: 'Todos los niveles',
    duration: '60 min',
    description:
      'Posturas pasivas sostenidas durante varios minutos para trabajar los tejidos profundos. Una invitación a la calma y la entrega.',
  },
  {
    icon: Waves,
    title: 'Yoga Restaurativo',
    level: 'Todos los niveles',
    duration: '75 min',
    description:
      'Práctica profundamente relajante con apoyos y mantas. Ideal para recuperarse del estrés, la tensión y la fatiga del día a día.',
  },
]

function Clases() {
  return (
    <section id="clases" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-terracota-600">
            Clases
          </p>
          <h2 className="font-serif text-3xl font-semibold text-tinta-950 sm:text-4xl">
            Encontrá el estilo que resuene con vos
          </h2>
          <p className="mt-4 text-tinta-500">
            Cuatro estilos de yoga para que elijas según tu momento, tu energía y lo
            que necesite tu cuerpo.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {clases.map((clase) => (
            <article
              key={clase.title}
              className="group flex flex-col rounded-2xl bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-salvia-100 text-salvia-600 transition-colors group-hover:bg-terracota-500 group-hover:text-white">
                <clase.icon size={28} />
              </div>
              <h3 className="font-serif text-xl font-semibold text-tinta-950">
                {clase.title}
              </h3>
              <div className="mt-2 flex items-center gap-3 text-xs font-medium text-tinta-500">
                <span className="rounded-full bg-arena-100 px-3 py-1">
                  {clase.level}
                </span>
                <span className="rounded-full bg-arena-100 px-3 py-1">
                  {clase.duration}
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-tinta-500">
                {clase.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Clases