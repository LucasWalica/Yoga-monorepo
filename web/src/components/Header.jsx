import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const links = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#sobre-mi', label: 'Sobre mí' },
  { href: '#clases', label: 'Clases' },
  { href: '#horarios', label: 'Horarios' },
  { href: '#precios', label: 'Precios' },
  { href: '#testimonios', label: 'Testimonios' },
  { href: '#galeria', label: 'Galería' },
  { href: '#contacto', label: 'Contacto' },
]

function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? 'bg-arena-100/95 shadow-sm backdrop-blur'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <a href="#inicio" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-terracota-500 font-serif text-xl text-white">
            S
          </span>
          <span className="font-serif text-xl font-semibold tracking-wide text-tinta-950">
            Seba Yoga
          </span>
        </a>

        <ul className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-tinta-700 transition-colors hover:text-terracota-600"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-tinta-950 hover:bg-arena-200 lg:hidden"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {open && (
        <ul className="border-t border-arena-200 bg-arena-100 px-4 pb-4 lg:hidden">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block border-b border-arena-200 py-3 text-sm font-medium text-tinta-700 transition-colors hover:text-terracota-600"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}

export default Header