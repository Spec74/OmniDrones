export interface DroneProduct {
  id: string;
  name: string;
  tagline: string;
  price: number;
  image: string;
  description: string;
  specs: {
    camera: string;
    flightTime: string;
    range: string;
    speed: string;
    weight: string;
  };
  features: string[];
  colors: { name: string; hex: string; desc: string }[];
  accessories: { id: string; name: string; price: number; description: string }[];
}

export interface CartItem {
  id: string; // unique item id (combines product id, color, accessories)
  product: DroneProduct;
  selectedColor: { name: string; hex: string };
  selectedAccessories: { id: string; name: string; price: number }[];
  quantity: number;
}

export interface QuizAnswers {
  step1_purpose: string; // 'cinematografia' | 'carreras' | 'social' | 'recreativa'
  step2_budget: string; // 'under_1000' | 'mid_2500' | 'high_5000' | 'pro_unlimited'
  step3_experience: string; // 'principiante' | 'intermedio' | 'avanzado' | 'experto_fpv'
  step4_priority: string; // 'camera' | 'battery' | 'speed' | 'portability'
}

export interface ShippingDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  reference: string; // Referencia o Distrito
}

export type PaymentMethod = "mercadopago" | "card" | "yape" | "plin";

export interface Order {
  id: string;
  items: CartItem[];
  shipping: ShippingDetails;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: "preparing" | "takeoff" | "en_route" | "delivered";
  createdAt: string;
}
