// src/components/SEO.js
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { MapComponent } from "./MapComponent";


const Irrigation = () => {
   const location = useLocation();
    const [toastMessage, setToastMessage] = useState("");
    const [toastColor, setToastColor] = useState("");
    // eslint-disable-next-line
    const [showLoadingScreen, setShowLoadingScreen] = useState(false);
    // eslint-disable-next-line
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const [actuators, setActuators] = useState([]);
  const sseSourceRef = useRef(null);  // Ref to hold the SSE connection
  const [error, setError] = useState(""); // For error state handling

    useEffect(() => {
      if (location.state?.toastMessage) {
        setToastMessage(location.state.toastMessage);
        setToastColor(location.state.toastColor);

        // Clear the toast message after 3 seconds
        const timer = setTimeout(() => {
          setToastMessage("");
        }, 3000);

        // Clear location.state to prevent reappearing on refresh
        window.history.replaceState({}, document.title);

        return () => clearTimeout(timer); // Cleanup timer
      }
    }, [location.state]);

    const userId = localStorage.getItem("userId");
    console.log("User ID:", userId);
    const locations = JSON.parse(localStorage.getItem("locations")) || [];
     const [selectedLocation, setSelectedLocation] = useState(null); // State to store selected marker data
      // Update selected location when a marker is clicked
  const handleMarkerClick = (location) => {
    setSelectedLocation(location); // Set the selected location in the parent
  };



  useEffect(() => {
    const eventSource = new EventSource(
      `http://localhost:5000/current-irrigation-status?user_id=${userId}`
    );

    // Event handler for receiving SSE data
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Data received from SSE:", data); // Debugging
        if (Array.isArray(data)) {
          setActuators(data); // Update state with actuators data
        } else {
          setError("Invalid data format received.");
        }
      } catch (err) {
        console.error("Error parsing actuator data:", err); // Debugging
        setError("Error parsing actuator data.");
      }
      setIsLoading(false); // Hide loading state when data is received
    };

    // Event handler for errors in SSE connection
    eventSource.onerror = () => {
      setError("Error connecting to the server.");
      eventSource.close(); // Close connection on error
    };

    // Store event source in the ref for cleanup on unmount
    sseSourceRef.current = eventSource;

    // Cleanup the EventSource when the component unmounts
    return () => {
      sseSourceRef.current?.close();
    };
  }, [userId]); // Dependency array to trigger effect when userId changes




  return (
    <div className="w-full h-full flex  ">
      <div className="w-full h-full flex">
        <Sidebar />
      </div>
      <div className="absolute w-[calc(100vw-6rem)] h-full mt-16 ml-20 flex xl:flex-col flex-col">
        {toastMessage && (
          <div
            className={`toast-top ${toastColor} p-2 px-10 my-20 fixed text-xl rounded-xl xl:right-6 xl:top-2 top-0 right-2 text-green-700 border-green-300 border`}
          >
            {toastMessage}
          </div>
        )}

        {isLoading && ( // Display loading component when isLoading is true
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-24 w-24"></div>
          </div>
        )}
      {/* Irrigation<br/><br/> */}


      <div className="my-2 p-4 border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 rounded-3xl shadow-lg w-[calc(100vw-6rem)]">
      {isLoading ? (
    <p className="text-center text-gray-500">Loading irrigation status...</p>
  ) : actuators.length === 0 ? (
    <p className="text-center text-red-500">No active actuators found for this USER ID</p>
  ) : (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800">Active Water Pumps</h2>
      <ul className="mt-4 space-y-4">
        {actuators.map((actuator) => (
          <li key={actuator.actuator_id} className="p-4 bg-gray-100 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800">{actuator.actuator_name}</h3>
            <p className="text-sm text-gray-600">Location: {actuator.actuator_location}</p>
            <p className="text-sm text-gray-600">Min Value: {actuator.min_actuator_value}</p>
            <p className="text-sm text-gray-600">Max Value: {actuator.max_actuator_value}</p>
            <p className="text-sm text-gray-600">status: {actuator.actuator_status}</p>
            <p className="text-sm text-gray-600">Time: {actuator.time}</p>
          </li>
        ))}
      </ul>
    </div>
  )}
</div>
<div className=" h-full mt-1 flex xl:flex-row flex-col">

      <div className="my-2 xl:mx-">
      <div className=" relative">
            {/* White Div that will overlap on the MapComponent */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white p-3 underline shadow-lg rounded-md text-center text-sm xl:text-xl font-semibold text-gray-700 z-20">
              Select Farm Area
            </div>
            {/* MapComponent below the overlapping white div */}
            <MapComponent
              locations={locations}
              onMarkerClick={handleMarkerClick}
              setSelectedLocation={setSelectedLocation} // Pass the setSelectedLocation function as a prop
            />{" "}
          </div>
          <div className="xl:w-full w-[calc(100vw-6rem)] mt-4  ">
            {selectedLocation ? (
              <div className="p-4 border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 rounded-3xl shadow-lg w-full h-full">
                <h2 className="text-xl font-semibold">
                  {selectedLocation.piLocation}
                </h2>
                <p>Status: {selectedLocation.piStatus}</p>
                {/* <p>ID: {selectedLocation.piId}</p> */}
                <p>
                  {/* Coordinates: {selectedLocation.latitude},{" "}
                  {selectedLocation.longitude} */}
                </p>
              </div>
            ) : (
              <div className="border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 rounded-3xl shadow-lg w-full h-full text-center justify-center items-center flex bg-gray-200 p-4">Select a location from the map to see details here.</div>
            )}
          </div>
          </div>
          </div>
</div>
    </div>
  );
};

export default Irrigation;
