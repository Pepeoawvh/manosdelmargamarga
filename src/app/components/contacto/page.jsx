import { FaSeedling } from "react-icons/fa";
import Link from "next/link";

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
