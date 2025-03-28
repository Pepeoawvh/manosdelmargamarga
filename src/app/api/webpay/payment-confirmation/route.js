import { NextResponse } from 'next/server';
import { firestoreDB } from '../../../lib/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';

export async function POST(request) {
  try {
    const data = await request.json();
    const { token_ws, orderId } = data;

    if (!token_ws || !orderId) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Actualizar el estado de la orden en Firestore
    const orderRef = doc(firestoreDB, 'orders', orderId);
    await updateDoc(orderRef, {
      paymentStatus: 'completed',
      transactionToken: token_ws,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      orderId,
      message: 'Pago confirmado correctamente',
    });
  } catch (error) {
    console.error('Error al confirmar el pago en WebPay:', error);
    return NextResponse.json(
      { error: 'Error al confirmar el pago en WebPay', details: error.message },
      { status: 500 }
    );
  }
}