import React from "react";
import EcoWebsInvitaciones from "../components/EcoWebsInvitaciones";
export const metadata = {
  title: "Invitaciones Web | EcoBodas",
  description: "Sitios web personalizados para tu boda con múltiples funcionalidades: galerías, confirmación de asistencia, contador y más."
};

export default function EcoWebs() {
  return (
    <div className="min-h-screen">
      <EcoWebsInvitaciones/>
    </div>
  );
}