import HomeClient from "./components/HomeClient";

export const metadata = {
  title: "Inicio",
  description:
    "Descubre papel artesanal, papel reciclado y papel semilla germinable hecho a mano en Chile. Diseños sostenibles para invitaciones, bodas, packaging ecológico y proyectos creativos.",
  keywords: [
    "papel artesanal Chile",
    "papel semilla germinable",
    "invitaciones papel reciclado",
    "papel hecho a mano",
    "packaging sostenible",
    "tarjetas papel semilla bodas",
    "papel biodegradable",
    "diseño ecológico",
  ],
  openGraph: {
    title: "Manos del Marga Marga | Papel artesanal sostenible",
    description:
      "Papel artesanal, reciclado y papel semilla para invitaciones, bodas y proyectos creativos. Hecho a mano en Chile.",
    type: "website",
    images: [
      {
        url: "/images/logos/mmm.png",
        width: 1200,
        height: 630,
        alt: "Taller de papel artesanal Manos del Marga Marga",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Manos del Marga Marga | Papel artesanal sostenible",
    description:
      "Papel artesanal, reciclado y papel semilla para proyectos creativos. Hecho a mano en Chile.",
  },
};

export default function Home() {
  return <HomeClient />;
}
