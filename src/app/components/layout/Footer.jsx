import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Mi Marca</h3>
            <p className="mt-4 text-gray-600 text-sm">
              Tu espacio para productos únicos, personalizados y con
              inspiración natural.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Enlaces rápidos
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/" className="text-gray-900 hover:text-gray-500">
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href={`/tienda/${"¿Cómo plantar?"
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[¿?]/g, "")
                    .replace(/\s+/g, "-")}`}
                  className="text-gray-900 hover:text-gray-500"
                >
                  ¿Cómo plantar?
                </Link>
              </li>
              <li>
                <Link
                  href={`/tienda/${"¿Cómo trabajamos?"
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[¿?]/g, "")
                    .replace(/\s+/g, "-")}`}
                  className="text-gray-900 hover:text-gray-500"
                >
                  ¿Cómo trabajamos?
                </Link>
              </li>
              <li>
                <Link
                  href={`/tienda/${"Protocolo gráfico"
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[¿?]/g, "")
                    .replace(/\s+/g, "-")}`}
                  className="text-gray-900 hover:text-gray-500"
                >
                  Protocolo gráfico
                </Link>
              </li>
              <li>
                <Link
                  href={`/tienda/${"Personalizados"
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[¿?]/g, "")
                    .replace(/\s+/g, "-")}`}
                  className="text-gray-900 hover:text-gray-500"
                >
                  Personalizados
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Contacto</h3>
            <ul className="mt-4 space-y-2 text-gray-600 text-sm">
              <li>Email: manosdelmargamarga@gmail.com</li>

            </ul>
          </div>

          {/* Síguenos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Síguenos</h3>
            <div className="mt-4 flex space-x-4">
              <a
                href="https://facebook.com/manosdelmargamarga"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
              >
                <FaFacebookF size={20} />
              </a>
              <a
                href="https://instagram.com/manosdelmargamarga"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
              >
                <FaLinkedinIn size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-gray-200 pt-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Manos del MargaMarga. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
