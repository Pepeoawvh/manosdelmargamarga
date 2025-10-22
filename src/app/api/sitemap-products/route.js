export const runtime = "nodejs";

import { NextResponse } from "next/server";
import admin, { adminDb } from "../../../lib/firebase/admin";

/**
 * Devuelve una lista ligera para el sitemap:
 * [{ slug: "m8s69ZyGYn8x1xszdir3", updatedAt: "2025-10-20T00:00:00.000Z" }]
 * - slug: por ahora el id del documento; si luego agregas campo slug, úsalo.
 * - updatedAt: usa updatedAt (Timestamp) si existe; si no, createdAt; fallback a now.
 */
export async function GET() {
  try {
    // Lee solo campos necesarios para que sea barato
    const snap = await adminDb
      .collection("productosmmm")
      .select("slug", "updatedAt", "createdAt", "stock")
      .get();

    const now = new Date().toISOString();

    const items = snap.docs
      .map((d) => {
        const data = d.data() || {};
        const slug = data.slug || d.id;
        const ts = data.updatedAt || data.createdAt;
        const updatedAt =
          (ts && typeof ts.toDate === "function" && ts.toDate().toISOString()) || now;

        // Si quieres excluir agotados del sitemap, descomenta:
        // if (Number(data.stock ?? 0) <= 0) return null;

        return { slug, updatedAt };
      })
      .filter(Boolean);

    return NextResponse.json(items, {
      headers: {
        // Cache en Edge 1 día, con SWR 7 días
        "Cache-Control": "s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("sitemap-products ERROR:", { message: err?.message });
    // Devuelve 200 con lista vacía para no romper el sitemap
    return NextResponse.json([], { status: 200 });
  }
}
