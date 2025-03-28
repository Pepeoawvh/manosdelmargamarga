import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { firestoreDB } from '../../../lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import mercadopago from 'mercadopago';

// Configuración de MercadoPago con el token correcto
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

export async function POST(request) {
  try {
    const data = await request.json();
    const { cart, customer, summary } = data;

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
    }

    const orderId = uuidv4();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const orderData = {
      id: orderId,
      cart,
      customer,
      summary,
      paymentMethod: 'mercadopago',
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    const ordersRef = collection(firestoreDB, 'orders');
    await addDoc(ordersRef, orderData);

    const items = cart.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description || 'Producto de MMM',
      category_id: 'productos',
      quantity: item.quantity,
      unit_price: Math.round(Number(item.price)),
      currency_id: 'CLP',
    }));

    const preference = {
      items,
      payer: {
        name: customer.firstName,
        surname: customer.lastName,
        email: customer.email,
        phone: {
          area_code: '',
          number: customer.phone,
        },
        address: {
          street_name: customer.address,
          zip_code: customer.postalCode || '0000000',
        },
      },
      back_urls: {
        success: `${baseUrl}/payment-success?orderId=${orderId}`,
        failure: `${baseUrl}/payment-failure?orderId=${orderId}`,
        pending: `${baseUrl}/payment-pending?orderId=${orderId}`,
      },
      auto_return: 'approved',
      external_reference: orderId,
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
    };

    const response = await mercadopago.preferences.create(preference);

    if (!response.body) {
      throw new Error('Respuesta inválida de MercadoPago');
    }

    const mercadoPagoUrl = response.body.init_point;

    return NextResponse.json({
      orderId,
      preferenceId: response.body.id,
      url: mercadoPagoUrl,
      message: 'Redirigiendo a MercadoPago...',
    });
  } catch (error) {
    console.error('Error al crear la transacción en MercadoPago:', error);
    return NextResponse.json(
      { error: 'Error al crear la transacción en MercadoPago', details: error.message },
      { status: 500 }
    );
  }
}