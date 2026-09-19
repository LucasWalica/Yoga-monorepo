import { Leaf } from 'lucide-react'

function InstagramIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function FacebookIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function YoutubeIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  )
}

const linkGroups = [
  {
    title: 'Explorar',
    links: [
      { label: 'Sobre mí', href: '#sobre-mi' },
      { label: 'Clases', href: '#clases' },
      { label: 'Horarios', href: '#horarios' },
      { label: 'Galería', href: '#galeria' },
    ],
  },
  {
    title: 'Información',
    links: [
      { label: 'Precios', href: '#precios' },
      { label: 'Testimonios', href: '#testimonios' },
      { label: 'Contacto', href: '#contacto' },
    ],
  },
]

const redes = [
  {
    icon: InstagramIcon,
    label: 'Instagram',
    href: 'https://instagram.com',
  },
  {
    icon: FacebookIcon,
    label: 'Facebook',
    href: 'https://facebook.com',
  },
  {
    icon: YoutubeIcon,
    label: 'YouTube',
    href: 'https://youtube.com',
  },
]

function Footer() {
  return (
    <footer className="bg-tinta-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-terracota-500 font-serif text-xl">
                S
              </span>
              <span className="font-serif text-xl font-semibold">Seba Yoga</span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
              Un espacio para reconectar con tu cuerpo, respirar profundo y
              encontrar calma en el movimiento. Todos los niveles son bienvenidos.
            </p>
            <div className="mt-6 flex gap-3">
              {redes.map((red) => (
                <a
                  key={red.label}
                  href={red.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={red.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-terracota-500 hover:text-white"
                >
                  <red.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {linkGroups.map((group) => (
            <div key={group.title}>
              <h3 className="font-semibold text-white">{group.title}</h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-terracota-300"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} Seba Yoga. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-2 text-sm text-white/40">
            <Leaf size={16} className="text-salvia-400" />
            Practicá con intención
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer