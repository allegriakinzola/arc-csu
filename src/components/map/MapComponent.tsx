"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapMarker } from "./MapContainer";

// Fix pour les icônes Leaflet avec Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const essIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const epvgIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface MapComponentProps {
  markers: MapMarker[];
  center: [number, number];
  zoom: number;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (lat: number, lng: number) => void;
  selectedPosition?: [number, number] | null;
}

function MapClickHandler({
  onMapClick,
}: {
  onMapClick?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function MapComponent({
  markers,
  center,
  zoom,
  onMarkerClick,
  onMapClick,
  selectedPosition,
}: MapComponentProps) {
  const getIcon = (marker: MapMarker) => {
    if (marker.type === "ESS") return essIcon;
    if (marker.type === "EPVG") return epvgIcon;
    return defaultIcon;
  };

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onMapClick={onMapClick} />

      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.latitude, marker.longitude]}
          icon={getIcon(marker)}
          eventHandlers={{
            click: () => onMarkerClick?.(marker),
          }}
        >
          <Popup>
            <div className="min-w-[200px]">
              <h3 className="font-semibold text-sm">{marker.title}</h3>
              {marker.description && (
                <p className="text-xs text-gray-600 mt-1">{marker.description}</p>
              )}
              {marker.type && (
                <span
                  className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full ${
                    marker.type === "ESS"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {marker.type}
                </span>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {selectedPosition && (
        <Marker position={selectedPosition} icon={selectedIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-medium">Position sélectionnée</p>
              <p className="text-xs text-gray-600">
                Lat: {selectedPosition[0].toFixed(6)}
                <br />
                Lng: {selectedPosition[1].toFixed(6)}
              </p>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
