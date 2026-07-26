"use client";

import FormularioContacto from "../components/contact/FormularioContacto";
import Image from "next/image";

export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-[#f5f3e6]">
      <section className="px-4 md:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded">
              <Image
                src="/images/contacto/contactoimg.svg"
                alt="Ilustración de contacto Manos del Marga Marga"
                fill
                className="object-cover object-[50%_50%]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          <div>
            <div className="grid gap-4 mb-4 text-sm">
              <div className="bg-white border border-gray-100 text-center rounded-xl p-4 shadow-sm">
                <p className="font-medium text-gray-700">Horario de atención</p>
                <p className="text-gray-500">Lunes a Viernes de 10:00 a 17:00 hrs.</p>
                <p className="text-gray-500">Sábado, Domingos y festivos: Cerrado</p>
              </div>
            </div>

            <h3 className="text-ml text-center font-semibold text-[#3f4f1c]">
              Déjanos tu mensaje
            </h3>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-4">
              <FormularioContacto />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
