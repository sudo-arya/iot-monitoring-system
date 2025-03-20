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
  const [viewMode, setViewMode] = useState("auto"); // "hourly" or "weekly"
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

    let updatedMinValue = minValue;
let updatedMaxValue = maxValue;
let updatedSelectedTime = selectedTime;
let isoDate = selectedDateTime.date; // "2025-03-20T12:01:31.311Z"
// let currentTimestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
let localTimestamp = new Date();
let currentTimestamp = localTimestamp.getFullYear() + "-" +
  String(localTimestamp.getMonth() + 1).padStart(2, '0') + "-" +
  String(localTimestamp.getDate()).padStart(2, '0') + " " +
  String(localTimestamp.getHours()).padStart(2, '0') + ":" +
  String(localTimestamp.getMinutes()).padStart(2, '0') + ":" +
  String(localTimestamp.getSeconds()).padStart(2, '0');

// Convert ISO to JS Date object
let jsDate = new Date(isoDate);

// Create the MySQL timestamp string (YYYY-MM-DD HH:MM:SS)
let mysqlTimestamp = `${jsDate.getFullYear()}-${String(jsDate.getMonth() + 1).padStart(2, '0')}-${String(jsDate.getDate()).padStart(2, '0')} ${String(jsDate.getHours()).padStart(2, '0')}:${String(jsDate.getMinutes()).padStart(2, '0')}:${String(jsDate.getSeconds()).padStart(2, '0')}`;

