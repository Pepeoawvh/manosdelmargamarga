import Image from 'next/image';
import Link from 'next/link';
import { ephesis } from '../ui/fonts';

export const metadata = {
  title: 'Sobre Nosotros | EcoBodas',
  description: 'Conoce más sobre EcoBodas, nuestros valores, misión y compromiso con el medio ambiente.',
};

export default function About() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative pb-12 md:py-24 bg-gradient-to-b from-emerald-50 to-white">
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-100 rounded-full opacity-40 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-100 rounded-full opacity-30 translate-x-1/4 translate-y-1/4" />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-emerald-800">
              Sobre <span className={`${ephesis.className} text-5xl md:text-6xl`}>Nosotros</span>
            </h1>
            <p className="text-lg md:text-xl text-emerald-700 max-w-3xl mx-auto">
              Somos un equipo apasionado por crear experiencias únicas para bodas, siempre comprometidos con el cuidado del medio ambiente.
            </p>
          </div>
        </div>
      </section>

      {/* Historia y Misión */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="md:w-1/2">
              <div className="relative">
                <div className="flex relative w-full aspect-square max-w-md mx-auto overflow-hidden">
                  <Image 
                    src="/images/logos/Ecobodaslogo.svg" 
                    alt="Equipo EcoBodas"
                    fill
                    className="object-fit"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-emerald-100 rounded-full z-[-1]" />
              </div>
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-emerald-800 mb-6">Nuestra Historia</h2>
              <p className="text-emerald-700 mb-4">
                EcoBodas nació en 2015 cuando nos dimos cuenta de la gran cantidad de papel que se desperdiciaba en las invitaciones tradicionales. Comenzamos realizando reciclaje de papel y poco a poco fuimos adquiriendo experiencia en la fabricación de elementos de papel reciclado para eventos y bodas. Hoy contamos con 4 años de experiencia en la elaboración de invitaciones digitales.
              </p>
              <p className="text-emerald-700 mb-6">
                A lo largo de los años, hemos ayudado a más de 400 parejas no solo a reducir la huella ecológica sin comprometer la belleza y elegancia de sus celebraciones especiales, sino a que a convertir sus recuerdos en algo único, significativo y especial.
              </p>
              
              <div className="bg-emerald-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-emerald-800 mb-3">Nuestra Misión</h3>
                <p className="text-emerald-700">
                  Queremos transformar la industria de las bodas, demostrando que es posible combinar la elegancia con la sostenibilidad, creando experiencias memorables que respeten nuestro planeta.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-12 bg-emerald-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-emerald-800 mb-12">Nuestros Valores</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-emerald-800 mb-2 text-center">Sostenibilidad</h3>
              <p className="text-emerald-700 text-center">
                Cada decisión que tomamos tiene en cuenta su impacto ambiental. Utilizamos materiales reciclados o biodegradables y procesos de producción eco-amigables.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-emerald-800 mb-2 text-center">Creatividad</h3>
              <p className="text-emerald-700 text-center">
                Buscamos constantemente formas innovadoras de fusionar la responsabilidad ambiental con diseños elegantes y personalizados para cada pareja.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-emerald-800 mb-2 text-center">Calidad</h3>
              <p className="text-emerald-700 text-center">
                Nos comprometemos a ofrecer productos y servicios de la más alta calidad. Creemos que lo eco-friendly no debería significar renunciar a la excelencia.
              </p>
            </div>
          </div>
        </div>
      </section>

     
      {/* Compromiso Ambiental */}
      <section className="py-12 bg-emerald-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row-reverse items-center gap-10">
           
            
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-emerald-800 mb-6">Nuestro Compromiso Ambiental</h2>
              <p className="text-emerald-700 mb-4">
                En EcoBodas, nuestra responsabilidad con el medio ambiente va más allá de nuestros productos:
              </p>
              
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-emerald-600 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-emerald-700">Fabricamos nuestro propio papel reciclado.</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-emerald-600 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-emerald-700">Nuestro taller opera con energía solar y sistemas de recolección de agua pluvial.</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-emerald-600 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-emerald-700">Utilizamos tintes vegetales y materiales 100% biodegradables o reciclados.</span>
                </li>
                <li className="flex items-start">

                </li>
              </ul>

            </div>
          </div>
        </div>
      </section>

      
      {/* Contacto CTA */}
      <section className="py-12 bg-emerald-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">¿Listo para hacer tu celebración más sustentable?</h2>
          <p className="text-lg mb-6">Contáctanos para comenzar a planificar tus invitaciones eco-friendly.</p>
          <Link href="/contact" className="inline-block px-8 py-3 bg-white text-emerald-700 rounded-md hover:bg-emerald-50 transition-colors font-semibold">
            Hablemos de tu boda
          </Link>
        </div>
      </section>
    </div>
  );
}