const fotos = [
  {
    url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop',
    alt: 'Meditación en postura de loto frente a una ventana',
    className: 'sm:row-span-2',
  },
  {
    url: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
    alt: 'Postura de guerrero durante una clase',
    className: '',
  },
  {
    url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800&auto=format&fit=crop',
    alt: 'Mujer practicando yoga en exterior',
    className: '',
  },
  {
    url: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?q=80&w=800&auto=format&fit=crop',
    alt: 'Postura de flexión durante una clase de yoga',
    className: 'sm:row-span-2',
  },
  {
    url: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?q=80&w=800&auto=format&fit=crop',
    alt: 'Pareja en postura de árbol al aire libre',
    className: '',
  },
  {
    url: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?q=80&w=800&auto=format&fit=crop',
    alt: 'Práctica de yoga en grupo en un estudio',
    className: '',
  },
]

function Galeria() {
  return (
    <section id="galeria" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-terracota-600">
            Galería
          </p>
          <h2 className="font-serif text-3xl font-semibold text-tinta-950 sm:text-4xl">
            Un vistazo al estudio
          </h2>
          <p className="mt-4 text-tinta-500">
            Espacios, clases y momentos compartidos. Una idea de lo que te espera.
          </p>
        </div>

        <div className="grid auto-rows-[240px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fotos.map((foto) => (
            <figure key={foto.url} className={`group relative overflow-hidden rounded-2xl ${foto.className}`}>
              <img
                src={foto.url}
                alt={foto.alt}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <figcaption className="absolute inset-0 flex items-end bg-gradient-to-t from-tinta-950/60 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="text-sm font-medium text-white">{foto.alt}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Galeria