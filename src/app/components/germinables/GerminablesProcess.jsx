"use client";
import Image from "next/image";

const GerminablesProcess = () => {
  const steps = [
    {
      number: 1,
      title: "Selección del diseño",
      description:
        "Elige entre nuestros modelos preestablecidos o solicita un diseño personalizado según tus preferencias.",
      icon: "/images/germinables/seleccion.svg",
    },
    {
      number: 2,
      title: "Personalización",
      description:
        "Nuestra diseñadora se pondrá en contacto contigo para definir los detalles: textos, colores, tipografías y acabados.",
      icon: "/images/germinables/personalizacion.svg",
    },
    {
      number: 3,
      title: "Aprobación",
      description:
        "Te enviamos una visualización previa para tu aprobación antes de comenzar la producción.",
      icon: "/images/germinables/aprobacion.svg",
    },
    {
      number: 4,
      title: "Producción artesanal",
      description:
        "Elaboramos cuidadosamente cada invitación a mano, utilizando nuestro papel con semillas",
      icon: "/images/germinables/produccion.svg",
    },
    {
      number: 5,
      title: "Envío seguro",
      description:
        "Empacamos con cuidado tus invitaciones y las enviamos a tu domicilio con seguimiento.",
      icon: "/images/germinables/envioseguro.svg",
    },
  ];

  return (
    <section id="process" className="select-none py-16 bg-emerald-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-6">
            Proceso de creación
          </h2>
          <p className="text-lg text-emerald-700">
            Así trabajamos para entregarte invitaciones perfectas y
            personalizadas para tu día especial
          </p>
        </div>

        <div className="relative mb-20">
          {/* Línea de tiempo vertical en escritorio */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-emerald-200 transform -translate-x-1/2"></div>

          {/* Proceso paso a paso */}
          <div className="space-y-12 md:space-y-0">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                } items-center mb-12`}
              >
                {/* Contenido izquierdo o derecho */}
                <div
                  className={`md:w-1/2 ${
                    index % 2 === 0
                      ? "md:text-right md:pr-12"
                      : "md:text-left md:pl-12"
                  } mb-6 md:mb-0`}
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-2">
                    <span className="text-xl font-bold">{step.number}</span>
                  </div>{" "}
                  <h3 className="text-xl font-semibold text-emerald-800 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-emerald-700">{step.description}</p>
                </div>

                {/* Círculo numerado central */}
                <div className="relative z-10 flex flex-row w-full  items-center justify-evenly">
                  <div className="flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-md p-2">
                    <Image
                      src={step.icon}
                      alt={step.title}
                      width={100}
                      height={100}
                    />
                  </div>
                </div>

                {/* Espacio para mantener la simetría */}
                <div className="md:w-1/2"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm">
          <h3 className="text-2xl font-bold text-emerald-800 mb-6 text-center">
            Tiempos de producción y entrega
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-emerald-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-emerald-800 mb-2">
                Diseño y aprobación
              </h4>
              <p className="text-emerald-700">3-5 días hábiles</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-emerald-700"
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
              <h4 className="text-lg font-semibold text-emerald-800 mb-2">
                Producción
              </h4>
              <p className="text-emerald-700">7-10 días hábiles</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-emerald-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  ></path>
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-emerald-800 mb-2">
                Envío
              </h4>
              <p className="text-emerald-700">3-5 días hábiles</p>
            </div>
          </div>
          <div className="mt-8 p-4 bg-emerald-50 rounded-lg">
            <p className="text-emerald-800 text-center font-medium">
              Recomendamos realizar tu pedido con al menos 2 meses de
              anticipación a la fecha en que necesitas entregar las
              invitaciones.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GerminablesProcess;
