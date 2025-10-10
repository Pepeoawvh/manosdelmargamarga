"use client";
import React from "react";

const inputCls =
  "border rounded px-3 py-2 bg-[#] outline-none text-white bg-[#5e5e6e]  placeholder-stone-200";
const labelCls = "text-sm font-medium text-gray-700";
const btnCls =
  "px-4 py-2 text-gray-700 rounded w-full bg-[#96cbfb] hover:opacity-90 disabled:opacity-60";

const WINDOW_MS = 2 * 60 * 30 * 1000; // 30 minutos

export default function FormularioContacto() {
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    website: "", // honeypot
  });
  const [status, setStatus] = React.useState({
    loading: false,
    ok: null,
    msg: "",
  });
  const [cooldownLeft, setCooldownLeft] = React.useState(0);

  // Cargar cooldown desde localStorage
  React.useEffect(() => {
    const ts = Number(localStorage.getItem("contactLastSent") || 0);
    const left = ts ? WINDOW_MS - (Date.now() - ts) : 0;
    if (left > 0) setCooldownLeft(left);
  }, []);

  // Tick de cuenta regresiva (1s)
  React.useEffect(() => {
    if (cooldownLeft <= 0) return;
    const t = setInterval(() => {
      setCooldownLeft((x) => Math.max(0, x - 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [cooldownLeft]);

  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const validate = () => {
    if (cooldownLeft > 0) {
      setStatus({
        loading: false,
        ok: false,
        msg: `Podrás enviar nuevamente en ${Math.ceil(cooldownLeft / 60000)} minutos.`,
      });
      return false;
    }
    // Honeypot: si el usuario visible lo completa, lo consideramos no válido
    if (form.website && form.website.trim().length > 0) {
      setStatus({ loading: false, ok: false, msg: "Validación fallida." });
      return false;
    }
    if (!form.name || !form.email || !form.message) {
      setStatus({
        loading: false,
        ok: false,
        msg: "Nombre, correo y mensaje son obligatorios.",
      });
      return false;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailOk) {
      setStatus({
        loading: false,
        ok: false,
        msg: "El correo electrónico no es válido.",
      });
      return false;
    }
    if (form.phone && !/^\+?\d[\d\s-]{6,}$/.test(form.phone.trim())) {
      setStatus({
        loading: false,
        ok: false,
        msg: "El teléfono ingresado no es válido.",
      });
      return false;
    }
    if (form.message.length > 4000) {
      setStatus({
        loading: false,
        ok: false,
        msg: "El mensaje es demasiado largo.",
      });
      return false;
    }
    const linksCount = (form.message.match(/https?:\/\//gi) || []).length;
    if (linksCount > 3) {
      setStatus({
        loading: false,
        ok: false,
        msg: "El mensaje contiene demasiados enlaces.",
      });
      return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, ok: null, msg: "" });
    if (!validate()) return;

    try {
      const res = await fetch("/api/contact/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "No se pudo enviar el mensaje");

      // Éxito: fijar cooldown local
      localStorage.setItem("contactLastSent", Date.now().toString());
      setCooldownLeft(WINDOW_MS);

      setStatus({
        loading: false,
        ok: true,
        msg: "Mensaje enviado. Gracias por escribir.",
      });
      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        website: "",
      });
    } catch (err) {
      setStatus({
        loading: false,
        ok: false,
        msg: err.message || "Error al enviar.",
      });
    }
  };

  const disabled = status.loading || cooldownLeft > 0;

  return (
    <form onSubmit={onSubmit} className="text-white grid gap-4">
      {/* Honeypot: campo oculto para bots */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={onChange}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="grid gap-1">
          <label className={labelCls} htmlFor="name">
            Nombre
          </label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={onChange}
            className={inputCls}
            placeholder="Nombre"
          />
        </div>
        <div className="grid gap-1">
          <label className={labelCls} htmlFor="email">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            value={form.email}
            onChange={onChange}
            className={inputCls}
            placeholder="correo@dominio.cl"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="grid gap-1">
          <label className={labelCls} htmlFor="phone">
            Teléfono (opcional)
          </label>
          <input
            id="phone"
            name="phone"
            value={form.phone}
            onChange={onChange}
            className={inputCls}
            placeholder="+56 9 1234 5678"
          />
        </div>
        <div className="grid gap-1">
          <label className={labelCls} htmlFor="subject">
            Asunto (opcional)
          </label>
          <input
            id="subject"
            name="subject"
            value={form.subject}
            onChange={onChange}
            className={inputCls}
            placeholder="Asunto"
          />
        </div>
      </div>

      <div className="grid gap-1">
        <label className={labelCls} htmlFor="message">
          Mensaje
        </label>
        <textarea
          id="message"
          name="message"
          value={form.message}
          onChange={onChange}
          rows={6}
          className={`${inputCls} resize-y`}
          placeholder="Escribe tu mensaje..."
        />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button type="submit" disabled={disabled} className={btnCls}>
          {status.loading
            ? "Enviando..."
            : cooldownLeft > 0
              ? "Temporalmente bloqueado"
              : "Enviar mensaje"}
        </button>
        {cooldownLeft > 0 && (
          <span className="text-amber-400 text-sm">
            Podrás enviar nuevamente en {Math.ceil(cooldownLeft / 60000)} min.
          </span>
        )}
        {status.ok === true && (
          <span className="text-[white] text-sm">
            Mensaje enviado correctamente.
          </span>
        )}
        {status.ok === false && (
          <span className="text-amber-700 text-sm">{status.msg}</span>
        )}
      </div>
    </form>
  );
}
