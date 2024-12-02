import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import "event-source-polyfill";
import { Line,Bar,Radar,Doughnut,Scatter } from "react-chartjs-2";
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
  const [sseSensorData, setSseSensorData] = useState({}); // New state for SSE data
  const [selectedSensorType, setSelectedSensorType] = useState("");
  const [loading, setLoading] = useState(true);
  const sseSourceRef = useRef(null);
  const [viewMode, setViewMode] = useState("hourly"); // Default viewMode is "hourly"

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
        setSseSensorData((prevData) => ({
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
    const currentData =
      sseSensorData[selectedSensorType] || sensorData[selectedSensorType];

    if (!selectedSensorType || !currentData) {
      return { labels: [], datasets: [] };
    }

    const reversedData = [...currentData].reverse();

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
  }, [selectedSensorType, sensorData, sseSensorData]);

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

  const unit = sensorData[selectedSensorType]?.[0]?.sensor_unit || "";

  return (
    <div className="mt-6">
      {loading ? (
        <></>
      ) : sensorTypes.length > 0 ? (
        <div className="">
          <div className="flex xl:text-center xl:justify-center items-start justify-start flex-row xl:flex-row text-white font-semibold text-base">
            {sensorTypes.map((sensorType, index) => (
              <button
                key={sensorType}
                onClick={() =>
                  handleSensorTypeSelect(
                    sensorType,
                    sensorData[sensorType][0]?.sensor_id // Ensure you always pass a valid sensorId
                  )
                }
                className={`flex xl:w-fit py-2 px-1 xl:px-3 justify-center xl:hover:bg-black transition-transform ease-in-out duration-300 cursor-pointer shadow-2xl 
        ${
          selectedSensorType === sensorType
            ? "bg-gradient-to-r from-blue-500 to-indigo-500"
            : "bg-gray-400"
        }
        ${index === 0 ? "rounded-l-full" : ""}
        ${index === sensorTypes.length - 1 ? "rounded-r-full" : ""}`}
              >
                {sensorType}
              </button>
            ))}
          </div>

          {selectedSensorType && (
            <div className="mt-4 overflow-x-auto">
              <h3 className="text-base font-bold text-center">
                Sensor Graph for {selectedSensorType} ({unit}):
              </h3>
              <Line
                data={chartData}
                options={chartOptions}
              />
            </div>
          )}
        </div>
      ) : (
        <p>No sensors available for the selected location.</p>
      )}
    </div>
  );
};


export default SensorDataDisplay;
