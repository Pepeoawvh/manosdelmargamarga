import { WebpayPlus } from "transbank-sdk";
import { NextResponse } from "next/server";
import admin, { adminDb } from "../../../../lib/firebase/admin";
import { handleNormalFlow } from "../payment-confirmation/transactionHelpers";

export async function POST(request) {
  try {
    const data = await request.json();
    const { token_ws, orderId } = data;

    if (!token_ws) {
      return NextResponse.json(
        {
          success: false,
          error: "Token no proporcionado",
        },
        { status: 400 }
      );
    }

    console.log("Completando transacción desde frontend:", {
      token_ws,
      orderId,
    });

    // Configurar WebpayPlus
    WebpayPlus.configureForIntegration(
      process.env.WEBPAY_COMMERCE_CODE,
      process.env.WEBPAY_API_KEY_SECRET
    );

    // Verificar si el pedido ya está confirmado
    if (orderId) {
      const orderRef = adminDb.collection("orders").doc(orderId);
      const orderDoc = await orderRef.get();

      if (orderDoc.exists) {
        const orderData = orderDoc.data();

        if (orderData.paymentStatus === "completed") {
          console.log(
            `La transacción ya fue confirmada para el pedido ${orderId}`
          );
          return NextResponse.json({
            success: true,
            orderId,
            status: "completed",
            isApproved: true,
            orderNumber: orderData.orderNumber || null,
            details: orderData.transactionDetails || {},
          });
        }
      }
    }

    // Obtener los detalles de la transacción usando los helpers
    let transactionResult, status, isApproved;
    try {
      const result = await handleNormalFlow(token_ws);
      transactionResult = result.transactionResult;
      status = result.status;
      isApproved = result.isApproved;

      console.log("Resultado de transacción:", {
        buy_order: transactionResult.buy_order,
        status,
        isApproved,
        response_code: transactionResult.response_code,
      });
    } catch (error) {
      console.error("Error al obtener detalles de la transacción:", error);
      return NextResponse.json(
        {
          success: false,
          error: `Error al obtener detalles: ${error.message}`,
        },
        { status: 500 }
      );
    }

    // Si tenemos el ID del documento directamente, usarlo, si no, usar buy_order
    let updateOrderId = orderId || transactionResult.buy_order;

    if (!updateOrderId) {
      return NextResponse.json(
        {
          success: false,
          error: "No se pudo determinar el ID de la orden",
        },
        { status: 400 }
      );
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
      return NextResponse.json(
        {
          success: false,
          error: updateResult.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: updateOrderId,
      status,
      isApproved,
      orderNumber: updateResult.orderNumber || null,
      details: {
        response_code: transactionResult.response_code,
        status: transactionResult.status,
      },
    });
  } catch (error) {
    console.error("Error en payment-confirmation:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Error al completar la transacción: ${error.message}`,
      },
      { status: 500 }
    );
  }
}

// ELIMINADA la función generateOrderNumber que estaba aquí

// Función para actualizar la orden en Firestore (simplificada, sin números automáticos)
async function updateOrderInFirestore(orderId, status, isApproved, transactionResult, additionalData) {
  try {
    const { token_ws } = additionalData;
    
    console.log('Actualizando orden desde complete-transaction:', { orderId, status, isApproved });
    
    // MODO DIRECTO: Buscar por ID de documento primero
    try {
      const orderDocRef = adminDb.collection('orders').doc(orderId);
      const orderDoc = await orderDocRef.get();
      
      if (orderDoc.exists) {
        console.log(`Documento encontrado directamente por ID: ${orderId}`);
        
        // Preparar los datos de actualización (sin campos de número de orden automáticos)
        const updateData = {
          paymentStatus: status,
          isApproved,
          transactionDetails: transactionResult || {},
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        // Extraer los campos principales para acceso directo
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
        
        // Obtener el número de orden actual (si existe)
        const updatedDoc = await orderDocRef.get();
        return { 
          success: true,
          orderNumber: updatedDoc.data().orderNumber || null
        };
      }
    } catch (directError) {
      console.warn('Error buscando documento directamente:', directError.message);
    }
    // Si no encontramos por ID directo, intentar otros métodos
    // Método 1: Buscar por campo 'id'
    try {
      const ordersSnapshot = await adminDb
        .collection("orders")
        .where("id", "==", orderId)
        .get();

      if (!ordersSnapshot.empty) {
        const orderDoc = ordersSnapshot.docs[0];
        console.log(`Orden encontrada por campo 'id': ${orderDoc.id}`);

        const updateData = {
          paymentStatus: status,
          isApproved,
          transactionDetails: transactionResult || {},
          response_code: transactionResult?.response_code,
          status_webpay: transactionResult?.status,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          // Ya no incluimos número de orden automático
        };

        await orderDoc.ref.update(updateData);
        
        // Obtener el número de orden si existe
        const updatedDoc = await orderDoc.ref.get();
        
        return { 
          success: true, 
          orderNumber: updatedDoc.data().orderNumber || null 
        };
      }
    } catch (idError) {
      console.warn("Error buscando por campo 'id':", idError.message);
    }
    
    // Método 2: Buscar por token de WebPay
    try {
      const tokenSnapshot = await adminDb
        .collection("orders")
        .where("webpayToken", "==", token_ws)
        .limit(1)
        .get();

      if (!tokenSnapshot.empty) {
        const orderDoc = tokenSnapshot.docs[0];
        console.log(`Orden encontrada por webpayToken: ${orderDoc.id}`);

        const updateData = {
          paymentStatus: status,
          isApproved,
          transactionDetails: transactionResult || {},
          response_code: transactionResult?.response_code,
          status_webpay: transactionResult?.status,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          // Ya no incluimos número de orden automático
        };

        await orderDoc.ref.update(updateData);
        
        // Obtener el número de orden si existe
        const updatedDoc = await orderDoc.ref.get();
        
        return { 
          success: true, 
          orderNumber: updatedDoc.data().orderNumber || null 
        };
      }
    } catch (tokenError) {
      console.warn("Error buscando por webpayToken:", tokenError.message);
    }

    // Si llegamos aquí, no encontramos el documento
    return { error: `Orden no encontrada: ${orderId}` };
  } catch (firestoreError) {
    console.error("Error al actualizar la orden:", firestoreError);
    return { error: `Error al actualizar la orden: ${firestoreError.message}` };
  }
}