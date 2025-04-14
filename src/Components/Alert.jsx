// src/components/SEO.js
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import FloatInput from "./FloatInput";
import DisplayAlert from "./DisplayAlert";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaTimesCircle,
  FaBell,
  FaPlusCircle,
} from 'react-icons/fa';
import { Trash2 } from "lucide-react"; // using Lucide icons

const Alert = () => {
  // eslint-disable-next-line
  const location = useLocation();
  const userId = localStorage.getItem("userId");
  // eslint-disable-next-line
  const [sensorData, setSensorData] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState("bg-green-200");
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line
  const [error, setError] = useState("");
  const [sensorList, setSensorList] = useState([]);
  // eslint-disable-next-line
  const [sensorDataMap, setSensorDataMap] = useState({});
  const [selectedSensorType, setSelectedSensorType] = useState(null);
  const [selectedSensorId, setSelectedSensorId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [minValue, setMinValue] = useState(0.0);
  const [maxValue, setMaxValue] = useState(100.0);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
      if (toastMessage) {
        const timer = setTimeout(() => setToastMessage(""), 3000);
        return () => clearTimeout(timer);
      }
    }, [toastMessage]);

    useEffect(() => {
      if (!userId) return;

      const fetchSensors = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/get-all-sensors?user_id=${userId}`);
          const sensors = Array.isArray(response.data) ? response.data : [];
          setSensorList(sensors);

          const dataMap = {};
          sensors.forEach(({ sensor_id, sensor_name }) => {
            if (!dataMap[sensor_name]) dataMap[sensor_name] = [];
            dataMap[sensor_name].push({ sensor_id });
          });
          setSensorDataMap(dataMap);
        } catch (err) {
          console.error("Error fetching sensor list:", err);
          setError("Failed to fetch sensors");
        }
      };

      fetchSensors();
    }, [userId]);



    const handleSensorTypeSelect = (sensorName, sensorId) => {
      setSelectedSensorType(sensorName);
      setSelectedSensorId(sensorId);

      // Find the selected sensor in sensorList to extract its pi_id
      const selectedSensor = sensorList.find(sensor => sensor.sensor_id === sensorId);
      if (selectedSensor) {
        setSelectedLocation({ piId: selectedSensor.pi_id,sensorId: selectedSensor.sensor_id });  // Save Pi ID
      }

      console.log("Selected sensor type:", sensorName, "with ID:", sensorId);
    };

    const handleMinChange = (newMin) => {
      setMinValue(newMin);
    };

    const handleMaxChange = (newMax) => {
      setMaxValue(newMax);
    };
    // useEffect(() => {
    //   console.log("Alert component mounted");
    // }, []);


    // alert sse component code
    useEffect(() => {
      if (!userId) return;

      const eventSource = new EventSource(`http://localhost:5000/get-live-alerts?user_id=${userId}`);

      eventSource.onmessage = (event) => {
        try {
          const alertData = JSON.parse(event.data);

          if (Array.isArray(alertData)) {
            // Replace entire alert list with the latest snapshot
            setAlerts(alertData);
          } else {
            console.log('Received unexpected alert format:', alertData);
          }
        } catch (err) {
          console.error('Failed to parse SSE data:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.error('SSE connection error:', err);
        eventSource.close(); // Optional: you can implement retry logic here
      };

      return () => {
        eventSource.close();
      };
    }, [userId]);



    const formatTimestamp = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        day: '2-digit',
        month: 'short',
      });
    };

    const getStatusIcon = (status) => {
      switch (status?.toLowerCase()) {
        case 'created':
          return <FaPlusCircle className="text-blue-500" />; // icon for 'created'
        case 'resolved':
          return <FaCheckCircle className="text-green-500" />;
        case 'warning':
          return <FaExclamationCircle className="text-yellow-500" />;
        case 'critical':
          return <FaTimesCircle className="text-red-500" />;
        case 'unresolved':
          return <FaExclamationCircle className="text-orange-500" />;
        case 'alert':
          return <FaBell className="text-pink-500" />; // if 'alert' is a valid status
        default:
          return <FaExclamationCircle className="text-gray-400" />;
      }
    };

    const handleDelete = async (userId, sensorId) => {
      console.log("Trying to delete alert for userId:", userId, "sensorId:", sensorId);

      try {
        const res = await fetch(
          `http://localhost:3000/delete-alert?user_id=${userId}&sensor_id=${sensorId}`,
          {
            method: 'DELETE',
          }
        );

        const data = await res.json();
        console.log("Delete response:", data);

        if (data.success) {
          setAlerts((prev) =>
            prev.filter(alert => !(alert.sensor_id === sensorId && alert.user_id === userId))
          );
          setToastColor("bg-green-200");
          setToastMessage("Alert deleted successfully!");
        } else {
          setToastColor("bg-red-200");
          setToastMessage("Failed to delete alert: " + data.message);
        }
      } catch (error) {
        console.error("Error deleting alert:", error);
        setToastColor("bg-red-200");
        setToastMessage("Error deleting alert.");
      }
    };







  return (
    <div className=" w-full h-full flex">
      <div className="w-full h-full flex">
        <Sidebar />
      </div>
      {/* Alert */}
      <div className="absolute xl:w-[calc(100vw-6rem)] h-full my-20 ml-20 flex xl:flex-col flex-col px-">

        {/* Toast Notification */}
        {toastMessage && (
          <div className={`fixed xl:right-6 xl:top-2 right-2 top-2 text-xl rounded-xl border p-3 px-6 z-50 ${toastColor}`}>
            {toastMessage}
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50 z-40">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-white h-20 w-20 animate-spin"></div>
          </div>
        )}

        {/* alert and management component  */}
          <div className="flex flex-col md:flex-row md:space-x-4">
            {/* first column  */}
            <div className="md:w-6/12 xl:h-[calc(100vh-6rem)]">

            {/* created alerts  */}
            <div className="xl:w-full  w-[calc(100vw-6rem)]  mt-4">
              <h2 className="text-3xl font-semibold mb-4 text-gray-800">Created Alerts :-</h2>
              <div className="overflow-x-auto shadow-md rounded-lg border border-indigo-500 xl:h-[calc(100vh-40rem)] h-[calc(100vh-30rem)] overflow-y-auto">

                {/* Header for xl and above */}
                <div className="hidden xl:grid grid-cols-7 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-sm sticky top-0 z-10">
                  <div className="px-4 py-2">Alert Type</div>
                  <div className="px-4 py-2">Created For</div>
                  <div className="px-4 py-2">Status</div>
                  <div className="px-4 py-2">Timestamp</div>
                  <div className="px-4 py-2">Min Value</div>
                  <div className="px-4 py-2">Max Value</div>
                  <div className="px-4 py-2 text-center">Delete</div>
                </div>

                {/* Rows for xl and above */}
                <div className="hidden xl:block text-sm">
                  {alerts.map((alert, index) => (
                    <div key={index} className="grid grid-cols-7 border-t border-gray-200 hover:bg-gray-50 transition">
                      <div className="px-4 py-2 text-gray-800">{alert.alert_type}</div>
                      <div className="px-4 py-2 text-gray-800">{alert.sensor_name}</div>
                      <div className="px-4 py-2 text-gray-800 flex items-center gap-1">
                        {getStatusIcon(alert.alert_status)} {alert.alert_status}
                      </div>
                      <div className="px-4 py-2 text-gray-800">{formatTimestamp(alert.timestamp)}</div>
                      <div className="px-4 py-2 text-gray-800">{alert.min_actuator_value}</div>
                      <div className="px-4 py-2 text-gray-800">{alert.max_actuator_value}</div>
                      <div className="px-4 py-2 flex justify-center">
                      <button onClick={() => handleDelete(userId, alert.sensor_id)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={18} />
                      </button>

                      </div>
                    </div>
                  ))}
                </div>


                {/* Responsive cards for smaller screens */}
                <div className="xl:hidden space-y-2 text-sm p-2">
                  {alerts.map((alert, index) => (
                    <div key={index} className="border rounded-md p-4 bg-white shadow-sm">
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold text-gray-700">Alert Type</span>
                        <span>{alert.alert_type}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold text-gray-700">Created For</span>
                        <span>{alert.sensor_name}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold text-gray-700">Status</span>
                        <span className="flex items-center gap-1">{getStatusIcon(alert.alert_status)} {alert.alert_status}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold text-gray-700">Timestamp</span>
                        <span>{formatTimestamp(alert.timestamp)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold text-gray-700">Min Value</span>
                        <span>{alert.min_actuator_value}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold text-gray-700">Max Value</span>
                        <span>{alert.max_actuator_value}</span>
                      </div>
                      <div className="flex justify-end mt-2">
                        <button onClick={() => handleDelete(userId, alert.sensor_id)} className="text-red-600 hover:text-red-800">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empty message */}
                {alerts.length === 0 && (
                  <div className="text-center text-sm text-gray-500 py-4">No alerts to display.</div>
                )}
              </div>
            </div>


            {/* shows Alerts that happen  */}
            <DisplayAlert userId={userId} />
            </div>

            {/* second column  */}
            <div className="xl:w-6/12   w-[calc(100vw-6rem)] xl:h-[calc(100vh-6rem)] mt-4 xl:mt-0">
              {/* sensor selection  */}
            <div className="flex flex-wrap justify-center xl:p-6 p-1 mb-6 gap-2 xl:mb-40">
              {sensorList.map((sensor, index) => (
                <button
                  type="button"
                  key={sensor.sensor_id}
                  onClick={() =>
                    handleSensorTypeSelect(sensor.sensor_type, sensor.sensor_id)
                  }
                  className={`py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 shadow-md hover:scale-105
                    ${
                      selectedSensorId === sensor.sensor_id
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white ring-2 ring-indigo-300"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                  {sensor.sensor_type}
                </button>
              ))}
            </div>
            {/* Optional: Sensor Info */}
            {/* {selectedSensorType && (
                  <div className="bg-white p-4 rounded shadow-lg max-w-md mx-auto mt-10">
                    <h2 className="text-lg font-bold text-gray-800 mb-2">{selectedSensorType}</h2>
                    <p className="text-gray-600">
                      Sensor Count: {sensorDataMap[selectedSensorType]?.length || 0}<br/>
                      {selectedLocation.piId}
                    </p>
                  </div>
                )} */}


              {selectedSensorType && (
                <div className="p-3 border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 rounded-3xl shadow-lg w-full xl:h-[calc(100vh-40rem)] h-[calc(100vh-28rem)] text-center justify-center items-center flex flex-col xl:p-6 mb-6 gap-2 xl:mb-40">
                {/* FloatInput controlled by parent */}
                  <FloatInput user_id={userId} pi_id={selectedLocation?.piId}
                    // key={viewMode} // Forces re-render when viewMode changes
                    selectedLocation={selectedLocation}
                    selectedSensorType={selectedSensorType}
                    minValue={minValue}
                    maxValue={maxValue}
                    onMinChange={handleMinChange}
                    onMaxChange={handleMaxChange}
                    onSensorChange={handleSensorTypeSelect}  /* Passing the callback */
                  />

                  {/* Add buttons to control actuator mode */}
                  <div className="mt-4 flex gap-1">

                    <button
                      disabled={!selectedLocation.sensorId}
                      type="button"
                      className="bg-gradient-to-b from-green-400 to-green-600 text-white w-full xl:w-60 px-8 mx-auto py-2 rounded-3xl shadow hover:from-green-500 hover:to-green-700 transition-all duration-300 ease-in-out"
                      onClick={async () => {

                        try {
                          setIsLoading(true);
                          const response = await axios.post("http://localhost:3000/create-alert", {
                            user_id: userId,
                            sensor_id: selectedLocation.sensorId,
                            min_actuator_value: minValue,
                            max_actuator_value: maxValue,
                          });

                          setToastMessage(response.data.message || "Alert created successfully");
                          setToastColor("bg-green-200");
                        } catch (err) {
                          console.error("Error creating alert:", err);
                          setToastMessage("Failed to create alert");
                          setToastColor("bg-red-300");
                        } finally {
                          setIsLoading(false);
                        }
                      }}

                    >
                        Create Alert
                    </button>
                    {/* {userId}<br/>{selectedLocation.sensorId}<br/>{minValue}<br/>{maxValue} */}
                  </div>
                </div>
              )}

              {!selectedSensorType && (
                <div className="p-3 border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 rounded-3xl shadow-lg w-full xl:h-[calc(100vh-40rem)] h-[calc(100vh-36rem)] text-center justify-center items-center flex flex-col xl:p-6 mb-6 gap-2 xl:mb-40 bg-gray-200">
                  Select a sensor to create an alert for it.
                </div>
              )}

            </div>
          </div>
        </div>
    </div>
  );
};

export default Alert;
