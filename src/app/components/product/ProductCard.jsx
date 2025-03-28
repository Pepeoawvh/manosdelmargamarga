'use client'
import { useState } from 'react';
import Link from 'next/link';
import AddToCartButton from '../cart/AddToCartButton';

const ProductCard = ({ 
  product = {}, 
  isAdmin = false, 
  onToggleFeatured, 
  onEdit, 
  onDelete,
  showInfo = true 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  if (!product) {
    return null;
  }

  const {
    id,
    image = '',
    title = '',
    categories = [],
    subcategories = [],
    description = '',
    price = '0',
    stock = 0,
    featured = false
  } = product;

  // Obtener la primera categoría y subcategoría para mostrar
  const mainCategory = categories && categories.length > 0 ? categories[0] : '';
  const mainSubcategory = subcategories && subcategories.length > 0 ? subcategories[0] : '';
  
  // Verificar si hay stock disponible
  const isOutOfStock = stock === 0;
  
  // Función para gestionar videos y GIFs
  const isGifUrl = (url) => {
    if (!url) return false;
    return url.toLowerCase().endsWith('.gif');
  };

  const isVideoUrl = (url) => {
    if (!url) return false;
    return url.toLowerCase().endsWith('.mp4') || 
           url.toLowerCase().endsWith('.webm') || 
           url.toLowerCase().endsWith('.mov');
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    
    // Patrones para diferentes servicios de video
    const patterns = [
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/,
      /^.*(vimeo.com\/)(\d+).*/
    ];
    
    // YouTube
    const youtubeMatch = url.match(patterns[0]);
    if (youtubeMatch && youtubeMatch[2].length === 11) {
      return `https://www.youtube.com/embed/${youtubeMatch[2]}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${youtubeMatch[2]}`;
    }
    
    return url;
  };

  return (
    <div 
      className="relative rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 h-[360px] w-full max-w-xs mx-auto group"
      onMouseEnter={() => !isAdmin && setIsHovered(true)}
      onMouseLeave={() => !isAdmin && setIsHovered(false)}
    >
      {/* Imagen de fondo */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
        
        {/* Overlay oscuro para mejorar legibilidad del texto */}
        <div className={`absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-40 transition-all duration-300`}></div>
      </div>
      
      {/* Video/GIF al hacer hover */}
      {product.videoUrl && (
        <div className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {isGifUrl(product.videoUrl) ? (
            <img src={product.videoUrl} alt={`${title} animación`} className="w-full h-full object-cover" />
          ) : isVideoUrl(product.videoUrl) ? (
            <video src={product.videoUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
          ) : (
            <iframe
              src={isHovered ? getEmbedUrl(product.videoUrl) : ''}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
        </div>
      )}
      
      {/* Badges de estado */}
      <div className="absolute top-2 left-2 flex flex-col gap-2 z-10">
        {mainCategory && (
          <span className="text-xs font-medium px-2 py-1 bg-emerald-100/80 backdrop-blur-sm text-emerald-800 rounded-full">
            {mainCategory}
          </span>
        )}
        
        {isOutOfStock && !isAdmin && (
          <span className="text-xs font-medium px-2 py-1 bg-red-500 text-white rounded-full">
            Agotado
          </span>
        )}
      </div>
      
      {/* Indicador de destacado */}
      {featured && (
        <div className="absolute top-2 right-2 z-10">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="w-6 h-6 text-yellow-400 drop-shadow-md"
          >
            <path 
              fillRule="evenodd" 
              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
              clipRule="evenodd" 
            />
          </svg>
        </div>
      )}
      
      {/* Información del producto (parte inferior) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{title}</h3>
        
        {showInfo && (
          <p className="text-white/80 text-xs mt-1 line-clamp-2 mb-2">{description}</p>
        )}
        
        {/* Precio y acciones */}
        <div className="flex justify-between items-end mt-2">
          {/* Precio */}
          {showInfo && (
            <p className="font-bold text-white">
              ${parseInt(price).toLocaleString()}
              {stock > 0 && stock <= 10 && (
                <span className="ml-2 text-xs font-medium text-amber-300">
                  (Quedan {stock})
                </span>
              )}
            </p>
          )}
          
          {/* Acciones */}
          {isAdmin ? (
            <div className="flex space-x-2">
              <button
                onClick={() => onToggleFeatured(product)}
                className={`p-1 rounded-full ${featured ? 'text-yellow-500' : 'text-gray-400'}`}
                title={featured ? 'Quitar de destacados' : 'Marcar como destacado'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
              </button>
              <button onClick={() => onEdit(product)} className="bg-blue-500 text-white text-sm px-2 py-1 rounded">Editar</button>
              <button onClick={() => onDelete(id)} className="bg-red-500 text-white text-sm px-2 py-1 rounded">Eliminar</button>
            </div>
          ) : (
            <div className="flex gap-2">
              {/* Botón para ver detalles */}
              <Link 
                href={`/producto/${id}`}
                className="px-3 py-1.5 bg-white text-emerald-700 text-xs font-medium rounded hover:bg-emerald-50 transition-colors"
              >
                Ver más
              </Link>
              
              {/* Botón de añadir al carrito */}
              <AddToCartButton product={product} compact={true} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded hover:bg-emerald-700" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 