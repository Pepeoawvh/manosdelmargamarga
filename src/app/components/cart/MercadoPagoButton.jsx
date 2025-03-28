'use client'
import React, { useEffect } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

const MercadoPagoButton = ({ preferenceId }) => {
  useEffect(() => {
    // Inicializar MercadoPago con tu Public Key
    initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY, { locale: 'es-CL' });
  }, []);

  if (!preferenceId) return null;

  return (
    <div>
      <Wallet initialization={{ preferenceId: preferenceId }} />
    </div>
  );
};

export default MercadoPagoButton;