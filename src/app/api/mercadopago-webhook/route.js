import { NextResponse } from 'next/server';
import mercadopago from 'mercadopago';
import { doc, updateDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestoreDB } from '@/app/lib/firebase/config';

// Configurar MercadoPago con el token de acceso
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

export async function POST(request) {
  try {
    // Guardar el cuerpo de la petición para depuración
    let body;
    try {
      body = await request.json();
      console.log('Webhook de MercadoPago recibido:', JSON.stringify(body));
      
      // Registrar la notificación en Firestore para depuración
      const webhooksRef = collection(firestoreDB, 'webhooks');
      await addDoc(webhooksRef, {
        provider: 'mercadopago',
        body,
        receivedAt: serverTimestamp()
      });
    } catch (parseError) {
      console.error('Error al parsear el cuerpo de la petición:', parseError);
      const rawBody = await request.text();
      console.log('Cuerpo de la petición (raw):', rawBody);
      
      // Registrar el error en Firestore
      const errorsRef = collection(firestoreDB, 'errors');
      await addDoc(errorsRef, {
        type: 'mercadopago_webhook_parse',
        message: parseError.message,
        rawBody,
        timestamp: serverTimestamp()
      });
      
      // Devolver 200 para evitar reintentos
      return NextResponse.json({ success: true });
    }
    
    // Tipo de notificación
    const type = body.type || body.action;
    
    // Solo procesamos notificaciones de pago
    if (type === 'payment') {
      const paymentId = body.data?.id;
      
      if (!paymentId) {
        console.error('ID de pago no encontrado en la notificación');
        return NextResponse.json({ success: true });
      }
      
      console.log(`Procesando pago ID: ${paymentId}`);
      
      try {
        // Obtener los detalles del pago desde MercadoPago
        const payment = await mercadopago.payment.get(paymentId);
        
        if (!payment || !payment.body) {
          throw new Error('No se pudo obtener la información del pago desde MercadoPago');
        }
        
        const { status, external_reference, transaction_details } = payment.body;
        
        console.log(`Estado del pago: ${status}, Referencia: ${external_reference}`);
        
        // Buscar la orden en Firestore
        const orderId = external_reference;
        if (!orderId) {
          throw new Error('Referencia externa no encontrada en el pago');
        }
        
        const ordersRef = collection(firestoreDB, 'orders');
        const q = query(ordersRef, where('id', '==', orderId));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          console.error(`No se encontró la orden con ID: ${orderId}`);
          throw new Error(`Orden no encontrada: ${orderId}`);
        }
        
        const orderDoc = querySnapshot.docs[0];
        
        // Mapear el estado de MercadoPago a nuestro sistema
        let orderStatus;
        switch (status) {
          case 'approved':
            orderStatus = 'pagado';
            break;
          case 'pending':
            orderStatus = 'pendiente';
            break;
          case 'in_process':
            orderStatus = 'procesando';
            break;
          case 'rejected':
            orderStatus = 'cancelado';
            break;
          default:
            orderStatus = status;
        }
        
        // Actualizar el estado de la orden
        await updateDoc(doc(firestoreDB, 'orders', orderDoc.id), {
          paymentStatus: orderStatus,
          lastUpdated: serverTimestamp(),
          paymentDetails: {
            provider: 'mercadopago',
            paymentId: paymentId,
            status: status,
            processorResponse: transaction_details?.payment_method_reference_id || '',
            updateTime: serverTimestamp()
          }
        });
        
        console.log(`Orden ${orderId} actualizada con estado: ${orderStatus}`);
        
        // También actualizar el registro de pago si existe
        const paymentsRef = collection(firestoreDB, 'payments');
        const paymentQuery = query(paymentsRef, where('orderId', '==', orderId));
        const paymentSnapshot = await getDocs(paymentQuery);
        
        if (!paymentSnapshot.empty) {
          await updateDoc(doc(firestoreDB, 'payments', paymentSnapshot.docs[0].id), {
            status: orderStatus,
            updatedAt: serverTimestamp()
          });
        }
      } catch (paymentError) {
        console.error('Error al procesar el pago:', paymentError);
        
        // Registrar el error en Firestore
        const errorsRef = collection(firestoreDB, 'errors');
        await addDoc(errorsRef, {
          type: 'mercadopago_payment_process',
          message: paymentError.message,
          paymentId,
          timestamp: serverTimestamp()
        });
      }
    }
    
    // Siempre devolver un 200 OK a MercadoPago para confirmar recepción
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error procesando webhook de MercadoPago:', error);
    
    try {
      // Registrar el error en Firestore
      const errorsRef = collection(firestoreDB, 'errors');
      await addDoc(errorsRef, {
        type: 'mercadopago_webhook_general',
        message: error.message,
        stack: error.stack,
        timestamp: serverTimestamp()
      });
    } catch (dbError) {
      console.error('Error al registrar en Firestore:', dbError);
    }
    
    // Aún así devolver un 200 para que MercadoPago no reintente
    // (los errores se deben manejar internamente)
    return NextResponse.json(
      { success: false, message: 'Error interno al procesar la notificación' }, 
      { status: 200 }
    );
  }
}