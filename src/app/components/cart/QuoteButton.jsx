'use client';

/**
 * QuoteButton — Botón para cotizar un producto vía WhatsApp.
 * Abre WhatsApp con un mensaje pre-armado que incluye los datos del producto.
 */

const WSP_NUMBER = '+56322121504';

const QuoteButton = ({ product, compact = false, personalizable = false, className = '' }) => {
  if (!product) return null;

  const buildWhatsappUrl = () => {
    const title = product.title || 'Producto';
    const price =
      product.price && Number(product.price) > 0
        ? `$${Number(product.price).toLocaleString('es-CL')} CLP`
        : 'precio a consultar';

    const slug = product.slug || product.id || '';
    const productUrl = slug
      ? `https://www.manosdelmargamarga.cl/producto/${slug}`
      : 'https://www.manosdelmargamarga.cl/catalogo';

    const categories =
      Array.isArray(product.categories) && product.categories.length > 0
        ? product.categories.join(', ')
        : '';

    const isPersonalizable = personalizable || product.personalizable;

    const lines = isPersonalizable
      ? [
          `¡Hola! Me gustaría cotizar un producto personalizable de Manos del Marga Marga:`,
          ``,
          `🎨 *${title}* (personalización a pedido)`,
          categories ? `🏷️ Categoría: ${categories}` : '',
          `🔗 ${productUrl}`,
          ``,
          `Me gustaría saber disponibilidad, opciones de personalización y precio. ¡Gracias!`,
        ].filter((l) => l !== null).join('\n')
      : [
          `¡Hola! Me gustaría cotizar el siguiente producto de Manos del Marga Marga:`,
          ``,
          `📦 *${title}*`,
          categories ? `🏷️ Categoría: ${categories}` : '',
          `🔗 ${productUrl}`,
          ``,
          `¡Gracias!`,
        ].filter((l) => l !== null).join('\n');

    return `https://wa.me/${WSP_NUMBER}?text=${encodeURIComponent(lines)}`;
  };

  const isPersonalizable = personalizable || product.personalizable;

  if (compact) {
    return (
      <a
        href={buildWhatsappUrl()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={`inline-flex items-center gap-1 px-3 py-[5px] text-white text-[11px] font-semibold rounded-full transition-colors bg-[#5e8c30] hover:bg-[#4a7326] ${className}`}
        aria-label={`Cotizar ${product.title || 'producto'} por WhatsApp`}
        title={isPersonalizable ? 'Cotizar producto personalizable' : 'Cotizar por WhatsApp'}
      >
        {/* Icono WhatsApp */}
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        {isPersonalizable ? 'Cotizar personalizable' : 'Cotizar'}
      </a>
    );
  }

  return (
    <a
      href={buildWhatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 ${
        isPersonalizable
          ? 'bg-[#5e8c30] hover:bg-[#4a7326] active:bg-[#3d5e1e]'
          : 'bg-[#5e8c30] hover:bg-[#4a7326] active:bg-[#3d5e1e]'
      } text-white font-semibold rounded-md shadow transition-colors duration-200 ${className}`}
      aria-label={`Cotizar ${product.title || 'producto'} por WhatsApp`}
    >
      {/* Icono WhatsApp */}
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      {isPersonalizable ? 'Consultar por WhatsApp' : 'Cotizar por WhatsApp'}
    </a>
  );
};

export default QuoteButton;
