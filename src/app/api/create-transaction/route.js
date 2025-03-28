import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { firestoreDB } from '../../lib/firebase/config'; // Ajustado para usar firestoreDB
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import mercadopago from 'mercadopago'; // Importar SDK de MercadoPago

// Configuración de MercadoPago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-123456789012345678901234-123456' // Reemplaza con tu token real
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
    
    // Guardar la orden en Firestore
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
      // Configurar el ítem para MercadoPago según la documentación oficial
      const preference = {
        items: cart.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description || 'Producto de MMM',
          quantity: item.quantity,
          currency_id: 'CLP', // Moneda chilena
          unit_price: parseInt(item.price) // MercadoPago requiere que el precio sea numérico
        })),
        payer: {
          name: customer.firstName,
          surname: customer.lastName,
          email: customer.email,
          phone: {
            number: customer.phone
          },
          address: {
            street_name: customer.address,
            zip_code: customer.postalCode
          }
        },
        back_urls: {
          success: `${baseUrl}/payment-result?status=success&source=mercadopago&orderId=${orderId}`,
          failure: `${baseUrl}/payment-result?status=failure&source=mercadopago&orderId=${orderId}`,
          pending: `${baseUrl}/payment-result?status=pending&source=mercadopago&orderId=${orderId}`,
        },
        auto_return: "approved",
        external_reference: orderId,
        statement_descriptor: "MMM Store", // Descripción que aparecerá en el resumen de la tarjeta
        shipments: {
          cost: shippingCost,
          mode: "not_specified",
        },
        notification_url: `${baseUrl}/api/mercadopago-webhook`,
      };

      try {
        // Crear la preferencia en MercadoPago
        const response = await mercadopago.preferences.create(preference);
        
        // Obtener URL de pago de MercadoPago
        const mercadoPagoUrl = response.body.init_point; // URL de producción
        // const mercadoPagoUrl = response.body.sandbox_init_point; // URL para pruebas
        
        return NextResponse.json({
          orderId,
          url: mercadoPagoUrl,
          preferenceId: response.body.id,
          message: 'Redirigiendo a MercadoPago...'
        });
      } catch (mpError) {
        console.error('Error al crear preferencia en MercadoPago:', mpError);
        return NextResponse.json(
          { error: 'Error al crear preferencia en MercadoPago' },
          { status: 500 }
        );
      }
    }
    
    // Para otros métodos de pago (por ejemplo, transferencia bancaria)
    return NextResponse.json({
      orderId,
      message: 'Orden creada exitosamente'
    });
    
  } catch (error) {
    console.error('Error al crear la transacción:', error);
    return NextResponse.json(
      { error: 'Error al procesar la transacción' }, 
      { status: 500 }
    );
  }
}