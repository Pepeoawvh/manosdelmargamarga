"use client";
import { useState, useEffect, useRef } from "react";
import {
  FaWhatsapp,
  FaFacebookF,
  FaX,
  FaEnvelope,
  FaLink,
  FaShareAlt,
  FaCheck,
} from "react-icons/fa";

const ShareButton = ({ title = "", compact = false }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);

  const getUrl = () => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  };

  const url = getUrl();
  const shareText = title || "Manos del Marga Marga";
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);

  // Cerrar al hacer clic fuera del menú
  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, [open]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareText, url });
        return;
      } catch {
        // usuario canceló o falló — mostrar menú de fallback
      }
    }
    setOpen((prev) => !prev);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setOpen(false);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      icon: FaWhatsapp,
      color: "text-[#25D366]",
      hover: "hover:bg-[#25D366]/10",
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: FaFacebookF,
      color: "text-[#1877F2]",
      hover: "hover:bg-[#1877F2]/10",
    },
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      icon: FaX,
      color: "text-gray-800",
      hover: "hover:bg-gray-100",
    },
    {
      name: "Email",
      href: `mailto:?subject=${encodedText}&body=${encodedText}%20${encodedUrl}`,
      icon: FaEnvelope,
      color: "text-[#EA4335]",
      hover: "hover:bg-[#EA4335]/10",
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={handleShare}
        aria-label="Compartir producto"
        title="Compartir"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center justify-center text-[#798f38] hover:text-[#5e8c30] hover:bg-[#eef6d6] transition-colors rounded-full ${
          compact ? "w-8 h-8 text-sm" : "w-9 h-9 text-base"
        }`}
      >
        <FaShareAlt />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Opciones para compartir"
          className="absolute right-0 top-full mt-2 w-44 rounded-lg bg-white shadow-lg ring-1 ring-black/5 z-50 py-1.5"
        >
          {copied ? (
            <div className="flex items-center gap-2 px-4 py-2 text-sm text-[#5e8c30] font-medium">
              <FaCheck className="text-[#5e8c30]" />
              Enlace copiado
            </div>
          ) : (
            <>
              {shareLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors ${link.hover}`}
                  >
                    <Icon className={link.color} />
                    {link.name}
                  </a>
                );
              })}
              <button
                type="button"
                role="menuitem"
                onClick={copyLink}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
              >
                <FaLink className="text-gray-500" />
                Copiar enlace
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ShareButton;
