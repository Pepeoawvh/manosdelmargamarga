import { NextResponse } from 'next/server';
import mercadopago from 'mercadopago';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestoreDB } from '../../../lib/firebase/config';

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Webhook de MercadoPago recibido:', JSON.stringify(body));

    const webhooksRef = collection(firestoreDB, 'webhooks');
    await addDoc(webhooksRef, {
      provider: 'mercadopago',
      body,
      receivedAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error procesando webhook de MercadoPago:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno al procesar la notificación' },
      { status: 500 }
    );
  }
}