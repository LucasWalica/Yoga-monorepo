import { Award, Heart, Leaf } from 'lucide-react'

const highlights = [
  {
    icon: Award,
    title: '500 horas certificadas',
    text: 'Formación completa de profesores de yoga con especialización en alineación y yogaterapia.',
  },
  {
    icon: Heart,
    title: 'Práctica consciente',
    text: 'Cada clase es una invitación a escuchar tu cuerpo y conectar con el presente.',
  },
  {
    icon: Leaf,
    title: 'Enfoque holístico',
    text: 'Integro respiración, meditación y movimiento en cada sesión para un bienestar completo.',
  },
]

function SobreMi() {
  return (
    <section id="sobre-mi" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <div className="absolute -top-6 -left-6 h-48 w-48 rounded-full bg-salvia-100" />
            <img
              src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=987&auto=format&fit=crop"
              alt="Sebastián, profesor de yoga, en postura de meditación"
              className="relative z-10 w-full rounded-2xl object-cover shadow-xl"
              loading="lazy"
            />
            <div className="absolute -bottom-6 -right-4 rounded-2xl bg-terracota-500 px-6 py-4 text-white shadow-lg">
              <p className="font-serif text-3xl font-bold">+10</p>
              <p className="text-sm font-medium text-white/90">años de práctica</p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-terracota-600">
              Sobre mí
            </p>
            <h2 className="font-serif text-3xl font-semibold text-tinta-950 sm:text-4xl">
              Hola, soy Sebastián
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-tinta-700">
              Soy profesor de yoga hace más de 10 años. Empecé mi camino buscando
              alivio para el estrés y encontré mucho más: una forma de vida, una
              manera de estar conmigo mismo y con los demás.
            </p>
            <p className="mt-4 leading-relaxed text-tinta-500">
              Mi enfoque es simple: crear un espacio seguro donde puedas moverte
              libremente, respirar profundo y reconectar con tu cuerpo. No importa
              si nunca hiciste yoga o si llevás años practicando, en mis clases
              vas a encontrar siempre un lugar para crecer.
            </p>

            <div className="mt-8 space-y-6">
              {highlights.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-salvia-100 text-salvia-600">
                    <item.icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-tinta-950">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-tinta-500">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SobreMi