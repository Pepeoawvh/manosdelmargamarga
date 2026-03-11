"use client";
import React from "react";
import FormularioContacto from "../components/contact/FormularioContacto";
import Image from "next/image";
export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-[#f5f3e6]">
      <section className="px-4 md:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Columna izquierda: frase e ilustración */}
          <div className="space-y-8">

            <div className="w-full aspect-[4/3] rounded  grid place-items-center text-stone-600">
              <Image
                src="/images/contacto/contactoimg.svg"
                alt=""
                width={1000}
                height={1000}
                className=""
              />
            </div>
          </div>

          {/* Columna derecha: datos de contacto + formulario */}
          <div>

            <div className="grid  gap-4 mb-4 text-sm">

              <div className="bg-stone-100 text-center rounded p-4">
                <p className="font-medium">Horario de atención</p>
                <p className="text-stone-600">Lunes a Viernes de 10:00 a 17:00 hrs.</p>
                <p className="text-stone-600">Sábado, Domingos y festivos: Cerrado</p>
              </div>
            </div>

            <h3 className="text-2xl text-center font-semibold text-[#3f4f1c] ">
              Déjanos tu mensaje
            </h3>
            <div className="bg-none rounded-xl  p-4 md:p-6 shadow-sm">
              <FormularioContacto />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
