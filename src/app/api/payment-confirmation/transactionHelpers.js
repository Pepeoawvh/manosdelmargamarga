import { WebpayPlus, Environment, Options } from 'transbank-sdk';

// Instancia configurada para PRODUCCIÓN
const options = new Options(
  process.env.WEBPAY_COMMERCE_CODE,
  process.env.WEBPAY_API_KEY_SECRET,
  Environment.Production
);
const webpay = new WebpayPlus.Transaction(options);

// Manejar el flujo normal (éxito o rechazo) con commit y fallback a status=422
export async function handleNormalFlow(token_ws) {
  let transactionResult = null;
  let orderId = null;
  let status = 'unknown';
  let isApproved = false;

  try {
    console.log('Confirmando transacción con token (commit):', token_ws);
    const commitResponse = await webpay.commit(token_ws);
    console.log('Respuesta de commit:', JSON.stringify({
      buy_order: commitResponse?.buy_order,
      status: commitResponse?.status,
      response_code: commitResponse?.response_code
    }));

    transactionResult = commitResponse;
    orderId = commitResponse.buy_order;

    if (commitResponse.response_code === 0 && commitResponse.status === 'AUTHORIZED') {
      status = 'completed';
      isApproved = true;
      console.log('✅ Transacción APROBADA (commit)');
    } else {
      status = 'failed';
      console.log('❌ Transacción RECHAZADA (commit):', {
        response_code: commitResponse.response_code,
        status: commitResponse.status,
      });
    }
  } catch (commitError) {
    console.error('Error en commit de WebpayPlus:', commitError);

    // Cuando commit retorna 422, la transacción ya fue procesada
    if (commitError?.response?.status === 422) {
      console.log('Transacción ya procesada (422), consultando estado...');
      const result = await handleProcessedTransaction(token_ws);
      return result;
    }

    throw new Error(`Error en commit de WebpayPlus: ${commitError.message}`);
  }

  return { transactionResult, orderId, status, isApproved };
}

// Manejar transacción ya procesada via status
export async function handleProcessedTransaction(token_ws) {
  let transactionResult = null;
  let orderId = null;
  let status = 'unknown';
  let isApproved = false;

  try {
    console.log('Consultando estado (status) con token:', token_ws);
    const statusResponse = await webpay.status(token_ws);
    console.log('Respuesta de status:', JSON.stringify({
      buy_order: statusResponse?.buy_order,
      status: statusResponse?.status,
      response_code: statusResponse?.response_code
    }));

    transactionResult = statusResponse;
    orderId = statusResponse.buy_order;

    if (statusResponse.status === 'AUTHORIZED' && statusResponse.response_code === 0) {
      status = 'completed';
      isApproved = true;
      console.log('✅ Transacción previamente APROBADA (status)');
    } else {
      status = 'failed';
      console.log('❌ Transacción previamente RECHAZADA (status):', {
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
