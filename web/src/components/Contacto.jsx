import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react'
import { useState } from 'react'

const contactInfo = [
  {
    icon: MapPin,
    title: 'Dirección',
    text: 'Av. Los Aromos 1234, Barrio El Sol\nCórdoba, Argentina',
  },
  {
    icon: Mail,
    title: 'Email',
    text: 'hola@sebayoga.com.ar',
  },
  {
    icon: Phone,
    title: 'Teléfono / WhatsApp',
    text: '+54 9 351 555-0199',
  },
  {
    icon: Clock,
    title: 'Horario de atención',
    text: 'Lunes a viernes: 9 a 20 hs\nSábados: 10 a 14 hs',
  },
]

function Contacto() {
  const [enviado, setEnviado] = useState(false)

  return (
    <section id="contacto" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-14 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-terracota-600">
              Contacto
            </p>
            <h2 className="font-serif text-3xl font-semibold text-tinta-950 sm:text-4xl">
              Escribinos y empezá tu práctica
            </h2>
            <p className="mt-4 text-tinta-500">
              ¿Tenés dudas sobre las clases, los planes o querés reservar tu primer
              clase? Dejame tu mensaje y te respondo a la brevedad.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {contactInfo.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-salvia-100 text-salvia-600">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-tinta-950">{item.title}</h3>
                    <p className="mt-1 whitespace-pre-line text-sm text-tinta-500">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-arena-50 p-8 sm:p-10">
            {enviado ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-salvia-100 text-salvia-600">
                  <Send size={36} />
                </div>
                <h3 className="font-serif text-2xl font-semibold text-tinta-950">
                  ¡Mensaje enviado!
                </h3>
                <p className="mt-3 max-w-sm text-tinta-500">
                  Gracias por escribir. Te voy a responder a la brevedad. Mientras,
                  podés explorar las clases que ofrecemos.
                </p>
                <button
                  type="button"
                  onClick={() => setEnviado(false)}
                  className="mt-8 rounded-full border-2 border-terracota-500 px-6 py-3 font-semibold text-terracota-600 transition-colors hover:bg-terracota-500 hover:text-white"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setEnviado(true)
                }}
                className="space-y-6"
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="nombre"
                      className="mb-2 block text-sm font-medium text-tinta-950"
                    >
                      Nombre
                    </label>
                    <input
                      id="nombre"
                      type="text"
                      required
                      placeholder="Tu nombre"
                      className="w-full rounded-xl border border-arena-300 bg-white px-4 py-3 text-tinta-950 placeholder:text-tinta-300 focus:border-terracota-500 focus:outline-none focus:ring-2 focus:ring-terracota-500/20"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-tinta-950"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="tu@email.com"
                      className="w-full rounded-xl border border-arena-300 bg-white px-4 py-3 text-tinta-950 placeholder:text-tinta-300 focus:border-terracota-500 focus:outline-none focus:ring-2 focus:ring-terracota-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="asunto"
                    className="mb-2 block text-sm font-medium text-tinta-950"
                  >
                    Motivo
                  </label>
                  <select
                    id="asunto"
                    className="w-full rounded-xl border border-arena-300 bg-white px-4 py-3 text-tinta-950 focus:border-terracota-500 focus:outline-none focus:ring-2 focus:ring-terracota-500/20"
                  >
                    <option>Quiero empezar yoga</option>
                    <option>Consulta sobre planes y precios</option>
                    <option>Reservar una clase</option>
                    <option>Otro motivo</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="mensaje"
                    className="mb-2 block text-sm font-medium text-tinta-950"
                  >
                    Mensaje
                  </label>
                  <textarea
                    id="mensaje"
                    rows={5}
                    required
                    placeholder="Contame cómo podemos ayudarte..."
                    className="w-full resize-none rounded-xl border border-arena-300 bg-white px-4 py-3 text-tinta-950 placeholder:text-tinta-300 focus:border-terracota-500 focus:outline-none focus:ring-2 focus:ring-terracota-500/20"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-terracota-500 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-terracota-600 hover:shadow-xl"
                >
                  Enviar mensaje
                  <Send size={18} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contacto