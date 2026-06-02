import { FaSeedling } from "react-icons/fa";
import Link from "next/link";

export const metadata = {
  title: "Sobre Nosotras | Taller de Papel Artesanal",
  description:
    "Conoce a Manos del Marga Marga: taller chileno dedicado al papel artesanal, reciclado y papel semilla. Nuestra historia, valores y proceso artesanal sostenible.",
  alternates: {
    canonical: "https://www.manosdelmargamarga.cl/nosotras",
  },
  openGraph: {
    type: "website",
    url: "https://www.manosdelmargamarga.cl/nosotras",
    title: "Sobre Nosotras | Manos del Marga Marga",
    description:
      "Taller chileno de papel artesanal y reciclado. Conoce nuestra historia, proceso y compromiso con la sostenibilidad.",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Manos del Marga Marga - Taller de papel artesanal",
      },
    ],
    siteName: "Manos del Marga Marga",
    locale: "es_CL",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sobre Nosotras | Manos del Marga Marga",
    description:
      "Taller chileno de papel artesanal y reciclado. Conoce nuestra historia y proceso sostenible.",
    images: ["/og.jpg"],
  },
};

export default function EnConstruccion() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e6e5df] px-6">
      <div className="bg-white shadow-md rounded-2xl p-10 max-w-lg text-center border border-gray-200">
        <div className="flex justify-center mb-6 text-green-600">
          <FaSeedling size={60} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Página en construcción
        </h1>
        <p className="mt-4 text-gray-700">
          Estamos sembrando nuevas ideas para traerte esta sección muy pronto.  
          Gracias por tu paciencia 🌻🌼🌳

        ¡Si tienes alguna pregunta no dudes en escribirnos!
        </p>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 transition"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
