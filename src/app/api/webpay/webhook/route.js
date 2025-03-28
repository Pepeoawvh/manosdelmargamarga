import { NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestoreDB } from '../../../lib/firebase/config';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Webhook de WebPay recibido:', JSON.stringify(body));

    const webhooksRef = collection(firestoreDB, 'webhooks');
    await addDoc(webhooksRef, {
      provider: 'webpay',
      body,
      receivedAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error procesando webhook de WebPay:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno al procesar la notificación' },
      { status: 500 }
    );
  }
}