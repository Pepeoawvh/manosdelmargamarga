export const runtime = "nodejs";

import { NextResponse } from "next/server";
import admin, { adminDb } from "../../../lib/firebase/admin";

/**
 * Devuelve una lista ligera para el sitemap:
 * [{ slug: "mi-slug", updatedAt: "2025-10-20T00:00:00.000Z" }]
 * - slug: usa el campo slug; si falta, cae al id del documento.
 * - updatedAt: usa updatedAt (Timestamp) si existe; si no, createdAt; si no, now.
 * - No se excluyen productos sin stock (se indexan igual).
 */
export async function GET() {
  try {
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

        // Nota: no filtramos por stock para mantener indexación
        return { slug, updatedAt };
      })
      .filter(Boolean);

    return NextResponse.json(items, {
      headers: {
        "Cache-Control": "s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("sitemap-products ERROR:", { message: err?.message });
    // Devuelve 200 con lista vacía para no romper el sitemap
    return NextResponse.json([], { status: 200 });
  }
}