if (mode==="inactive") {
  updatedMinValue = 0;
  updatedMaxValue = 0;
  updatedSelectedTime = 0;
  mysqlTimestamp = currentTimestamp;
}
else if (viewMode === "manual") {
  updatedMinValue = 0;
  updatedMaxValue = 0;
  if (dateMode==="now") {
    mysqlTimestamp=currentTimestamp
  }

} else if (viewMode === "auto") {
  updatedSelectedTime = 0;
  mysqlTimestamp = currentTimestamp;
}

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
          min_actuator_value: updatedMinValue,
      max_actuator_value: updatedMaxValue,
      time: updatedSelectedTime,
      after: mysqlTimestamp,
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

        {/* top container */}
      <div className=" p-3 border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 rounded-3xl shadow-lg w-[calc(100vw-6rem)]">
      {isLoading ? (
      <p className="text-center text-gray-500">Loading irrigation status...</p>
        ) : actuators.length === 0 ? (
          <p className="text-center text-red-500">No active actuators found for this USER ID</p>
        ) : (
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Currently Running Pumps</h2>
        <div className="mt-2 overflow-x-auto">
          <div className="flex space-x-4">
            {actuators
              .filter((actuator) => actuator.actuator_status === 'active') // Only include active actuators
              .map((actuator) => (
                <div
                  key={actuator.actuator_id}
                  className="p-2 bg-gray-100 rounded-lg shadow-md w-64 flex-shrink-0"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-800">{actuator.actuator_name}</h3>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>Location:</strong> {actuator.actuator_location}</p>
                    {(actuator.min_actuator_value !== 0 || actuator.max_actuator_value !== 0) && (
                    <>
                      {/* {actuator.min_actuator_value !== 0 && ( */}
                        {/* <p><strong>Min Value:</strong> {actuator.min_actuator_value}</p> */}
                      {/* )} */}
                      {/* {actuator.max_actuator_value !== 0 && ( */}
                        {/* <p><strong>Max Value:</strong> {actuator.max_actuator_value}</p> */}

                        <p><strong>Run Automatic when :</strong> {actuator.min_actuator_value}-{actuator.max_actuator_value}</p>
                      {/* )} */}
                    </>
                    )}

                    {actuator.time !== 0 && (
                      <p><strong>Run for:</strong> {actuator.time < 1 ? `${(actuator.time * 60).toFixed(0)} min` : `${Math.floor(actuator.time)} hrs ${((actuator.time - Math.floor(actuator.time)) * 60).toFixed(0)} min`}</p>
                    )}
                    <p><strong>Status:</strong>
                      <span
                        className={`text-sm font-medium px-2 rounded-full ml-2
                          ${actuator.actuator_status === 'active' && 'bg-green-100 text-green-700'}
                          ${actuator.actuator_status === 'inactive' && 'bg-gray-100 text-gray-700'}
                          ${actuator.actuator_status === 'scheduled' && 'bg-blue-100 text-blue-700'}
                          ${actuator.actuator_status === 'completed' && 'bg-purple-100 text-purple-700'}
                          ${actuator.actuator_status === 'cancelled' && 'bg-red-100 text-red-700'}
                        `}
                      >
                        {actuator.actuator_status}
                      </span>
                    </p>

                    <p><strong>Timestamp:</strong> {new Date(actuator.after).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}</p>

                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>


  )}
      </div>

      {/* bottom container */}
      <div className=" h-full mt-1 flex xl:flex-row flex-col">
        {/* first column  */}
        <div className="my-2 xl:mx-">
          {/* map component */}
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
          {/* water pumps selection area */}
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
            {/* list of selectable water pumps */}
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

        {/* second column */}
        <div className="my-2 xl:mx-6 xl:w-[calc(100vw-80rem)] w-[calc(100vw-6rem)]">
          {/* process mode changer */}
          <div className=" h-fit ">
            {selectedActuator ? (
            <div className="p-4 border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 rounded-3xl shadow-lg w-full h-full">
              <h2 className="text-xl font-semibold text-center justify-center flex items-center gap-2">
                {selectedActuator.actuator_name}
                {/* Status Badge */}
                <span className={`text-sm font-medium px-2 py-1 rounded-full
                  ${selectedActuator.actuator_status === 'active' && 'bg-green-100 text-green-700'}
                ${selectedActuator.actuator_status === 'inactive' && 'bg-gray-100 text-gray-700'}
                  ${selectedActuator.actuator_status === 'scheduled' && 'bg-blue-100 text-blue-700'}
                  ${selectedActuator.actuator_status === 'completed' && 'bg-purple-100 text-purple-700'}
                  ${selectedActuator.actuator_status === 'cancelled' && 'bg-red-100 text-red-700'}
                `}>
                  {selectedActuator.actuator_status.charAt(0).toUpperCase() + selectedActuator.actuator_status.slice(1)}
                </span>
              </h2>
              <div className="flex text-center justify-center flex-row xl:flex-row text-white font-semibold text-base mt-3 xl:mt-4">

          {/* auto selector */}
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
          {/* manual selector */}
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

              {/* auto selection view */}
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
  {/* {minValue}/{maxValue} */}
        </div>
              )}

              {/* manual selection view */}
              {viewMode === "manual"&&(
          <div className="flex flex-col ">
          {/* Buttons for selecting 'Now' or 'Other' */}
          <div className="flex text-center justify-center flex-row xl:flex-row text-white font-semibold text-base mt-3">
            {/* now view */}
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
          {/* schedule view */}
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
                {/* <h1>Selected Date and Time: {JSON.stringify(selectedDateTime)}</h1> */}
              </div>
            )}

            {/* Always show TimeSelector */}
            <div className="w-full max-w-md">
            <TimeSelector onTimeChange={handleTimeChange} />
            {/* <div className="mt-4 text-xl">
          Selected Time: {selectedTime < 1 ? `${(selectedTime * 60).toFixed(0)} min` : `${Math.floor(selectedTime)} hrs ${((selectedTime - Math.floor(selectedTime)) * 60).toFixed(0)} min`}
        </div> */}
        {/* {selectedTime} */}
            </div>
          </div>
        </div>

              )}
              {/* Add buttons to control actuator mode */}
              <div className="mt-4 flex gap-1">
                <button
    className="bg-gradient-to-r from-green-400 to-green-600 text-white w-1/2 py-2 rounded-s-3xl shadow hover:from-green-500 hover:to-green-700 transition-all duration-300 ease-in-out"
    onClick={() => {
      // if (viewMode === "auto") {
      //   handleActuatorModeChange("active");
      // }
      if (dateMode === "schedule") {
        handleActuatorModeChange("scheduled");
      }
      else {
        handleActuatorModeChange("active");
      }
    }}
  >
      Activate
                </button>
                <button
      className="bg-gradient-to-l from-red-400 to-red-600 text-white w-1/2 py-2 rounded-e-3xl shadow hover:from-red-500 hover:to-red-700 transition-all duration-300 ease-in-out"
      onClick={() => handleActuatorModeChange("inactive")}
    >
      Deactivate
                </button>
              </div>
            </div>
              ) : (
                <div className="border-2 xl:h-[calc(100vh-36rem)] border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 rounded-3xl shadow-lg w-full h-full text-center justify-center items-center flex bg-gray-200 p-4">Select a Pump from list to make them work.</div>
              )}
          </div>

          {/* upcoming processes container */}
          <div
  className={`xl:h-[calc(100vh-49rem)] h-fit mt-4 p-4 border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 rounded-3xl shadow-lg w-full h-ful ${
    !isLoading && actuators.filter((actuator) => actuator.actuator_status === 'scheduled').length === 0
      ? 'bg-gray-200 flex items-center justify-center'
      : ''
  }`}
