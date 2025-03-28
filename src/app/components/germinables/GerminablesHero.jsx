'use client'
import Image from 'next/image';
import Link from 'next/link';
import { ephesis } from '../../ui/fonts';

const GerminablesHero = () => {
  return (
    <section className="relative select-none py-20 md:py-28 bg-gradient-to-b from-emerald-50 to-white">
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-100 rounded-full opacity-40 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-100 rounded-full opacity-30 translate-x-1/4 translate-y-1/4" />
      </div>
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-emerald-800">
              Invitaciones <span className={`${ephesis.className} text-5xl md:text-6xl`}>Germinables</span>
            </h1>
            <p className="text-lg text-emerald-700 mb-8">
              Papel artesanal con semillas que florecen. Una invitación que tus invitados plantarán y verán crecer, simbolizando el comienzo de tu nueva vida.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <Link href="#features" className="px-6 py-3 bg-emerald-700 text-white rounded-md hover:bg-emerald-600 transition-colors">
                Descubrir productos
              </Link>
              <Link href="/contact" className="px-6 py-3 border-2 border-emerald-700 text-emerald-800 rounded-md hover:bg-emerald-50 transition-colors">
                Solicitar información
              </Link>
            </div>
          </div>
          
          <div className="md:w-1/2">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <Image 
                src="/images/germinables/germinablesHero.svg" 
                alt="Invitación Germinable" 
                fill
                className="object-cover rounded-2xl shadow-lg"
              />
             
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-100 rounded-full z-[-1]" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-amber-100 rounded-full z-[-1]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GerminablesHero;