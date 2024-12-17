import React, { useState, useEffect, useRef } from "react";

const LatestSensorData = ({ userId, piId, piName }) => {
  const [sensorData, setSensorData] = useState([]);
  const [error, setError] = useState(null);
  const sseSourceRef = useRef(null);  // Ref to hold the SSE connection

  useEffect(() => {
    if (!userId || !piId) {
      setError("User ID and Pi ID are required.");
      return;
    }

    // Initialize EventSource
    const eventSource = new EventSource(
      `http://localhost:5000/get-latest-sensors-for-pi?user_id=${userId}&pi_id=${piId}`
    );

    // Event handler for receiving SSE data
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Data received from SSE:", data); // Debugging
        if (Array.isArray(data)) {
          setSensorData(data); // Update state with sensor data
        } else {
          setError("Invalid data format received.");
        }
      } catch (err) {
        console.error("Error parsing sensor data:", err); // Debugging
        setError("Error parsing sensor data.");
      }
    };

    // Event handler for errors in SSE connection
    eventSource.onerror = () => {
      setError("Error connecting to the server.");
      eventSource.close();
    };

    // Store event source in the ref for cleanup on unmount
    sseSourceRef.current = eventSource;

    // Cleanup the EventSource when the component unmounts
    return () => {
      sseSourceRef.current?.close();
    };
  }, [userId, piId]); // Dependency array to trigger effect when userId or piId change

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="xl:w-[calc(100vw-84rem)] w-[calc(100vw-6rem)]">
    <h2 className="text-2xl font-bold mb-4">Latest Data for {piName}</h2>
    <div className="xl:overflow-x-hidden overflow-x-auto shadow-lg rounded-lg border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 ">

      <table className="min-w-full divide-y divide-gray-200 bg-white xl:w-[calc(100vw-84rem)]">
        <thead className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Parameter
            </th>

            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
              Value
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
              Unit
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
              Timestamp
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sensorData.length > 0 ? (
            sensorData.map((sensor) => (
              <tr key={sensor.sensor_id} className="hover:bg-gray-100">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {sensor.sensor_type}
                </td>

                <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                  {sensor.sensor_value}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                  {sensor.sensor_unit}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                  {sensor.sensor_status}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                  {new Date(sensor.timestamp).toLocaleString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-4 text-sm text-gray-700">
                Loading or no data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </div>
  );
};

export default LatestSensorData;
