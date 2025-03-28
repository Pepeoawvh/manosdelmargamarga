import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { firestoreDB } from '../../../lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request) {
  try {
    const data = await request.json();
    const { cart, customer, summary } = data;

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
    }

    const orderId = uuidv4();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Crear la orden en Firestore
    const orderData = {
      id: orderId,
      cart,
      customer,
      summary,
      paymentMethod: 'webpay',
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    const ordersRef = collection(firestoreDB, 'orders');
    await addDoc(ordersRef, orderData);

    // Configurar la transacción en WebPay
    const webpayRequest = {
      buy_order: orderId,
      session_id: uuidv4(),
      amount: summary.total,
      return_url: `${baseUrl}/api/webpay/payment-confirmation`,
    };

    // Simular la respuesta de WebPay en el ambiente de integración
    const webpayResponse = {
      url: `${process.env.WEBPAY_HOST}/webpayserver/initTransaction`,
      token: `WEBPAY-TOKEN-${orderId.substring(0, 8)}`,
    };

    return NextResponse.json({
      orderId,
      url: webpayResponse.url,
      token: webpayResponse.token,
      message: 'Redirigiendo a WebPay...',
    });
  } catch (error) {
    console.error('Error al crear la transacción en WebPay:', error);
    return NextResponse.json(
      { error: 'Error al crear la transacción en WebPay', details: error.message },
      { status: 500 }
    );
  }
}