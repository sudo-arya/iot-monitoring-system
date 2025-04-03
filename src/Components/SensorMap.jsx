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

const MapComponent = ({ locations, setSelectedLocation, setSelectedEsp }) => {
  const [espLocations, setEspLocations] = useState([]);
  const userId = localStorage.getItem("userId");
  const defaultCenter = [20.5937, 78.9629]; // Center on India (default)
  const defaultZoom = 18;
  const [zoom, setZoom] = useState(defaultZoom);

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
          offset={[0, -10]}
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



  useEffect(() => {
    const fetchESPData = async () => {
      if (!userId || !/^\d+$/.test(userId)) {
        console.error("Invalid userId:", userId);
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/esp-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: String(userId) }), // Convert to string
        });

        const data = await response.json();
        console.log("ESP Data received:", data);
        console.log("Sent userId:", userId);

        if (Array.isArray(data)) {
          setEspLocations(data);
        } else {
          setEspLocations([]);
        }
      } catch (error) {
        console.error("Error fetching ESP data:", error);
        setEspLocations([]);
      }
    };

    fetchESPData();
  }, [userId]); // Runs when userId changes



const createTriangleMarker = () =>
  L.divIcon({
    html: `
      <div style="
        width: 0; height: 0;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-bottom: 20px solid blue;
      "></div>`,
    iconAnchor: [10, 20], // Adjust position
    className: "",
  });

  const ESPMarker = ({ esp }) => {
    const markerRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      };
      window.addEventListener("resize", handleResize);
      handleResize();
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleMouseOver = () => {
      if (!isMobile && markerRef.current) {
        markerRef.current.openPopup();
      }
    };

    const handleMouseOut = () => {
      if (!isMobile && markerRef.current) {
        markerRef.current.closePopup();
      }
    };

    const handleClick = () => {
      setSelectedEsp(esp);
    };

    return (
      <Marker
        position={[esp.latitude, esp.longitude]}
        icon={createTriangleMarker()}
        ref={markerRef}
        eventHandlers={{
          mouseover: handleMouseOver,
          mouseout: handleMouseOut,
          click: handleClick,
        }}
      >
        <Tooltip direction="top" offset={[0, -6]} opacity={1} permanent>
          <div className="text-sm">{esp.esp_name}</div>
        </Tooltip>

        <Popup autoPan={true} closeButton={false} className="p-1 m-0 max-w-xs rounded-md">
          <div className="text-sm">
            {/* <p><strong>Lat:</strong> {esp.latitude}<br/> <strong>Long:</strong> {esp.longitude}</p> */}
            <p>Status: {esp.esp_status}</p>
          </div>
        </Popup>
      </Marker>
    );
  };

// zoom handle
  useEffect(() => {
    const updateZoom = () => {
      setZoom(window.innerWidth < 768 ? 17 : defaultZoom); // Use 17 for small screens
    };

    updateZoom(); // Set initial zoom
    window.addEventListener("resize", updateZoom);

    return () => window.removeEventListener("resize", updateZoom);
  }, [defaultZoom]);


  return (
    <div className="p- border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 rounded-3xl shadow-lg w-full xl:h-[calc(100vh-6rem)] h-[calc(100vh-25rem)] z-10">
      <MapContainer
        center={center}
        zoom={zoom}
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
        {/* esp markers  */}
        {espLocations.map((esp, index) => (
          <ESPMarker key={index} esp={esp}  setSelectedEsp={setSelectedEsp} />
        ))}

        <ResetViewButton center={center} zoom={defaultZoom} />
      </MapContainer>
    </div>
  );
};

const MapPage = ({ locations }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedEsp, setSelectedEsp] = useState(null);

  return (
    <div className="my-2 xl:mx-8">
      <div className="relative">
        {/* White Div that will overlap on the MapComponent */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white p-3 underline shadow-lg rounded-md text-center text-xl font-semibold text-gray-700 z-[1000]">
          Select Farm Area
        </div>

        {/* MapComponent below the overlapping white div */}
        <MapComponent
          locations={locations}
          setSelectedLocation={setSelectedLocation}
          setSelectedEsp={setSelectedEsp} // Pass setSelectedEsp to MapComponent
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

         {/* Display selected ESP details */}
         {selectedEsp && (
          <div className="p-4 mt-4 bg-white border rounded-md shadow-md">
            <h3 className="text-xl font-semibold">Selected ESP</h3>
            <p>
              <strong>ESP Name:</strong> {selectedEsp.esp_name}
            </p>
            <p>
              <strong>Status:</strong> {selectedEsp.esp_status}
            </p>
            <p>
              <strong>Coordinates:</strong> Lat: {selectedEsp.latitude}, Long: {selectedEsp.longitude}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Exporting both components
export { MapComponent, MapPage };
