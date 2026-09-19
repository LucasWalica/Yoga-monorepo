const dias = [
  {
    dia: 'Lunes',
    clases: [
      { hora: '09:00', nombre: 'Hatha Yoga', nivel: 'Todos los niveles' },
      { hora: '18:30', nombre: 'Vinyasa Flow', nivel: 'Intermedio' },
    ],
  },
  {
    dia: 'Martes',
    clases: [
      { hora: '10:30', nombre: 'Yin Yoga', nivel: 'Todos los niveles' },
      { hora: '19:00', nombre: 'Hatha Yoga', nivel: 'Principiante' },
    ],
  },
  {
    dia: 'Miércoles',
    clases: [
      { hora: '09:00', nombre: 'Vinyasa Flow', nivel: 'Intermedio' },
      { hora: '18:30', nombre: 'Yoga Restaurativo', nivel: 'Todos los niveles' },
    ],
  },
  {
    dia: 'Jueves',
    clases: [
      { hora: '10:30', nombre: 'Hatha Yoga', nivel: 'Principiante' },
      { hora: '19:00', nombre: 'Yin Yoga', nivel: 'Todos los niveles' },
    ],
  },
  {
    dia: 'Viernes',
    clases: [{ hora: '09:00', nombre: 'Vinyasa Flow', nivel: 'Intermedio' }],
  },
  {
    dia: 'Sábado',
    clases: [{ hora: '11:00', nombre: 'Yoga para toda la familia', nivel: 'Todos los niveles' }],
  },
]

function Horarios() {
  return (
    <section id="horarios" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-terracota-600">
            Horarios
          </p>
          <h2 className="font-serif text-3xl font-semibold text-tinta-950 sm:text-4xl">
            Tus clases semana a semana
          </h2>
          <p className="mt-4 text-tinta-500">
            Horarios fijos de lunes a sábado. Podés venir a la clase que quieras con
            tu pase mensual o reservar clase suelta.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dias.map((dia) => (
              <div
                key={dia.dia}
                className="rounded-2xl border border-arena-200 bg-arena-50 p-6"
              >
                <h3 className="font-serif text-lg font-semibold text-tinta-950">
                  {dia.dia}
                </h3>
                <ul className="mt-4 space-y-3">
                  {dia.clases.map((clase) => (
                    <li
                      key={`${dia.dia}-${clase.hora}`}
                      className="flex items-start justify-between gap-4 rounded-xl bg-white p-4 shadow-sm"
                    >
                      <div>
                        <p className="text-sm font-semibold text-tinta-950">
                          {clase.nombre}
                        </p>
                        <p className="mt-0.5 text-xs text-tinta-500">
                          {clase.nivel}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-salvia-100 px-3 py-1 text-sm font-semibold text-salvia-700">
                        {clase.hora}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-tinta-500">
          Domingo descansamos. Pero si querés moverte en casa, tengo clases online
          grabadas para vos.
        </p>
      </div>
    </section>
  )
}

export default Horarios