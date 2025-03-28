import Image from 'next/image';
import { useState, useEffect } from 'react';

const Slide2 = ({ 
  imageUrl, 
  mobileImageUrl, // Imagen específica para móvil
  mobileObjectFit = "contain", // Valor para móvil
  mobileObjectPosition = "center", // Posición para móvil
  overlayPosition, 
  overlayGradient, 
  desktopObjectFit = "cover", // Valor para escritorio
  desktopObjectPosition = "center", // Posición para escritorio
}) => {
  const [currentImage, setCurrentImage] = useState(imageUrl);
  const [objectFit, setObjectFit] = useState(desktopObjectFit);
  const [objectPosition, setObjectPosition] = useState(desktopObjectPosition);
  
  // Detecta el tamaño de pantalla y cambia la imagen y sus estilos
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setCurrentImage(mobileImageUrl || imageUrl);
        setObjectFit(mobileObjectFit);
        setObjectPosition(mobileObjectPosition);
      } else {
        setCurrentImage(imageUrl);
        setObjectFit(desktopObjectFit);
        setObjectPosition(desktopObjectPosition);
      }
    };
    
    // Inicializar
    handleResize();
    
    // Escuchar cambios de tamaño
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imageUrl, mobileImageUrl, desktopObjectFit, mobileObjectFit, desktopObjectPosition, mobileObjectPosition]);

  return (
    <div className="relative h-[70vh] md:h-[70vh] w-full bg-[#ffffff86]">
      <Image
        src={currentImage}
        alt="Background"
        fill
        priority
        style={{ 
          objectFit,
          objectPosition 
        }}
      />
      <div className={`absolute inset-0 bg-gradient-to-r ${overlayGradient}`}>
        <div className={`h-full flex items-center ${
          overlayPosition === 'left' ? 'justify-start' : 'justify-end'
        }`}>
          <div className={`max-w-md md:max-w-2xl px-4 md:px-8 ${
            overlayPosition === 'left' ? 'ml-4 md:ml-8' : 'mr-4 md:mr-8'
          }`}>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slide2;