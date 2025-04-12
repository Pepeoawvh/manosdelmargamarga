import { WebpayPlus } from 'transbank-sdk';
import { NextResponse } from 'next/server';
import admin, { adminDb } from '../../../../lib/firebase/admin';
import { handleNormalFlow, handleProcessedTransaction } from '../payment-confirmation/transactionHelpers';

export async function POST(request) {
  try {
    const data = await request.json();
    const { token_ws, orderId } = data;

    if (!token_ws) {
      return NextResponse.json({ 
        success: false, 
        error: 'Token no proporcionado'
      }, { status: 400 });
    }

    console.log('Completando transacción desde frontend:', { token_ws, orderId });

    // Configurar WebpayPlus
    WebpayPlus.configureForIntegration(
      process.env.WEBPAY_COMMERCE_CODE,
      process.env.WEBPAY_API_KEY_SECRET
    );

    // Obtener los detalles de la transacción usando los helpers
    let transactionResult, status, isApproved;
    try {
      // Reutilizar la misma lógica de flujo normal
      const result = await handleNormalFlow(token_ws);
      transactionResult = result.transactionResult;
      status = result.status;
      isApproved = result.isApproved;
      
      console.log('Resultado de transacción:', {
        buy_order: transactionResult.buy_order,
        status,
        isApproved,
        response_code: transactionResult.response_code
      });
    } catch (error) {
      console.error('Error al obtener detalles de la transacción:', error);
      return NextResponse.json({ 
        success: false, 
        error: `Error al obtener detalles: ${error.message}` 
      }, { status: 500 });
    }
    
    // Si tenemos el ID del documento directamente, usarlo, si no, usar buy_order
    let updateOrderId = orderId || transactionResult.buy_order;
    
    if (!updateOrderId) {
      return NextResponse.json({ 
        success: false, 
        error: 'No se pudo determinar el ID de la orden' 
      }, { status: 400 });
    }

    // Actualizar Firestore con los detalles actualizados
    const updateResult = await updateOrderInFirestore(
      updateOrderId, 
      status, 
      isApproved, 
      transactionResult, 
      { token_ws }
    );

    if (updateResult.error) {
      return NextResponse.json({ 
        success: false, 
        error: updateResult.error 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orderId: updateOrderId,
      status,
      isApproved,
      details: {
        response_code: transactionResult.response_code,
        status: transactionResult.status
      }
    });
  } catch (error) {
    console.error('Error en complete-transaction:', error);
    return NextResponse.json({
      success: false,
      error: `Error al completar la transacción: ${error.message}`
    }, { status: 500 });
  }
}

// Función para actualizar la orden en Firestore
async function updateOrderInFirestore(orderId, status, isApproved, transactionResult, additionalData) {
  try {
    const { token_ws } = additionalData;
    
    console.log('Actualizando orden desde complete-transaction:', { orderId, status, isApproved });
    
    // MODO DIRECTO: Buscar por ID de documento primero
    try {
      // Intentar obtener el documento directamente
      const orderDocRef = adminDb.collection('orders').doc(orderId);
      const orderDoc = await orderDocRef.get();
      
      if (orderDoc.exists) {
        console.log(`Documento encontrado directamente por ID: ${orderId}`);
        
        // Preparar los datos de actualización
        const updateData = {
          paymentStatus: status,
          isApproved,
          transactionDetails: transactionResult || {},
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        // IMPORTANTE: Extraer los campos principales para acceso directo
        if (transactionResult) {
          updateData.response_code = transactionResult.response_code;
          updateData.status_webpay = transactionResult.status;
          updateData.authorization_code = transactionResult.authorization_code;
          updateData.payment_type_code = transactionResult.payment_type_code;
          updateData.transaction_date = transactionResult.transaction_date;
          updateData.accounting_date = transactionResult.accounting_date;
        }
        
        // Actualizar el documento
        await orderDocRef.update(updateData);
        console.log(`Orden ${orderId} actualizada correctamente desde frontend`);
        return { success: true };
      }
    } catch (directError) {
      console.warn('Error buscando documento directamente:', directError.message);
      // Continuar con el método alternativo
    }
    
    // Si no encontramos por ID directo, buscar de otras maneras
    // (puede ser un ID de orden no un ID de documento)
    const ordersSnapshot = await adminDb.collection('orders').where('id', '==', orderId).get();

    if (ordersSnapshot.empty) {
      // Intentar buscar por token_ws
      const tokenSnapshot = await adminDb.collection('orders')
        .where('webpayToken', '==', token_ws)
        .limit(1)
        .get();
        
      if (tokenSnapshot.empty) {
        // Un último intento: buscar por transactionDetails.token_ws
        const detailsSnapshot = await adminDb.collection('orders')
          .where('transactionDetails.token_ws', '==', token_ws)
          .limit(1)
          .get();
          
        if (detailsSnapshot.empty) {
          console.error(`Orden no encontrada por ningún método: ${orderId}, token: ${token_ws}`);
          return { error: `Orden no encontrada: ${orderId}` };
        }
        
        const orderDoc = detailsSnapshot.docs[0];
        console.log(`Orden encontrada por transactionDetails.token_ws: ${orderDoc.id}`);
        
        // Preparar datos de actualización
        const updateData = {
          paymentStatus: status,
          isApproved,
          transactionDetails: transactionResult || {},
          response_code: transactionResult?.response_code,
          status_webpay: transactionResult?.status,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        await orderDoc.ref.update(updateData);
        console.log(`Orden ${orderDoc.id} actualizada por token en transactionDetails`);
        return { success: true };
      }
      
      // Usar el primer documento encontrado por webpayToken
      const orderDoc = tokenSnapshot.docs[0];
      console.log(`Orden encontrada por webpayToken: ${orderDoc.id}`);
      
      // Preparar datos de actualización
      const updateData = {
        paymentStatus: status,
        isApproved,
        transactionDetails: transactionResult || {},
        response_code: transactionResult?.response_code,
        status_webpay: transactionResult?.status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await orderDoc.ref.update(updateData);
      console.log(`Orden ${orderDoc.id} actualizada por webpayToken`);
      return { success: true };
    }

    // Actualizar usando el ID interno encontrado
    const orderDoc = ordersSnapshot.docs[0];
    console.log(`Orden encontrada por campo 'id': ${orderDoc.id}`);
    
    // Preparar datos de actualización
    const updateData = {
      paymentStatus: status,
      isApproved,
      transactionDetails: transactionResult || {},
      response_code: transactionResult?.response_code,
      status_webpay: transactionResult?.status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await orderDoc.ref.update(updateData);
    console.log(`Orden ${orderDoc.id} actualizada por campo 'id'`);
    return { success: true };
  } catch (firestoreError) {
    console.error('Error al actualizar la orden:', firestoreError);
    return { error: `Error al actualizar la orden: ${firestoreError.message}` };
  }
}