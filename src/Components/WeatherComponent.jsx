import React, { useEffect, useState } from "react";
import axios from "axios";

const WeatherComponent = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);

  // Coordinates for the location
  const lat = 60.515802413267174;
  const lon = 5.572510170378234;

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        // Fetching weather data from Open-Meteo API
        const response = await axios.get(
          `https://api.open-meteo.com/v1/forecast`,
          {
            params: {
              latitude: lat,
              longitude: lon,
              current_weather: true, // We are requesting the current weather
              //   forecast: 24, // For 24-hour forecast
              //   hourly: "temperature_2m,humidity_2m,pressure_msl,windspeed_10m", // Hourly data (temperature, humidity, pressure, windspeed)
              // hourly:"temperature_2m",
              current: "temperature_2m,humidity_2m,pressure_msl,windspeed_10m", // Current weather variables
              hourly:
                "temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m", // Hourly weather variables
              forecast_days: 7, // Forecast for up to 7 days (or change to 16 for a 16-day forecast)
              timezone: "auto", // Automatically detect the timezone based on coordinates
              temperature_unit: "celsius", // Optional: Default is celsius, set to fahrenheit if needed
              wind_speed_unit: "kmh", // Optional: Adjust wind speed unit if needed
            },
          }
        );

        if (response.data && response.data.current_weather) {
          setWeatherData(response.data.current_weather);
        } else {
          setError("Location not found or unable to fetch data");
        }
      } catch (err) {
        setError("Error fetching weather data");
        console.error(err);
      }
    };

    fetchWeatherData();
  }, []); // Run once on mount

  if (error) {
    return <div>{error}</div>;
  }

  if (!weatherData) {
    return <div>Loading...</div>;
  }

  const { temperature, windspeed, pressure, humidity } = weatherData;

  return (
    <div className="w-fit bg-gray-100 px-12 py-4 border border-green-700 text-green-700">
      <div className="current-weather">
        <h2>Weather's Today</h2>
        <p>
          <strong>{new Date().toLocaleDateString()}</strong>
        </p>
        <p>Temperature: {temperature}°C</p>
        <p>Humidity: {humidity}%</p>
        <p>Wind Speed: {windspeed} m/s</p>
        <p>Pressure: {pressure} hPa</p>
      </div>
    </div>
  );
};

export default WeatherComponent;
