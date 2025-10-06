'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [savedShippingInfo, setSavedShippingInfo] = useState(null);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cargar carrito desde localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('shoppingCart');
    const savedShipping = localStorage.getItem('shippingInfo');
    const savedPaymentStatus = localStorage.getItem('paymentInProgress');

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem('shoppingCart');
      }
    }

    if (savedShipping) {
      try {
        setSavedShippingInfo(JSON.parse(savedShipping));
      } catch {
        localStorage.removeItem('shippingInfo');
      }
    }

    if (savedPaymentStatus === 'true') setPaymentInProgress(true);
    const paymentTimestamp = localStorage.getItem('paymentStartTimestamp');
    if (paymentTimestamp && savedPaymentStatus === 'true') {
      const thirtyMinutesInMs = 30 * 60 * 1000;
      if (Date.now() - parseInt(paymentTimestamp) > thirtyMinutesInMs) {
        setPaymentInProgress(false);
        localStorage.removeItem('paymentInProgress');
        localStorage.removeItem('paymentStartTimestamp');
      }
    }
  }, []);

  // Calcular subtotal
  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setSubtotal(total);
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
  }, [cart]);

  // Carrito
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  const addToCart = (productToAdd) => {
    const { product, quantity = 1 } = productToAdd.product ? productToAdd : { product: productToAdd, quantity: 1 };
    if (!product || !product.id) return;

    setCart(prev => {
      const index = prev.findIndex(item => item.id === product.id);
      if (index !== -1) {
        const updated = [...prev];
        updated[index].quantity += quantity;
        return updated;
      }
      return [...prev, {
        id: product.id,
        title: product.title || product.name || 'Producto',
        price: parseFloat(product.price) || 0,
        image: product.image || product.images?.[0] || '/placeholder.png',
        quantity,
        sku: product.sku || ''
      }];
    });
    openCart();
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
  const updateQuantity = (id, qty) => {
    if (qty < 1) return;
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: qty } : item));
  };
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('shoppingCart');
  };
  const saveShippingInfo = (info) => {
    setSavedShippingInfo(info);
    localStorage.setItem('shippingInfo', JSON.stringify(info));
  };

  // Pagos con WebPay v5
  const startPaymentAttempt = async (shippingInfo) => {
    if (!cart.length) return;
    setPaymentInProgress(true);
    localStorage.setItem('paymentInProgress', 'true');
    localStorage.setItem('paymentStartTimestamp', Date.now().toString());

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart,
          customer: shippingInfo || savedShippingInfo,
          summary: { subtotal, shippingCost: 0, total: subtotal },
          paymentMethod: 'webpay'
        })
      });

      const data = await response.json();
      if (data.url) {
        // Redirigir a WebPay
        window.location.href = data.url;
      } else {
        console.error('Error al iniciar transacción WebPay:', data);
        setPaymentInProgress(false);
        localStorage.removeItem('paymentInProgress');
        localStorage.removeItem('paymentStartTimestamp');
      }
    } catch (error) {
      console.error('Error en startPaymentAttempt:', error);
      setPaymentInProgress(false);
      localStorage.removeItem('paymentInProgress');
      localStorage.removeItem('paymentStartTimestamp');
    }
  };

  const cancelPaymentAttempt = () => {
    setPaymentInProgress(false);
    localStorage.removeItem('paymentInProgress');
    localStorage.removeItem('paymentStartTimestamp');
  };

  const completeCheckout = () => {
    clearCart();
    cancelPaymentAttempt();
  };

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, subtotal, addToCart, removeFromCart, updateQuantity, clearCart,
      savedShippingInfo, saveShippingInfo,
      paymentInProgress, startPaymentAttempt, cancelPaymentAttempt, completeCheckout,
      isCartOpen, openCart, closeCart, toggleCart,
      itemCount
    }}>
      {children}
    </CartContext.Provider>
  );
}
