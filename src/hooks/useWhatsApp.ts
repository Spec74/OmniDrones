import { useMemo } from "react";
import { CartItem, Order } from "../types";

export interface UseWhatsAppProps {
  cart: CartItem[];
  completedOrder: Order | null;
  phoneNumber?: string; // Default: e.g. 51987654321
}

export function useWhatsApp({ cart, completedOrder, phoneNumber = "51987654321" }: UseWhatsAppProps) {
  const whatsAppUrl = useMemo(() => {
    let text = "";

    if (completedOrder) {
      if (completedOrder.status === "preparing") {
        // Newly paid post-sale behavior
        text = `Hola, mi orden ${completedOrder.id} tiene el Pago Aprobado. Solicito mi comprobante.`;
      } else {
        // En route tracking behavior
        text = `Hola, veo que mi orden ${completedOrder.id} está en camino. Solicito ubicación satelital.`;
      }
    } else {
      // Pre-sale behavior
      text = "Hola, necesito ayuda para elegir mi primer dron.";
    }

    const encodedText = encodeURIComponent(text);
    return `https://wa.me/${phoneNumber}?text=${encodedText}`;
  }, [cart, completedOrder, phoneNumber]);

  return { whatsAppUrl };
}
