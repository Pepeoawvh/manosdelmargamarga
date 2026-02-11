"use client";
import React, { useMemo, useState } from "react";
import { useCart } from "../../context/CartContext";

const fmtMoney = (v) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(Number(v)) ? Number(v) : 0);

export default function CartItem({ item }) {
  const { removeFromCart, updateQuantity } = useCart();
  const [hint, setHint] = useState("");

  const price = Number(item.price) || 0;
  const qty = Math.max(1, Number(item.quantity) || 1);
  const stock = Number(item.stock ?? 0); // viene desde CartContext al añadir
  const canInc = Number.isFinite(stock) ? qty < stock : true;
  const lineTotal = useMemo(() => price * qty, [price, qty]);

  const handleDec = () => {
    const next = Math.max(1, qty - 1);
    updateQuantity(item.id, next);
    setHint("");
  };

  const handleInc = () => {
    if (!canInc) {
      setHint("Stock máximo alcanzado");
      return;
    }
    const next = qty + 1;
    updateQuantity(item.id, next);
    if (next >= stock) setHint("Stock máximo alcanzado, si necesita un mayor stock de este producto puede realizar una reserva y le contactaremos");
    else setHint("");
  };

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw === "") {
      // Permitir vacío temporalmente, manejar en blur
      return;
    }
    let next = Number(raw);
    if (!Number.isFinite(next)) return;
    if (Number.isFinite(stock) && stock > 0) {
      next = Math.min(Math.max(1, next), stock);
    } else {
      next = Math.max(1, next);
    }
    updateQuantity(item.id, next);
    if (Number.isFinite(stock) && next >= stock) setHint("Stock máximo alcanzado");
    else setHint("");
  };

  const handleBlur = (e) => {
    // Si quedó vacío, normalizar a 1 (o a stock si stock=0)
    const raw = e.target.value.replace(/\D/g, "");
    if (raw === "") {
      const fallback = Number.isFinite(stock) && stock > 0 ? 1 : 1;
      updateQuantity(item.id, fallback);
    }
  };

  return (
    <div className="flex items-center gap-3 border rounded p-2">
      <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
        <img
          src={item.image || "/placeholder.png"}
          alt={item.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.png";
          }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
        <p className="text-xs text-gray-500">{fmtMoney(price)}</p>

        <div className="mt-2 flex items-center gap-2">
          <div className="inline-flex items-center rounded border border-gray-300">
            <button
              type="button"
              className="px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleDec}
              aria-label="Disminuir cantidad"
            >
              −
            </button>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-12 text-center text-sm py-1 text-[#648801ff] outline-none "
              value={qty}  // Cambiado: de defaultValue a value para input controlado
              onChange={handleChange}  // Cambiado: de onInput a onChange
              onBlur={handleBlur}
            />
            <button
              type="button"
              className={`px-2 py-1 text-sm ${
                canInc ? "text-gray-700 hover:bg-gray-600" : "text-gray-800 cursor-not-allowed"
              }`}
              onClick={handleInc}
              disabled={!canInc}
              aria-label="Aumentar cantidad"
              title={canInc ? "Aumentar" : "Stock máximo alcanzado"}
            >
              +
            </button>
          </div>

          {Number.isFinite(stock) && (
            <span className="text-[11px] text-gray-700">
              Stock: {stock}
            </span>
          )}
        </div>

        {hint && (
          <p className="mt-1 text-[11px] text-amber-700">{hint}</p>
        )}
      </div>

      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">{fmtMoney(lineTotal)}</p>
        <button
          type="button"
          onClick={() => removeFromCart(item.id)}
          className="mt-1 text-xs text-red-600 hover:underline"
        >
          Quitar
        </button>
      </div>
    </div>
  );
}