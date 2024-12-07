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
  Filler,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-date-fns";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  TimeScale,
  Filler,
  zoomPlugin
);

const SensorDataDisplay = ({ selectedLocation, userId }) => {
  const [sensorData, setSensorData] = useState({});
  const [sseSensorData, setSseSensorData] = useState({});
  const [selectedSensorType, setSelectedSensorType] = useState("");
  const [loading, setLoading] = useState(true);
  const [showLatest, setShowLatest] = useState(true); // Track whether user is at the latest data
  const [graphKey, setGraphKey] = useState(0); // Key for unmounting and re-rendering graph

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
    if (!sensorId) {
      console.error("Sensor ID is undefined");
      return;
    }
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
            timestamp: new Date(sensorInfo.timestamp),
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
          tension: 0.5,
        },
      ],
    };
  }, [selectedSensorType, sensorData, sseSensorData]);

  const chartOptions = useMemo(() => {
    const currentData =
      sseSensorData[selectedSensorType] || sensorData[selectedSensorType];

    let minTime = null;
    let maxTime = null;
    let latestTime = null;

    if (currentData && currentData.length > 0) {
      minTime = Math.min(
        ...currentData.map((item) => new Date(item.timestamp).getTime())
      );
      maxTime = Math.max(
        ...currentData.map((item) => new Date(item.timestamp).getTime())
      );
      latestTime = maxTime; // Latest data timestamp
    }

    const range = maxTime && minTime ? maxTime - minTime : 0;
    const leftPadding = range * 0.07; // Adjust padding on the left
    const rightPadding = range * 0.03; // Adjust padding on the right

    const zoomMin = latestTime ? latestTime - leftPadding : minTime;
    const zoomMax = latestTime ? latestTime + rightPadding : maxTime;

    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "time",
          time: {
            unit: "minute",
            displayFormats: {
              minute: "HH:mm",
            },
          },
          min: zoomMin,
          max: zoomMax,
        },
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        zoom: {
          pan: {
            enabled: true,
            mode: "x",
          },
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            mode: "x",
          },
        },
      },
    };
  }, [selectedSensorType, sseSensorData, sensorData, showLatest]);



  const latestDataPoint =
    sseSensorData[selectedSensorType]?.[0] ||
    sensorData[selectedSensorType]?.[
      sensorData[selectedSensorType]?.length - 1
    ];
  const handleGoToLatest = () => {
    setShowLatest(true); // Enable centering latest data
    setGraphKey((prevKey) => prevKey + 1); // Re-render graph
  };


  return (
    <div className="mt-6 xl:h-[calc(100vh-42rem)] h-[calc(100vh-24rem)] relative xl:w-[calc(100vw-80rem)] w-[calc(100vw-6rem)]">
      {loading ? (
        <p>Loading...</p>
      ) : sensorTypes.length > 0 ? (
        <div>
          <div className="flex xl:text-center xl:justify-center items-start justify-start flex-row xl:flex-row text-white font-semibold text-base">
            {sensorTypes.map((sensorType, index) => (
              <button
                key={sensorType}
                onClick={() =>
                  handleSensorTypeSelect(
                    sensorType,
                    sensorData[sensorType][0]?.sensor_id
                  )
                }
                className={`flex xl:w-fit py-2 px-1 xl:px-3 justify-center xl:hover:bg-gradient-to-t xl:hover:to-gray-500 xl:hover:from-black transition-transform ease-in-out duration-300 cursor-pointer shadow-2xl 
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
            <>
              <h3>
                Sensor Graph for {selectedSensorType} (
                {sensorData[selectedSensorType]?.[0]?.sensor_unit || ""}):
              </h3>

              <div className="mt-4">
                <button
                  onClick={handleGoToLatest}
                  className="bg-white text-gray-600 font-semibold hover:bg-gray-600 hover:text-white border-2 border-gray-400 py-2 px-4 rounded mt-2"
                >
                  Go to Latest Data
                </button>
              </div>
              <div className="mt-4 xl:h-[calc(100vh-42rem)] h-[calc(100vh-24rem)] overflow-x-auto">
                <Line
                  key={graphKey} // Key for re-rendering
                  data={chartData}
                  options={chartOptions}
                  className=""
                />
              </div>
            </>
          )}
        </div>
      ) : (
        <p>No sensors available for the selected location.</p>
      )}
    </div>
  );
};

export default SensorDataDisplay;
