import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default icon issue in Leaflet
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapComponent = ({ locations }) => {
  const defaultCenter = [20.5937, 78.9629]; // Center on India (default)
  const defaultZoom = 5;

  return (
    <div className="h-[calc(100vh-30rem)] relative xl:w-[calc(100vw-80rem)] w-[calc(100vw-6rem)] bg-white border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 rounded-3xl shadow-lg  text-gray-700">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%" }}
        className=" w-full h-full rounded-3xl"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {locations.map((location, index) => (
          <Marker
            key={index}
            position={[location.latitude, location.longitude]}
          >
            <Popup>
              Latitude: {location.latitude} <br />
              Longitude: {location.longitude}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
