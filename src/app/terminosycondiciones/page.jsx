"use client";
import React from "react";
import Image from "next/image";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f5f3e6]">
      <section className="px-4 md:px-6 py-16">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <header>
                <h1 className="text-3xl font-bold tracking-tight text-[#3f4f1c]">Términos y Condiciones del Servicio (T&amp;C)</h1>
                <p className="mt-2 text-sm text-stone-600">MANOS DEL MARGA MARGA SpA</p>
              </header>

              <section className="prose prose-base leading-relaxed max-w-none text-stone-700">
                <h2 className="text-2xl font-semibold mt-10 mb-4 text-[#3f4f1c]">Resumen Clave para el Usuario</h2>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-left">
                      <th className="py-2">Concepto Clave</th>
                      <th className="py-2">Tu Derecho</th>
                      <th className="py-2">Condición Importante</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="py-2 align-top">Garantía Legal</td>
                      <td className="py-2 align-top">3 Meses para optar a cambio, reparación o devolución si hay falla.</td>
                      <td className="py-2 align-top">Aplica solo a fallas no imputables al consumidor. Los costos de envío de retorno son nuestros.</td>
                    </tr>
                    <tr className="border-t">
                      <td className="py-2 align-top">Cambio Voluntario</td>
                      <td className="py-2 align-top">30 Días para cambiar el producto si no te satisface.</td>
                      <td className="py-2 align-top">El producto debe estar sin uso, en su empaque original, sin imprimir y en perfecto estado. El costo de envío de retorno es tuyo.</td>
                    </tr>
                    <tr className="border-t">
                      <td className="py-2 align-top">Derecho a Retracto</td>
                      <td className="py-2 align-top">10 Días para anular la compra online.</td>
                      <td className="py-2 align-top">No aplica si el papel germinable presenta deterioro por humedad o manipulación. El costo de envío de retorno es tuyo.</td>
                    </tr>
                    <tr className="border-t">
                      <td className="py-2 align-top">Ley Aplicable</td>
                      <td className="py-2 align-top">Leyes de la República de Chile (Ley 19.496).</td>
                      <td className="py-2 align-top">Cualquier controversia será sometida a los Tribunales Chilenos.</td>
                    </tr>
                  </tbody>
                </table>

                <p className="mt-4">Contacto y Soporte: <a className="text-[#3f4f1c] font-medium" href="mailto:contacto@manosdelmargamarga.cl">contacto@manosdelmargamarga.cl</a></p>
                <p className="text-sm text-stone-600">Nuestro equipo te responderá en un plazo máximo de 48 horas hábiles.</p>

                <h2 className="text-2xl font-semibold mt-10 mb-4 text-[#3f4f1c]">Primero: Identificación de la empresa y aceptación</h2>
                <p>Estos Términos y Condiciones regulan el uso del sitio web www.manosdelmargamarga.cl, operado por MANOS DEL MARGA MARGA SpA, RUT 76.781.664-2. Nuestra representante legal es LIZBETH CAROLINA VALDÉS HERNÁNDEZ, y nuestro domicilio se encuentra en QUILPUÉ, Valle del Marga Marga.</p>
                <p>Aceptación: Al visitar, usar o comprar en nuestro sitio web, manifiestas tu aceptación a estos Términos y Condiciones. Si no estás de acuerdo con ellos, te pedimos no utilizar nuestros servicios.</p>
                <p>Legislación Aplicable: El uso de este sitio y los contratos que celebres se encuentran sujetos a las leyes de la República de Chile y, en especial, a la Ley 19.496 de protección de los derechos de los consumidores. En todo momento aplicaremos los derechos y garantías reconocidos a favor de nuestros clientes.</p>

                <h2 className="text-2xl font-semibold mt-10 mb-4 text-[#3f4f1c]">Segundo: Comunicaciones y atención al cliente</h2>
                <ol>
                  <li><strong>Medio de Contacto:</strong> Para cualquier consulta, reclamo o para ejercer tus derechos como consumidor, debes contactarnos a través del correo electrónico <a className="text-[#3f4f1c] font-medium" href="mailto:contacto@manosdelmargamarga.cl">contacto@manosdelmargamarga.cl</a>.</li>
                  <li><strong>Publicidad y Promociones:</strong> Si decides recibir información publicitaria, cada mensaje contendrá claramente la identificación de Manos del Marga Marga SpA y un procedimiento simple y eficaz para que solicites la suspensión de futuros envíos en cualquier momento.</li>
                </ol>

                <h2 className="text-2xl font-semibold mt-10 mb-4 text-[#3f4f1c]">Tercero: Proceso de compra y perfeccionamiento del contrato</h2>
                <p>1. Libertad de Navegación: Puedes navegar y visitar nuestro sitio libremente. La contratación solo se produce cuando manifiestas tu voluntad de compra.</p>
                <p>2. Secuencia de Compra: Para realizar una compra, debes seguir los siguientes pasos:</p>
                <ul>
                  <li>a) Aceptar estos T&amp;C;</li>
                  <li>b) Agregar los productos al carro de compra;</li>
                  <li>c) Ingresar tus datos o registrarte;</li>
                  <li>d) Seleccionar el tipo de despacho;</li>
                  <li>e) Seleccionar el medio de pago;</li>
                  <li>f) Revisar el resumen final de la orden.</li>
                </ul>
                <p>3. Perfeccionamiento: El contrato se entiende perfeccionado y completo una vez que verificamos el pago y confirmamos tu orden, lo cual te será notificado por correo electrónico.</p>

                <h2 className="text-2xl font-semibold mt-10 mb-4 text-[#3f4f1c]">Cuarto: Precios y facturación</h2>
                <ol>
                  <li>Precios: Los precios de los productos están sujetos a cambios, pero no modificaremos las condiciones bajo las cuales ya has contratado.</li>
                  <li>Facturación (Crédito): Si solicitas factura a crédito, aceptas implícitamente la condición de que dicho documento puede ser objeto de Factorización (venta de la factura a una empresa de Factoring).</li>
                  <li>Para solicitar FACTURA debes incluir los datos correspondientes en el formulario de compra. Para BOLETA debes enviar tu Comprobante de compra al botón whatsapp del mismo sitio web.</li>
                </ol>

                <h2 className="text-2xl font-semibold mt-10 mb-4 text-[#3f4f1c]">Quinto: Medios de pago, despacho y entrega</h2>
                <ol>
                  <li>Medios de Pago: Aceptamos tarjetas de crédito y débito bancarias a través de los sistemas de pago informados en el sitio.</li>
                  <li>Plazos de Despacho: Los pedidos se procesan solo en días hábiles. Los plazos de despacho son estimados y van de 1 a 3 días hábiles (lunes, miércoles o viernes) vía nuestro operador logístico. Con servicio por pagar a domicilio que has ingresado en el formulario.</li>
                </ol>

                <h2 className="text-2xl font-semibold mt-10 mb-4 text-[#3f4f1c]">Sexto: Metodología de devolución y reclamos</h2>
                <p>Para solicitar un cambio, devolución o ejercer una garantía, debes seguir esta metodología:</p>
                <h3 className="text-xl font-medium mt-6 mb-2 text-[#3f4f1c]">Paso 1: Envío de Antecedentes (Apertura del Caso)</h3>
                <p>Envía un correo a <a className="text-[#3f4f1c] font-medium" href="mailto:contacto@manosdelmargamarga.cl">contacto@manosdelmargamarga.cl</a> indicando claramente el motivo de tu solicitud:</p>
                <ul>
                  <li>Motivo: Retracto, Garantía Legal por Falla o Devolución/Cambio Voluntario</li>
                  <li>Identificación: Número de pedido y tus datos de contacto.</li>
                  <li>Fotografías Esenciales: Adjunta imágenes claras del producto que muestren:</li>
                  <ul>
                    <li>El defecto o la falla (solo si aplica garantía legal).</li>
                    <li>El estado general del producto y su embalaje, demostrando que no ha sido usado, impreso o manipulado.</li>
                  </ul>
                </ul>

                <h3 className="text-xl font-medium mt-6 mb-2 text-[#3f4f1c]">Paso 2: Evaluación y Respuesta</h3>
                <ol>
                  <li>Nuestro equipo abrirá un caso de servicio y revisará los antecedentes y fotografías para determinar la procedencia de tu solicitud, bajo el cumplimiento de las condiciones de este T&amp;C.</li>
                  <li>Recibirás una respuesta formal indicando la aprobación o rechazo de tu solicitud en un plazo máximo de 48 horas hábiles.</li>
                </ol>

                <h2 className="text-2xl font-semibold mt-10 mb-4 text-[#3f4f1c]">Séptimo: Derechos y condiciones especiales (Productos germinables)</h2>
                <h3 className="text-xl font-medium mt-6 mb-2 text-[#3f4f1c]">1. Garantía Legal (3 Meses por Falla)</h3>
                <p>Tu Opción: Si el producto presenta fallas o defectos de fabricación (ej: perforaciones, roturas, humedad que lo inutilice) dentro de los 3 meses siguientes a la recepción, tienes derecho a optar por la reparación gratuita, el cambio o la devolución del dinero. En caso de devolución del dinero por Retracto o Voluntaria, a banco de otras plazas diferentes a Banco Estado, aplicará descuento por recargo de transacción sistema bancario y costos de envio no asumidos por el consumidor.</p>
                <p>Costos de Traslado: Si la falla es confirmada por la empresa, Manos del Marga Marga SpA asume el costo de transporte para el retorno del producto.</p>

                <h3 className="text-xl font-medium mt-6 mb-2 text-[#3f4f1c]">2. Derecho a Retracto (10 Días)</h3>
                <p>Plazo Legal: Tienes un plazo de 10 días corridos para anular la compra online desde que recibes el producto.</p>
                <p>Condición Excluyente (Protección del Producto Delicado): Dado el carácter artesanal y la delicadeza de nuestro papel con semillas, no podrás ejercer el retracto si el bien se ha deteriorado por una acción tuya. Esto incluye:</p>
                <ul>
                  <li>Humedad, Manchas, Cortes o Dobleces Permanentes.</li>
                  <li>Impresión, Uso o Manipulación de las Semillas.</li>
                  <li>Daños en el Embalaje de Protección que comprometan la viabilidad del producto.</li>
                </ul>
                <p>Costos de Traslado: En caso de retracto, el costo de envío del producto de vuelta a nuestra bodega es asumido por el cliente.</p>

                <h3 className="text-xl font-medium mt-6 mb-2 text-[#3f4f1c]">3. Cambios o Devoluciones Voluntarias (30 Días por Disconformidad)</h3>
                <p>Plazo: Tienes hasta 30 días desde la recepción para solicitar un cambio o devolución si el producto no te satisface.</p>
                <p>Condición: El producto debe estar sin uso, en su empaque original, sin imprimir y con todos sus embalajes originales en perfecto estado.</p>
                <p>Costos de Traslado: El costo de transporte para la devolución o cambio es asumido por el cliente.</p>

                <h3 className="text-xl font-medium mt-6 mb-2 text-[#3f4f1c]">4. Devolución de Dinero</h3>
                <p>Una vez que se verifique la condición del producto en nuestra bodega, realizaremos el reembolso en un plazo no superior a 72 horas hábiles a tu medio de pago.</p>

                <h2 className="text-2xl font-semibold mt-10 mb-4 text-[#3f4f1c]">Octavo: Otras disposiciones</h2>
                <ol>
                  <li><strong>Propiedad Intelectual:</strong> Todos los contenidos de este sitio (logos, imágenes, textos, códigos) son propiedad de Manos del Marga Marga SpA y están protegidos por las leyes de propiedad intelectual INAPI.</li>
                  <li><strong>Responsabilidad:</strong> Manos del Marga Marga SpA no será responsable por el uso indebido que se le dé a los materiales. Nuestra responsabilidad se limita al precio efectivamente pagado por el producto.</li>
                  <li><strong>Vigencia:</strong> Estos Términos y Condiciones se rigen e interpretan de conformidad con las leyes de la República de Chile y son válidos a partir de su publicación en el sitio web.</li>
                </ol>

                <hr className="my-6" />
                <p className="text-sm text-stone-600"> Si necesitas una copia o ayuda para interpretar cualquier cláusula, contáctanos a <a className="text-[#3f4f1c] font-medium" href="mailto:contacto@manosdelmargamarga.cl">contacto@manosdelmargamarga.cl</a>.</p>
              </section>
            </div>

            
          </div>
        </div>
      </section>
    </main>
  );
}
