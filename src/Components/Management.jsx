// src/components/SEO.js
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { MapComponent } from "./SensorMap";
import axios from "axios";
import { CheckCircle, XCircle, MinusCircle, MapPin, Network, ClipboardCopy } from "lucide-react";



const Management = () => {
  const location = useLocation();
  const userId = localStorage.getItem("userId");
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // For error state handling
  const locations = JSON.parse(localStorage.getItem("locations")) || [];
  const [selectedLocation, setSelectedLocation] = useState(null); // State to store selected marker data
  const [selectedEsp, setSelectedEsp] = useState(null);
  const [viewMode, setViewMode] = useState(null);
  const [espData, setEspData] = useState([]);
  const [actuatorData, setActuatorData] = useState([]);
  const [sensorData, setSensorData] = useState([]);
  const [espDevices, setEspDevices] = useState([]);
  const [piDevices, setPiDevices] = useState([]);
  const [gatewayData, setGatewayData] = useState([]);


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

  // Automatically update viewMode when selectedLocation or selectedEsp changes
  useEffect(() => {
    if (selectedLocation) {
      setViewMode("pi");
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (selectedEsp) {
      setViewMode("esp");
    }
  }, [selectedEsp]);

   // Update selected location when a marker is clicked
   const handleMarkerClick = (location) => {
    setSelectedLocation(location); // Set the selected location in the parent
    setViewMode("pi"); // Automatically switch to Pi view
  };


  // fetching data from backend
    // Fetch ESP Data
    useEffect(() => {
      if (!userId) return;
      setIsLoading(true); // Set loading state before fetching

      axios
        .get(`http://localhost:3000/get-all-esp?user_id=${userId}`)
        .then((response) => {
          setEspDevices(response.data);
          // console.log(response.data);
        })
        .catch((error) => {
          setError("Failed to fetch ESP devices.");
          console.error("Error fetching ESP data:", error);
        })
        .finally(() => {
          setIsLoading(false); // Ensure loading state resets
        });

    }, [userId]);

  // Fetch Actuator Data
  useEffect(() => {
    if (viewMode === "pump") {
      const fetchAllActuators = async () => {
        try {
          const user_id = localStorage.getItem("userId");
          const response = await axios.get("http://localhost:3000/get-all-actuators", {
            params: { user_id },
          });
          setActuatorData(response.data);
          // console.log(response.data);
        } catch (error) {
          console.error("Error fetching actuators:", error);
        }
      };

      fetchAllActuators();
    }
  }, [viewMode]);

  // Fetch Sensor Data
useEffect(() => {
  if (viewMode === "sensor" && userId) {
    const fetchSensorData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/get-all-sensors", {
          params: { user_id: userId },
        });

        setSensorData(response.data || []); // Ensure sensorData is always an array
        console.log("Fetched Sensor Data:", response.data);
      } catch (error) {
        console.error("Error fetching sensor data:", error);
      }
    };

    fetchSensorData();
  }
}, [viewMode, userId]); // Runs when viewMode or userId changes

