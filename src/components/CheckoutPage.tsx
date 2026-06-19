import * as React from "react";
import { useState } from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import CheckoutButton from "./CheckoutButton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sparkle,
  ShoppingBag,
  ArrowLeft,
  CheckCircle,
} from "@phosphor-icons/react";
import confetti from "canvas-confetti";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import qrImage from "../assets/qr.jpeg";

// Configure the default active payment tab: "qr" or "paypal"
const DEFAULT_PAYMENT_METHOD = "qr";

function CheckoutPageContent() {
  const { user, cart, cartSubtotal, authLoading, clearCart } = useAuth();
  const [completedOrder, setCompletedOrder] = useState<{
    orderId: string;
    paypalOrderId: string;
    total: number;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<string>(DEFAULT_PAYMENT_METHOD);

  // Keep a local copy of cart items upon successful checkout so we can display them in the confirmation screen
  const [purchasedItems, setPurchasedItems] = useState<typeof cart>([]);

  const handlePaymentSuccess = async (result: {
    orderId: string;
    paypalOrderId: string;
    total: number;
  }) => {
    // 1. Keep track of what was bought for the success screen
    setPurchasedItems([...cart]);

    // 2. Clear state and trigger confetti
    setCompletedOrder(result);
    await clearCart();

    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#7C0A12", "#1C1917", "#D4AF37", "#fbf9f6"],
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#fbf9f6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-[#7C0A12]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-xs uppercase tracking-widest text-[#78716C] font-semibold animate-pulse">
            Verificando sesión...
          </p>
        </div>
      </div>
    );
  }

  // Auth gate
  if (!user) {
    return (
      <div className="min-h-screen bg-[#fbf9f6] flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-white border border-[#78716C]/15 shadow-xl rounded-none">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto size-12 bg-[#7C0A12]/5 text-[#7C0A12] flex items-center justify-center rounded-none mb-3">
              <Sparkle size={24} />
            </div>
            <CardTitle className="font-heading text-2xl text-[#1C1917]">
              Inicio de Sesión Requerido
            </CardTitle>
            <CardDescription className="text-xs text-[#78716C]">
              Debes estar autenticado para completar el proceso de pago.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-center">
            <p className="text-xs text-[#625d5b] leading-relaxed">
              Por favor, regresa a la página de colecciones para iniciar sesión
              o registrarte y proceder con tu compra.
            </p>
            <Button
              onClick={() => (window.location.href = "/colecciones")}
              className="bg-[#1C1917] hover:bg-[#7C0A12] text-white py-5 text-xs uppercase tracking-widest rounded-none mt-2"
            >
              Ir a Colecciones
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success screen
  if (completedOrder) {
    return (
      <div className="min-h-screen bg-[#fbf9f6] pt-28 pb-16 px-6 md:px-12 flex flex-col items-center">
        <div className="w-full max-w-2xl bg-white border border-[#78716C]/15 shadow-2xl p-8 md:p-12 flex flex-col items-center text-center">
          <div className="size-16 bg-green-50 text-green-600 flex items-center justify-center rounded-full mb-6 border border-green-100 animate-badge-pop">
            <CheckCircle size={36} weight="fill" />
          </div>
          <span className="text-xs uppercase tracking-widest text-[#7C0A12] font-semibold mb-2">
            ¡Pago Verificado con Éxito!
          </span>
          <h1 className="font-heading text-3xl md:text-4xl text-[#1C1917] mb-6">
            Gracias por tu confianza.
          </h1>
          <div className="w-16 h-0.5 bg-[#7C0A12] mb-8"></div>

          <div className="w-full bg-[#fbf9f6] border border-[#78716C]/10 p-6 text-left flex flex-col gap-4 mb-8">
            <div className="flex justify-between items-center text-xs border-b border-[#78716C]/10 pb-3">
              <span className="text-[#78716C] uppercase font-semibold">
                Código de Pedido
              </span>
              <span className="font-mono text-[#1C1917] font-semibold">
                {completedOrder.orderId}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs border-b border-[#78716C]/10 pb-3">
              <span className="text-[#78716C] uppercase font-semibold">
                PayPal Order ID
              </span>
              <span className="font-mono text-[#1C1917]">
                {completedOrder.paypalOrderId}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs border-b border-[#78716C]/10 pb-3">
              <span className="text-[#78716C] uppercase font-semibold">
                Monto Pagado
              </span>
              <span className="text-[#7C0A12] font-bold text-sm">
                Bs. {completedOrder.total.toFixed(2)}
              </span>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <span className="text-[10px] text-[#78716C] uppercase tracking-wider font-bold">
                Detalle de Adquisición
              </span>
              {purchasedItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex justify-between text-xs py-1 text-[#625d5b]"
                >
                  <span>
                    {item.product.name}{" "}
                    <span className="text-[#78716C]/60 font-semibold">
                      x{item.quantity}
                    </span>
                  </span>
                  <span className="font-semibold">
                    Bs. {(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-[#625d5b] leading-relaxed max-w-md mb-8">
            Tu transacción se completó de forma correcta. Hemos registrado tu
            pedido.
          </p>

          <Button
            onClick={() => (window.location.href = "/colecciones")}
            className="bg-[#1C1917] hover:bg-[#7C0A12] text-white py-5 px-8 text-xs uppercase tracking-widest rounded-none"
          >
            Regresar a la Tienda
          </Button>
        </div>
      </div>
    );
  }

  // Cart empty gate
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#fbf9f6] flex items-center justify-center p-6">
        <div className="text-center flex flex-col items-center gap-4 max-w-sm">
          <ShoppingBag size={56} className="text-[#78716C]/40 animate-pulse" />
          <h2 className="font-heading text-2xl text-[#1C1917]">
            Tu bolsa está vacía
          </h2>
          <p className="text-xs text-[#625d5b] leading-relaxed">
            No tienes piezas seleccionadas para el pago. Visita nuestro catálogo
            para añadir amuletos con intención a tu bolsa.
          </p>
          <Button
            onClick={() => (window.location.href = "/colecciones")}
            className="bg-[#1C1917] hover:bg-[#7C0A12] text-white py-5 px-6 text-xs uppercase tracking-widest rounded-none mt-2"
          >
            Seguir Comprando
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf9f6] pt-28 pb-16 px-6 md:px-12 max-w-7xl mx-auto selection:bg-[#7C0A12] selection:text-white">
      {/* Back button */}
      <a
        href="/colecciones"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#78716C] hover:text-[#7C0A12] transition-colors duration-200 mb-8"
      >
        <ArrowLeft size={14} />
        Regresar a la Colección
      </a>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Cart items summary */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <h1 className="font-heading text-3xl md:text-4xl text-[#1C1917]">
            Finalizar Compra
          </h1>
          <div className="w-12 h-0.5 bg-[#7C0A12]"></div>

          <div className="flex flex-col gap-6 mt-4">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-4 py-4 border-b border-[#78716C]/10 items-center justify-between"
              >
                <div className="flex gap-4 items-center">
                  <div className="size-16 bg-[#efeeeb] border border-[#78716C]/15 shrink-0 flex items-center justify-center">
                    <ShoppingBag size={24} className="text-[#78716C]/60" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="font-heading text-lg text-[#1C1917] leading-tight font-medium">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-[#78716C]">
                      Piedra:{" "}
                      <span className="font-semibold text-[#625d5b]">
                        {item.product.stone}
                      </span>{" "}
                      &bull; Intención:{" "}
                      <span className="font-semibold text-[#625d5b]">
                        {item.product.intention}
                      </span>
                    </p>
                    <span className="text-[10px] text-[#78716C] uppercase font-bold mt-1">
                      Cantidad: {item.quantity}
                    </span>
                  </div>
                </div>

                <span className="font-heading text-base font-bold text-[#1C1917] shrink-0">
                  Bs. {(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary & PayPal Button */}
        <div className="lg:col-span-5 bg-white border border-[#78716C]/15 shadow-2xl p-6 md:p-8 flex flex-col gap-6">
          <h2 className="font-heading text-2xl text-[#1C1917]">
            Resumen del Pedido
          </h2>

          <div className="flex flex-col gap-3 text-xs border-b border-[#78716C]/10 pb-4 text-[#625d5b]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold">
                Bs. {cartSubtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Envío (Colección Permanente)</span>
              <span className="text-green-600 font-semibold uppercase">
                Gratuito
              </span>
            </div>
            <div className="flex justify-between">
              <span>Impuestos estimados</span>
              <span className="font-semibold">Bs. 0.00</span>
            </div>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="font-heading text-lg text-[#1C1917] font-semibold">
              Total del Pedido
            </span>
            <span className="font-heading text-xl text-[#7C0A12] font-bold">
              Bs. {cartSubtotal.toFixed(2)}
            </span>
          </div>

          {/* Payment Tabs (QR Code / PayPal) */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-2">
            <TabsList variant="line" className="w-full border-b border-[#78716C]/15 gap-8 bg-transparent justify-start h-10 px-0">
              <TabsTrigger
                value="qr"
                className="uppercase tracking-widest text-[11px] font-semibold py-2 px-0 data-active:text-[#7C0A12] text-[#78716C] transition-colors duration-200 border-none rounded-none after:bg-[#7C0A12] cursor-pointer"
              >
                Pago con QR
              </TabsTrigger>
              <TabsTrigger
                value="paypal"
                className="uppercase tracking-widest text-[11px] font-semibold py-2 px-0 data-active:text-[#7C0A12] text-[#78716C] transition-colors duration-200 border-none rounded-none after:bg-[#7C0A12] cursor-pointer"
              >
                PayPal
              </TabsTrigger>
            </TabsList>

            <TabsContent value="qr" className="mt-6 flex flex-col gap-4 text-center">
              <div className="bg-[#fbf9f6] border border-[#78716C]/10 p-5 flex flex-col items-center">
                <img
                  src={typeof qrImage === "string" ? qrImage : (qrImage as any).src}
                  alt="Código QR de Pago Banco Mercantil Santa Cruz"
                  className="max-w-[220px] w-full h-auto object-contain border-2 border-white shadow-md mx-auto"
                />
                <p className="text-xs text-[#78716C] leading-relaxed mt-4 max-w-[280px] mx-auto font-medium">
                  Escanea este código QR con tu app bancaria móvil para pagar.
                </p>
                <div className="w-full h-px bg-[#78716C]/10 my-3"></div>
                <p className="text-[10px] text-[#78716C]/70 leading-normal max-w-[280px] mx-auto">
                  Una vez realizado el pago, nuestro equipo validará la transacción para proceder con el envío de tus piezas con intención.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="paypal" className="mt-6">
              {/* Load PayPal Buttons only when active to guarantee proper width layout calculation */}
              {activeTab === "paypal" ? (
                <CheckoutButton
                  onSuccess={handlePaymentSuccess}
                  cartSubtotal={cartSubtotal}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-6 gap-2 border border-[#78716C]/10 bg-[#fbf9f6]">
                  <p className="text-[10px] text-[#78716C] uppercase tracking-wider">
                    Selecciona esta pestaña para iniciar PayPal...
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <AuthProvider>
      <CheckoutPageContent />
    </AuthProvider>
  );
}
