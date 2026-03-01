import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function LiveMap() {
  const mapRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([20.5937, 78.9629], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(mapRef.current);
    }

    const loadVehicles = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/vehicles/live');
        const vehicles = await res.json();

        if (!Array.isArray(vehicles)) return;

        vehicles.forEach((v) => {
          if (!v?.lat || !v?.lng) return;

          const id = v._id;
          const popup = `
            <strong>${v.vehicleNumber}</strong><br>
            Driver: ${v.driverName}<br>
            Speed: ${v.speed} km/h<br>
            Fuel: ${v.fuel || 0}%
          `;

          const color = {
            running: '#10b981',
            idle: '#f59e0b',
            stopped: '#ef4444',
          }[v.status?.toLowerCase()] || '#999';

          const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:3px solid white;"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          if (!markersRef.current[id]) {
            markersRef.current[id] = L.marker([v.lat, v.lng], { icon })
              .addTo(mapRef.current)
              .bindPopup(popup);
          } else {
            markersRef.current[id]
              .setLatLng([v.lat, v.lng])
              .setIcon(icon)
              .getPopup()
              ?.setContent(popup);
          }
        });
      } catch (err) {
        console.error('Failed to load live vehicles', err);
      }
    };

    loadVehicles();
    const interval = setInterval(loadVehicles, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="map-container">
      <div className="section-header">
        <h3>Live Fleet Map</h3>
        <button className="expand-btn">
          <i className="fas fa-expand"></i> Full View
        </button>
      </div>
      <div id="map" style={{ height: '400px', borderRadius: '8px' }}></div>
    </div>
  );
}