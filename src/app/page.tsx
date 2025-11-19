import Header from '@/components/ui/Header';
import { Search, ArrowRight, Check, Home, Phone, Mail, MapPin } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <section className="relative bg-gradient-to-br from-[#63bae9] to-[#4ca8d8] text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-32 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            GBS y Asociados
          </h1>
          <p className="text-2xl md:text-3xl font-light mb-8 max-w-4xl mx-auto opacity-95">
            Alquileres • Ventas • Administración de propiedades en Entre Ríos
          </p>
          <p className="text-4xl md:text-5xl font-bold mb-16">
            Encontrá tu próximo hogar
          </p>

          <a
            href="propiedades"
            className="group inline-flex items-center gap-6 px-16 py-9 bg-white text-[#63bae9] font-bold text-3xl rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
          >
            <Search className="w-12 h-12" />
            Buscar propiedades
            <ArrowRight className="w-10 h-10 group-hover:translate-x-3 transition-transform" />
          </a>
        </div>
      </section>

      <section id="propiedades" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8" style={{ color: '#686363' }}>
            ¿Qué estás buscando?
          </h2>
          <p className="text-2xl text-gray-700 mb-12 max-w-3xl mx-auto">
            Todo lo que buscás lo encontrás acá
          </p>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { title: 'Departamentos en alquiler', desc: 'Monoambientes, 2, 3 y 4 ambientes en Libertador San Martín' },
              { title: 'Casas y terrenos', desc: 'Con jardín, parrilla, terraza o pileta en Entre Ríos' },
              { title: 'Propiedades en venta', desc: 'Departamentos, casas y oportunidades únicas en la región' },
            ].map((item, i) => (
              <div
                key={i}
                className="p-10 bg-white rounded-3xl shadow-xl border border-gray-100 hover:border-[#63bae9] transition-all duration-300"
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#63bae9]/10 flex items-center justify-center">
                  <Home className="w-14 h-14" style={{ color: '#63bae9' }} />
                </div>
                <h3 className="text-2xl font-bold mb-3" style={{ color: '#686363' }}>
                  {item.title}
                </h3>
                <p className="text-gray-600 text-lg">{item.desc}</p>
              </div>
            ))}
          </div>

          <a
            href="propiedades"
            className="inline-flex items-center gap-3 mt-12 px-10 py-5 bg-[#fcc238] text-[#686363] font-bold text-xl rounded-2xl shadow-xl hover:shadow-2xl hover:bg-[#e5af32] transition-all duration-300 hover:scale-105"
          >
            Ver todas las propiedades disponibles
            <ArrowRight className="w-7 h-7" />
          </a>
        </div>
      </section>

      <section id="nosotros" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16" style={{ color: '#686363' }}>
            ¿Por qué elegir Inmobiliaria Libertador San Martín?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              'Conocimiento local de Entre Ríos',
              'Atención personalizada',
              'Trámites ágiles y seguros',
              'Propiedades verificadas',
              'Asesoramiento profesional incluido',
              'Múltiples garantías aceptadas',
              'Respuesta en menos de 24 hs',
              'Transparencia total en costos',
            ].map((texto, i) => (
              <div key={i} className="flex items-center gap-4">
                <Check className="w-9 h-9 flex-shrink-0" style={{ color: '#fcc238' }} />
                <span className="text-lg font-medium" style={{ color: '#686363' }}>{texto}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12" style={{ color: '#686363' }}>
            Conocemos Entre Ríos como nadie
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xl mb-6" style={{ color: '#686363' }}>
                Somos una inmobiliaria con raíces profundas en Libertador San Martín y toda la provincia de Entre Ríos.
                Nuestro conocimiento del mercado local nos permite ofrecerte las mejores opciones según tus necesidades.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: '#63bae9' }} />
                  <div>
                    <h3 className="font-bold text-lg mb-1" style={{ color: '#686363' }}>
                      Ubicación privilegiada
                    </h3>
                    <p style={{ color: '#969696' }}>
                      Propiedades en las mejores zonas de Libertador San Martín, Gualeguaychú y alrededores
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: '#fcc238' }} />
                  <div>
                    <h3 className="font-bold text-lg mb-1" style={{ color: '#686363' }}>
                      Compromiso local
                    </h3>
                    <p style={{ color: '#969696' }}>
                      Trabajamos con propietarios e inquilinos de la región, entendiendo sus necesidades
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-8 border-4 border-[#63bae9]">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#63bae9] to-[#fcc238] flex items-center justify-center">
                  <Home className="w-20 h-20 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-4" style={{ color: '#686363' }}>
                  +30 propiedades gestionadas
                </h3>
                <p className="text-xl" style={{ color: '#969696' }}>
                  En Libertador San Martín y la región
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contacto" className="py-24 bg-[#63bae9] text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-8">
            ¿Tenés una consulta?
          </h2>
          <p className="text-2xl mb-12 opacity-90">
            Hablá directamente con un asesor. Estamos para ayudarte.
          </p>
          <div className="grid md:grid-cols-3 gap-10 max-w-4xl mx-auto">
            <a
              href="tel:03447123456"
              className="p-10 bg-white/20 backdrop-blur-sm rounded-3xl hover:bg-white/30 transition-all duration-300"
            >
              <Phone className="w-16 h-16 mx-auto mb-4" />
              <p className="text-3xl font-bold">03447-123456</p>
              <p className="text-lg mt-2">Lun a Vie • 9 a 18 hs</p>
              <p className="text-sm mt-1 opacity-80">Sáb • 9 a 13 hs</p>
            </a>
            <a
              href="https://wa.me/5491123456789"
              target="_blank"
              rel="noopener noreferrer"
              className="p-10 bg-white/20 backdrop-blur-sm rounded-3xl hover:bg-white/30 transition-all duration-300"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold">WA</span>
              </div>
              <p className="text-3xl font-bold">WhatsApp</p>
              <p className="text-lg mt-2">Respuesta inmediata</p>
            </a>
            <a
              href="mailto:info@libertadorsanmartin.com.ar"
              className="p-10 bg-white/20 backdrop-blur-sm rounded-3xl hover:bg-white/30 transition-all duration-300"
            >
              <Mail className="w-16 h-16 mx-auto mb-4" />
              <p className="text-3xl font-bold">Email</p>
              <p className="text-lg mt-2">info@libertadorsanmartin.com.ar</p>
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-[#686363] text-white py-14">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            <div>
              <h3 className="text-2xl font-bold mb-4">Inmobiliaria Libertador San Martín</h3>
              <p className="opacity-80">
                Tu inmobiliaria de confianza en Entre Ríos
              </p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-3">Servicios</h4>
              <ul className="space-y-2 opacity-80">
                <li>Alquileres</li>
                <li>Ventas</li>
                <li>Administración de propiedades</li>
                <li>Tasaciones</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-3">Ubicación</h4>
              <p className="opacity-80">
                Libertador San Martín<br />
                Entre Ríos • Argentina
              </p>
            </div>
          </div>
          <div className="h-px bg-white/30 mb-8"></div>
          <p className="text-center text-sm opacity-70">
            © 2025 Inmobiliaria Libertador San Martín • Todos los derechos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
