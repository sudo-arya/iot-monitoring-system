// src/components/SEO.js
import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";


const Alert = () => {
  const location = useLocation();
  const userId = localStorage.getItem("userId");
  const [sensorData, setSensorData] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState("bg-green-200");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sensorList, setSensorList] = useState([]);
  const [sensorDataMap, setSensorDataMap] = useState({});
  const [selectedSensorType, setSelectedSensorType] = useState(null);
  const [selectedSensorId, setSelectedSensorId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

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


  return (
    <div className=" w-full min-h-screen flex bg-gray-100">
      <Sidebar />
      {/* Alert */}
      <div className="absolute xl:w-[calc(100vw-6rem)] h-full my-20 ml-20 flex xl:flex-col flex-col px-4">

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
            <div className="w-full md:w-6/12 xl:h-[calc(100vh-6rem)] mt-4 xl:mt-0">
              {/* sensor selection  */}
            <div className="flex flex-wrap gap-2">
              {sensorList.map((sensor, index) => (
                <button
                  key={sensor.sensor_id}
                  onClick={() =>
                    handleSensorTypeSelect(sensor.sensor_type, sensor.sensor_id)
                  }
                  className={`py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 shadow-md hover:scale-105
                    ${
                      selectedSensorType === sensor.sensor_type
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white ring-2 ring-indigo-300"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                  {sensor.sensor_type}
                </button>
              ))}
            </div>
            {/* Optional: Sensor Info */}
            {selectedSensorType && (
                  <div className="bg-white p-4 rounded shadow-lg max-w-md mx-auto mt-10">
                    <h2 className="text-lg font-bold text-gray-800 mb-2">{selectedSensorType}</h2>
                    <p className="text-gray-600">
                      Sensor Count: {sensorDataMap[selectedSensorType]?.length || 0}
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
    </div>
  );
};

export default Alert;
