import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-emerald-950 rounded text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          
          <div>
            <h4 className="font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-300 hover:text-white">Inicio</Link></li>
              <li><Link href="/ecoproducts" className="text-gray-300 hover:text-white">Catálogo</Link></li>
              <li><Link href="/ecowebs" className="text-gray-300 hover:text-white">EcoWebs</Link></li>
              <li><Link href="/germinables" className="text-gray-300 hover:text-white">Germinables</Link></li>
              <li><Link href="/ecoabout" className="text-gray-300 hover:text-white">Nosotros</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <div className="space-y-4">
              <Link 
                href="https://wa.me/56322121504" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 transition-colors rounded-lg text-white"
              >
                <span className="mr-2 flex items-center justify-center">
                  <Image 
                    src="/images/icons/wspicon.svg" 
                    alt="WhatsApp" 
                    width={22} 
                    height={22} 
                  />
                </span>
                Contacto Germinables
              </Link>              <Link 
                href="https://wa.me/56949866129" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 transition-colors rounded-lg text-white"
              >
                <span className="mr-2 flex items-center justify-center">
                  <Image 
                    src="/images/icons/wspicon.svg" 
                    alt="WhatsApp" 
                    width={22} 
                    height={22} 
                  />
                </span>
                Contacto Webs
              </Link>
              <p className="text-gray-300">info@ecobodas.cl</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Síguenos</h4>
            <div className="flex space-x-4">
              <Link href="https://instagram.com/ecobodas" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white flex items-center">
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                Instagram
              </Link>
              <Link href="https://facebook.com/ecobodas" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white flex items-center">
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
                Facebook
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Eco-comprometidos</h4>
            <p className="text-gray-300 text-sm">
              Nuestros productos son elaborados con materiales reciclados y sostenibles.
            </p>

          </div>
        </div>
        <div className="border-t border-gray-700 text-xs mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} EcoBodas. Todos los derechos reservados.</p>
          <a 
            href="/adminpanel" 
            className="text-xs text-gray-400 hover:text-white mt-2 inline-block"
          >
            🎫
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;