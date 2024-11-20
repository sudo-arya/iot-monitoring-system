import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const WeatherForecastComponent = () => {
  const [forecastData, setForecastData] = useState(null);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("hourly"); // "hourly" or "weekly"
  const [selectedMetric, setSelectedMetric] = useState("temperature");

  // Coordinates for the location
  const lat = 22.314806706030907;
  const lon = 87.32086776565481;

  useEffect(() => {
    const fetchForecastData = async () => {
      try {
        const response = await axios.get(
          "https://api.open-meteo.com/v1/forecast",
          {
            params: {
              latitude: lat,
              longitude: lon,
              current_weather: true,
              hourly:
                "temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m",
              daily: "temperature_2m_max,temperature_2m_min,precipitation_sum",
              forecast_days: 7,
              timezone: "auto",
              temperature_unit: "celsius",
              wind_speed_unit: "kmh",
            },
          }
        );

        if (response.data) {
          setForecastData(response.data);
        } else {
          setError("Unable to fetch forecast data");
        }
      } catch (err) {
        setError("Error fetching forecast data");
        console.error(err);
      }
    };

    fetchForecastData();
  }, []); // Run once on mount

  if (error) {
    return <div>{error}</div>;
  }

  if (!forecastData) {
    return <div>Loading...</div>;
  }

  const { hourly, daily } = forecastData;

  // Prepare the data for the graphs
  const hourlyLabels = hourly?.temperature_2m
    ? hourly.temperature_2m.slice(0, 24).map((_, index) => {
        const hours = new Date();
        hours.setHours(index, 0, 0, 0);
        const hoursFormatted = hours.toLocaleTimeString([], {
          hour: "2-digit",
          //   minute: "2-digit",
        });

        // Show time labels every 2 hours
        if (index % 2 === 0 || index === 23) {
          return hoursFormatted;
        }
        return "";
      })
    : [];

  const hourlyTemperatureData = hourly?.temperature_2m || [];
  const hourlyWindSpeedData = hourly?.wind_speed_10m || [];
  const hourlyHumidityData = hourly?.relative_humidity_2m || [];
  const hourlyPressureData = hourly?.pressure_msl || [];

  // Daily data for max and min temperatures
  const dailyLabels = daily?.temperature_2m_max
    ? daily.temperature_2m_max.map((_, index) => {
        const today = new Date();
        today.setDate(today.getDate() + index);
        return today.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        }); // Date format (e.g., "20 Nov")
      })
    : [];
  const dailyMaxTemperatureData = daily?.temperature_2m_max || [];
  const dailyMinTemperatureData = daily?.temperature_2m_min || [];

  // Graph options for the hourly chart
  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      title: {
        display: false,
        text: `${viewMode === "hourly" ? "Hourly" : "Weekly"} ${
          selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)
        }`,
      },
      tooltip: {
        display: false,
        callbacks: {
          label: (tooltipItem) =>
            `${tooltipItem.dataset.label}: ${tooltipItem.raw} ${
              selectedMetric === "temperature"
                ? "°C"
                : selectedMetric === "wind_speed"
                ? "km/h"
                : selectedMetric === "humidity"
                ? "%"
                : "hPa"
            }`,
        },
      },
    },
    scales: {
      x: {
        type: "category",
        ticks: {
          autoSkip: false, // Show all ticks
          //   maxTicksLimit: 8, // Show more ticks by limiting the maximum number of ticks
        },
        min: 0, // Ensure the graph starts at the beginning
        max: viewMode === "hourly" ? 23 : undefined, // Max tick to show 24 hours
        grid: {
          display: false,
          drawOnChartArea: true,
        },
        title: {
          display: false,
          text: viewMode === "hourly" ? "Hours of the Day" : "Days of the Week",
        },
      },
      y: {
        ticks: {
          beginAtZero: false,
          maxTicksLimit: 15, // Show more ticks by limiting the maximum number of ticks
          callback: function (value) {
            return value.toFixed(1); // Display values with one decimal place
          },
        },
        grid: {
          display: false,
          drawOnChartArea: true,
        },
        title: {
          display: false,
          text: "Values",
        },
      },
    },

    elements: {
      point: {
        radius: 0,
      },
    },
  };

  // Dynamically change the data based on selected metric or view mode
  const graphData =
    viewMode === "hourly"
      ? {
          temperature: hourlyTemperatureData,
          wind_speed: hourlyWindSpeedData,
          humidity: hourlyHumidityData,
          pressure: hourlyPressureData,
        }
      : {
          temperature: dailyMaxTemperatureData, // Weekly view shows max temperature for simplicity
        };

  return (
    <div className="forecast-container">
      <div className="view-mode-buttons">
        <button onClick={() => setViewMode("hourly")}>Hourly Forecast</button>
        <button onClick={() => setViewMode("weekly")}>Weekly Forecast</button>
      </div>

      {viewMode === "hourly" && (
        <div className="button-group">
          {/* Buttons for each weather metric */}
          <button onClick={() => setSelectedMetric("temperature")}>
            Temperature
          </button>
          <button onClick={() => setSelectedMetric("wind_speed")}>
            Wind Speed
          </button>
          <button onClick={() => setSelectedMetric("humidity")}>
            Humidity
          </button>
          <button onClick={() => setSelectedMetric("pressure")}>
            Pressure
          </button>
        </div>
      )}

      {/* Only show the graph if the view mode is "hourly" */}
      {viewMode === "hourly" && (
        <div
          className="graph-container xl:w-2/6 w-9/12  bg-gray-100 bg-opacity-25 xl:px-4 items-center justify-center flex py-2 border border-green-700 text-green-700"
          style={{ overflowX: "auto" }} // Increased height
        >
          <div
            //   style={{ minWidth: "1000px" }}
            className="w-full"
          >
            <Line
              data={{
                labels: hourlyLabels,
                datasets: [
                  {
                    label: `${
                      selectedMetric.charAt(0).toUpperCase() +
                      selectedMetric.slice(1)
                    } (${
                      selectedMetric === "temperature"
                        ? "°C"
                        : selectedMetric === "wind_speed"
                        ? "km/h"
                        : selectedMetric === "humidity"
                        ? "%"
                        : "hPa"
                    })`,
                    data: graphData[selectedMetric],
                    borderColor:
                      selectedMetric === "temperature"
                        ? "rgba(75, 192, 192, 1)"
                        : selectedMetric === "wind_speed"
                        ? "rgba(255, 159, 64, 1)"
                        : selectedMetric === "humidity"
                        ? "rgba(153, 102, 255, 1)"
                        : "rgba(255, 99, 132, 1)",
                    backgroundColor:
                      selectedMetric === "temperature"
                        ? "rgba(75, 192, 192, 0.2)"
                        : selectedMetric === "wind_speed"
                        ? "rgba(255, 159, 64, 0.2)"
                        : selectedMetric === "humidity"
                        ? "rgba(153, 102, 255, 0.2)"
                        : "rgba(255, 99, 132, 0.2)",
                    fill: true,
                    tension: 0.4, // Smoother curves
                    borderWidth: 2,
                  },
                ],
              }}
              options={options}
            />
          </div>
        </div>
      )}

      {/* Only show the weekly forecast if the view mode is "weekly" */}
      {viewMode === "weekly" && (
        <div className="weekly-forecast">
          <h3>Weekly Forecast</h3>
          {/* Daily Temperature Chart */}
          <div style={{ minWidth: "1000px" }}>
            <Line
              data={{
                labels: dailyLabels,
                datasets: [
                  {
                    label: "Max Temperature (°C)",
                    data: dailyMaxTemperatureData,
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                  },
                  {
                    label: "Min Temperature (°C)",
                    data: dailyMinTemperatureData,
                    borderColor: "rgba(153, 102, 255, 1)",
                    backgroundColor: "rgba(153, 102, 255, 0.2)",
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    text: "Weekly Temperature Forecast",
                  },
                },
                scales: {
                  x: {
                    type: "category",
                  },
                  y: {
                    ticks: {
                      beginAtZero: true,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherForecastComponent;
