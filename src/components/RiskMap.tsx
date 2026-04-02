import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Circle, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import { Map as MapIcon, LocateFixed } from "lucide-react";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface RiskMapProps {
  lat: number;
  lon: number;
  riskLevel: "Low" | "Medium" | "High";
  riskScore: number;
}

const riskColors = {
  Low: "#22c55e",
  Medium: "#f59e0b",
  High: "#ef4444",
};

function MapUpdater({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], map.getZoom());
  }, [lat, lon, map]);
  return <Marker position={[lat, lon]} />;
}

function LocateButton() {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  const handleLocate = useCallback(() => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 16, { duration: 1.2 });
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 10000 }
    );
  }, [map]);

  return (
    <button
      onClick={handleLocate}
      className="absolute top-2 right-2 z-[1000] glass-card p-2 rounded-lg hover:bg-white/10 transition-colors"
      title="Center on my location"
    >
      <LocateFixed size={16} className={`text-foreground ${locating ? "animate-pulse" : ""}`} />
    </button>
  );
}

const RiskMap = ({ lat, lon, riskLevel, riskScore }: RiskMapProps) => {
  const color = riskColors[riskLevel];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-glow overflow-hidden"
    >
      <div className="flex items-center gap-2 p-3 pb-0">
        <MapIcon size={14} className="text-muted-foreground" />
        <span className="text-xs font-semibold text-foreground">Live Risk Map</span>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full" style={{ background: color + "30", color }}>
          {riskLevel} Risk Zone
        </span>
      </div>
      <div className="h-72 mt-2 rounded-b-xl overflow-hidden relative">
        <MapContainer
          center={[lat, lon]}
          zoom={15}
          scrollWheelZoom={true}
          zoomControl={true}
          attributionControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <MapUpdater lat={lat} lon={lon} />
          <Circle center={[lat, lon]} radius={2000} pathOptions={{ color, fillColor: color, fillOpacity: 0.15, weight: 1 }} />
          <Circle center={[lat, lon]} radius={500} pathOptions={{ color, fillColor: color, fillOpacity: 0.3, weight: 2 }} />
          <LocateButton />
        </MapContainer>
        <div className="absolute bottom-2 left-2 z-[1000] glass-card px-2 py-1 text-[10px] text-muted-foreground">
          Risk zones based on real-time weather
        </div>
      </div>
    </motion.div>
  );
};

export default RiskMap;
