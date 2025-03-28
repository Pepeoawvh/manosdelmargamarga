'use client'
import { useState } from 'react';

const GerminablesFAQ = () => {
  const [openItem, setOpenItem] = useState(0);
  
  const faqs = [
    {
      question: "¿Qué tipos de semillas utilizan en las invitaciones?",
      answer: "Utilizamos una variedad de semillas según tu preferencia: flores silvestres, hierbas aromáticas como lavanda o menta, e incluso vegetales pequeños. Cada tipo de semilla está seleccionada cuidadosamente para garantizar una buena germinación."
    },
    {
      question: "¿Cuánto tiempo tardan en germinar las semillas?",
      answer: "Dependiendo del tipo de semilla y las condiciones de plantación, pueden comenzar a germinar entre 5 y 15 días después de plantarlas. Incluimos instrucciones detalladas para ayudar a tus invitados a tener éxito con el cultivo."
    },
    {
      question: "¿Las invitaciones son resistentes o se deterioran fácilmente?",
      answer: "Nuestras invitaciones están elaboradas para mantener su integridad durante el tiempo necesario. El papel con semillas es más grueso que el papel convencional y tiene una textura especial, pero es completamente funcional y resistente para su manejo normal."
    },
    {
      question: "¿Puedo elegir colores específicos para mis invitaciones?",
      answer: "¡Por supuesto! Aunque trabajamos con papel artesanal que tiene un tono natural, podemos incorporar colores en los bordes, agregar detalles en diferentes tonalidades e imprimir con tintas ecológicas que se adapten a la paleta de colores de tu boda."
    },
    {
      question: "¿Cuántas invitaciones debo pedir?",
      answer: "Recomendamos pedir un 10-15% más del número de hogares a invitar (no por persona). Esto te dará un margen para invitaciones de último momento, errores de dirección o para guardarlo como recuerdo."
    },
    {
      question: "¿Puedo incluir sobres o elementos adicionales?",
      answer: "Sí, ofrecemos sobres a juego, tarjetas adicionales (como mapas, itinerarios o información de hospedaje), etiquetas personalizadas y otros complementos para crear un conjunto completo y coordinado."
    },
    {
      question: "¿Envían muestras antes de hacer un pedido completo?",
      answer: "Podemos enviar una muestra de nuestro papel con semillas para que puedas apreciar la textura y calidad. Tiene un costo adicional que se descontará de tu pedido final si decides seguir adelante con nosotros."
    }
  ];

  const toggleItem = (index) => {
    setOpenItem(openItem === index ? null : index);
  };

  return (
    <section id="faq" className="select-none py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-6">Preguntas frecuentes</h2>
          <p className="text-lg text-emerald-700">
            Todo lo que necesitas saber sobre nuestras invitaciones germinables
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-4 border-b border-emerald-100 pb-4">
              <button
                className="w-full flex justify-between items-center text-left font-medium text-lg text-emerald-800 hover:text-emerald-600 focus:outline-none"
                onClick={() => toggleItem(index)}
              >
                <span>{faq.question}</span>
                <svg
                  className={`w-5 h-5 transform transition-transform ${openItem === index ? 'rotate-180' : ''}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
              <div className={`mt-2 text-emerald-700 ${openItem === index ? 'block' : 'hidden'}`}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 p-6 bg-emerald-50 rounded-lg max-w-4xl mx-auto text-center">
          <h3 className="text-xl font-semibold text-emerald-800 mb-3">¿Tienes más preguntas?</h3>
          <p className="text-emerald-700 mb-6">
            Estaremos encantados de responder todas tus dudas y ayudarte a crear la invitación perfecta para tu día especial.
          </p>
          <a 
            href="/contact" 
            className="inline-block px-6 py-3 bg-emerald-700 text-white rounded-md hover:bg-emerald-600 transition-colors"
          >
            Contáctanos
          </a>
        </div>
      </div>
    </section>
  );
};

export default GerminablesFAQ;