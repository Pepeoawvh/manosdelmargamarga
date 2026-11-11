// src/app/api/create-reservation/route.js
import { adminDb } from "../../../lib/firebase/admin";

export async function POST(req) {
  try {
    const body = await req.json();
    const { items, customer, cartTotal, timestamp } = body;

    // Validaciones básicas
    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return Response.json(
        { error: "La reserva debe contener entre 1 y 50 productos" },
        { status: 400 }
      );
    }

    if (
      !customer ||
      typeof customer !== "object" ||
      typeof customer.email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email) ||
      customer.email.length > 254
    ) {
      return Response.json(
        { error: "Datos del cliente inválidos" },
        { status: 400 }
      );
    }

    const validItems = items.every((item) => {
      const quantity = Number(item?.quantity || 1);
      const price = Number(item?.productPrice);
      return (
        item &&
        typeof item.productId === "string" &&
        item.productId.length <= 200 &&
        typeof item.productTitle === "string" &&
        item.productTitle.length <= 300 &&
        Number.isSafeInteger(quantity) &&
        quantity > 0 &&
        quantity <= 1000 &&
        Number.isFinite(price) &&
        price >= 0 &&
        price <= 100000000
      );
    });

    if (!validItems) {
      return Response.json({ error: "Datos de productos inválidos" }, { status: 400 });
    }

    // Crear un documento de reserva por cada producto
    const reservationIds = [];
    
    for (const item of items) {
      const reservationData = {
        productId: item.productId,
        productTitle: item.productTitle,
        productPrice: Number(item.productPrice),
        quantity: Number(item.quantity || 1),
        total: Number(item.productPrice) * Number(item.quantity || 1),
        customerFirstName: customer.firstName,
        customerLastName: customer.lastName,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        customerCity: customer.city,
        customerRegion: customer.region,
        customerNotes: customer.notes || "",
        status: "pending", // pending, confirmed, cancelled, completed
        createdAt: new Date(timestamp || Date.now()),
        updatedAt: new Date(),
      };

      // Guardar en Firestore
      const docRef = await adminDb
        .collection("reservations")
        .add(reservationData);

      reservationIds.push(docRef.id);
      console.log(`Reserva creada: ${docRef.id}`, reservationData);
    }

    // Opcional: Enviar email de confirmación
    try {
      const emailRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/contact/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "reservation",
          reservationIds: reservationIds,
          customer: {
            email: customer.email,
            firstName: customer.firstName,
            lastName: customer.lastName,
          },
          items: items,
          cartTotal: cartTotal,
        }),
      });

      if (!emailRes.ok) {
        console.warn("No se pudo enviar email de confirmación de reserva");
      }
    } catch (emailError) {
      console.warn("Error al enviar email de reserva:", emailError);
    }

    return Response.json(
      {
        success: true,
        reservationId: reservationIds[0], // Retornar el primero para referencia
        reservationIds: reservationIds, // Retornar todos
        message: `${reservationIds.length} producto(s) reservado(s) correctamente`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear reserva:", error);
    return Response.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
