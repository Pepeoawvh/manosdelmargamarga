import "./globals.css";
import { AuthProvider } from "./context/authProvider";
import {
  lexend,
} from "./ui/fonts";
import ClientProviders from "./providers/ClientProviders";

export const metadata = {
  title: "Manos del Marga Marga",
  description: "Productos sostenibles y artesanales hechos con papel reciclado",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-gray-100 hover:scrollbar-thumb-emerald-300 scrollbar-thumb-rounded-full">
      <body className={`${lexend.className} relative min-h-screen`}>
        {/* Contenedor de fondo */}
        <div className="fixed bg-[#f5f3ea] inset-0 w-full h-full">
        </div>
        
        <AuthProvider>
          <ClientProviders>
            {children}
          </ClientProviders>
        </AuthProvider>
      </body>
    </html>
  );
}