"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-muted rounded-lg">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
});

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  type?: "ESS" | "EPVG";
  popup?: React.ReactNode;
}

interface MapContainerProps {
  markers?: MapMarker[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (lat: number, lng: number) => void;
  selectedPosition?: [number, number] | null;
}

export default function MapContainer({
  markers = [],
  center = [-4.4419, 15.2663], // Kinshasa par défaut
  zoom = 12,
  height = "400px",
  onMarkerClick,
  onMapClick,
  selectedPosition,
}: MapContainerProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        className="w-full flex items-center justify-center bg-muted rounded-lg"
        style={{ height }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full rounded-lg overflow-hidden border">
      <MapComponent
        markers={markers}
        center={center}
        zoom={zoom}
        onMarkerClick={onMarkerClick}
        onMapClick={onMapClick}
        selectedPosition={selectedPosition}
      />
    </div>
  );
}
