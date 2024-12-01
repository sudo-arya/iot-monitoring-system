import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import "event-source-polyfill";


const SensorDataDisplay = ({ selectedLocation, userId }) => {
  const [sensorData, setSensorData] = useState({});
  const [selectedSensorType, setSelectedSensorType] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const sseSourceRef = useRef({});
  const retryTimeoutRef = useRef({}); // Ref to store retry timeouts

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return isNaN(date.getTime())
      ? "Invalid Date"
      : `${
          date.getMonth() + 1
        }/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
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
          setIsDataLoaded(true);
        })
        .catch((error) => console.error("Error fetching sensor data:", error))
        .finally(() => setLoading(false));
    },
    [userId]
  );

  const handleSensorTypeSelect = (sensorType, sensorId) => {
    const maxRetries = 3; // Maximum number of retries for SSE
    let retryCount = 0;

    const establishSSEConnection = () => {
      // Ensure any existing SSE connection for the sensor type is closed
      if (sseSourceRef.current[sensorType]) {
        console.log(`Closing existing SSE connection for ${sensorType}`);
        sseSourceRef.current[sensorType].close();
      }

      console.log(`Attempting to establish SSE connection for ${sensorType}`);

      // Create a new EventSource connection
      const eventSource = new EventSource(
        `/get-latest-sensor-data?user_id=${userId}&sensor_id=${sensorId}`
      );

      // Event: Connection opened
      eventSource.onopen = () => {
        console.log(`SSE connection opened for ${sensorType}`);
        retryCount = 0; // Reset retry count on successful connection
      };

      // Event: New message received
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log(`Received SSE data for ${sensorType}:`, data);

          // Update sensor data state
          setSensorData((prevData) => ({
            ...prevData,
            [sensorType]: [...(prevData[sensorType] || []), ...data],
          }));
        } catch (error) {
          console.error(`Error parsing SSE message for ${sensorType}:`, error);
        }
      };

      // Event: Error occurred
      eventSource.onerror = () => {
        console.error(`SSE error for ${sensorType}`);

        // Close current connection and retry if below max retries
        eventSource.close();

        if (retryCount < maxRetries) {
          retryCount++;
          const retryDelay = Math.min(5000 * retryCount, 30000); // Exponential backoff, max 30 seconds
          console.log(
            `Retrying SSE connection for ${sensorType} in ${retryDelay / 1000}s`
          );

          // Schedule reconnection
          setTimeout(establishSSEConnection, retryDelay);
        } else {
          console.error(`Max retries reached for ${sensorType}. Giving up.`);
        }
      };

      // Save the connection reference
      sseSourceRef.current[sensorType] = eventSource;
    };

    // Clean up and establish a new connection
    setSelectedSensorType(sensorType);
    establishSSEConnection();
  };



  useEffect(() => {
    return () => {
      Object.values(sseSourceRef.current).forEach((source) => source.close());
      Object.values(retryTimeoutRef.current).forEach((timeout) =>
        clearTimeout(timeout)
      );
    };
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      fetchSensorData(selectedLocation.piId);
    }
  }, [selectedLocation, fetchSensorData]);

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
