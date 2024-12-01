import React, { useState, useEffect, useCallback, useRef } from "react";

const SensorDataDisplay = ({ selectedLocation, userId }) => {
  const [sensorData, setSensorData] = useState({}); // Store all sensor data by type
  const [selectedSensorType, setSelectedSensorType] = useState(""); // The currently selected sensor type
  const [loading, setLoading] = useState(true); // Track loading state
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Track if data is fully loaded

  const sseSourceRef = useRef({}); // Ref to store SSE connections

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return `${
      date.getMonth() + 1
    }/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
  };

  // Fetch sensor data for the selected Pi ID
  const fetchSensorData = useCallback(
    (piId) => {
      setLoading(true); // Show loading message while fetching
      console.log("Fetching sensor data for piId:", piId); // Log the piId
      fetch(`/get-sensor-data?user_id=${userId}&pi_id=${piId}`)
        .then((response) => response.json())
        .then((data) => {
          console.log("Fetched sensor data:", data);
          // Organize sensor data by sensor type
          const formattedData = data.reduce((acc, sensor) => {
            const { sensor_type, ...sensorInfo } = sensor;
            if (!acc[sensor_type]) {
              acc[sensor_type] = [];
            }
            acc[sensor_type].push(sensorInfo);
            return acc;
          }, {});

          console.log("Formatted sensor data:", formattedData);
          setSensorData(formattedData);
          setIsDataLoaded(true); // Mark data as loaded
        })
        .catch((error) => {
          console.error("Error fetching sensor data:", error);
        })
        .finally(() => {
          setLoading(false); // Set loading to false after fetch is complete
          console.log("Loading state set to false");
        });
    },
    [userId]
  );

  // Handle selection of sensor type and set up SSE connection
  const handleSensorTypeSelect = (sensorType, sensorId) => {
    if (sseSourceRef.current[sensorType]) {
      sseSourceRef.current[sensorType].close(); // Close any existing SSE connection
      console.log(`Previous SSE connection for ${sensorType} closed.`);
    }

    setSelectedSensorType(sensorType); // Set the selected sensor type
    console.log(
      `Selecting sensor type: ${sensorType} for sensorId: ${sensorId}`
    );

    const eventSource = new EventSource(
      `/get-latest-sensor-data?user_id=${userId}&sensor_id=${sensorId}`
    );

    eventSource.onmessage = function (event) {
      try {
        const data = JSON.parse(event.data); // Ensure this parses the data correctly
        console.log("Received data:", data);

        // Process and update the sensor data state
        setSensorData((prevData) => {
          const updatedData = prevData[selectedSensorType] || [];
          return {
            ...prevData,
            [selectedSensorType]: [...updatedData, ...data],
          };
        });
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = function (error) {
      console.error("Error with SSE:", error);
      eventSource.close();
    };

    // Store the SSE connection for cleanup
    sseSourceRef.current[sensorType] = eventSource;
    console.log("SSE connection set for sensorId:", sensorId);
  };
 

  // Cleanup SSE connection when the component unmounts
  useEffect(() => {
    return () => {
      // Cleanup all SSE connections
      Object.values(sseSourceRef.current).forEach((source) => {
        console.log("Cleaning up SSE connection");
        source.close();
      });
    };
  }, []);

  // Effect to fetch data when the location changes
  useEffect(() => {
    if (selectedLocation) {
      console.log(
        "Location selected, fetching data for piId:",
        selectedLocation.piId
      );
      fetchSensorData(selectedLocation.piId);
    }
  }, [selectedLocation, fetchSensorData]);

  // List the sensor types for the selected Pi ID
  const sensorTypes = Object.keys(sensorData);

  return (
    <div className="mt-4 p-4 border-2 border-indigo-500 rounded-3xl shadow-lg">
      <h2 className="text-xl font-semibold">Sensor Data</h2>

      {/* Display available sensor types */}
      {sensorTypes.length > 0 ? (
        <div>
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
        </div>
      ) : (
        <p>No sensors available for the selected location.</p>
      )}

      {/* Show loading spinner while fetching data */}
      {loading ? (
        <p>Loading sensor data...</p>
      ) : (
        isDataLoaded &&
        selectedSensorType && (
          <div>
            <h3 className="mt-4 text-lg">
              Sensor Data for {selectedSensorType}:
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Timestamp</th>
                    <th className="border px-4 py-2">Sensor Value</th>
                    <th className="border px-4 py-2">Sensor Status</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Render table rows dynamically */}
                  {sensorData[selectedSensorType]?.map((data, index) => (
                    <tr key={index}>
                      <td className="border px-4 py-2">
                        {formatTimestamp(data.timestamp)}
                      </td>
                      <td className="border px-4 py-2">{data.sensor_value}</td>
                      <td className="border px-4 py-2">{data.sensor_status}</td>
                    </tr>
                  ))}
                  {/* If no data available for selected sensor */}
                  {sensorData[selectedSensorType]?.length === 0 && (
                    <tr>
                      <td colSpan="3" className="text-center border px-4 py-2">
                        No data available for this sensor type.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default SensorDataDisplay;
