// src/components/SEO.js
import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";
import Sidebar from "./Sidebar";
import SensorDataDisplay from "./SensorDataDisplay";

const Logging = () => {
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
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "timestamp", direction: "desc" });
  const [searchTermLog, setSearchTermLog] = useState("");
  const [sortConfigLog, setSortConfigLog] = useState({ key: "timestamp", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [data, setData] = useState([]);

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

  const fetchSensorData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:3000/get-selected-sensor-data", {
        params: { user_id: userId, sensor_id: selectedSensorId },
      });
      setSensorData(response.data);
    } catch (error) {
      console.error("Error fetching sensor data:", error);
      setSensorData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId && selectedSensorId) {
      fetchSensorData();
    }
  }, [userId, selectedSensorId]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);


  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "text-green-600 bg-green-100";
      case "inactive":
        return "text-yellow-600 bg-yellow-100";
      case "error":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const sortedData = [...sensorData]
    .filter((entry) =>
      new Date(entry.timestamp).toLocaleString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.sensor_status.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (sortConfig.direction === "asc") return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    // logs
    useEffect(() => {
      const fetchLogsAndActuators = async () => {
        try {
          setIsLoading(true);
          const response = await axios.post("http://localhost:3000/get-logs", {
            userId,
          });
          setData(response.data.data);
        } catch (err) {
          setError("Failed to fetch data");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };

      if (userId) fetchLogsAndActuators();
    }, [userId]);

    const handleSortLog = (key) => {
      setSortConfigLog((prev) => ({
        key,
        direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
      }));
    };

    const filteredAndSortedDataLog = useMemo(() => {
      let filtered = data.filter((entry) => {
        const timeMatch = new Date(entry.timestamp).toLocaleString().toLowerCase().includes(searchTermLog.toLowerCase());
        const statusMatch = entry.status?.toLowerCase().includes(searchTermLog.toLowerCase());
        return timeMatch || statusMatch;
      });

      if (sortConfigLog.key) {
        filtered.sort((a, b) => {
          let aVal = a[sortConfigLog.key];
          let bVal = b[sortConfigLog.key];

          if (sortConfigLog.key === "timestamp") {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
          }

          if (aVal < bVal) return sortConfigLog.direction === "asc" ? -1 : 1;
          if (aVal > bVal) return sortConfigLog.direction === "asc" ? 1 : -1;
          return 0;
        });
      }

      return filtered;
    }, [data, searchTermLog, sortConfigLog]);

  return (
    <div className="w-full h-full flex">
      <div className="w-full h-full flex">
        <Sidebar />
      </div>

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

        {/* logging component */}
        <div className="flex flex-col md:flex-row md:space-x-4">
          {/* first column  */}
          <div className="xl:w-6/12 w-[calc(100vw-6rem)] xl:h-[calc(100vh-6rem)] mt-4 xl:mt-0">
            {/* sensor selection  */}
            <div className="flex flex-wrap justify-center xl:p-6 p-1 gap-2">
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
            {/* {selectedSensorType && (
                  <div className="bg-white p-4 rounded shadow-lg max-w-md mx-auto mt-10">
                    <h2 className="text-lg font-bold text-gray-800 mb-2">{selectedSensorType}</h2>
                    <p className="text-gray-600">
                      Sensor Count: {sensorDataMap[selectedSensorType]?.length || 0}
                    </p>
                  </div>
                )} */}

                {/* sensor data in tabular format  */}
              <div className="p-3 border-2 border-indigo-500 rounded-3xl shadow-lg w-full bg-white mt-4 max-h-[400px] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Sensor Data</h2>

                {/* Search input */}
                <input
                  type="text"
                  placeholder="Search by time or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-3 p-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />

                {/* Sort buttons */}
                <div className="flex gap-4 mb-3">
                  <button
                    onClick={() => handleSort("timestamp")}
                    className="px-3 py-1 text-sm rounded-md bg-indigo-100 hover:bg-indigo-200"
                  >
                    Sort by Timestamp {sortConfig.key === "timestamp" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </button>
                  <button
                    onClick={() => handleSort("sensor_value")}
                    className="px-3 py-1 text-sm rounded-md bg-indigo-100 hover:bg-indigo-200"
                  >
                    Sort by Value {sortConfig.key === "sensor_value" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </button>
                </div>

                {!selectedSensorId ? (
                  <div className="text-gray-500 mt-4">Please select a sensor to view its data.</div>
                ) : isLoading ? (
                  <div className="text-gray-500">Loading data...</div>
                ) : sortedData.length === 0 ? (
                  <div className="text-red-500">No data available for this sensor.</div>
                ) : (
                  <>
                  <div className="w-full">
                    {/* Table Header - for xl and above */}
                    <div className="hidden xl:grid grid-cols-4 bg-indigo-200 font-semibold text-sm text-gray-800 sticky top-0 z-10 rounded-t-md">
                      <div className="p-2 border-r cursor-pointer hover:bg-indigo-300" onClick={() => handleSort("timestamp")}>
                        Timestamp {sortConfig.key === "timestamp" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </div>
                      <div className="p-2 border-r cursor-pointer hover:bg-indigo-300" onClick={() => handleSort("sensor_value")}>
                        Value {sortConfig.key === "sensor_value" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </div>
                      <div className="p-2 border-r">Unit</div>
                      <div className="p-2">Status</div>
                    </div>

                    {/* Table Rows - for xl and above */}
                    <div className="hidden xl:block text-sm">
                      {sortedData.map((entry) => (
                        <div
                          key={entry.sensor_data_id}
                          className="grid grid-cols-4 border-t border-gray-200 hover:bg-gray-50 transition"
                        >
                          <div className="p-2 border-r">{new Date(entry.timestamp).toLocaleString()}</div>
                          <div className="p-2 border-r">{entry.sensor_value}</div>
                          <div className="p-2 border-r">{entry.sensor_unit}</div>
                          <div className="p-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(entry.sensor_status)}`}>
                              {entry.sensor_status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Responsive Cards - for smaller screens */}
                    <div className="xl:hidden space-y-2 text-sm">
                      {sortedData.map((entry) => (
                        <div
                          key={entry.sensor_data_id}
                          className="border rounded-md p-4 bg-white shadow-sm"
                        >
                          <div className="flex justify-between mb-2">
                            <span className="font-semibold text-gray-700">Timestamp</span>
                            <span>{new Date(entry.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="font-semibold text-gray-700">Value</span>
                            <span>{entry.sensor_value}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="font-semibold text-gray-700">Unit</span>
                            <span>{entry.sensor_unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-semibold text-gray-700">Status</span>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(entry.sensor_status)}`}>
                              {entry.sensor_status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
                )}
              </div>

              {/* sensor data in graph format  */}
            {selectedLocation ? (
              <SensorDataDisplay
                selectedLocation={selectedLocation}
                userId={userId}
                selectedSensorId={selectedLocation.sensorId}
              />
            ) : (
              <div className="overflow-x-auto shadow-lg rounded-3xl border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 xl:h-[calc(100vh-28rem)] h-[calc(100vh-24rem)] relative xl:w-full w-[calc(100vw-6rem)] text-center justify-center items-center flex bg-gray-200 mt-4">
                Select a location from the map to see available sensors.
              </div>
            )}
          </div>

          {/* second column  */}
          <div className="w-full md:w-6/12 xl:h-[calc(100vh-6rem)] mt-4 xl:mt-0">
          <div className="p-3 border-2 border-indigo-500 rounded-3xl shadow-lg w-full bg-white mt- xl:h-[calc(100vh-6rem)] overflow-y-auto ">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">User Logs & Actuator Data</h2>

      {/* Search input */}
      <input
        type="text"
        placeholder="Search by time or status..."
        value={searchTermLog}
        onChange={(e) => setSearchTermLog(e.target.value)}
        className="mb-3 p-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />

      {/* Sort buttons */}
      <div className="flex gap-4 mb-3">
        <button
          onClick={() => handleSortLog("timestamp")}
          className="px-3 py-1 text-sm rounded-md bg-indigo-100 hover:bg-indigo-200"
        >
          Sort by Timestamp {sortConfigLog.key === "timestamp" && (sortConfigLog.direction === "asc" ? "↑" : "↓")}
        </button>
        <button
          onClick={() => handleSortLog("sensor_value")}
          className="px-3 py-1 text-sm rounded-md bg-indigo-100 hover:bg-indigo-200"
        >
          Sort by Value {sortConfigLog.key === "sensor_value" && (sortConfigLog.direction === "asc" ? "↑" : "↓")}
        </button>
      </div>

      {/* Table header */}
      <div className="hidden xl:grid grid-cols-4 bg-indigo-200 font-semibold text-sm text-gray-800 sticky top-0 z-10 rounded-t-md">
        <div className="p-2 border-r">Type & ID</div>
        <div className="p-2 border-r">Timestamp</div>
        <div className="p-2 border-r">Details</div>
        <div className="p-2">Info</div>
      </div>

      {/* Table rows */}
      <div className="hidden xl:block text-sm">
        {filteredAndSortedDataLog.map((entry, index) => (
          <div
            key={index}
            className={`grid grid-cols-4 border-t border-gray-200 hover:bg-gray-50 transition ${
              entry.source === "log" ? "bg-blue-50" : "bg-white"
            }`}
          >
            <div className="p-2 border-r font-medium text-gray-700">
              {entry.source === "log" ? "Log" : "Actuator"} #{entry.id}
            </div>
            <div className="p-2 border-r text-gray-600">
              {new Date(entry.timestamp).toLocaleString()}
            </div>
            <div className="p-2 border-r text-gray-700">
              {entry.source === "log" ? (
                <span><strong>Message:</strong> {entry.message}</span>
              ) : (
                <span>{entry.actuator_name}</span>
              )}
            </div>
            <div className="p-2 text-gray-700 space-y-1">
              {entry.source === "log" ? (
                <span>-</span>
              ) : (
                <>
                  <p>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(entry.status)}`}>
                      {entry.status}
                    </span>
                  </p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Card layout for small screens */}
      <div className="xl:hidden space-y-2 text-sm max-h-[450px]">
        {filteredAndSortedDataLog.map((entry, index) => (
          <div
            key={index}
            className="border rounded-md p-4 bg-white shadow-sm"
          >
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-700">
                {entry.source === "log" ? "Log" : "Actuator"} #{entry.id}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(entry.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="text-gray-700 space-y-1">
              {entry.source === "log" ? (
                <p><strong>Message:</strong> {entry.message}</p>
              ) : (
                <>
                  <p><strong>Actuator:</strong> {entry.actuator_name}</p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(entry.status)}`}>
                      {entry.status}
                    </span>
                  </p>
                  <p><strong>Sensor:</strong> {entry.sensor_name}</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default Logging;
