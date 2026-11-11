import Link from "next/link";
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const quickLinks = [
  { href: "/como-plantar-papel-germinable-manos-del-marga-marga", label: "¿Cómo plantar?" },
  { href: "/tutoriales/como-trabajamos", label: "¿Cómo trabajamos?" },
  { href: "/tutoriales/protocolo-grafico", label: "Protocolo Gráfico" },
  { href: "/terminosycondiciones", label: "Términos y condiciones" },
];

export default function Footer() {
  return (
    <footer
      className="border-t border-[#eeeeec] bg-[#fdfdfc] text-[#292929]"
      role="contentinfo"
      aria-label="Pie de página"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[1fr_1fr_1.15fr] lg:gap-16 lg:px-8">
        <section className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <Image
            src="/images/logos/MMMvertical.png"
            alt="Manos del Marga Marga, papel reciclado artesanal germinable"
            width={188}
            height={198}
            className="h-auto w-[158px] object-contain sm:w-[183px]"
          />
          <p className="mt-5 max-w-[245px] text-sm leading-[1.4]">
            Transformamos residuos en vida.
            <br />
            Lo que comenzó como una búsqueda de coherencia ambiental, hoy es
            Manos del Marga Marga.
          </p>
          <div className="mt-6 flex items-center gap-4 text-[#474747]" aria-label="Redes sociales">
            <a
              href="https://facebook.com/manosdelmargamarga"
              target="_blank"
              rel="noopener noreferrer me"
              aria-label="Facebook"
              title="Facebook"
              className="!text-[#474747] transition-colors hover:!text-[#5e8c30]"
            >
              <FaFacebookF size={35} aria-hidden="true" />
            </a>
            <a
              href="https://instagram.com/manosdelmargamarga"
              target="_blank"
              rel="noopener noreferrer me"
              aria-label="Instagram"
              title="Instagram"
              className="!text-[#474747] transition-colors hover:!text-[#5e8c30]"
            >
              <FaInstagram size={40} aria-hidden="true" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
              className="!text-[#474747] transition-colors hover:!text-[#5e8c30]"
            >
              <FaLinkedinIn size={37} aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="text-center">
          <nav aria-label="Enlaces rápidos">
            <h2 className="text-base font-semibold uppercase">Enlaces rápidos</h2>
            <ul className="mt-4 space-y-2 text-base">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#292929] transition-colors hover:text-[#5e8c30]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-10" aria-label="Información de contacto">
            <h2 className="text-base font-semibold uppercase">Contacto</h2>
            <p className="mt-5 text-base leading-[1.45]">
              ¿Necesitas ponerte en contacto
              <br />
              con nosotras?
            </p>
            <p className="mt-5 text-base leading-[1.45]">
              Escríbenos
              <br />
              <a
                href="mailto:manosdelmargamarga@gmail.com"
                className="text-[#292929] transition-colors hover:text-[#5e8c30]"
              >
                manosdelmargamarga@gmail.com
              </a>
              <br />
              <a
                href="tel:+56322121504"
                className="text-[#292929] transition-colors hover:text-[#5e8c30]"
              >
                +56 32 212 1504
              </a>
            </p>
          </div>
        </section>

        <section
          className="flex flex-col items-center justify-start gap-7"
          aria-label="Convenios y medios de pago"
        >
          <Image
            src="/images/logos/MercadoPublico.png"
            alt="ChileCompra Mercado Público"
            width={310}
            height={95}
            className="h-auto w-[250px] object-contain sm:w-[290px]"
          />
          <div className="flex w-full max-w-[300px] items-center justify-center gap-4 sm:gap-5">
            <Image
              src="/images/logos/SelloMujer.png"
              alt="Sello Empresa Mujer"
              width={90}
              height={100}
              className="h-[88px] w-auto object-contain"
            />
            <Image
              src="/images/logos/Sernatur.png"
              alt="Sernatur"
              width={100}
              height={100}
              className="h-[88px] w-auto object-contain"
            />
            <Image
              src="/images/logos/MarcaChile.png"
              alt="Marca Chile"
              width={100}
              height={100}
              className="h-[88px] w-auto object-contain"
            />
          </div>
          <Image
            src="/images/logos/webpay.png"
            alt="Webpay Plus y medios de pago Transbank"
            width={220}
            height={100}
            className="h-auto w-[205px] object-contain"
          />
        </section>
      </div>

      <div className="h-3 bg-[#5e9851]" aria-hidden="true" />

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
              "https://linkedin.com",
            ],
            contactPoint: [
              {
                "@type": "ContactPoint",
                email: "manosdelmargamarga@gmail.com",
                contactType: "customer support",
                availableLanguage: ["es"],
              },
            ],
          }).replace(/</g, "\\u003c"),
        }}
      />
    </footer>
  );
}
