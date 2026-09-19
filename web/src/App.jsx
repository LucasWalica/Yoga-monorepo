import Header from './components/Header'
import Hero from './components/Hero'
import SobreMi from './components/SobreMi'
import Clases from './components/Clases'
import Horarios from './components/Horarios'
import Precios from './components/Precios'
import Testimonios from './components/Testimonios'
import Galeria from './components/Galeria'
import Contacto from './components/Contacto'
import Footer from './components/Footer'

function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <SobreMi />
        <Clases />
        <Horarios />
        <Precios />
        <Testimonios />
        <Galeria />
        <Contacto />
      </main>
      <Footer />
    </>
  )
}

export default App