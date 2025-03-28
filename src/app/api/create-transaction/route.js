import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { firestoreDB } from '../../lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import mercadopago from 'mercadopago';

// Configuración de MercadoPago con el token correcto
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

export async function POST(request) {
  try {
    // Obtener datos de la solicitud
    const data = await request.json();
    const { cart, customer, summary, paymentMethod } = data;
    
    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
    }
    
    // Crear ID único para la orden
    const orderId = uuidv4();
    
    // URL base para redirecciones
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Almacenar la orden en Firestore
    const orderData = {
      id: orderId,
      cart,
      customer,
      summary,
      paymentMethod,
      status: 'pending',
      createdAt: serverTimestamp()
    };
    
    const ordersRef = collection(firestoreDB, 'orders');
    await addDoc(ordersRef, orderData);
    
    // Manejar según el método de pago seleccionado
    if (paymentMethod === 'webpay') {
      // Simular respuesta de WebPay
      // En un entorno real, aquí usarías el SDK de Transbank
      const webpayResponse = {
        url: 'https://webpay3gint.transbank.cl/webpayserver/initTransaction', // URL de ejemplo
        token: `WEBPAY-TOKEN-${orderId.substring(0, 8)}`
      };
      
      return NextResponse.json({
        orderId,
        url: webpayResponse.url,
        token: webpayResponse.token,
        message: 'Redirigiendo a WebPay...'
      });
    } 
    else if (paymentMethod === 'mercadopago') {
      // Obtener el costo de envío del resumen
      const shippingCost = summary.shipping || 0;
      
      try {
        console.log('Preparando preferencia para MercadoPago...');
        
        // Formatear los items para MercadoPago
        // MercadoPago requiere que los precios sean números enteros
        const items = cart.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description || 'Producto de MMM',
          category_id: 'productos',
          quantity: item.quantity,
          unit_price: Number(item.price), // Convertir explícitamente a número
          currency_id: 'CLP',
        }));
        
        console.log('Items formateados:', items);
        
        // Configurar la preferencia de MercadoPago
        const preference = {
          items,
          payer: {
            name: customer.firstName,
            surname: customer.lastName,
            email: customer.email,
            phone: {
              area_code: "",
              number: customer.phone
            },
            address: {
              street_name: customer.address,
              zip_code: customer.postalCode || '0000000'
            }
          },
          back_urls: {
            success: `${baseUrl}/payment-success?orderId=${orderId}`,
            failure: `${baseUrl}/payment-failure?orderId=${orderId}`,
            pending: `${baseUrl}/payment-pending?orderId=${orderId}`,
          },
          auto_return: "approved",
          external_reference: orderId,
          statement_descriptor: "MMM Store",
          shipments: {
            cost: shippingCost,
            mode: "not_specified",
          },
          notification_url: `${baseUrl}/api/mercadopago-webhook`,
        };
        
        console.log('Creando preferencia en MercadoPago:', JSON.stringify(preference));
        
        // Crear la preferencia en MercadoPago
        const response = await mercadopago.preferences.create(preference);
        
        console.log('Respuesta de MercadoPago:', response);
        
        if (!response.body) {
          throw new Error('Respuesta inválida de MercadoPago');
        }
        
        // Guardar la preferencia en Firestore para referencia futura
        const paymentsRef = collection(firestoreDB, 'payments');
        await addDoc(paymentsRef, {
          orderId: orderId,
          preferenceId: response.body.id,
          status: 'pending',
          provider: 'mercadopago',
          createdAt: serverTimestamp()
        });
        
        // URL para el ambiente de producción
        const mercadoPagoUrl = response.body.init_point;
        
        return NextResponse.json({
          orderId,
          preferenceId: response.body.id,
          url: mercadoPagoUrl,
          message: 'Redirigiendo a MercadoPago...'
        });
      } catch (mpError) {
        console.error('Error detallado al crear preferencia en MercadoPago:', mpError);
        
        // Registrar el error en Firestore
        const errorsRef = collection(firestoreDB, 'errors');
        await addDoc(errorsRef, {
          type: 'mercadopago_create_preference',
          message: mpError.message,
          stack: mpError.stack,
          timestamp: serverTimestamp()
        });
        
        return NextResponse.json(
          { 
            error: 'Error al crear preferencia en MercadoPago', 
            details: mpError.message,
            stack: process.env.NODE_ENV === 'development' ? mpError.stack : undefined
          }, 
          { status: 500 }
        );
      }
    }
    
    // Para otros métodos de pago
    return NextResponse.json({
      orderId,
      message: 'Orden creada exitosamente'
    });
    
  } catch (error) {
    console.error('Error al crear la transacción:', error);
    return NextResponse.json(
      { error: 'Error al procesar la transacción', details: error.message }, 
      { status: 500 }
    );
  }
}