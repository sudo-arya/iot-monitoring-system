import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";

// Fix default icon issue in Leaflet
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const MapComponent = ({ locations }) => {
  const defaultCenter = [20.5937, 78.9629]; // Center on India (default)
  const defaultZoom = 13;
  const navigate = useNavigate();

  const [popupPosition, setPopupPosition] = useState(null); // Track popup position

  const getCenter = (locations) => {
    if (locations.length === 0) return defaultCenter;
    const avgLat =
      locations.reduce((sum, loc) => sum + loc.latitude, 0) / locations.length;
    const avgLon =
      locations.reduce((sum, loc) => sum + loc.longitude, 0) / locations.length;
    return [avgLat, avgLon];
  };

  const center = getCenter(locations);

  const getMarkerColorClass = (status) => {
    return status === "active" ? "bg-green-500" : "bg-red-500";
  };

  const createCustomMarker = (status) =>
    L.divIcon({
      html: `<div class="rounded-full ${getMarkerColorClass(
        status
      )} w-6 h-6 border-2 border-white"></div>`,
      iconAnchor: [12, 12],
      className: "",
    });

  const MarkerWithPopup = ({ location, onMarkerClick }) => {
    const markerRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);
    const [popupOpen, setPopupOpen] = useState(false); // Track popup visibility

    // Update isMobile state based on screen size
    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768); // Mobile breakpoint (768px or less)
      };
      window.addEventListener("resize", handleResize);
      handleResize(); // Initialize the check on component mount
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Hover events to show and hide popup
    const handleMouseOver = () => {
      if (!isMobile && markerRef.current) {
        markerRef.current.openPopup();
        setPopupOpen(true); // Open popup on hover
      }
    };

    const handleMouseOut = () => {
      if (!isMobile && markerRef.current) {
        markerRef.current.closePopup();
        setPopupOpen(false); // Close popup on mouse out
      }
    };

    // Handle click to open popup
    const handleClick = () => {
      if (markerRef.current) {
        markerRef.current.openPopup();
        setPopupOpen(true); // Open popup on click
      }
      onMarkerClick(location.piId); // Notify parent component of the click
    };

    return (
      <Marker
        position={[location.latitude, location.longitude]}
        icon={createCustomMarker(location.piStatus)}
        ref={markerRef}
        eventHandlers={{
          mouseover: handleMouseOver,
          mouseout: handleMouseOut,
          click: handleClick, // Show popup on click
        }}
      >
        {/* Tooltip to show permanent piLocation */}
        <Tooltip direction="top" className="rounded-3xl" offset={[-10, -10]} opacity={1} permanent>
          <div className="text-sm">{location.piLocation}</div>
        </Tooltip>

        {/* Popup to show details */}
        <Popup
          autoPan={true}
          closeButton={false}
          className={`${
            isMobile ? "flex" : "block"
          } p-2 m-0 max-w-xs rounded-md`}
        >
          <div className="text-sm">
            <p className="font-semibold">{location.piLocation}</p>
            <p>Status: {location.piStatus}</p>
          </div>
        </Popup>
      </Marker>
    );
  };

  const handleMapClick = (e) => {
    setPopupPosition(e.latlng); // Set the popup position to where the map was clicked
  };

  const handlePopupClose = () => {
    setPopupPosition(null); // Close the popup
  };

  return (
    <div className="h-[calc(100vh-34rem)] relative xl:w-[calc(100vw-80rem)] w-[calc(100vw-6rem)] bg-white border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 rounded-3xl shadow-lg text-gray-700 z-10">
      <MapContainer
        center={center}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%" }}
        className="w-full h-full rounded-3xl"
        onClick={handleMapClick} // Handle map clicks
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          className="bg-black h-20 top-0"
        />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {locations.map((location, index) => (
          <MarkerWithPopup
            key={index}
            location={location}
            onMarkerClick={(piId) => navigate(`/piId/${piId}`)} // Pass the click handler to each marker
          />
        ))}
        {/* Popup to show when clicking anywhere on the map */}
        {popupPosition && (
          <Popup position={popupPosition} onClose={handlePopupClose}>
            <div className="text-sm">
              <p>Map Clicked Here!</p>
              <p>
                Lat: {popupPosition.lat}, Long: {popupPosition.lng}
              </p>
            </div>
          </Popup>
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
