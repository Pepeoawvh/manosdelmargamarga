import { WebpayPlus } from 'transbank-sdk';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { firestoreDB } from '../../../lib/firebase/config';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    const { cart, customer, summary, paymentMethod } = data;

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
    }

    // Generar IDs únicos para evitar colisiones
    const timestamp = Date.now();
    const newOrderId = `O-${timestamp.toString().slice(-5)}`;
    const sessionId = `S-${timestamp.toString().slice(-5)}`;
    const amount = summary.total;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/payment-success`;
    
    // Ya no preparamos datos para un número de orden con formato fecha
    // La asignación del número será manual
    
    // Crear la orden en Firestore - mantener la estructura original del cliente
    const orderData = {
      id: newOrderId,
      sessionId,
      cart,
      customer,
      summary,
      paymentMethod: 'webpay',
      paymentStatus: 'pending',
      isApproved: false,
      createdAt: serverTimestamp(),
      // Solo guardar timestamp general
      timestamp
    };

    try {
      console.log('Guardando orden inicial con ID:', newOrderId);
      
      // Verificar estructura del cliente para evitar errores
      if (customer) {
        console.log('Estructura del cliente:', {
          tieneAddress: !!customer.address,
          tieneCity: !!customer.city,
          tieneRegion: !!customer.region,
          tieneShippingAddress: !!customer.shippingAddress,
          tieneNotes: !!customer.notes
        });
      }
      
      // Guardar la orden en Firestore
      const ordersRef = collection(firestoreDB, 'orders');
      const docRef = await addDoc(ordersRef, orderData);
      console.log('Orden guardada con ID de documento:', docRef.id, 'para orderId:', newOrderId);
      
      // Configurar WebpayPlus - Asegurarse de que la configuración sea correcta
      try {
        WebpayPlus.configureForIntegration(
          process.env.WEBPAY_COMMERCE_CODE, 
          process.env.WEBPAY_API_KEY_SECRET
        );
      } catch (configError) {
        console.error("Error al configurar WebpayPlus:", configError);
        throw new Error(`Error de configuración: ${configError.message}`);
      }

      // Crear la transacción en WebpayPlus
      console.log('Creando transacción en WebpayPlus:', { 
        orderId: newOrderId, 
        sessionId, 
        amount, 
        returnUrl 
      });
      
      const transaction = new WebpayPlus.Transaction();
      const createResponse = await transaction.create(
        newOrderId,
        sessionId,
        amount,
        returnUrl
      );
      
      console.log('Respuesta de WebpayPlus:', createResponse);

      if (!createResponse || !createResponse.url || !createResponse.token) {
        throw new Error('Respuesta inválida de WebpayPlus');
      }

      // IMPORTANTE: Guardar el token y referencias adicionales en la orden
      await updateDoc(doc(firestoreDB, 'orders', docRef.id), {
        webpayToken: createResponse.token,
        firestoreDocId: docRef.id, // Guardar referencia explícita al ID de documento
        transactionDetails: {
          token_ws: createResponse.token,
          created_at: new Date().toISOString()
        }
      });
      
      console.log('Orden actualizada con token WebPay:', createResponse.token);

      return NextResponse.json({
        orderId: newOrderId,
        documentId: docRef.id,
        url: createResponse.url,
        token: createResponse.token,
        message: 'Redirigiendo a WebPay...',
      });
    } catch (error) {
      console.error('Error al crear/guardar la transacción:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error general al crear transacción:', error);
    return NextResponse.json(
      { error: 'Error al crear la transacción', details: error.message },
      { status: 500 }
    );
  }
}