// fetch pi data
useEffect(() => {
  if (viewMode === "pi" && userId) {
    setIsLoading(true);

    axios
      .get("http://localhost:3000/get-all-pi", {
        params: { user_id: userId },
      })
      .then((response) => {
        setPiDevices(response.data || []);
        console.log("Fetched Pi Data:", response.data);
      })
      .catch((error) => {
        console.error("Error fetching Pi data:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }
}, [viewMode, userId]);


// fetch gateway data
useEffect(() => {
  if (!userId) return;

  const fetchGatewayData = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/get-gateway-data?user_id=${userId}`);
      setGatewayData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching data");
    } finally {
      setIsLoading(false);
    }
  };

  fetchGatewayData();
}, [userId]);

const GatewayStatusCard = ({ gateway }) => {
  return (
    <div className="p-4 border rounded-xl shadow-md bg-white w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b pb-2">
        <h3 className="text-lg font-semibold text-gray-700 w-full sm:w-auto">
          Gateway ID: {gateway.gateway_id}
        </h3>

        <p className="flex items-center w-full sm:w-auto mt-2 sm:mt-0">
          <MapPin className="mr-2 text-blue-500" size={18} />
          <span className="font-medium">{gateway.gateway_location}</span>
        </p>

        <p className="flex items-center w-full sm:w-auto mt-2 sm:mt-0">
          <Network className="mr-2 text-indigo-500" size={18} />
          <span className="font-medium">{gateway.network_type}</span>
        </p>

        <div className="mt-2 sm:mt-0">
          {gateway.gateway_status === "active" ? (
            <CheckCircle className="text-green-600" size={24} />
          ) : gateway.gateway_status === "error" ? (
            <XCircle className="text-red-600" size={24} />
          ) : (
            <MinusCircle className="text-gray-600" size={24} />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-gray-600">
        <p>
          <strong>Status:</strong>
          <span className={`ml-2 px-2 py-1 rounded-full text-sm inline-block
            ${gateway.gateway_status === "active" ? "bg-green-100 text-green-700" :
              gateway.gateway_status === "inactive" ? "bg-gray-100 text-gray-700" :
              gateway.gateway_status === "scheduled" ? "bg-blue-100 text-blue-700" :
              gateway.gateway_status === "completed" ? "bg-purple-100 text-purple-700" :
              gateway.gateway_status === "error" ? "bg-red-100 text-red-700" :
              "bg-yellow-100 text-yellow-700"}`}>
            {gateway.gateway_status.charAt(0).toUpperCase() + gateway.gateway_status.slice(1)}
          </span>
        </p>

        <p className="flex items-center flex-wrap">
          <span className="mr-2">IP Address:</span>
          <span className="bg-gray-100 px-2 py-1 rounded text-sm">{gateway.ip_address}</span>
          <ClipboardCopy
            className="ml-2 cursor-pointer hover:text-blue-600"
            size={16}
            onClick={() => navigator.clipboard.writeText(gateway.ip_address)}
          />
        </p>

        <p className="text-sm text-gray-500">
          Last Updated: <span className="font-semibold">{new Date(gateway.updated_at).toLocaleString()}</span>
        </p>
      </div>
    </div>
  );
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
        {/* Managemnt<br/><br/> */}
        <div className="flex flex-col md:flex-row md:space-x-4">
          {/* First Column */}
          <div className="w-full md:w-5/12 xl:h-[calc(100vh-6rem)] z-20">
          <div className=" relative">
            {/* White Div that will overlap on the MapComponent */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white p-3 underline shadow-lg rounded-md text-center text-sm xl:text-xl font-semibold text-gray-700 z-[1000]">
              Select Pi/Esp to see there status
            </div>
            {/* MapComponent below the overlapping white div */}
            <MapComponent
              locations={locations}
              onMarkerClick={handleMarkerClick}
              setSelectedLocation={setSelectedLocation} // Pass the setSelectedLocation function as a prop
              setSelectedEsp={setSelectedEsp} // Pass setSelectedEsp to MapComponent
            />{" "}
          </div>

          </div>

          {/* Second Column */}
          <div className="p-3 border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 rounded-3xl shadow-lg w-full md:w-7/12 xl:h-[calc(100vh-6rem)] mt-4 xl:mt-0">

          {/* gateway data  */}
          <div className="flex flex-wrap justify-center gap-4 xl:p-6 p-1 mb-6 xl:mb-0">
            {gatewayData.map((gateway) => (
              <GatewayStatusCard key={gateway.gateway_id} gateway={gateway} />
            ))}
          </div>

          {/* select tab  */}
          <div className="flex text-center justify-center flex-row xl:flex-row text-white font-semibold text-base">
            <div
              className={`flex xl:w-1/6 py-2 xl:px-1 px-4 justify-center items-center xl:hover:bg-gradient-to-r xl:hover:from-gray-500 xl:hover:to-black transition-transform ease-in-out duration-300 cursor-pointer rounded-l-full shodow-2xl  ${
                viewMode === "pi"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                  : "bg-gray-400"
              }`}
              onClick={() => setViewMode("pi")}
            >
              <button>Pi's</button>
            </div>

            <div
              className={`flex xl:w-1/6 py-2 px-1 justify-center xl:hover:bg-gradient-to-b xl:hover:to-gray-500 xl:hover:from-black transition-transform ease-in-out duration-300 cursor-pointer shadow-2xl ${
                viewMode === "esp"
                  ? "bg-gradient-to-b from-blue-500 to-indigo-500"
                  : "bg-gray-400"
              }`}
              onClick={() => setViewMode("esp")}
            >
              <button>Esp's</button>
            </div>

            <div
              className={`flex xl:w-1/6 py-2 xl:px-1 px-4 justify-center items-center xl:hover:bg-gradient-to-b xl:hover:to-gray-500 xl:hover:from-black transition-transform ease-in-out duration-300 cursor-pointer shodow-2xl  ${
                viewMode === "pump"
                  ? "bg-gradient-to-b from-blue-500 to-indigo-500"
                  : "bg-gray-400"
              }`}
              onClick={() => setViewMode("pump")}
            >
              <button>Water Pump</button>
            </div>

            <div
              className={`flex xl:w-1/6 py-2 px-1 justify-center xl:hover:bg-gradient-to-b xl:hover:to-gray-500 xl:hover:from-black transition-transform ease-in-out duration-300 cursor-pointer shadow-2xl ${
                viewMode === "sensor"
                  ? "bg-gradient-to-b from-blue-500 to-indigo-500"
                  : "bg-gray-400"
              }`}
              onClick={() => setViewMode("sensor")}
            >
              <button>Sensor's</button>
            </div>

            <div
              className={`flex xl:w-1/6 py-2 px-1 justify-center xl:hover:bg-gradient-to-r xl:hover:to-gray-500 xl:hover:from-black transition-transform ease-in-out duration-300 cursor-pointer rounded-r-full shadow-2xl ${
                viewMode === "actuator"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                  : "bg-gray-400"
              }`}
              onClick={() => setViewMode("actuator")}
            >
              <button>Actuator's</button>
            </div>
          </div>

          {/* Selected tab data */}
          <div className="xl:p-6 p-1 mt-6 xl:mt-0">
          {viewMode === null && (
            <div className="p-3 border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 rounded-3xl shadow-lg w-full h-96 bg-gray-200 text-center justify-center flex items-center mt-4 xl:mt-0">
              Select a device or sensor to view its information
            </div>
          )}

              {viewMode === "pi" && (
                <div>
                  {piDevices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {piDevices.map((pi) => (
                        <div key={pi.pi_id} className="p-4 border rounded-lg shadow-md bg-white">
                          <h3 className="text-lg font-semibold">{pi.pi_location}</h3>
                          <h3 className="text-base text-gray-700 font-semibold">{pi.pi_name}</h3>

                          <p><strong>ID:</strong>
                            <span className="ml-2 px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                              {pi.pi_id}
                            </span>
                          </p>

                          <p><strong>Status:</strong>
                            <span className={`ml-2 px-2 py-1 rounded-full text-sm
                              ${pi.pi_status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                              {pi.pi_status.charAt(0).toUpperCase() + pi.pi_status.slice(1)}
                            </span>
                          </p>

                          <p><strong>Created At:</strong> {new Date(pi.created_at).toLocaleString()}</p>
                          <p><strong>Updated At:</strong> {new Date(pi.updated_at).toLocaleString()}</p>

                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">No Pi devices found.</p>
                  )}
                </div>
              )}
              {viewMode === "esp" && (
    <div>
      {espDevices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {espDevices.map((device) => (
            <div key={device.esp_id} className="p-4 border rounded-lg shadow-md bg-white">
              <h3 className="text-lg font-semibold">{device.esp_name}</h3>

              <p><strong>Id:</strong>
                <span className="ml-2 px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                  {device.esp_id}
                </span>
              </p>

              <p><strong>Status:</strong>
                <span className={`ml-2 px-2 py-1 rounded-full text-sm
                  ${device.esp_status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                  {device.esp_status.charAt(0).toUpperCase() + device.esp_status.slice(1)}
                </span>
              </p>

              {/* Display Created At Timestamp */}
              <p><strong>Created At:</strong> {new Date(device.created_at).toLocaleString()}</p>

              {/* Display Updated At Timestamp */}
              <p><strong>Updated At:</strong> {new Date(device.updated_at).toLocaleString()}</p>

              {/* Uncomment to show coordinates if required */}
              {/* <p><strong>Coordinates:</strong> Lat: {device.latitude}, Long: {device.longitude}</p> */}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">No ESP devices found.</p>
      )}
    </div>
              )}
              {viewMode === "pump" && (
                <div>
                  {actuatorData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {actuatorData.map((actuator) => (
                        <div key={actuator.actuator_id} className="p-4 border rounded-lg shadow-md bg-white">
                          <h3 className="text-lg font-semibold">{actuator.actuator_name}</h3>
                          <p><strong>Location:</strong> {actuator.actuator_location}</p>

                          <p><strong>Status:</strong>
                            <span className={`ml-2 px-2 py-1 rounded-full text-sm
                              ${actuator.actuator_status === "active" ? "bg-green-100 text-green-700" :
                                actuator.actuator_status === "inactive" ? "bg-gray-100 text-gray-700" :
                                actuator.actuator_status === "scheduled" ? "bg-blue-100 text-blue-700" :
                                actuator.actuator_status === "completed" ? "bg-purple-100 text-purple-700" :
                                "bg-red-100 text-red-700"}`}>
                              {actuator.actuator_status.charAt(0).toUpperCase() + actuator.actuator_status.slice(1)}
                            </span>
                          </p>

                          {/* Show Min-Max Values only when min !== 0 or max !== 0 */}
                          {(actuator.min_actuator_value !== 0 || actuator.max_actuator_value !== 0) && (
                            <p><strong>Run Automatic when:</strong> {actuator.sensor_name} ({actuator.min_actuator_value}-{actuator.max_actuator_value})</p>
                          )}

                          {/* Show Time only when time !== 0 */}
                          {actuator.time !== 0 && (
                            <p><strong>Time:</strong> {actuator.time < 1
                              ? `${(actuator.time * 60).toFixed(0)} min`
                              : `${Math.floor(actuator.time)} hrs ${((actuator.time - Math.floor(actuator.time)) * 60).toFixed(0)} min`}
                            </p>
                          )}

                          {/* Show "After" Date & Time if the actuator status is "scheduled" */}
                          {actuator.actuator_status === "scheduled" && actuator.after && (
                            <p><strong>After:</strong> {new Date(actuator.after).toLocaleString()}</p>
                          )}

                          <p><strong>Updated At:</strong> {new Date(actuator.updated_at).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center">No actuators found.</p>
                  )}
                </div>
              )}
              {viewMode === "sensor" && (
                <div>
                  {sensorData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sensorData.map((sensor) => (
                        <div key={sensor.sensor_id} className="p-4 border rounded-lg shadow-md bg-white">
                          <h3 className="text-lg font-semibold">{sensor.sensor_type} ({sensor.sensor_unit})</h3>
                          {/* <p><strong>Value:</strong> {sensor.value} {sensor.sensor_unit}</p> */}

                          {/* Show Min-Max Values only when min !== 0 or max !== 0 */}
                          {(sensor.min_sensor_value !== 0 || sensor.max_sensor_value !== 0) && (
                            <p><strong>Min-Max Range:</strong> {sensor.min_sensor_value}-{sensor.max_sensor_value} {sensor.sensor_unit}</p>
                          )}

                          <p><strong>Status:</strong>
                            <span className={`ml-2 px-2 py-1 rounded-full text-sm
                              ${sensor.sensor_status === "active" ? "bg-green-100 text-green-700" :
                                "bg-gray-100 text-gray-700"}`}>
                              {sensor.sensor_status.charAt(0).toUpperCase() + sensor.sensor_status.slice(1)}
                            </span>
                          </p>
                          <p><strong>Pi ID:</strong> {sensor.pi_id}</p>
                          <p><strong>Timestamp:</strong> {new Date(sensor.updated_at).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center">No sensor data available.</p>
                  )}
                </div>
              )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Management;
