'use client'
import Image from 'next/image';

const GerminablesBenefits = () => {
  const benefits = [
    {
      title: "Ecológicas y sostenibles",
      description: "Reducen la huella de carbono y contribuyen activamente a la conservación del medio ambiente",
      icon: "/images/germinables/ECOLOGICAS.svg"
    },
    {
      title: "Memorables y únicas",
      description: "Ofrecen una experiencia interactiva que sorprenderá a tus invitados",
      icon: "/images/germinables/MEMORABLES.svg"
    },
    {
      title: "Totalmente personalizables",
      description: "Diseños exclusivos adaptados a tu estilo y temática de boda",
      icon: "/images/germinables/PERSONALIZABLES.svg"
    },
    {
      title: "Variedad de semillas",
      description: "Flores silvestres, hierbas aromáticas o vegetales según tu preferencia",
      icon: "/images/germinables/SEMILLAS.svg"
    },
    {
      title: "Acabados artesanales",
      description: "Texturas naturales, bordes irregulares y detalles hechos a mano",
      icon: "/images/germinables/ACABADOS.svg"
    },
    {
      title: "Complementos a juego",
      description: "Sobres, etiquetas, sellos y decoración adicional en el mismo estilo",
      icon: "/images/germinables/COMPLEMENTOS.svg"
    }
  ];

  return (
    <section id="benefits" className="py-16 select-none bg-emerald-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-6">Beneficios de las invitaciones germinables</h2>
          <p className="text-lg text-emerald-700">
            Más que invitaciones, son un símbolo de crecimiento y un compromiso con el planeta.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex mb-4">
                <div className="flex w-32 items-center h-32 mr-4">
                  <Image 
                    src={benefit.icon} 
                    alt={benefit.title} 
                    width={100} 
                    height={100} 
                    className="text-emerald-600 "
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-emerald-800 mb-2">{benefit.title}</h3>
                  <p className="text-emerald-700">{benefit.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 bg-white p-8 rounded-xl shadow-sm">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/3 mb-6 md:mb-0">
              <div className="relative w-full aspect-square max-w-xs mx-auto">
                <Image 
                  src="/images/icons/ecobeneficios.svg" 
                  alt="Impacto ecológico" 
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </div>
            <div className="md:w-2/3 md:pl-10">
              <h3 className="text-2xl font-bold text-emerald-800 mb-4">Impacto ecológico positivo</h3>
              <p className="text-emerald-700 mb-4">
                Al elegir nuestras invitaciones germinables, estás tomando una decisión importante para reducir el impacto ambiental de tu celebración:
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-emerald-600 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-emerald-700">Reducción de la tala de árboles para fabricación de papel</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-emerald-600 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-emerald-700">Menor uso de tintas químicas y procesos contaminantes</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-emerald-600 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-emerald-700">Contribución a la polinización y biodiversidad</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-emerald-600 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-emerald-700">Cero residuos: se transforma en vida en lugar de desecharse</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-emerald-600 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-emerald-700">Sensibilización ambiental entre tus invitados</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GerminablesBenefits;