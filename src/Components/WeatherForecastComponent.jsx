import React, { useEffect, useState } from "react";
import axios from "axios";

const WeatherForecastComponent = () => {
  const [forecastData, setForecastData] = useState(null);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("hourly"); // "hourly" or "weekly"

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
                "temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m,wind_direction_10m",
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
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  if (!forecastData) {
    return <div>Loading...</div>;
  }

  const { hourly, daily } = forecastData;

  const calculateAverage = (data) =>
    data.reduce((sum, val) => sum + val, 0) / data.length;

  // Hourly data calculation
  // Hourly data calculation for today
  const todayDate = new Date().toLocaleDateString();
  const todayHourlyData = hourly.time
    ? hourly.time.filter((time, index) => new Date(time).toLocaleDateString() === todayDate)
    : [];

  const todayHourly = {
    temperature: {
      max: Math.max(...todayHourlyData.map((_, index) => hourly.temperature_2m[index])),
      min: Math.min(...todayHourlyData.map((_, index) => hourly.temperature_2m[index])),
      avg: calculateAverage(todayHourlyData.map((_, index) => hourly.temperature_2m[index])),
    },
    wind: {
      max: Math.max(...todayHourlyData.map((_, index) => hourly.wind_speed_10m[index])),
      min: Math.min(...todayHourlyData.map((_, index) => hourly.wind_speed_10m[index])),
      avg: calculateAverage(todayHourlyData.map((_, index) => hourly.wind_speed_10m[index])),
      direction: hourly.wind_direction_10m[0], // Simplified, show first value
    },
    pressure: {
      max: Math.max(...todayHourlyData.map((_, index) => hourly.pressure_msl[index])),
      min: Math.min(...todayHourlyData.map((_, index) => hourly.pressure_msl[index])),
      avg: calculateAverage(todayHourlyData.map((_, index) => hourly.pressure_msl[index])),
    },
    humidity: {
      max: Math.max(...todayHourlyData.map((_, index) => hourly.relative_humidity_2m[index])),
      min: Math.min(...todayHourlyData.map((_, index) => hourly.relative_humidity_2m[index])),
      avg: calculateAverage(todayHourlyData.map((_, index) => hourly.relative_humidity_2m[index])),
      maxTime: hourly.time[
        hourly.relative_humidity_2m.indexOf(Math.max(...todayHourlyData.map((_, index) => hourly.relative_humidity_2m[index])))
      ], // Time when humidity is highest
    },
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="forecast-container">
      <div className="view-mode-buttons">
        <button onClick={() => setViewMode("hourly")}>Hourly Forecast</button>
        <button onClick={() => setViewMode("weekly")}>Weekly Forecast</button>
      </div>

      {viewMode === "hourly" && todayHourly && (
        <div className="data-display">
          <h3>Today Forecast</h3>
          <div>
            <p>
              <strong>Max Temperature:</strong>{" "}
              {todayHourly.temperature.max.toFixed(2)}°C
            </p>
            <p>
              <strong>Min Temperature:</strong>{" "}
              {todayHourly.temperature.min.toFixed(2)}°C
            </p>
            <p>
              <strong>Avg Temperature:</strong>{" "}
              {todayHourly.temperature.avg.toFixed(2)}°C
            </p>
            <p>
              <strong>Max Wind Speed:</strong> {todayHourly.wind.max.toFixed(2)}{" "}
              km/h
            </p>
            <p>
              <strong>Min Wind Speed:</strong> {todayHourly.wind.min.toFixed(2)}{" "}
              km/h
            </p>
            <p>
              <strong>Avg Wind Speed:</strong> {todayHourly.wind.avg.toFixed(2)}{" "}
              km/h
            </p>
            <p>
              <strong>Wind Direction:</strong> {todayHourly.wind.direction}°
            </p>
            <p>
              <strong>Avg Pressure:</strong>{" "}
              {todayHourly.pressure.avg.toFixed(2)} hPa
            </p>
            <p>
              <strong>Max Humidity:</strong>{" "}
              {todayHourly.humidity.max.toFixed(2)}%
            </p>
            <p>
              <strong>Min Humidity:</strong>{" "}
              {todayHourly.humidity.min.toFixed(2)}%
            </p>
            <p>
              <strong>Avg Humidity:</strong>{" "}
              {todayHourly.humidity.avg.toFixed(2)}%
            </p>
            <p>
              <strong>Time of Max Humidity:</strong>{" "}
              {formatTime(todayHourly.humidity.maxTime)}
            </p>
          </div>
        </div>
      )}

      {viewMode === "weekly" && daily && (
        <div className="data-display">
          <h3>Weekly Forecast</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Max Temp (°C)</th>
                <th>Min Temp (°C)</th>
                <th>Precipitation (mm)</th>
              </tr>
            </thead>
            <tbody>
              {daily.time.map((date, index) => (
                <tr key={index}>
                  <td>{new Date(date).toLocaleDateString()}</td>
                  <td>{daily.temperature_2m_max[index].toFixed(2)}</td>
                  <td>{daily.temperature_2m_min[index].toFixed(2)}</td>
                  <td>{(daily.precipitation_sum[index] || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WeatherForecastComponent;
