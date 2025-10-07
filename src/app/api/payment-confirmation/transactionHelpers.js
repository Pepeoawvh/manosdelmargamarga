import { WebpayPlus } from 'transbank-sdk';

// Manejar el flujo normal (éxito o rechazo)
export async function handleNormalFlow(token_ws) {
  const transaction = new WebpayPlus.Transaction();
  let transactionResult = null;
  let orderId = null;
  let status = 'unknown';
  let isApproved = false;

  try {
    console.log('Confirmando transacción con token:', token_ws);
    const commitResponse = await transaction.commit(token_ws);
    console.log('Respuesta de commit:', JSON.stringify(commitResponse));

    transactionResult = commitResponse;
    orderId = commitResponse.buy_order;

    if (commitResponse.response_code === 0 && commitResponse.status === 'AUTHORIZED') {
      status = 'completed';
      isApproved = true;
      console.log('✅ Transacción APROBADA según API WebPay');
    } else {
      status = 'failed';
      console.log('❌ Transacción RECHAZADA:', {
        response_code: commitResponse.response_code,
        status: commitResponse.status,
      });
    }
  } catch (commitError) {
    console.error('Error en commit de WebpayPlus:', commitError);

    if (commitError.response?.status === 422) {
      console.log('Transacción ya procesada, consultando estado...');
      try {
        const result = await handleProcessedTransaction(token_ws);
        return result;
      } catch (statusError) {
        console.error('Error al consultar estado de transacción ya procesada:', statusError);
        throw statusError;
      }
    } else {
      throw new Error(`Error en commit de WebpayPlus: ${commitError.message}`);
    }
  }

  return { transactionResult, orderId, status, isApproved };
}

// Manejar transacción ya procesada
export async function handleProcessedTransaction(token_ws) {
  let transactionResult = null;
  let orderId = null;
  let status = 'unknown';
  let isApproved = false;

  try {
    const transaction = new WebpayPlus.Transaction();
    console.log('Consultando estado de transacción ya procesada con token:', token_ws);
    const statusResponse = await transaction.status(token_ws);
    console.log('Respuesta de status:', JSON.stringify(statusResponse));
    
    transactionResult = statusResponse;
    orderId = statusResponse.buy_order;

    if (statusResponse.status === 'AUTHORIZED' && statusResponse.response_code === 0) {
      status = 'completed';
      isApproved = true;
      console.log('✅ Transacción previamente APROBADA según API WebPay');
    } else {
      status = 'failed';
      console.log('❌ Transacción previamente RECHAZADA:', {
        response_code: statusResponse.response_code,
        status: statusResponse.status,
      });
    }
  } catch (statusError) {
    console.error('Error al consultar estado de transacción:', statusError);
    throw new Error(`Error al consultar estado: ${statusError.message}`);
  }

  return { transactionResult, orderId, status, isApproved };
}