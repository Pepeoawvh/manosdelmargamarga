import Link from "next/link";
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#ebead6] border-t border-gray-200" role="contentinfo" aria-label="Pie de página">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 justify-items-center text-center gap-8">
          {/* Enlaces rápidos */}
          <nav aria-label="Enlaces rápidos">
            <h3 className="text-lg font-semibold text-gray-800">Enlaces rápidos</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/" className="text-gray-800 hover:text-gray-500" title="Ir al inicio">
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
                  title="Cómo plantar"
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
                  title="Cómo trabajamos"
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
                  title="Protocolo gráfico"
                >
                  Protocolo gráfico
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contacto */}
          <div aria-label="Información de contacto">
            <h3 className="text-lg font-semibold text-gray-800">Contacto</h3>
                  <div className="mt-4">
                    <h1 className="text-[#87a644] text-lg">manosdelmargamarga@gmail.com</h1>
                  </div>


          </div>

          {/* Síguenos */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold text-gray-800">Síguenos</h3>
            <div className="mt-4 flex space-x-4" aria-label="Redes sociales">
              <a
                href="https://facebook.com/manosdelmargamarga"
                target="_blank"
                rel="noopener noreferrer me"
                className="text-gray-800 hover:text-gray-900"
                aria-label="Facebook"
                title="Facebook"
              >
                <FaFacebookF size={20} aria-hidden="true" />
              </a>
              <a
                href="https://instagram.com/manosdelmargamarga"
                target="_blank"
                rel="noopener noreferrer me"
                className="text-gray-800 hover:text-gray-900"
                aria-label="Instagram"
                title="Instagram"
              >
                <FaInstagram size={20} aria-hidden="true" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-800 hover:text-gray-900"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <FaLinkedinIn size={20} aria-hidden="true" />
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
          © {new Date().getFullYear()} Manos del MargaMarga. Todos los derechos reservados.
        </div>

        {/* JSON-LD Organization (no altera UI) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Manos del MargaMarga",
              url: "https://www.manosdelmargamarga.cl",
              logo: "https://www.manosdelmargamarga.cl/images/logos/mmm.png",
              sameAs: [
                "https://facebook.com/manosdelmargamarga",
                "https://instagram.com/manosdelmargamarga",
                "https://linkedin.com"
              ],
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  email: "manosdelmargamarga@gmail.com",
                  contactType: "customer support",
                  availableLanguage: ["es"]
                }
              ]
            }).replace(/</g, "\\u003c"),
          }}
        />
      </div>
    </footer>
  );
}
