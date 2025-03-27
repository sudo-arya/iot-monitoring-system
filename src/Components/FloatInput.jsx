import { useState, useEffect } from "react";
import axios from "axios";

const FloatInput = ({ user_id, pi_id, minValue, maxValue, onMinChange, onMaxChange, onSensorChange }) => {
  const [sensors, setSensors] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [localMinValue, setLocalMinValue] = useState(minValue);
  const [localMaxValue, setLocalMaxValue] = useState(maxValue);

  

  // Fetch sensors from the backend
  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/get-available-sensors?user_id=${user_id}&pi_id=${pi_id}`
        );
        console.log(response.data);
        setSensors(response.data);
      } catch (error) {
        console.error("Error fetching sensors:", error);
      }
    };

    fetchSensors();
  }, [user_id, pi_id]);

  // Handle sensor selection change
  const handleSensorChange = (event) => {
    const sensorId = event.target.value;
    const sensor = sensors.find((s) => s.sensor_id.toString() === sensorId);

    if (sensor) {
      setSelectedSensor(sensor);
      setLocalMinValue(sensor.min_sensor_value);
      setLocalMaxValue(sensor.max_sensor_value);

      // Call the parent callback with the selected sensor
      onSensorChange(sensor);
      onMinChange(sensor.min_sensor_value);
      onMaxChange(sensor.max_sensor_value);
    }
  };

  const handleMinChange = (event) => {
    const newValue = parseFloat(event.target.value);
    if (newValue <= localMaxValue) {
      setLocalMinValue(newValue);
      onMinChange(newValue);
    }
  };

  const handleMaxChange = (event) => {
    const newValue = parseFloat(event.target.value);
    if (newValue >= localMinValue) {
      setLocalMaxValue(newValue);
      onMaxChange(newValue);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white p-4 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Select Sensor Range
        </h2>

        {/* Sensor Dropdown */}
        <div className="flex flex-col items-center space-y-3 mt-4">
          <label htmlFor="sensor" className="text-lg font-medium text-gray-700">
            Select Sensor:
          </label>
          <select
            id="sensor"
            value={selectedSensor?.sensor_id || ""}
            onChange={handleSensorChange}
            className="w-full p-2 border rounded-lg"
            disabled={sensors.length === 0}
          >
            <option value="" disabled hidden>
              Select a sensor
            </option>
            {sensors.map((sensor) => (
              <option key={sensor.sensor_id} value={sensor.sensor_id}>
                {sensor.sensor_type}
              </option>
            ))}
          </select>
        </div>

        {/* Minimum Value Section */}
        <div className="flex flex-col items-center space-y-3">
          <label htmlFor="min" className="text-lg font-medium text-gray-700">
            Min Sensor Value :{" "}
            <span className="text-lg font-semibold text-green-600">
              {localMinValue.toFixed(1)}
            </span>
          </label>
          <input
            id="min"
            type="range"
            min={selectedSensor?.min_sensor_value || 0}
            max={selectedSensor?.max_sensor_value || 100}
            step="0.1"
            value={localMinValue}
            onChange={handleMinChange}
            className="w-full h-3 bg-green-300 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Maximum Value Section */}
        <div className="flex flex-col items-center space-y-3">
          <label htmlFor="max" className="text-lg font-medium text-gray-700">
            Max Sensor Value :{" "}
            <span className="text-lg font-semibold text-red-600">
              {localMaxValue.toFixed(1)}
            </span>
          </label>
          <input
            id="max"
            type="range"
            min={selectedSensor?.min_sensor_value || 0}
            max={selectedSensor?.max_sensor_value || 100}
            step="0.1"
            value={localMaxValue}
            onChange={handleMaxChange}
            className="w-full h-3 bg-red-300 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Display Selected Range */}
        <div className="text-center mt-8 w-fit items-center px-6 py-1 mx-auto text-lg font-medium text-gray-800 bg-gray-100 rounded-full">
          Selected Range:{" "}
          <span className="text-green-600">{localMinValue.toFixed(1)}</span> -{" "}
          <span className="text-red-600">{localMaxValue.toFixed(1)}</span>{" "}
          {selectedSensor?.sensor_unit || "Unit not available"}
        </div>
      </div>
    </div>
  );
};

export default FloatInput;
