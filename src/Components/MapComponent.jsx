import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default icon issue in Leaflet
// eslint-disable-next-line
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const MapComponent = ({ locations, setSelectedLocation }) => {
  const defaultCenter = [20.5937, 78.9629]; // Center on India (default)
  const defaultZoom = 17;

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

  const MarkerWithPopup = ({ location }) => {
    const markerRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);
    // eslint-disable-next-line
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

    // Handle click to show content in the target div
    const handleClick = () => {
      setSelectedLocation(location); // Use setSelectedLocation to update the parent state
    };

    return (
      <Marker
        position={[location.latitude, location.longitude]}
        icon={createCustomMarker(location.piStatus)}
        ref={markerRef}
        eventHandlers={{
          mouseover: handleMouseOver,
          mouseout: handleMouseOut,
          click: handleClick, // Show content in target div on click
        }}
      >
        {/* Tooltip to show permanent piLocation */}
        <Tooltip
          direction="top"
          className="rounded-3xl"
          offset={[-10, -10]}
          opacity={1}
          permanent
        >
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

  const ResetViewButton = ({ center, zoom }) => {
    const map = useMap();

    const handleResetView = () => {
      map.setView(center, zoom); // Reset the map view to the provided center and zoom
    };

    return (
      <button
        onClick={handleResetView}
        className="absolute left-3 top-[6.5rem] bg-white p-1.5 rounded-md shadow-lg hover:bg-gray-100 border-2 border-gray-400 border-opacity-50 focus:outline-none z-[1000]"
        style={{
          zIndex: 1000, // Ensure it stays above the map layers
        }}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/4024/4024085.png"
          alt="Reset View"
          className="xl:w-4 xl:h-4 w-5 h-5"
        />
      </button>
    );
  };

  return (
    <div className="xl:h-[calc(100vh-42rem)] h-[calc(100vh-24rem)] relative xl:w-[calc(100vw-80rem)] w-[calc(100vw-6rem)] bg-white border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 rounded-3xl shadow-lg text-gray-700 z-10">
      <MapContainer
        center={center}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%" }}
        className="w-full h-full rounded-[1.4rem] scroll-smooth"
        onClick={handleMapClick} // Handle map clicks 
      >
        <TileLayer
          // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // default
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" //green tint one
          // url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" //black
          // url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" //artistic
          // url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" // genuine with satellite view
          // url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"  // cartonistic
          // url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" // google maps
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {locations.map((location, index) => (
          <MarkerWithPopup
            key={index}
            location={location}
            setSelectedLocation={setSelectedLocation} // Pass setSelectedLocation to MarkerWithPopup
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
        <ResetViewButton center={center} zoom={defaultZoom} />
      </MapContainer>
    </div>
  );
};

const MapPage = ({ locations }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <div className="my-2 xl:mx-8">
      <div className="relative">
        {/* White Div that will overlap on the MapComponent */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white p-3 underline shadow-lg rounded-md text-center text-xl font-semibold text-gray-700 z-20">
          Select Farm Area
        </div>

        {/* MapComponent below the overlapping white div */}
        <MapComponent
          locations={locations}
          setSelectedLocation={setSelectedLocation}
        />
      </div>
      <div>
        {/* Target div that will display selected content */}
        {selectedLocation && (
          <div className="p-4 mt-4 bg-white border rounded-md shadow-md">
            <h3 className="text-xl font-semibold">Selected Location</h3>

            <p>
              <strong>Location:</strong> {selectedLocation.piLocation}
            </p>
            <p>
              <strong>Status:</strong> {selectedLocation.piStatus}
            </p>
            <p>
              <strong>Coordinates:</strong> Lat: {selectedLocation.latitude},
              Long: {selectedLocation.longitude}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Exporting both components
export { MapComponent, MapPage };
