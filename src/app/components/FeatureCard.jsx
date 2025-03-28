import React from 'react';

const FeatureCard = ({ title, description, icon, bgImage = '/images/backgrounds/leaf-pattern.jpg' }) => {
  return (
    <div className="relative h-[300px] rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group">

      
      {/* Overlay oscuro para mejorar legibilidad del texto */}
      <div className="absolute inset-0 bg-emerald-900 bg-opacity-70 group-hover:bg-opacity-50 transition-all duration-300"></div>
      
      {/* Icono flotante que se agranda en hover */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-emerald-200 opacity-5 text-[150px] transition-all duration-300 group-hover:scale-125 group-hover:opacity-10 pointer-events-none">
        {icon}
      </div>
      
      {/* Contenido de la tarjeta superpuesto */}
      <div className="absolute inset-0 flex flex-col justify-between p-6 text-white z-10">
        <div>
          <div className="text-4xl text-emerald-200 mb-4 transform group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-emerald-200 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-gray-100">
            {description}
          </p>
        </div>
        
        {/* Línea decorativa que se expande en hover */}
        <div className="w-12 h-1 bg-emerald-200 rounded group-hover:w-full transition-all duration-300"></div>
      </div>
    </div>
  );
};

export default FeatureCard;