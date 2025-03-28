'use client'
import { createContext, useContext, useState, useEffect } from 'react';

// Crear contexto
const CartContext = createContext();

// Hook personalizado para usar el contexto
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // Estado inicial del carrito (intentar cargar desde localStorage)
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('mmm-cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error('Error al cargar carrito:', error);
    }
  }, []);
  
  // Guardar carrito en localStorage cuando cambia
  useEffect(() => {
    try {
      localStorage.setItem('mmm-cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error al guardar carrito:', error);
    }
  }, [cart]);
  
  // Obtener el número total de items en el carrito
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
  
  // Calcular el subtotal del carrito
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Añadir producto al carrito
  const addToCart = (product, quantity = 1) => {
    setCart(currentCart => {
      // Verificar si el producto ya está en el carrito
      const existingItemIndex = currentCart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Actualizar cantidad si el producto ya está en el carrito
        const updatedCart = [...currentCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      } else {
        // Añadir nuevo producto al carrito
        return [...currentCart, { ...product, quantity }];
      }
    });
    
    // Mostrar el carrito después de añadir un producto
    setIsCartOpen(true);
  };
  
  // Actualizar cantidad de un producto
  const updateQuantity = (productId, quantity) => {
    setCart(currentCart => 
      currentCart.map(item => 
        item.id === productId 
          ? { ...item, quantity: Math.max(1, quantity) } 
          : item
      )
    );
  };
  
  // Eliminar producto del carrito
  const removeFromCart = (productId) => {
    setCart(currentCart => currentCart.filter(item => item.id !== productId));
  };
  
  // Vaciar carrito
  const clearCart = () => {
    setCart([]);
  };
  
  // Verificar si un producto está en el carrito
  const isInCart = (productId) => {
    return cart.some(item => item.id === productId);
  };
  
  // Abrir carrito
  const openCart = () => setIsCartOpen(true);
  
  // Cerrar carrito
  const closeCart = () => setIsCartOpen(false);
  
  return (
    <CartContext.Provider value={{
      cart,
      isCartOpen,
      itemCount,
      subtotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      isInCart,
      openCart,
      closeCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;