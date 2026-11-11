import { FaSeedling, FaCompass, FaDesktop, FaPuzzlePiece } from "react-icons/fa";

const botones = [
  {
    icon: <FaSeedling className="text-[#5e8c30] text-3xl mb-2" />,
    title: "¿CÓMO PLANTAR?",
    desc: "Haz germinar tu papel semilla.",
    href: "/como-plantar-papel-germinable-manos-del-marga-marga",
  },
  {
    icon: <FaCompass className="text-[#5e8c30] text-3xl mb-2" />,
    title: "¿CÓMO TRABAJAMOS?",
    desc: "Así funcionamos ante un pedido.",
    href: "/tutoriales/como-trabajamos",
  },
  {
    icon: <FaDesktop className="text-[#5e8c30] text-3xl mb-2" />,
    title: "PROTOCOLO GRÁFICO",
    desc: "Léelo si enviarás tu propio diseño.",
    href: "/tutoriales/protocolo-grafico",
  },
  {
    icon: <FaPuzzlePiece className="text-[#5e8c30] text-3xl mb-2" />,
    title: "PERSONALIZADOS",
    desc: "¿Tienes una idea? Lee aquí",
    href: "#personalizados",
  },
];

export default function BotoneraInfo() {
  return (
    <div className="bg-[#ebead5] p-4 flex flex-col md:flex-row justify-between items-stretch gap-4">
      {botones.map((btn, idx) => (
        <a
          key={btn.title}
          href={btn.href}
          className="flex-1 flex flex-col items-center text-center hover:bg-[#fffff5] transition rounded-lg px-4 py-2 border-r last:border-r-0 border-gray-200"
          style={idx !== botones.length - 1 ? { borderRight: "1px solid #e5e7eb" } : {}}
        >
          {btn.icon}
          <span className="font-semibold text-zinc-600 text-sm">{btn.title}</span>
          <span className="text-xs text-gray-500">{btn.desc}</span>
        </a>
      ))}
    </div>
  );
}