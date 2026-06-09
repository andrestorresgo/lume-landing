import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const PUBLIC_PAYPAL_CLIENT_ID = import.meta.env.PUBLIC_PAYPAL_CLIENT_ID;

interface CheckoutButtonProps {
  onSuccess: (orderData: { orderId: string; paypalOrderId: string; total: number }) => void;
  cartSubtotal: number;
}

export default function CheckoutButton({ onSuccess, cartSubtotal }: CheckoutButtonProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paypalButtonRef = useRef<HTMLDivElement>(null);

  // Dynamic script loader for PayPal JS SDK
  useEffect(() => {
    if (!PUBLIC_PAYPAL_CLIENT_ID) {
      setError("Error de configuración: PUBLIC_PAYPAL_CLIENT_ID no está definido.");
      return;
    }

    const scriptId = "paypal-sdk-script";
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://www.paypal.com/sdk/js?client-id=${PUBLIC_PAYPAL_CLIENT_ID}&intent=capture&currency=USD`;
    script.async = true;
    script.onload = () => {
      setIsLoaded(true);
    };
    script.onerror = () => {
      setError("Error al cargar la plataforma de pagos PayPal. Por favor comprueba tu conexión.");
    };
    document.body.appendChild(script);

    return () => {
      // Keep script in body, but ensure no multiple instances
    };
  }, []);

  // Buttons rendering logic
  useEffect(() => {
    if (!isLoaded || !paypalButtonRef.current || isCapturing) return;

    // Clear the container in case of double rendering
    paypalButtonRef.current.innerHTML = "";

    const paypalWindow = window as any;
    if (!paypalWindow.paypal || !paypalWindow.paypal.Buttons) {
      setError("El SDK de PayPal no se inicializó correctamente.");
      return;
    }

    try {
      paypalWindow.paypal.Buttons({
        style: {
          layout: "vertical",
          color: "black",
          shape: "rect",
          label: "pay"
        },
        createOrder: async () => {
          setError(null);
          try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) {
              throw new Error("No hay una sesión activa de usuario.");
            }

            const response = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              }
            });

            if (!response.ok) {
              const errData = await response.json();
              throw new Error(errData.error || "Fallo al iniciar el pedido.");
            }

            const order = await response.json();
            return order.id;
          } catch (err: any) {
            console.error("Error creating PayPal order:", err);
            setError(err.message || "Hubo un error al iniciar la orden de PayPal.");
            throw err;
          }
        },
        onApprove: async (data: any) => {
          setIsCapturing(true);
          setError(null);
          try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) {
              throw new Error("La sesión expiró antes del procesamiento del pago.");
            }

            const response = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({ orderID: data.orderID })
            });

            if (!response.ok) {
              const errData = await response.json();
              throw new Error(errData.error || "Fallo al capturar el pago.");
            }

            const result = await response.json();
            if (result.success) {
              onSuccess(result);
            } else {
              throw new Error("La transacción no se pudo completar correctamente.");
            }
          } catch (err: any) {
            console.error("Error capturing PayPal payment:", err);
            setError(err.message || "Hubo un problema confirmando tu pago en nuestros servidores.");
          } finally {
            setIsCapturing(false);
          }
        },
        onError: (err: any) => {
          console.error("PayPal SDK error callback:", err);
          setError("Ocurrió un error inesperado al interactuar con PayPal.");
        }
      }).render(paypalButtonRef.current);
    } catch (err: any) {
      console.error("Failed to render PayPal buttons:", err);
      setError("Error al renderizar los botones de PayPal.");
    }
  }, [isLoaded, isCapturing]);

  return (
    <div className="w-full flex flex-col gap-4">
      {error && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900 rounded-none">
          <AlertTitle className="font-semibold text-sm">Error en el Pago</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button 
            variant="outline"
            onClick={() => { setError(null); setIsLoaded(false); setTimeout(() => setIsLoaded(true), 50); }}
            className="mt-3 border-red-300 text-red-900 hover:bg-red-100/50 rounded-none text-xs w-full py-1.5"
          >
            Reintentar inicialización
          </Button>
        </Alert>
      )}

      {isCapturing && (
        <div className="flex flex-col items-center justify-center py-8 gap-3 border border-[#78716C]/10 bg-[#f5f3f0]">
          <svg className="animate-spin h-6 w-6 text-[#7C0A12]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xs text-[#78716C] font-medium uppercase tracking-wider animate-pulse">
            Verificando y Capturando Pago...
          </p>
        </div>
      )}

      {!isLoaded && !error && (
        <div className="flex flex-col items-center justify-center py-6 gap-2 border border-[#78716C]/10 bg-[#fbf9f6]">
          <svg className="animate-spin h-5 w-5 text-[#1C1917]/55" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-[10px] text-[#78716C] uppercase tracking-wider">
            Cargando pasarela de pagos...
          </p>
        </div>
      )}

      {/* Mount point for PayPal smart buttons */}
      <div 
        id="paypal-button-container" 
        ref={paypalButtonRef}
        className={`${!isLoaded || isCapturing ? "hidden" : "block"} w-full`}
      />
    </div>
  );
}
