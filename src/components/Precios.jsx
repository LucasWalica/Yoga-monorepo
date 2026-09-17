import { Check } from 'lucide-react'

const planes = [
  {
    nombre: 'Clase suelta',
    precio: '15',
    periodo: 'por clase',
    descripcion: 'Perfecta para probar y empezar',
    beneficios: [
      'Acceso a cualquier clase semanal',
      'Esterilla y props incluidos',
      'Reserva con 2 horas de anticipación',
      'Clase online grabada en tu cuenta',
    ],
    destacado: false,
  },
  {
    nombre: 'Pase mensual',
    precio: '60',
    periodo: 'por mes',
    descripcion: 'El favorito de los practicantes regulares',
    beneficios: [
      'Clases ilimitadas de lunes a sábado',
      'Prioridad en la reserva de plazas',
      '1 clase online exclusiva por mes',
      '10% de descuento en talleres',
      'Acompañamiento personalizado',
    ],
    destacado: true,
  },
  {
    nombre: 'Pase anual',
    precio: '600',
    periodo: 'por año',
    descripcion: 'Para comprometerte con tu práctica',
    beneficios: [
      'Todos los beneficios del pase mensual',
      '2 meses gratis vs. pago mensual',
      '4 talleres de profundización incluidos',
      'Sesión de alineación personal',
      'Acceso a comunidad privada',
    ],
    destacado: false,
  },
]

function Precios() {
  return (
    <section id="precios" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-terracota-600">
            Precios
          </p>
          <h2 className="font-serif text-3xl font-semibold text-tinta-950 sm:text-4xl">
            Planes simples, sin letra chica
          </h2>
          <p className="mt-4 text-tinta-500">
            Elegí cómo querés practicar. Podés cambiar de plan cuando quieras sin
            costos extra.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {planes.map((plan) => (
            <article
              key={plan.nombre}
              className={`relative flex flex-col rounded-2xl p-8 ${
                plan.destacado
                  ? 'bg-terracota-500 text-white shadow-xl lg:scale-105'
                  : 'bg-white shadow-sm'
              }`}
            >
              {plan.destacado && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-salvia-600 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                  Recomendado
                </span>
              )}
              <h3 className="font-serif text-xl font-semibold">{plan.nombre}</h3>
              <p
                className={`mt-1 text-sm ${
                  plan.destacado ? 'text-white/80' : 'text-tinta-500'
                }`}
              >
                {plan.descripcion}
              </p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-serif text-5xl font-bold">${plan.precio}</span>
                <span
                  className={`text-sm font-medium ${
                    plan.destacado ? 'text-white/80' : 'text-tinta-500'
                  }`}
                >
                  {plan.periodo}
                </span>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.beneficios.map((beneficio) => (
                  <li key={beneficio} className="flex items-start gap-3">
                    <Check
                      size={18}
                      className={`mt-0.5 shrink-0 ${
                        plan.destacado ? 'text-salvia-100' : 'text-salvia-600'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        plan.destacado ? 'text-white/90' : 'text-tinta-700'
                      }`}
                    >
                      {beneficio}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="#contacto"
                className={`mt-8 rounded-full px-6 py-3 text-center font-semibold transition-all ${
                  plan.destacado
                    ? 'bg-white text-terracota-600 hover:bg-arena-100'
                    : 'border-2 border-terracota-500 text-terracota-600 hover:bg-terracota-500 hover:text-white'
                }`}
              >
                Empezar ahora
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Precios