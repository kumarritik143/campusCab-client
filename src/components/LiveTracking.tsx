"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import throttle from "lodash.throttle";

// Fix icon warning
delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;

// ICONS
const pickupIcon = new L.Icon({
  iconUrl: "/pickup.png",
  iconSize: [30, 40],
  iconAnchor: [15, 40],
});

const destinationIcon = new L.Icon({
  iconUrl: "/pickup.png",
  iconSize: [30, 40],
  iconAnchor: [15, 40],
});

const createLiveLocationIcon = (minimize: boolean) =>
  new L.Icon({
    iconUrl: "/pickup.png",
    iconSize: minimize ? [15, 15] : [25, 25],
    iconAnchor: [7.5, 7.5],
  });

// TYPES
type LatLng = { lat: number; lng: number };
type Props = {
  pickup?: LatLng | null;
  destination?: LatLng | null;
};

// Recenter once
const RecenterOnDemand = ({
  position,
  trigger,
  onComplete,
}: {
  position: LatLng;
  trigger: boolean;
  onComplete: () => void;
}) => {
  const map = useMap();
  useEffect(() => {
    if (trigger) {
      map.setView([position.lat, position.lng], 15, { animate: true });
      onComplete();
    }
  }, [trigger, position, map, onComplete]);
  return null;
};

// Fit route once
const FitRouteBounds = ({ route }: { route: LatLng[] }) => {
  const map = useMap();
  useEffect(() => {
    if (route.length > 0) {
      const bounds = L.latLngBounds(route.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [route, map]);
  return null;
};

// MAIN
const LiveTracking: React.FC<Props> = ({ pickup, destination }) => {
  const [currentPosition, setCurrentPosition] = useState<LatLng | null>(null);
  const [routePath, setRoutePath] = useState<LatLng[]>([]);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [recenterRequested, setRecenterRequested] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      const throttledUpdate = throttle((lat: number, lng: number) => {
        setCurrentPosition({ lat, lng });
      }, 3000);

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          throttledUpdate(latitude, longitude);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError("Unable to fetch current location.");
        },
        { enableHighAccuracy: true }
      );
      return () => {
        navigator.geolocation.clearWatch(watchId);
        throttledUpdate.cancel();
      };
    }
    setError("Geolocation not supported.");
  }, []);

  
  useEffect(() => {
    if (!pickup || !destination) {
      setRoutePath([]); 
      return;
    }

    setIsRouteLoading(true);
    const token = localStorage.getItem("token");

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/maps/get-route`, {
        params: {
          pickup: `${pickup.lat},${pickup.lng}`,
          destination: `${destination.lat},${destination.lng}`,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setRoutePath(res.data);
      })
      .catch((err) => {
        console.error("Route error:", err);
        setError("Failed to load route.");
      })
      .finally(() => setIsRouteLoading(false));
  }, [pickup, destination]);

  const showMinimizedLiveIcon = !!pickup && !!destination;

  const polylineMemo = useMemo(
    () =>
      routePath.length > 0 && (
        <>
          <Polyline
            positions={routePath}
            pathOptions={{ color: "blue", weight: 5, opacity: 0.8 }}
          />
          <FitRouteBounds route={routePath} />
        </>
      ),
    [routePath]
  );

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (!currentPosition) {
    return (
      <div className="flex items-center justify-center h-screen w-full text-lg">
        Fetching current location...
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {isRouteLoading && (
        <div className="absolute top-4 right-4 bg-white p-2 rounded shadow z-[1000]">
          Fetching route...
        </div>
      )}

      <button
        onClick={() => setRecenterRequested(true)}
        className="absolute bottom-66 right-4 z-[1000] bg-white border border-gray-300 w-10 h-10 flex items-center justify-center rounded-full shadow hover:bg-gray-100"
        title="My Location"
      >
        📍
      </button>

      <MapContainer
        center={[currentPosition.lat, currentPosition.lng]}
        zoom={15}
        scrollWheelZoom
        style={{ width: "100%", height: "100vh" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Live marker */}
        <Marker
          position={[currentPosition.lat, currentPosition.lng]}
          icon={createLiveLocationIcon(showMinimizedLiveIcon)}
        >
          <Popup>You are here</Popup>
        </Marker>

        {/* Pickup/Destination */}
        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
            <Popup>Pickup</Popup>
          </Marker>
        )}
        {destination && (
          <Marker
            position={[destination.lat, destination.lng]}
            icon={destinationIcon}
          >
            <Popup>Destination</Popup>
          </Marker>
        )}

        {/* Route path */}
        {polylineMemo}

        {/* Recenter on button click */}
        <RecenterOnDemand
          position={currentPosition}
          trigger={recenterRequested}
          onComplete={() => setRecenterRequested(false)}
        />
      </MapContainer>
    </div>
  );
};

export default LiveTracking;