>
  {isLoading ? (
    <p className="text-center text-gray-500">Loading irrigation status...</p>
  ) : (
    (() => {
      const scheduledActuators = actuators.filter(
        (actuator) => actuator.actuator_status === 'scheduled'
      );

      if (scheduledActuators.length === 0) {
        return (
          <p className="text-center text-black">
            You don't have any upcoming irrigation processes.
          </p>
        );
      }

      return (
        <div className="w-full">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            Upcoming Irrigation Processes
          </h2>
          <div className="flex flex-col">
            {scheduledActuators.map((actuator) => (
              <div
                key={actuator.actuator_id}
                className="p-3 bg-gray-100 rounded-lg shadow-md w-full"
              >
                <div className="flex items-center justify-between mr-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {actuator.actuator_name}
                  </h3>
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded-full ${
                      actuator.actuator_status === 'scheduled'
                        ? 'bg-blue-100 text-blue-700'
                        : ''
                    }`}
                  >
                    {actuator.actuator_status}
                  </span>
                </div>

                <div className="text-sm text-gray-600 mt-1">
                  <p>
                    <strong>Location:</strong> {actuator.actuator_location}
                  </p>

                  {(actuator.min_actuator_value !== 0 ||
                    actuator.max_actuator_value !== 0) && (
                    <p>
                      <strong>Run Automatic when:</strong>{' '}
                      {actuator.min_actuator_value}-{actuator.max_actuator_value}
                    </p>
                  )}

                  {actuator.time !== 0 && (
                    <p>
                      <strong>Run for:</strong>{' '}
                      {actuator.time < 1
                        ? `${(actuator.time * 60).toFixed(0)} min`
                        : `${Math.floor(actuator.time)} hrs ${(
                            (actuator.time - Math.floor(actuator.time)) *
                            60
                          ).toFixed(0)} min`}
                    </p>
                  )}

                  <p>
                    <strong>Timestamp:</strong>{' '}
                    {new Date(actuator.after).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    })()
  )}
          </div>
        </div>

        {/* third column */}
        <div className="my-2 xl:w-[calc(100vw-80rem)] w-[calc(100vw-6rem)] ">
          <div className="p-4 border-2 xl:h-[calc(100vh-19rem)] h-fit border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 rounded-3xl shadow-lg w-full">
          hii
          </div>
          <div className="h-20 xl:h-0">&nbsp;</div>
        </div>

      </div>
    </div>
  </div>
  );
};

export default Irrigation;
