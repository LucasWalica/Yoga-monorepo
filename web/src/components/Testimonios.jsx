import { Star } from 'lucide-react'

const testimonios = [
  {
    nombre: 'María García',
    rol: 'Practicante hace 2 años',
    foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    texto:
      'Empecé sin saber nada de yoga y hoy es parte de mi vida. Seba tiene una paciencia increíble y siempre te hace sentir cómoda. Las clases de Vinyasa los miércoles son mi momento favorito de la semana.',
  },
  {
    nombre: 'Jorge Fernández',
    rol: 'Practicante hace 8 meses',
    foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    texto:
      'Llegué buscando alivio para el dolor de espalda por mi trabajo de oficina. En tres meses noté una diferencia enorme. Seba adapta cada postura a las necesidades de cada persona. Muy recomendable.',
  },
  {
    nombre: 'Carolina Ruiz',
    rol: 'Practicante hace 3 años',
    foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
    texto:
      'El Yin Yoga con Seba me cambió la vida. Es un espacio de calma en medio del caos. Cada clase es un mimo al cuerpo y a la mente. Y la energía del espacio es única, te vas como renovada.',
  },
]

function Testimonios() {
  return (
    <section id="testimonios" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-terracota-600">
            Testimonios
          </p>
          <h2 className="font-serif text-3xl font-semibold text-tinta-950 sm:text-4xl">
            Lo que dicen quienes practican
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonios.map((testimonio) => (
            <figure
              key={testimonio.nombre}
              className="flex flex-col rounded-2xl bg-arena-50 p-8"
            >
              <div className="flex gap-1 text-terracota-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" strokeWidth={0} />
                ))}
              </div>

              <blockquote className="mt-5 flex-1 text-tinta-700 italic leading-relaxed">
                &ldquo;{testimonio.texto}&rdquo;
              </blockquote>

              <figcaption className="mt-6 flex items-center gap-4">
                <img
                  src={testimonio.foto}
                  alt={`Foto de ${testimonio.nombre}`}
                  className="h-12 w-12 rounded-full object-cover"
                  loading="lazy"
                />
                <div>
                  <p className="font-semibold text-tinta-950">
                    {testimonio.nombre}
                  </p>
                  <p className="text-sm text-tinta-500">{testimonio.rol}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonios