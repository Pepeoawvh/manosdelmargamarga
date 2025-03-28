import { NextResponse } from 'next/server';
import { firestoreDB } from '../../lib/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import mercadopago from 'mercadopago';

// Configuración de MercadoPago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-123456789012345678901234-123456'
});

export async function POST(request) {
  try {
    const data = await request.json();
    const { token_ws, orderId, paymentMethod, source } = data;
    
    if (!orderId) {
      return NextResponse.json({ error: 'ID de orden no proporcionado' }, { status: 400 });
    }
    
    // Buscar la orden en Firestore
    const orderRef = doc(firestoreDB, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (!orderDoc.exists()) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }
    
    // Actualizar según el método de pago
    if (source === 'mercadopago') {
      // Para MercadoPago, verificar el estado del pago
      // En una implementación real, verificaríamos el estado directamente con MercadoPago
      // usando el SDK y el external_reference (orderId)
      
      const paymentId = data.payment_id;
      let status = data.status || 'pending';
      
      if (paymentId) {
        try {
          // Verificar el pago en MercadoPago (opcional, para doble verificación)
          const paymentInfo = await mercadopago.payment.get(paymentId);
          status = paymentInfo.body.status;
        } catch (mpError) {
          console.error('Error al verificar pago en MercadoPago:', mpError);
        }
      }
      
      await updateDoc(orderRef, {
        paymentStatus: status === 'approved' ? 'completed' : status,
        paymentId: paymentId,
        paymentMethod: 'mercadopago',
        updatedAt: new Date()
      });
    } else {
      // Para WebPay u otros métodos
      if (!token_ws) {
        return NextResponse.json({ error: 'Token de pago no proporcionado' }, { status: 400 });
      }
      
      await updateDoc(orderRef, {
        paymentStatus: 'completed',
        transactionToken: token_ws,
        paymentMethod: paymentMethod || 'webpay',
        updatedAt: new Date()
      });
    }
    
    return NextResponse.json({
      success: true,
      orderId,
      message: 'Pago confirmado correctamente'
    });
    
  } catch (error) {
    console.error('Error al confirmar el pago:', error);
    return NextResponse.json(
      { error: 'Error al confirmar el pago' },
      { status: 500 }
    );
  }
}