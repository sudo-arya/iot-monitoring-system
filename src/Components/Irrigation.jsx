// src/components/SEO.js
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import FloatInput from "./FloatInput";
import DateTimeInput from "./DateTimeInput";
import { MapComponent } from "./MapComponent";
import TimeSelector from "./TimeSelector";

const Irrigation = () => {
   const location = useLocation();
    const [toastMessage, setToastMessage] = useState("");
    const [toastColor, setToastColor] = useState("");
    // eslint-disable-next-line
    const [showLoadingScreen, setShowLoadingScreen] = useState(false);
    // eslint-disable-next-line
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const [actuators, setActuators] = useState([]);
    const [actuatorsList, setActuatorsList] = useState([]);const [selectedActuator, setSelectedActuator] = useState(null); // State to store selected actuator
  const [viewMode, setViewMode] = useState("manual"); // "hourly" or "weekly"
  const [dateMode, setDateMode] = useState("now"); // 'now' or 'other'

  const sseSourceRef = useRef(null);  // Ref to hold the SSE connection
  // eslint-disable-next-line
  const [error, setError] = useState(""); // For error state handling

  const [minValue, setMinValue] = useState(0.0);
  const [maxValue, setMaxValue] = useState(100.0);
  const [selectedTime, setSelectedTime] = useState(0); // State to hold selected time
  const [selectedDateTime, setSelectedDateTime] = useState({
    date: null,
    hours: null,
    minutes: null
  });

  const handleDateTimeChange = (date, hours, minutes) => {
    setSelectedDateTime({
      date,
      hours,
      minutes
    });
  };

  // Callback function to handle time changes
  const handleTimeChange = (newTime) => {
    setSelectedTime(newTime);
  };

  const handleMinChange = (newMin) => {
    setMinValue(newMin);
  };

  const handleMaxChange = (newMax) => {
    setMaxValue(newMax);
  };

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

    const showToast = (message,color) => {
      setToastMessage(message);
      setToastColor(color);
      setTimeout(() => {
        setToastMessage('');
      }, 3000); // Clears the message after 3 seconds
    };


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


  useEffect(() => {
    const fetchActuatorsList = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/get-actuators?user_id=${userId}&pi_id=${selectedLocation?.piId || ''}`
        );
        if (response.ok) {
          const data = await response.json();
          setActuatorsList(data);
        } else {
          setError("Failed to fetch actuators. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching actuators:", error);
        setError("Error fetching actuators.");
      }
      setIsLoading(false);
    };

    if (selectedLocation) {
      setIsLoading(true);
      fetchActuatorsList();
      setSelectedActuator(null);
    }
  }, [userId, selectedLocation]);

  useEffect(() => {
    if (actuatorsList.length === 1) {
      setSelectedActuator(actuatorsList[0]); // Automatically select the single actuator
    }

  }, [actuatorsList]); // Dependency ensures it runs when actuatorsList changes



  // redefined as to use outside too for refetching data after actyivating or deactivating
  const fetchActuatorsList = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/get-actuators?user_id=${userId}&pi_id=${selectedLocation?.piId || ''}`
      );
      if (response.ok) {
        const data = await response.json();
        setActuatorsList(data);
      } else {
        setError("Failed to fetch actuators. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching actuators:", error);
      setError("Error fetching actuators.");
    }
    setIsLoading(false);
  };


  // Add this function to send actuator mode change request
  const handleActuatorModeChange = async (mode) => {
    if (!selectedActuator) {
      setToastMessage("Please select an actuator.");
      setToastColor("bg-red-500");
      return;
    }

    // Check if selectedLocation and its piId are available
    const userId = localStorage.getItem("userId");
    const piId = selectedLocation?.piId || "";

    try {
      const response = await fetch("http://localhost:3000/actuator-mode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actuator_id: selectedActuator.actuator_id,
          user_id: userId, // Include user_id
          pi_id: piId, // Include pi_id
          actuator_status: mode,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        showToast(`Actuator ${mode === "active" ? "activated" : "deactivated"} successfully.`,`${mode === "inactive" ? "bg-red-100 text-red-700 border-red-300" : "bg-green-100"}`);
        //Refetch the actuators list after mode change
        fetchActuatorsList();
      } else {
        showToast(`Failed to change actuator mode.`,`bg-red-100 text-red-700 border-red-300`);
      }
    } catch (error) {
      showToast(`Error connecting to the server.`,`bg-red-100 text-red-700 border-red-300`);

    }
  };



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
      <div className="mt-4 space-y-4">
  {actuators.map((actuator) => (
    <div
      key={actuator.actuator_id}
      className="p-4 bg-gray-100 rounded-lg shadow-md flex flex-wrap items-center justify-between space-y-2 md:space-y-0"
    >
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-gray-800">{actuator.actuator_name}</h3>
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-600">
          <strong>Location:</strong> {actuator.actuator_location}
        </p>
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-600">
          <strong>Min Value:</strong> {actuator.min_actuator_value}
        </p>
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-600">
          <strong>Max Value:</strong> {actuator.max_actuator_value}
        </p>
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-600">
          <strong>Status:</strong> {actuator.actuator_status}
        </p>
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-600">
          <strong>Time:</strong> {actuator.time}
        </p>
      </div>
    </div>
  ))}
</div>

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

          {isLoading ? (
  <p className="text-center text-gray-500">Loading irrigation status...</p>
) : actuatorsList.length === 0 ? (
  <>
    {/* No active actuators found for this location */}
  </>
) : (
  <div className="mt-4">
  <h2 className="text-2xl font-semibold text-gray-800">Available Water Pumps</h2>
  <div className="mt-4 space-y-4">
    {actuatorsList.map((actuator) => (
      <div
        key={actuator.actuator_id}
        className={`p-4  rounded-lg shadow-md flex flex-wrap items-center justify-between space-y-2 md:space-y-0 cursor-pointer ${
          selectedActuator?.actuator_id === actuator.actuator_id
            ? "bg-blue-200"
            : "bg-gray-100"
        }`}
        onClick={() => setSelectedActuator(actuator)} // Set selected actuator on click
      >
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800">
            {actuator.actuator_name}
          </h3>
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600">
            <strong>Location:</strong> {actuator.actuator_location}
          </p>
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600">
            <strong>Status:</strong> {actuator.actuator_status}
          </p>
        </div>
        {/* {selectedActuator} */}
      </div>

    ))}
  </div>
</div>
)}

          </div>

          <div className="my-2 xl:mx-6 xl:h-[calc(100vh-36rem)] h-fit xl:w-[calc(100vw-80rem)] w-[calc(100vw-6rem)]">{selectedActuator ? (
              <div className="p-4 border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 rounded-3xl shadow-lg w-full h-full">
              <h2 className="text-xl font-semibold">{selectedActuator.actuator_name}</h2>
              <p><strong>Location:</strong> {selectedActuator.actuator_location}</p>
              <p><strong>Status:</strong> {selectedActuator.actuator_status}</p>
              {/* <div className="p-6 space-y-4"></div> */}

    <div className="flex text-center justify-center flex-row xl:flex-row text-white font-semibold text-base mt-3 xl:mt-4">
        <div
          className={`flex xl:w-1/3 py-2 xl:px-1 px-4 justify-center items-center xl:hover:bg-gradient-to-r xl:hover:from-gray-500 xl:hover:to-black transition-transform ease-in-out duration-300 cursor-pointer rounded-l-full shodow-2xl  ${
            viewMode === "auto"
              ? "bg-gradient-to-r from-blue-500 to-indigo-500"
              : "bg-gray-400"
          }`}
          onClick={() => setViewMode("auto")}
        >
          <button>Auto Irrigation</button>
        </div>
        <div
          className={`flex xl:w-1/3 py-2 px-1 justify-center xl:hover:bg-gradient-to-r xl:hover:to-gray-500 xl:hover:from-black transition-transform ease-in-out duration-300 cursor-pointer rounded-r-full shadow-2xl ${
            viewMode === "manual"
              ? "bg-gradient-to-r from-blue-500 to-indigo-500"
              : "bg-gray-400"
          }`}
          onClick={() => setViewMode("manual")}
        >
          <button>Manual Irrigation</button>
        </div>
      </div>


      {viewMode === "auto" && (
        <div className="">
        {/* FloatInput controlled by parent */}
        <FloatInput
          minValue={minValue}
          maxValue={maxValue}
          onMinChange={handleMinChange}
          onMaxChange={handleMaxChange}
        />
        {/* You can now use minValue & maxValue here */}

      </div>
      )}



      {viewMode === "manual"&&(
        <div className="flex flex-col ">
        {/* Buttons for selecting 'Now' or 'Other' */}
        <div className="flex text-center justify-center flex-row xl:flex-row text-white font-semibold text-base mt-3">
        <div
          className={`flex xl:w-1/6 py-2 xl:px-1 px-4 justify-center items-center xl:hover:bg-gradient-to-r xl:hover:from-gray-500 xl:hover:to-black transition-transform ease-in-out duration-300 cursor-pointer rounded-l-full shodow-2xl  ${
            dateMode === "now"
              ? "bg-gradient-to-r from-blue-500 to-indigo-500"
              : "bg-gray-400"
          }`}
          onClick={() => setDateMode("now")}
        >
          <button>Now</button>
        </div>
        <div
          className={`flex xl:w-1/6 py-2 px-1 justify-center xl:hover:bg-gradient-to-r xl:hover:to-gray-500 xl:hover:from-black transition-transform ease-in-out duration-300 cursor-pointer rounded-r-full shadow-2xl ${
            dateMode === "schedule"
              ? "bg-gradient-to-r from-blue-500 to-indigo-500"
              : "bg-gray-400"
          }`}
          onClick={() => setDateMode("schedule")}
        >
          <button>Schedule</button>
        </div>
      </div>

        {/* Conditionally render the components */}
        <div className="flex flex-col items-center mt-1">
          {dateMode === "schedule" && (
            <div className="w-full max-w-md">
              <DateTimeInput onDateTimeChange={handleDateTimeChange} />
              <h1>Selected Date and Time: {JSON.stringify(selectedDateTime)}</h1>
            </div>
          )}

          {/* Always show TimeSelector */}
          <div className="w-full max-w-md">
          <TimeSelector onTimeChange={handleTimeChange} />
          {/* <div className="mt-4 text-xl">
        Selected Time: {selectedTime < 1 ? `${(selectedTime * 60).toFixed(0)} min` : `${Math.floor(selectedTime)} hrs ${((selectedTime - Math.floor(selectedTime)) * 60).toFixed(0)} min`}
      </div> */}
          </div>
        </div>
      </div>

      )}
              {/* Add buttons to control actuator mode */}
              <div className="mt-4 flex space-x-4">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600"
                  onClick={() => handleActuatorModeChange("active")}
                >
                  Activate
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600"
                  onClick={() => handleActuatorModeChange("inactive")}
                >
                  Deactivate
                </button>
              </div>
            </div>
            ) : (
              <div className="border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 rounded-3xl shadow-lg w-full h-full text-center justify-center items-center flex bg-gray-200 p-4">Select a actuator from the actuators list to make them work.</div>
            )}</div>



          </div>
</div>
    </div>
  );
};

export default Irrigation;
