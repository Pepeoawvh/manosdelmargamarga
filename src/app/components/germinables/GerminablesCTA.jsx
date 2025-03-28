import Link from 'next/link';

const GerminablesCTA = () => {
  return (
    <section className="py-16 select-none bg-emerald-700 text-white">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para sorprender a tus invitados?</h2>
        <p className="text-xl mb-8 max-w-3xl mx-auto">
          Crea invitaciones que dejarán huella y simbolizarán el crecimiento de tu nueva etapa juntos.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link href="/ecoproducts?type=germinable" className="px-8 py-3 bg-white text-emerald-700 rounded-md hover:bg-emerald-50 transition-colors font-semibold text-lg">
            Ver todos los modelos
          </Link>
          <Link href="/contact?product=germinable" className="px-8 py-3 text-yellow-500 border-2 border-white rounded-md hover:bg-emerald-600 transition-colors font-medium text-lg">
            Solicitar información
          </Link>
        </div>
        <p className="mt-8 text-emerald-100">
          ¡Más de 200 parejas ya han elegido nuestras invitaciones germinables!
        </p>
      </div>
    </section>
  );
};

export default GerminablesCTA;