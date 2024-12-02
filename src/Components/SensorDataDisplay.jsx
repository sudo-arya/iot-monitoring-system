import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import "event-source-polyfill";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  TimeScale
);

const SensorDataDisplay = ({ selectedLocation, userId }) => {
  const [sensorData, setSensorData] = useState({});
  const [selectedSensorType, setSelectedSensorType] = useState("");
  const [loading, setLoading] = useState(true);
  const sseSourceRef = useRef(null);

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
    // Ensure that sensorId is available
    if (!sensorId) {
      console.error("Sensor ID is undefined");
      return;
    }

    // Avoid unnecessary reconnections if the sensor type is already selected
    if (sensorType === selectedSensorType) return;

    if (sseSourceRef.current) {
      sseSourceRef.current.close();
      sseSourceRef.current = null;
    }

    const eventSource = new EventSource(
      `http://localhost:5000/get-latest-sensor-data?user_id=${userId}&sensor_id=${sensorId}`
    );

    eventSource.onmessage = (event) => {
      try {
        const newData = JSON.parse(event.data);
        setSensorData((prevData) => ({
          ...prevData,
          [sensorType]: newData.map((sensorInfo) => ({
            ...sensorInfo,
            timestamp: new Date(sensorInfo.timestamp), // Ensure timestamp is a Date object
          })),
        }));
      } catch (error) {
        console.error(`Error parsing SSE message for ${sensorType}:`, error);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    sseSourceRef.current = eventSource;
    setSelectedSensorType(sensorType);
  };


  useEffect(() => {
    if (selectedLocation) {
      fetchSensorData(selectedLocation.piId);
    }
  }, [selectedLocation, fetchSensorData]);

  useEffect(() => {
    return () => {
      if (sseSourceRef.current) {
        sseSourceRef.current.close();
      }
    };
  }, []);

  const sensorTypes = useMemo(() => Object.keys(sensorData), [sensorData]);

  const chartData = useMemo(() => {
    if (!selectedSensorType || !sensorData[selectedSensorType]) {
      return { labels: [], datasets: [] };
    }

    const reversedData = [...sensorData[selectedSensorType]].reverse();

    return {
      labels: reversedData.map((data) => data.timestamp),
      datasets: [
        {
          label: `${selectedSensorType} Values`,
          data: reversedData.map((data) => data.sensor_value),
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderWidth: 2,
        },
      ],
    };
  }, [selectedSensorType, sensorData]);

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        type: "time",
        time: {
          unit: "hour", // Choose an appropriate time unit (e.g., second, minute, hour, day)
          displayFormats: {
            hour: "HH:mm", // Customize the time format as needed
          },
        },
        ticks: {
          autoSkip: true, // Skip overlapping ticks
          maxTicksLimit: 10, // Limit the number of ticks
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };


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
              <li key={sensorType}>
                <button
                  onClick={() =>
                    handleSensorTypeSelect(
                      sensorType,
                      sensorData[sensorType][0]?.sensor_id // Ensure you always pass a valid sensorId
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
            <div className="mt-4">
              <h3 className="text-lg font-bold">
                Sensor Graph for {selectedSensorType}:
              </h3>
              <Line data={chartData} options={chartOptions} />
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
