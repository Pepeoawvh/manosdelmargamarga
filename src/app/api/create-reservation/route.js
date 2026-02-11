// src/app/api/create-reservation/route.js
import { adminDb } from "../../../lib/firebase/admin";

export async function POST(req) {
  try {
    const body = await req.json();
    const { items, customer, cartTotal, timestamp } = body;

    // Validaciones básicas
    if (!items || items.length === 0) {
      return Response.json(
        { error: "No hay productos para reservar" },
        { status: 400 }
      );
    }

    if (!customer || !customer.email) {
      return Response.json(
        { error: "Datos del cliente inválidos" },
        { status: 400 }
      );
    }

    // Crear un documento de reserva por cada producto
    const reservationIds = [];
    
    for (const item of items) {
      const reservationData = {
        productId: item.productId,
        productTitle: item.productTitle,
        productPrice: item.productPrice,
        quantity: item.quantity || 1,
        total: item.total || (item.productPrice * (item.quantity || 1)),
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
