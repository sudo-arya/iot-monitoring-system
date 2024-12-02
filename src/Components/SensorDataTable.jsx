import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
// import "event-source-polyfill";

const SensorDataDisplay = ({ selectedLocation, userId }) => {
  const [sensorData, setSensorData] = useState({});
  const [selectedSensorType, setSelectedSensorType] = useState("");
  const [loading, setLoading] = useState(true);
  const sseSourceRef = useRef(null);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Invalid Date";

    const parsedDate = new Date(timestamp);
    if (isNaN(parsedDate.getTime())) {
      return "Invalid Date"; // Return a fallback if parsing fails
    }

    return `${
      parsedDate.getMonth() + 1
    }/${parsedDate.getDate()}/${parsedDate.getFullYear()} ${parsedDate.getHours()}:${parsedDate.getMinutes()}`;
  };

  const fetchSensorData = useCallback(
    (piId) => {
      setLoading(true);
      fetch(`/get-sensor-data?user_id=${userId}&pi_id=${piId}`)
        .then((response) => response.json())
        .then((data) => {
          const formattedData = data.reduce((acc, sensor) => {
            const { sensor_type, ...sensorInfo } = sensor;
            acc[sensor_type] = acc[sensor_type] || [];
            acc[sensor_type].push(sensorInfo);
            return acc;
          }, {});
          setSensorData(formattedData);
        })
        .catch((error) => console.error("Error fetching sensor data:", error))
        .finally(() => setLoading(false));
    },
    [userId]
  );

  const handleSensorTypeSelect = (sensorType, sensorId) => {
    // Close any existing SSE connection
    if (sseSourceRef.current) {
      console.log("Closing existing SSE connection");
      sseSourceRef.current.close();
      sseSourceRef.current = null;
    }

    console.log(`Setting up SSE for ${sensorType} with Sensor ID: ${sensorId}`);
    const eventSource = new EventSource(
      `http://localhost:5000/get-latest-sensor-data?user_id=${userId}&sensor_id=${sensorId}`
    );

    eventSource.onmessage = (event) => {
      try {
        const newData = JSON.parse(event.data); // Parse new data received from SSE
        console.log(`Received SSE data for ${sensorType}:`, newData);

        // Replace the data for the corresponding sensor type in the table
        setSensorData((prevData) => {
          const updatedData = { ...prevData };
          updatedData[sensorType] = newData.map((sensorInfo) => ({
            ...sensorInfo,
            timestamp: formatTimestamp(sensorInfo.timestamp), // Format timestamp
          }));
          return updatedData;
        });
      } catch (error) {
        console.error(`Error parsing SSE message for ${sensorType}:`, error);
      }
    };

    eventSource.onerror = () => {
      console.error("SSE connection error. Closing connection.");
      eventSource.close();
    };

    sseSourceRef.current = eventSource; // Save reference to the current SSE connection
    setSelectedSensorType(sensorType); // Update the selected sensor type
  };

  useEffect(() => {
    if (selectedLocation) {
      fetchSensorData(selectedLocation.piId);
    }
  }, [selectedLocation, fetchSensorData]);

  useEffect(() => {
    return () => {
      if (sseSourceRef.current) {
        console.log("Cleaning up SSE connection");
        sseSourceRef.current.close();
      }
    };
  }, []);

  const sensorTypes = useMemo(() => Object.keys(sensorData), [sensorData]);

  return (
    <div className="mt-4 p-4 border-2 border-indigo-500 rounded-3xl shadow-lg">
      <h2 className="text-xl font-semibold">Sensor Data</h2>

      {loading ? (
        <p>Loading sensor data...</p>
      ) : sensorTypes.length > 0 ? (
        <>
          <h3 className="mt-4 text-lg">Select Sensor Type:</h3>
          <ul>
            {sensorTypes.map((sensorType) => (
              <li key={sensorType} className="cursor-pointer">
                <button
                  onClick={() =>
                    handleSensorTypeSelect(
                      sensorType,
                      sensorData[sensorType][0]?.sensor_id
                    )
                  }
                  className="text-blue-500"
                >
                  {sensorType}
                </button>
              </li>
            ))}
          </ul>
          {selectedSensorType && (
            <div>
              <h3 className="mt-4 text-lg font-bold">
                Sensor Data for {selectedSensorType}:
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-4 py-2 text-left">Timestamp</th>
                      <th className="border px-4 py-2 text-left">
                        Sensor Value
                      </th>
                      <th className="border px-4 py-2 text-left">
                        Sensor Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sensorData[selectedSensorType]?.length > 0 ? (
                      sensorData[selectedSensorType].map((data, index) => (
                        <tr key={index} className="even:bg-gray-50">
                          <td className="border px-4 py-2">
                            {formatTimestamp(data.timestamp)}
                          </td>
                          <td className="border px-4 py-2">
                            {data.sensor_value}
                          </td>
                          <td className="border px-4 py-2">
                            {data.sensor_status}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="3"
                          className="text-center border px-4 py-2 text-gray-500"
                        >
                          No data available for this sensor type.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <p>No sensors available for the selected location.</p>
      )}
    </div>
  );
};

export default SensorDataDisplay;
