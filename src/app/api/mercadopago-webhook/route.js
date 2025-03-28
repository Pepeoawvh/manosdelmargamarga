import { NextResponse } from 'next/server';
import mercadopago from 'mercadopago';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { firestoreDB } from '@/app/lib/firebase/config';

// Configurar MercadoPago con el token de acceso
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Registrar la notificación recibida para depuración
    console.log('Webhook de MercadoPago recibido:', body);
    
    // Tipo de notificación
    const type = body.type || body.action;
    
    // Solo procesamos notificaciones de pago
    if (type === 'payment') {
      const paymentId = body.data.id;
      
      console.log(`Procesando pago ID: ${paymentId}`);
      
      // Obtenemos los detalles del pago desde MercadoPago
      const payment = await mercadopago.payment.get(paymentId);
      
      if (payment && payment.body) {
        const { status, external_reference, transaction_details } = payment.body;
        
        console.log(`Estado del pago: ${status}, Referencia: ${external_reference}`);
        
        // Buscar la orden en Firestore
        const orderId = external_reference;
        const ordersRef = collection(firestoreDB, 'orders');
        const q = query(ordersRef, where('id', '==', orderId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
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
            lastUpdated: new Date(),
            paymentDetails: {
              paymentId: paymentId,
              status: status,
              processorResponse: transaction_details?.payment_method_reference_id || '',
              updateTime: new Date()
            }
          });
          
          console.log(`Orden ${orderId} actualizada con estado: ${orderStatus}`);
        } else {
          console.error(`No se encontró la orden con ID: ${orderId}`);
        }
      }
    }
    
    // Siempre devolver un 200 OK a MercadoPago para confirmar recepción
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error procesando webhook de MercadoPago:', error);
    
    // Aún así devolver un 200 para que MercadoPago no reintente
    // (los errores se deben manejar internamente)
    return NextResponse.json(
      { success: false, message: 'Error interno procesado la notificación' }, 
      { status: 200 }
    );
  }
}