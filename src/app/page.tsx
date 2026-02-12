//src/app/page.tsx
import Header from '@/components/ui/Header';
import { Search, ArrowRight, Check, Home, Phone, Mail, MapPin, Shield, Clock, Award, Users } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }
        
        h1, h2, h3, .serif {
          font-family: 'Crimson Pro', serif;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.6s ease-out forwards;
        }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }

        .gradient-text {
          background: linear-gradient(135deg, #63bae9 0%, #4a9fd4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(99, 186, 233, 0.15);
        }

        .btn-primary {
          background: #63bae9;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          background: #4a9fd4;
          box-shadow: 0 10px 30px rgba(99, 186, 233, 0.3);
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: #fcc238;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          background: #e6af32;
          box-shadow: 0 10px 30px rgba(252, 194, 56, 0.3);
          transform: translateY(-2px);
        }

        .text-shadow {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .hero-pattern {
          background-image: 
            linear-gradient(135deg, rgba(99, 186, 233, 0.95) 0%, rgba(74, 159, 212, 0.9) 100%),
            url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v6h6V4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>

      <Header />

      {/* Hero Section */}
      <section className="relative hero-pattern text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-white/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="text-center opacity-0 animate-fade-in-up">
            <div className="inline-block mb-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <p className="text-sm font-medium tracking-wide">INMOBILIARIA EN ENTRE RÍOS</p>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-shadow">
              GBS y Asociados
            </h1>
            
            <p className="text-xl md:text-2xl font-light mb-4 max-w-3xl mx-auto opacity-95">
              Especialistas en alquileres, ventas y administración de propiedades
            </p>
            
            <p className="text-3xl md:text-4xl font-semibold mb-12 opacity-0 animate-fade-in-up delay-200">
              Tu próximo hogar te está esperando
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center opacity-0 animate-fade-in-up delay-300">
              <a
                href="#propiedades"
                className="group inline-flex items-center gap-3 px-8 py-4 btn-primary text-white font-semibold text-lg rounded-xl shadow-lg"
              >
                <Search className="w-5 h-5" />
                Buscar propiedades
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              
              <a
                href="#contacto"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold text-lg rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all"
              >
                <Phone className="w-5 h-5" />
                Contactar asesor
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto opacity-0 animate-fade-in-up delay-400">
            {[
              { number: '30+', label: 'Propiedades' },
              { number: '100+', label: 'Clientes satisfechos' },
              { number: '15+', label: 'Años de experiencia' },
              { number: '24hs', label: 'Tiempo de respuesta' }
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <p className="text-3xl font-bold mb-1">{stat.number}</p>
                <p className="text-sm opacity-90">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Property Types Section */}
      <section id="propiedades" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#686363]">
              ¿Qué estás buscando?
            </h2>
            <p className="text-xl text-[#969696] max-w-2xl mx-auto">
              Encontrá la propiedad perfecta para vos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: Home,
                title: 'Departamentos en alquiler', 
                desc: 'Monoambientes, 2, 3 y 4 ambientes en Libertador San Martín',
                features: ['Amoblados', 'Sin garantía', 'Listo para mudarse']
              },
              { 
                icon: Home,
                title: 'Casas y terrenos', 
                desc: 'Con jardín, parrilla, terraza o pileta en Entre Ríos',
                features: ['Zonas exclusivas', 'Amplios espacios', 'Excelente ubicación']
              },
              { 
                icon: Home,
                title: 'Propiedades en venta', 
                desc: 'Departamentos, casas y oportunidades únicas en la región',
                features: ['Financiación', 'Escrituración', 'Asesoramiento legal']
              },
            ].map((item, i) => (
              <div
                key={i}
                className="card-hover p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:border-[#63bae9]/30"
              >
                <div className="w-16 h-16 mb-6 rounded-xl bg-gradient-to-br from-[#63bae9] to-[#4a9fd4] flex items-center justify-center shadow-lg">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold mb-3 text-[#686363]">
                  {item.title}
                </h3>
                
                <p className="text-[#969696] mb-6 leading-relaxed">{item.desc}</p>
                
                <ul className="space-y-2">
                  {item.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-[#686363]">
                      <Check className="w-4 h-4 text-[#63bae9] flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="propiedades"
              className="inline-flex items-center gap-3 px-8 py-4 btn-secondary text-[#686363] font-semibold text-lg rounded-xl shadow-lg"
            >
              Ver todas las propiedades disponibles
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#686363]">
              ¿Por qué elegirnos?
            </h2>
            <p className="text-xl text-[#969696] max-w-2xl mx-auto">
              Trabajamos para hacer realidad tu proyecto inmobiliario
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: MapPin, title: 'Conocimiento local', desc: 'Expertos en el mercado de Entre Ríos' },
              { icon: Shield, title: 'Seguridad garantizada', desc: 'Trámites verificados y seguros' },
              { icon: Clock, title: 'Respuesta rápida', desc: 'Atención en menos de 24 horas' },
              { icon: Award, title: 'Profesionalismo', desc: 'Asesoramiento especializado' },
              { icon: Users, title: 'Atención personalizada', desc: 'Servicio adaptado a tus necesidades' },
              { icon: Check, title: 'Propiedades verificadas', desc: 'Todas nuestras propiedades están validadas' },
              { icon: Home, title: 'Múltiples garantías', desc: 'Aceptamos diferentes tipos de garantía' },
              { icon: Phone, title: 'Soporte continuo', desc: 'Estamos disponibles cuando nos necesites' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-14 h-14 mb-4 rounded-full bg-[#63bae9]/10 flex items-center justify-center">
                  <item.icon className="w-7 h-7 text-[#63bae9]" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-[#686363]">{item.title}</h3>
                <p className="text-sm text-[#969696]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local Knowledge Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-[#63bae9]/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#686363]">
                Conocemos Entre Ríos como nadie
              </h2>
              
              <p className="text-lg text-[#686363] mb-8 leading-relaxed">
                Somos una inmobiliaria con raíces profundas en Libertador San Martín y toda la provincia de Entre Ríos.
                Nuestro conocimiento del mercado local nos permite ofrecerte las mejores opciones según tus necesidades.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                  <div className="w-12 h-12 rounded-lg bg-[#63bae9]/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-[#63bae9]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1 text-[#686363]">
                      Ubicación privilegiada
                    </h3>
                    <p className="text-[#969696]">
                      Propiedades en las mejores zonas de Libertador San Martín, Gualeguaychú y alrededores
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                  <div className="w-12 h-12 rounded-lg bg-[#fcc238]/10 flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-[#fcc238]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1 text-[#686363]">
                      Compromiso local
                    </h3>
                    <p className="text-[#969696]">
                      Trabajamos con propietarios e inquilinos de la región, entendiendo sus necesidades
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#63bae9] to-[#4a9fd4] rounded-3xl opacity-10"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl p-10 border border-gray-100">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#63bae9] to-[#4a9fd4] flex items-center justify-center shadow-xl">
                      <Home className="w-14 h-14 text-white" />
                    </div>
                    <div className="mb-2">
                      <span className="text-5xl font-bold gradient-text">+30</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-[#686363]">
                      Propiedades gestionadas
                    </h3>
                    <p className="text-[#969696]">
                      En Libertador San Martín y la región
                    </p>
                    
                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-[#63bae9]">100%</p>
                          <p className="text-sm text-[#969696]">Verificadas</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-[#63bae9]">15+</p>
                          <p className="text-sm text-[#969696]">Años</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20 bg-gradient-to-br from-[#63bae9] to-[#4a9fd4] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ¿Tenés una consulta?
          </h2>
          <p className="text-xl mb-12 opacity-90 max-w-2xl mx-auto">
            Hablá directamente con un asesor. Estamos para ayudarte a encontrar tu próximo hogar.
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <a
              href="tel:03447123456"
              className="card-hover p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-white/20 flex items-center justify-center">
                <Phone className="w-8 h-8" />
              </div>
              <p className="text-2xl font-bold mb-2">03447-123456</p>
              <p className="text-sm opacity-90">Lun a Vie • 9 a 18 hs</p>
              <p className="text-sm opacity-75 mt-1">Sáb • 9 a 13 hs</p>
            </a>

            <a
              href="https://wa.me/5491123456789"
              target="_blank"
              rel="noopener noreferrer"
              className="card-hover p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-green-500 flex items-center justify-center">
                <span className="text-2xl font-bold">WA</span>
              </div>
              <p className="text-2xl font-bold mb-2">WhatsApp</p>
              <p className="text-sm opacity-90">Respuesta inmediata</p>
              <p className="text-sm opacity-75 mt-1">24/7 disponible</p>
            </a>

            <a
              href="mailto:info@libertadorsanmartin.com.ar"
              className="card-hover p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-white/20 flex items-center justify-center">
                <Mail className="w-8 h-8" />
              </div>
              <p className="text-2xl font-bold mb-2">Email</p>
              <p className="text-sm opacity-90 break-all">info@libertadorsanmartin.com.ar</p>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#686363] text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">GBS y Asociados</h3>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Tu inmobiliaria de confianza en Entre Ríos. Especialistas en alquileres, ventas y administración de propiedades.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#63bae9] transition-colors">
                  <span className="text-sm font-bold">FB</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#63bae9] transition-colors">
                  <span className="text-sm font-bold">IG</span>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Servicios</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-[#63bae9] transition-colors">Alquileres</a></li>
                <li><a href="#" className="hover:text-[#63bae9] transition-colors">Ventas</a></li>
                <li><a href="#" className="hover:text-[#63bae9] transition-colors">Administración</a></li>
                <li><a href="#" className="hover:text-[#63bae9] transition-colors">Tasaciones</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Ubicación</h4>
              <p className="text-gray-300 leading-relaxed">
                Libertador San Martín<br />
                Entre Ríos<br />
                Argentina
              </p>
            </div>
          </div>

          <div className="h-px bg-white/10 mb-6"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-300">
            <p>© 2025 GBS y Asociados • Todos los derechos reservados</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#63bae9] transition-colors">Términos y Condiciones</a>
              <a href="#" className="hover:text-[#63bae9] transition-colors">Política de Privacidad</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;