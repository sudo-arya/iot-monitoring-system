// src/components/Control.js
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";

const Control = () => {
  const location = useLocation();
  const userId = localStorage.getItem("userId");

  const [sensorList, setSensorList] = useState([]);
  const [actuators, setActuators] = useState([]);
  const [espDevices, setEspDevices] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState("bg-green-200");
  const [actions, setActions] = useState([]);

  // Selections
  const [selectedSensorType, setSelectedSensorType] = useState(null);
  const [selectedSensorId, setSelectedSensorId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedActuatorId, setSelectedActuatorId] = useState(null);
  const [selectedEspId, setSelectedEspId] = useState(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [actuatorRes, sensorRes, espRes] = await Promise.all([
          axios.get('http://localhost:3000/get-actuator-summary', { params: { user_id: userId } }),
          axios.get('http://localhost:3000/get-all-sensors', { params: { user_id: userId } }),
          axios.get('http://localhost:3000/get-esp-summary', { params: { user_id: userId } }),
        ]);

        setActuators(actuatorRes.data.actuators || []);
        setSensorList(sensorRes.data || []);
        setEspDevices(espRes.data.espDevices || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Selection handlers
  const handleSensorTypeSelect = (sensorName, sensorId) => {
    setSelectedSensorType(sensorName);
    setSelectedSensorId(sensorId);
    setSelectedLocation(sensorList.find(s => s.sensor_id === sensorId));
    setSelectedActuatorId(null);
    setSelectedEspId(null);
  };

  const handleActuatorSelect = (actuatorId) => {
    setSelectedActuatorId(actuatorId);
    setSelectedSensorType(null);
    setSelectedSensorId(null);
    setSelectedLocation(null);
    setSelectedEspId(null);
  };

  const handleEspSelect = (espId) => {
    setSelectedEspId(espId);
    setSelectedSensorType(null);
    setSelectedSensorId(null);
    setSelectedLocation(null);
    setSelectedActuatorId(null);
  };

  const selectedEsp = espDevices.find(esp => esp.esp_id === selectedEspId);
  const selectedActuator = actuators.find(a => a.actuator_id === selectedActuatorId);

  useEffect(() => {
    if (!userId) return;

    const eventSource = new EventSource(`http://localhost:3000/get-live-actions?user_id=${userId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setActions(data);
      } catch (err) {
        console.error("Error parsing SSE data:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [userId]);

  return (
    <div className="w-full h-full flex">
      <Sidebar />

      <div className="absolute xl:w-[calc(100vw-6rem)] h-full my-20 ml-20 flex flex-col px-4">
        {/* Toast Notification */}
        {toastMessage && (
          <div className={`fixed xl:right-6 xl:top-2 right-2 top-2 text-xl rounded-xl border p-3 px-6 z-50 ${toastColor}`}>
            {toastMessage}
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex justify-center items-center h-full text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : (
          <div className="flex flex-col md:flex-row md:space-x-4 p-3 border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 rounded-3xl shadow-lg">
            {/* Sensor Selection */}
            <div className="md:w-1/3 p-4">
              <h2 className="text-xl font-bold mb-1 text-center">Select Sensor</h2>
              <div className="w-1/4 flex mx-auto h-px bg-gray-300 mb-4" />
              <div className="flex flex-wrap justify-center gap-2">
                {sensorList.map(sensor => (
                  <button
                    key={sensor.sensor_id}
                    onClick={() => handleSensorTypeSelect(sensor.sensor_type, sensor.sensor_id)}
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
            </div>

            {/* Actuator Selection */}
            <div className="md:w-1/3 p-4">
              <h2 className="text-xl font-bold mb-1 text-center">Select Actuator</h2>
              <div className="w-1/4 flex mx-auto h-px bg-gray-300 mb-4" />
              <div className="flex flex-wrap justify-center gap-2">
                {actuators.map(actuator => (
                  <button
                    key={actuator.actuator_id}
                    onClick={() => handleActuatorSelect(actuator.actuator_id)}
                    className={`py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 shadow-md hover:scale-105
                      ${
                        selectedActuatorId === actuator.actuator_id
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white ring-2 ring-emerald-300"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                  >
                    {actuator.actuator_name}
                  </button>
                ))}
              </div>
            </div>

            {/* ESP Selection */}
            <div className="md:w-1/3 p-4">
              <h2 className="text-xl font-bold mb-1 text-center">Select ESP Device</h2>
              <div className="w-1/4 flex mx-auto h-px bg-gray-300 mb-4" />
              <div className="flex flex-wrap justify-center gap-2">
                {espDevices.map(esp => (
                  <button
                    key={esp.esp_id}
                    onClick={() => handleEspSelect(esp.esp_id)}
                    className={`py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 shadow-md hover:scale-105
                      ${
                        selectedEspId === esp.esp_id
                          ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white ring-2 ring-indigo-300"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                  >
                    {esp.esp_name || `ESP ${esp.esp_id}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

<div className="flex flex-col md:flex-row md:space-x-4">
  {/* first column - Selected Device Details */}
  <div className="p- xl:w-6/12 w-[calc(100vw-6rem)] xl:h-[calc(100vh-30rem)] mt-4 xl:mt-4 flex justify-center items-center text-center border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 rounded-3xl shadow-lg">
    <div className="w-full h-full flex flex-col justify-center items-center">


      {/* No device selected */}
      {!(selectedSensorId || selectedActuatorId || selectedEspId) ? (
        <>
        <div className="bg-gray-200 text-black w-full h-full flex justify-center items-center rounded-3xl p- text-lg font-mediu shadow-inner">
          Select a device to reboot it.
        </div>
        </>
      ) : (
        // Device selected
        <div className="w-full max-w-md mx-auto  p-6 text-sm">
  <h2 className="text-3xl font-bold mb-1 text-center">Selected Device Details</h2>
  <div className="w-1/2 flex mx-auto h-px bg-gray-300 mb-4" />
  <div className="grid grid-cols-2 gap-y-1 items-stretch text-center text-lg">
    {selectedSensorId ? (
      <>
        <span className="font-semibold text-gray-700 text-right mr-2">Type -</span>
        <span className="text-left">Sensor</span>

        <span className="font-semibold text-gray-700 text-right mr-2">Name -</span>
        <span className="text-left">{selectedSensorType}</span>

        <span className="font-semibold text-gray-700 text-right mr-2">Sensor ID -</span>
        <span className="text-left">{selectedSensorId}</span>

        <span className="font-semibold text-gray-700 text-right mr-2">Esp ID -</span>
        <span className="text-left">{selectedLocation?.esp_id || 'N/A'}</span>

        <span className="font-semibold text-gray-700 text-right mr-2">Pi ID -</span>
        <span className="text-left">{selectedLocation?.pi_id || 'N/A'}</span>
      </>
    ) : selectedActuatorId ? (
      <>
        <span className="font-semibold text-gray-700 text-right mr-2">Type -</span>
        <span className="text-left">Actuator</span>

        <span className="font-semibold text-gray-700 text-right mr-2">Name -</span>
        <span className="text-left">{selectedActuator?.actuator_name}</span>

        <span className="font-semibold text-gray-700 text-right mr-2">Actuator ID -</span>
        <span className="text-left">{selectedActuator?.actuator_id}</span>

        <span className="font-semibold text-gray-700 text-right mr-2">ESP ID -</span>
        <span className="text-left">{selectedActuator?.esp_id}</span>

        <span className="font-semibold text-gray-700 text-right mr-2">Pi ID -</span>
        <span className="text-left">{selectedActuator?.pi_id}</span>
      </>
    ) : (
      <>
        <span className="font-semibold text-gray-700 text-right mr-2">Type -</span>
        <span className="text-left">ESP Device</span>

        <span className="font-semibold text-gray-700 text-right mr-2">Name -</span>
        <span className="text-left">{selectedEsp?.esp_name || `ESP ${selectedEsp?.esp_id}`}</span>

        <span className="font-semibold text-gray-700 text-right mr-2">ESP ID -</span>
        <span className="text-left">{selectedEsp?.esp_id}</span>

        <span className="font-semibold text-gray-700 text-right mr-2">IP Address -</span>
        <span className="text-left">{selectedEsp?.ip_address || 'N/A'}</span>

        <span className="font-semibold text-gray-700 text-right mr-2">Pi ID -</span>
        <span className="text-left">{selectedEsp?.pi_id || 'N/A'}</span>
      </>
    )}
  </div>
  <div className="w-full flex justify-center mt-4">
  <button
    className="bg-gradient-to-b from-red-400 to-red-600 text-white w-full xl:w-72 px-8 mx-auto py-2 rounded-3xl shadow hover:from-red-500 hover:to-red-700 transition-all duration-300 ease-in-out text-lg"
    onClick={async () => {
      const user_id = userId; // Replace this with your user ID source
      const pi_id = selectedSensorId
        ? selectedLocation?.pi_id
        : selectedActuatorId
        ? selectedActuator?.pi_id
        : selectedEsp?.pi_id;

      const esp_id = selectedSensorId
        ? selectedLocation?.esp_id
        : selectedActuatorId
        ? selectedActuator?.esp_id
        : selectedEsp?.esp_id;

      const device_name = selectedSensorId
        ? selectedSensorType
        : selectedActuatorId
        ? selectedActuator?.actuator_name
        : selectedEsp?.esp_name || `ESP ${selectedEsp?.esp_id}`;

      const action_name = `Restart ${device_name}`;

      try {
        const response = await fetch('/log-action', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id, pi_id, esp_id, action_name }),
        });

        const data = await response.json();
        if (response.ok) {
          setToastMessage(`✅ Action logged: ${action_name}`);
          setToastColor('bg-green-100 text-green-800 border-green-400');
        } else {
          setToastMessage(`❌ Failed to log: ${data.error}`);
          setToastColor('bg-red-100 text-red-800 border-red-400');
        }
      } catch (error) {
        console.error('Error:', error);
        setToastMessage('⚠️ Unexpected error occurred.');
        setToastColor('bg-yellow-100 text-yellow-800 border-yellow-400');
      }

      // Auto-hide the toast after 3 seconds
      setTimeout(() => {
        setToastMessage('');
        setToastColor('');
      }, 3000);
    }}
  >
    Restart {selectedSensorType || selectedActuator?.actuator_name || selectedEsp?.esp_name || `ESP ${selectedEsp?.esp_id}`}
  </button>
</div>

</div>


      )}
    </div>
  </div>

  {/* second column  */}
  <div className="overflow-x-auto border-indigo-500 h-[calc(100vh-30rem)] overflow-y-auto xl:w-6/12 w-[calc(100vw-6rem)] xl:h-[calc(100vh-30rem)] mt-4 xl:mt-4 justify-center items-center text-center border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 rounded-3xl shadow-lg">

  {/* Header for xl and above */}
  <div className="hidden xl:grid grid-cols-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-sm sticky top-0 z-10">
    <div className="px-4 py-2">Action ID</div>
    <div className="px-4 py-2">Action Name</div>
    <div className="px-4 py-2">Status</div>
    <div className="px-4 py-2">Timestamp</div>
  </div>

  {/* Rows for xl and above */}
  <div className="hidden xl:block text-sm">
    {actions.map((action, index) => (
      <div key={action.action_id || index} className="grid grid-cols-4 border-t border-gray-200 hover:bg-gray-50 transition">
        <div className="px-4 py-2 text-gray-800">{action.action_id}</div>
        <div className="px-4 py-2 text-gray-800">{action.action_name}</div>
        <div className={`px-4 py-2 font-medium ${action.action_status === 'SUCCESS' ? 'text-green-600' : action.action_status === 'FAILED' ? 'text-red-600' : 'text-yellow-600'}`}>
          {action.action_status}
        </div>
        <div className="px-4 py-2 text-gray-800">{new Date(action.timestamp).toLocaleString()}</div>
      </div>
    ))}
  </div>

  {/* Responsive cards for smaller screens */}
  <div className="xl:hidden space-y-2 text-sm p-2">
    {actions.map((action, index) => (
      <div key={action.action_id || index} className="border rounded-md p-4 bg-white shadow-sm">
        <div className="flex justify-between mb-2">
          <span className="font-semibold text-gray-700">Action ID</span>
          <span>{action.action_id}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="font-semibold text-gray-700">Action Name</span>
          <span>{action.action_name}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="font-semibold text-gray-700">Status</span>
          <span className={`${action.action_status === 'SUCCESS' ? 'text-green-600' : action.action_status === 'FAILED' ? 'text-red-600' : 'text-yellow-600'}`}>
            {action.action_status}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-gray-700">Timestamp</span>
          <span>{new Date(action.timestamp).toLocaleString()}</span>
        </div>
      </div>
    ))}
  </div>

  {/* Empty message */}
  {actions.length === 0 && (
    <div className="text-center text-sm text-gray-500 py-4">No actions to display.</div>
  )}
</div>
</div>



      </div>
    </div>
  );
};

export default Control;
