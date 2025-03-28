"use client";
import Image from "next/image";

const GerminablesOverview = () => {
  return (
    <section id="overview" className="select-none py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-6">
            Invitaciones que cobran vida
          </h2>
          <p className="text-lg text-emerald-700">
            Nuestras invitaciones germinables son elaboradas artesanalmente con
            papel reciclado y semillas de plantas y flores. Un regalo ecológico
            que tus invitados podrán plantar después de tu boda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-emerald-50 p-6 rounded-lg">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
  </svg>
            </div>
            <h3 className="text-xl font-semibold text-emerald-800 mb-2">
              Eco-friendly
            </h3>
            <p className="text-emerald-700">
              Elaboradas con papel reciclado y biodegradable. Una alternativa
              perfecta al papel tradicional que respeta el medio ambiente.
            </p>
          </div>

          <div className="bg-emerald-50 p-6 rounded-lg">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-emerald-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-emerald-800 mb-2">
              Artesanales
            </h3>
            <p className="text-emerald-700">
              Cada invitación es creada a mano con dedicación y cuidado.
              Texturas únicas y acabados naturales que sorprenderán a tus
              invitados.
            </p>
          </div>

          <div className="bg-emerald-50 p-6 rounded-lg">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
  </svg>
            </div>
            <h3 className="text-xl font-semibold text-emerald-800 mb-2">
              Simbólicas
            </h3>
            <p className="text-emerald-700">
              Representan el crecimiento de tu nueva etapa. Tus invitados podrán
              conservar un recuerdo vivo de tu boda que florecerá con el tiempo.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center bg-emerald-50 rounded-xl overflow-hidden">
          
          <div className="md:w-1/2 p-8">
            <h3 className="text-2xl font-bold text-emerald-800 mb-4">
              ¿Cómo funcionan?
            </h3>
            <ol className="space-y-4">
              <li className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 mt-1 mr-3">
                  1
                </div>
                <p className="text-emerald-700">
                  Después de recibir la invitación, tus invitados pueden
                  colocarla en tierra húmeda.
                </p>
              </li>
              <li className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 mt-1 mr-3">
                  2
                </div>
                <p className="text-emerald-700">
                  Con agua y luz solar, el papel comenzará a descomponerse
                  naturalmente.
                </p>
              </li>
              <li className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 mt-1 mr-3">
                  3
                </div>
                <p className="text-emerald-700">
                  En pocas semanas, las semillas germinarán creando bellas
                  flores o plantas aromáticas.
                </p>
              </li>
              <li className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 mt-1 mr-3">
                  4
                </div>
                <p className="text-emerald-700">
                  Un recuerdo de tu boda que florecerá y perdurará en el tiempo.
                </p>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GerminablesOverview;
