import { useState, useCallback, useMemo } from "react";
import { Order } from "../types";

export function useOrderTracking(initialStatus: Order["status"] = "preparing") {
  const [status, setStatus] = useState<Order["status"]>(initialStatus);

  const statusSequence: Order["status"][] = ["preparing", "takeoff", "en_route", "delivered"];

  const advanceTracking = useCallback(() => {
    setStatus((prev) => {
      const currentIndex = statusSequence.indexOf(prev);
      if (currentIndex < statusSequence.length - 1) {
        return statusSequence[currentIndex + 1];
      }
      return prev;
    });
  }, []);

  const resetTracking = useCallback(() => {
    setStatus("preparing");
  }, []);

  const jumpToStatus = useCallback((targetStatus: Order["status"]) => {
    setStatus(targetStatus);
  }, []);

  // Compute mock telemetry values based on status
  const telemetry = useMemo(() => {
    switch (status) {
      case "preparing":
        return {
          altitude: "0m (En hangar)",
          speed: "0 km/h",
          battery: "100%",
          coordinates: "Lat: -12.0945° • Long: -77.0189°",
          eta: "Entrega programada para hoy"
        };
      case "takeoff":
        return {
          altitude: "12m (Ascendiendo)",
          speed: "15 km/h",
          battery: "99%",
          coordinates: "Lat: -12.0942° • Long: -77.0191°",
          eta: "Despeje exitoso - Hoy a las 4:35 PM"
        };
      case "en_route":
        return {
          altitude: "85m (Vuelo de flete)",
          speed: "68 km/h",
          battery: "76%",
          coordinates: "Lat: -12.0911° • Long: -77.0254°",
          eta: "En camino - Hoy a las 4:35 PM"
        };
      case "delivered":
        return {
          altitude: "0m (Aterrizaje seguro)",
          speed: "0 km/h",
          battery: "48%",
          coordinates: "Lat: -12.0832° • Long: -77.0345°",
          eta: "¡Entregado con éxito en tu jardín!"
        };
      default:
        return {
          altitude: "---",
          speed: "---",
          battery: "---",
          coordinates: "---",
          eta: "---"
        };
    }
  }, [status]);

  return {
    status,
    advanceTracking,
    resetTracking,
    jumpToStatus,
    telemetry,
    isDelivered: status === "delivered",
    progressPercent: (statusSequence.indexOf(status) / (statusSequence.length - 1)) * 100
  };
}
