export const runtime = "nodejs";
import { NextResponse } from "next/server";
import admin, { adminDb } from "../../../../lib/firebase/admin";

export async function GET(_req, { params }) {
  try {
    const { id } = await params;

    const snap = await adminDb
      .collection("productosmmm")
      .doc(id)
      .get();

    if (!snap.exists) {
      return NextResponse.json({ slug: null }, { status: 200 });
    }

    const data = snap.data() || {};

    return NextResponse.json(
      { slug: data.slug || id },
      {
        status: 200,
        headers: { "Cache-Control": "s-maxage=300" },
      }
    );
  } catch (error) {
    return NextResponse.json({ slug: null }, { status: 200 });
  }
}
