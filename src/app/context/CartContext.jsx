'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  // Estado para el carrito
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [savedShippingInfo, setSavedShippingInfo] = useState(null);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  
  // Estado para controlar la visibilidad del carrito
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('shoppingCart');
    const savedShipping = localStorage.getItem('shippingInfo');
    const savedPaymentStatus = localStorage.getItem('paymentInProgress');
    
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
        console.log('Carrito cargado desde localStorage:', parsedCart);
      } catch (error) {
        console.error('Error al cargar el carrito desde localStorage:', error);
        localStorage.removeItem('shoppingCart');
      }
    }
    
    if (savedShipping) {
      try {
        setSavedShippingInfo(JSON.parse(savedShipping));
      } catch (error) {
        console.error('Error al cargar datos de envío desde localStorage:', error);
        localStorage.removeItem('shippingInfo');
      }
    }
    
    if (savedPaymentStatus === 'true') setPaymentInProgress(true);
    
    // Limpiar flag de pago en progreso después de 30 minutos
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

  // Calcular subtotal cuando cambia el carrito
  useEffect(() => {
    const newSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setSubtotal(newSubtotal);
    
    // Guardar en localStorage
    try {
      localStorage.setItem('shoppingCart', JSON.stringify(cart));
      console.log('Carrito actualizado en localStorage:', cart);
    } catch (error) {
      console.error('Error al guardar el carrito en localStorage:', error);
    }
  }, [cart]);

  // Funciones para abrir/cerrar el carrito
  const openCart = () => {
    console.log("Abriendo carrito");
    setIsCartOpen(true);
  };

  const closeCart = () => {
    console.log("Cerrando carrito");
    setIsCartOpen(false);
  };

  const toggleCart = () => {
    console.log("Alternando visibilidad del carrito");
    setIsCartOpen(prevIsOpen => !prevIsOpen);
  };

  // Añadir producto al carrito
  const addToCart = (productToAdd) => {
    console.log('CartContext: Recibiendo producto para añadir:', productToAdd);
    
    // Verificar si se está obteniendo el producto de la vitrina o del admin panel
    const { product, quantity = 1 } = productToAdd.product ? productToAdd : { product: productToAdd, quantity: 1 };
    
    if (!product || !product.id) {
      console.error("Intento de agregar un producto inválido al carrito:", productToAdd);
      return;
    }

    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.id === product.id);
      let updatedCart;
      
      if (existingItemIndex !== -1) {
        // El producto ya está en el carrito, actualizar cantidad
        updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
      } else {
        // Agregar nuevo producto al carrito
        const newItem = {
          id: product.id,
          title: product.title || product.name || 'Producto sin nombre',
          price: parseFloat(product.price) || 0,
          image: product.image || product.images?.[0] || '/placeholder.png',
          quantity: quantity,
          sku: product.sku || ''
        };
        
        updatedCart = [...prevCart, newItem];
      }
      
      console.log('CartContext: Carrito actualizado:', updatedCart);
      
      // Abrir automáticamente el carrito al añadir productos
      openCart();
      
      return updatedCart;
    });
  };

  // Eliminar producto del carrito
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Actualizar cantidad de un producto
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCart(prevCart => prevCart.map(item => 
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  // Vaciar carrito
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('shoppingCart');
  };

  // Guardar información de envío
  const saveShippingInfo = (info) => {
    setSavedShippingInfo(info);
    localStorage.setItem('shippingInfo', JSON.stringify(info));
  };

  // Indicar que un intento de pago ha comenzado
  const startPaymentAttempt = () => {
    setPaymentInProgress(true);
    localStorage.setItem('paymentInProgress', 'true');
    localStorage.setItem('paymentStartTimestamp', Date.now().toString());
  };

  // Cancelar o finalizar un intento de pago
  const cancelPaymentAttempt = () => {
    setPaymentInProgress(false);
    localStorage.removeItem('paymentInProgress');
    localStorage.removeItem('paymentStartTimestamp');
  };

  // Completar el proceso de compra
  const completeCheckout = () => {
    clearCart();
    cancelPaymentAttempt();
    // No eliminamos la información de envío para que esté disponible para futuros pedidos
  };

  // Calculamos el número total de items en el carrito
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Variables y funciones expuestas por el contexto
  const contextValue = {
    cart,
    subtotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    savedShippingInfo,
    saveShippingInfo,
    paymentInProgress,
    startPaymentAttempt,
    cancelPaymentAttempt,
    completeCheckout,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
    itemCount
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}