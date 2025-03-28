import Image from 'next/image';
import { useState, useEffect } from 'react';

const Slide3 = ({ 
  imageUrl, 
  mobileImageUrl, // Nueva prop para imagen móvil
  card 
}) => {
  const [currentImage, setCurrentImage] = useState(imageUrl);
  
  // Detecta el tamaño de pantalla y cambia la imagen
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setCurrentImage(mobileImageUrl || imageUrl);
      } else {
        setCurrentImage(imageUrl);
      }
    };
    
    // Inicializar
    handleResize();
    
    // Escuchar cambios de tamaño
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imageUrl, mobileImageUrl]);

  return (
    <div className="relative h-[70vh] w-full">
      <Image
        src={currentImage}
        alt="Background"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 flex items-center">
        <div className={`max-w-md p-5 sm:p-8 rounded-lg ${
          card.position === 'right' 
            ? 'ml-auto mr-4 sm:mr-12' 
            : 'ml-4 sm:ml-12'
        } ${card.backgroundColor}`}>
          <h3 className={`text-2xl sm:text-3xl font-bold mb-2 sm:mb-4 ${card.textColor}`}>
            {card.title}
          </h3>
          <p className={`${card.textColor} opacity-90 text-sm sm:text-base`}>
            {card.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Slide3;