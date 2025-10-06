import Link from "next/link";
import Image from "next/image";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#ebead6] border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 justify-items-center text-center gap-8">
          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Enlaces rápidos
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/" className="text-gray-800 hover:text-gray-500">
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href={`/tutoriales/${"como-plantar"
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[¿?]/g, "")
                    .replace(/\s+/g, "-")}`}
                  className="text-gray-800 hover:text-gray-500"
                >
                  ¿Cómo plantar?
                </Link>
              </li>
              <li>
                <Link
                  href={`/tutoriales/${"como-trabajamos"
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[¿?]/g, "")
                    .replace(/\s+/g, "-")}`}
                  className="text-gray-800 hover:text-gray-500"
                >
                  ¿Cómo trabajamos?
                </Link>
              </li>
              <li>
                <Link
                  href={`/tutoriales/${"protocolo-grafico"
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[¿?]/g, "")
                    .replace(/\s+/g, "-")}`}
                  className="text-gray-800 hover:text-gray-500"
                >
                  Protocolo gráfico
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Contacto</h3>
            <ul className="mt-4 space-y-2 text-gray-800 text-xl">
              <li>manosdelmargamarga@gmail.com</li>
            </ul>
          </div>

          {/* Síguenos */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold text-gray-800">Síguenos</h3>
            <div className="mt-4 flex space-x-4">
              <a
                href="https://facebook.com/manosdelmargamarga"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-800 hover:text-gray-900"
              >
                <FaFacebookF size={20} />
              </a>
              <a
                href="https://instagram.com/manosdelmargamarga"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-800 hover:text-gray-900"
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-800 hover:text-gray-900"
              >
                <FaLinkedinIn size={20} />
              </a>
            </div>

            {/* Logo con next/image */}
            <div className="mt-6">
              <Image
                src="/images/logos/mmm.png"
                alt="Manos del MargaMarga"
                width={160}
                height={80}
              className="mx-auto h-auto w-auto object-contain object-center"
                priority
              />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-gray-200 pt-8 text-center text-[#b4cf66] text-sm">
          © {new Date().getFullYear()} Manos del MargaMarga. Todos los derechos
          reservados.
        </div>
      </div>
    </footer>
  );
}
