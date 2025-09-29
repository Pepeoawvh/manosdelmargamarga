import React from "react";
import Image from "next/image";

const ProtocoloGrafico = () => {
  return (
    <div className="m-8 sm:m-12 lg:m-28">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Protocolo Gráfico
      </h1>
      <div className="flex flex-col gap-2 border-4 border-white rounded-md">
        <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh]"> {/* Altura dinámica basada en el viewport */}
          <Image
            src="/images/protocolografico/1logo.svg"
            alt="Logo"
            fill
            style={{ objectFit: "contain" }} // Mantiene la proporción de la imagen
          />
        </div>
        <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh]"> {/* Altura dinámica basada en el viewport */}
          <Image
            src="/images/protocolografico/2bordes.svg"
            alt="Descripción del SVG 2"
            fill
            style={{ objectFit: "contain" }}
          />
        </div><div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh]"> {/* Altura dinámica basada en el viewport */}
          <Image
            src="/images/protocolografico/3formato.svg"
            alt="Descripción del SVG 2"
            fill
            style={{ objectFit: "contain" }}
          />
        </div><div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh]"> {/* Altura dinámica basada en el viewport */}
          <Image
            src="/images/protocolografico/4tiroretiro.svg"
            alt="Descripción del SVG 2"
            fill
            style={{ objectFit: "contain" }}
          />
        </div>
        {/* Agrega más imágenes aquí */}
      </div>
    </div>
  );
};

export default ProtocoloGrafico;