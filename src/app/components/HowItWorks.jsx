'use client'
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const HowItWorks = () => {
  // Estado para alternar entre iconos en la tarjeta 2
  const [showSecondIcon, setShowSecondIcon] = useState(false);
  
  // Efecto para alternar el icono cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setShowSecondIcon(prev => !prev);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      number: 1,
      title: "Revisa nuestro catálogo",
      description: "Explora nuestras opciones de diseños exclusivos para tu evento especial.",
      icon: "/images/icons/CatalogIcon.svg", 
      action: {
        text: "Ver catálogo",
        href: "/ecoproducts"
      }
    },
    {
      number: 2,
      title: "Decide el formato",
      description: "Elige entre invitación en PDF o un sitio web completo personalizado.",
      icon: "/images/icons/pdfIcon.svg",
      secondIcon: "/images/icons/webIcon.svg", // Segundo icono para alternar
      action: {
        text: "¿Cuál es la diferencia?",
        href: "" //SECCION DE COMPARACION DE PRODUCTOS
      }
    },
    {
      number: 3,
      title: "¡Compra tu invitación!",
      description: "Te contactaremos rápidamente para comenzar la producción.",
      icon: "/images/icons/buyicon.svg", 
      action: {
        text: "Compras 100% Protegidas",
        href: "/ecoabout" // SECCION DE PREGUNTAS FRECUENTES
      }
    }
  ];

  return (
    <section className="py-16 px-4 bg-emerald-50/60">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-4">¿Cómo funciona?</h2>
          <p className="text-lg text-emerald-700 max-w-2xl mx-auto">
            ¡Para nuestras Invitaciones Digitales el proceso es muy sencillo! <br/> En solo tres pasos estaremos trabajando en tu invitación personalizada
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden group">
              {/* Número de paso con círculo decorativo */}
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <span className="text-3xl font-bold text-emerald-800 translate-x-[-8px] translate-y-[8px]">{step.number}</span>
              </div>
              
              {/* Contenido del paso */}
              <div className="mb-6 flex items-center justify-center h-20 relative">
                {/* Para la tarjeta 2 (índice 1), mostramos iconos alternados */}
                {index === 1 ? (
                  <div className="relative w-24 h-24">
                    <div 
                      className={`absolute inset-0 transition-opacity duration-1000 ${
                        showSecondIcon ? 'opacity-0' : 'opacity-100'
                      }`}
                    >
                      <Image 
                        src={step.icon} 
                        alt={`${step.title} - PDF`}
                        width={100}
                        height={100}
                        className="text-emerald-600"
                      />
                    </div>
                    <div 
                      className={`absolute inset-0 transition-opacity duration-1000 ${
                        showSecondIcon ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <Image 
                        src={step.secondIcon} 
                        alt={`${step.title} - Web`}
                        width={100}
                        height={100}
                        className="text-emerald-600"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-24 h-24 relative">
                    <Image 
                      src={step.icon} 
                      alt={`Paso ${step.number}`}
                      width={100}
                      height={100}
                      className="text-emerald-600"
                    />
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-emerald-800 mb-3">{step.title}</h3>
              <p className="text-emerald-700 mb-6 flex-grow">{step.description}</p>
              
              <Link href={step.action.href} className="inline-block text-white bg-emerald-700 hover:bg-emerald-600 transition-colors py-2 px-4 rounded text-sm text-center w-full mt-auto">
                {step.action.text}
              </Link>
            </div>
          ))}
        </div>
        
        {/* Mensaje de ayuda */}
        <div className="mt-12 text-center p-6 bg-white rounded-xl shadow-sm">
          <p className="text-lg text-emerald-800 font-medium">
            ¿Tienes preguntas? ¡No dudes en consultarnos!
          </p>
          <Link 
            href="/contact" 
            className="inline-block mt-4 border-2 border-emerald-700 text-emerald-800 hover:bg-emerald-700 hover:text-white transition-colors py-2 px-6 rounded"
          >
            Contactar
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;