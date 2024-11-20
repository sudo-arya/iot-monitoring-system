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
    ? hourly.temperature_2m.slice(0, 24).map((_, index) => `Hour ${index}`)
    : [];
  const hourlyTemperatureData = hourly?.temperature_2m || [];
  const hourlyWindSpeedData = hourly?.wind_speed_10m || [];
  const hourlyHumidityData = hourly?.relative_humidity_2m || [];
  const hourlyPressureData = hourly?.pressure_msl || [];

  // Daily data for max and min temperatures
  const dailyLabels = daily?.temperature_2m_max
    ? daily.temperature_2m_max.map((_, index) => `Day ${index + 1}`)
    : [];
  const dailyMaxTemperatureData = daily?.temperature_2m_max || [];
  const dailyMinTemperatureData = daily?.temperature_2m_min || [];

  // Graph options
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Hourly ${
          selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)
        }`,
      },
      tooltip: {
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
  };

  // Dynamically change the data based on selected metric
  const graphData = {
    temperature: hourlyTemperatureData,
    wind_speed: hourlyWindSpeedData,
    humidity: hourlyHumidityData,
    pressure: hourlyPressureData,
  };

  return (
    <div className="forecast-container">
      <div className="button-group">
        {/* Buttons for each weather metric */}
        <button onClick={() => setSelectedMetric("temperature")}>
          Temperature
        </button>
        <button onClick={() => setSelectedMetric("wind_speed")}>
          Wind Speed
        </button>
        <button onClick={() => setSelectedMetric("humidity")}>Humidity</button>
        <button onClick={() => setSelectedMetric("pressure")}>Pressure</button>
      </div>

      <div className="graph-container x:max-w-xl w-1/2">
        {/* Line chart for selected metric */}
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

      <div className="weekly-forecast">
        <h3>Weekly Forecast</h3>
        {/* Daily Temperature Chart */}
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
              },
              {
                label: "Min Temperature (°C)",
                data: dailyMinTemperatureData,
                borderColor: "rgba(255, 159, 64, 1)",
                backgroundColor: "rgba(255, 159, 64, 0.2)",
                fill: true,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: "Daily Temperature",
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default WeatherForecastComponent;
