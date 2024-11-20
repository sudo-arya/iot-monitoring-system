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

  const hourlyData = hourly
    ? {
        temperature: {
          max: Math.max(...hourly.temperature_2m),
          min: Math.min(...hourly.temperature_2m),
          avg: calculateAverage(hourly.temperature_2m),
        },
        wind: {
          max: Math.max(...hourly.wind_speed_10m),
          min: Math.min(...hourly.wind_speed_10m),
          avg: calculateAverage(hourly.wind_speed_10m),
          direction: hourly.wind_direction_10m[0], // Simplified, show first value
        },
        pressure: {
          max: Math.max(...hourly.pressure_msl),
          min: Math.min(...hourly.pressure_msl),
          avg: calculateAverage(hourly.pressure_msl),
        },
        humidity: {
          max: Math.max(...hourly.relative_humidity_2m),
          min: Math.min(...hourly.relative_humidity_2m),
          avg: calculateAverage(hourly.relative_humidity_2m),
        },
      }
    : null;

  const dailyData = daily
    ? {
        temperature: {
          max: Math.max(...daily.temperature_2m_max),
          min: Math.min(...daily.temperature_2m_min),
          avg: calculateAverage(
            daily.temperature_2m_max.concat(daily.temperature_2m_min)
          ),
        },
        wind: {
          max: hourlyData.wind.max,
          min: hourlyData.wind.min,
          avg: hourlyData.wind.avg,
          direction: hourlyData.wind.direction, // No daily wind direction in API
        },
        pressure: hourlyData.pressure,
        humidity: hourlyData.humidity,
      }
    : null;

    const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: "long", day: "numeric", month: "short" };
    return date.toLocaleDateString("en-US", options);
  };
    const weeklyData = daily
      ? daily.time.map((date, index) => ({
          date: formatDate(date),
          maxTemp: daily.temperature_2m_max[index],
          minTemp: daily.temperature_2m_min[index],
          precipitation: daily.precipitation_sum[index] || 0,
        }))
      : null;

  const dataToDisplay = viewMode === "hourly" ? hourlyData : dailyData;

  return (
    <div className="forecast-container">
      <div className="view-mode-buttons">
        <button onClick={() => setViewMode("hourly")}>Hourly Forecast</button>
        <button onClick={() => setViewMode("weekly")}>Weekly Forecast</button>
      </div>

      {dataToDisplay && (
        <div className="data-display">
          <h3>{viewMode === "hourly" ? "Hourly" : "Weekly"} Forecast</h3>
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Max</th>
                <th>Min</th>
                <th>Avg</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Temperature (°C)</td>
                <td>{dataToDisplay.temperature.max.toFixed(2)}</td>
                <td>{dataToDisplay.temperature.min.toFixed(2)}</td>
                <td>{dataToDisplay.temperature.avg.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Wind Speed (km/h)</td>
                <td>{dataToDisplay.wind.max.toFixed(2)}</td>
                <td>{dataToDisplay.wind.min.toFixed(2)}</td>
                <td>{dataToDisplay.wind.avg.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Wind Direction</td>
                <td colSpan="3">{dataToDisplay.wind.direction}°</td>
              </tr>
              <tr>
                <td>Pressure (hPa)</td>
                <td>{dataToDisplay.pressure.max.toFixed(2)}</td>
                <td>{dataToDisplay.pressure.min.toFixed(2)}</td>
                <td>{dataToDisplay.pressure.avg.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Humidity (%)</td>
                <td>{dataToDisplay.humidity.max.toFixed(2)}</td>
                <td>{dataToDisplay.humidity.min.toFixed(2)}</td>
                <td>{dataToDisplay.humidity.avg.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WeatherForecastComponent;
