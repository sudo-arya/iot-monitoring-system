import React, { useEffect, useState } from "react";
import axios from "axios";

const WeatherComponent = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);

  // Coordinates for the location
  const lat = 22.316718169420145;
  const lon = 87.317671736126;

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        // Fetching hourly and daily weather data from Open-Meteo API
        const response = await axios.get(
          `https://api.open-meteo.com/v1/forecast`,
          {
            params: {
              latitude: lat,
              longitude: lon,
              daily: [
                "temperature_2m_max",
                "temperature_2m_min",
                "precipitation_sum",
                "wind_speed_10m_max",
                "wind_gusts_10m_max",
                "uv_index_max",
                "weather_code",
                "sunrise",
                "sunset",
                "sunshine_duration",
                "daylight_duration",
                "wind_direction_10m_dominant",
              ].join(","), // Requesting multiple daily parameters
              hourly: ["temperature_2m", "wind_speed_10m"].join(","), // Request hourly temperature and wind speed
              timezone: "auto", // Automatically detect timezone
            },
          }
        );

        console.log("Full Response:", response.data); // Log response for debugging

        // Checking if data is available and setting it
        if (response.data && response.data.daily && response.data.hourly) {
          const { daily, hourly, current_weather } = response.data;
          const currentHour = new Date().getHours();
          setWeatherData({
            temperature_max: daily.temperature_2m_max[0],
            temperature_min: daily.temperature_2m_min[0],
            precipitation_sum: daily.precipitation_sum[0],
            wind_speed_max: daily.wind_speed_10m_max[0],
            wind_gusts_max: daily.wind_gusts_10m_max[0],
            uv_index_max: daily.uv_index_max[0],
            weather_code: daily.weather_code[0],
            sunrise: daily.sunrise[0],
            sunset: daily.sunset[0],
            sunshine_duration: daily.sunshine_duration[0],
            daylight_duration: daily.daylight_duration[0],
            wind_direction: daily.wind_direction_10m_dominant[0],
            current_temperature: hourly.temperature_2m[currentHour],
            current_wind_speed: hourly.wind_speed_10m[currentHour],
          });
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

  const convertSeconds = (seconds) => {
    if (seconds < 3600) {
      return `${(seconds / 60).toFixed(0)} minutes`;
    } else {
      return `${(seconds / 3600).toFixed(2)} hours`;
    }
  };

  const getWindDirection = (degree) => {
    if (degree >= 0 && degree < 22.5) return "North";
    if (degree >= 22.5 && degree < 67.5) return "Northeast";
    if (degree >= 67.5 && degree < 112.5) return "East";
    if (degree >= 112.5 && degree < 157.5) return "Southeast";
    if (degree >= 157.5 && degree < 202.5) return "South";
    if (degree >= 202.5 && degree < 247.5) return "Southwest";
    if (degree >= 247.5 && degree < 292.5) return "West";
    if (degree >= 292.5 && degree < 337.5) return "Northwest";
    return "North";
  };


  const getWeatherDescription = (code) => {
    const weatherCodes = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Cloudy",
      4: "Overcast",
      5: "Fog",
      6: "Freezing fog",
      7: "Light rain",
      8: "Moderate rain",
      9: "Heavy rain",
      10: "Light snow",
      11: "Moderate snow",
      12: "Heavy snow",
      13: "Snow grains",
      14: "Hail",
      15: "Thunderstorm",
      16: "Light thunderstorm",
      17: "Moderate thunderstorm",
      18: "Heavy thunderstorm",
      19: "Dust",
      20: "Sand",
      21: "Ash",
      22: "Squall",
      23: "Tornado",
    };

    return weatherCodes[code] || "Unknown weather condition";
  };

  const getUVIndexInfo = (uvIndex) => {
    let uvCategory = "";
    let precautions = "";

    if (uvIndex >= 0 && uvIndex <= 2) {
      uvCategory = "Low";
      precautions = "Enjoy the sun safely with minimal protection.";
    } else if (uvIndex >= 3 && uvIndex <= 5) {
      uvCategory = "Moderate";
      precautions = "Wear sunscreen and protective clothing.";
    } else if (uvIndex >= 6 && uvIndex <= 7) {
      uvCategory = "High";
      precautions = "Seek shade and wear sunscreen frequently.";
    } else if (uvIndex >= 8 && uvIndex <= 10) {
      uvCategory = "Very High";
      precautions = "Avoid direct sun exposure during peak hours.";
    } else if (uvIndex >= 11) {
      uvCategory = "Extreme";
      precautions = "Avoid being outside; use full sun protection.";
    }

    return { uvCategory, precautions };
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!weatherData) {
    return <div>Loading...</div>;
  }

  // Destructure the required data from the response
  const {
    temperature_max,
    temperature_min,
    precipitation_sum,
    wind_speed_max,
    wind_gusts_max,
    uv_index_max,
    weather_code,
    sunrise,
    sunset,
    sunshine_duration,
    daylight_duration,
    wind_direction,
    current_temperature,
    current_wind_speed,
  } = weatherData;

  const { uvCategory, precautions } = getUVIndexInfo(uv_index_max);

  return (
    <div className="w-fit bg-gray-100 px-12 py-4 border border-green-700 text-green-700">
      <div className="current-weather">
        <h2>Weather Today</h2>
        <p>
          <strong>Current Temperature:</strong> {current_temperature}°C
        </p>
        <p>
          <strong>Current Wind Speed:</strong> {current_wind_speed} km/h
        </p>
        <p>
          <strong>Sunrise:</strong> {new Date(sunrise).toLocaleString()}
        </p>
        <p>
          <strong>Sunset:</strong> {new Date(sunset).toLocaleString()}
        </p>
        <p>Temperature Max: {temperature_max}°C</p>
        <p>Temperature Min: {temperature_min}°C</p>
        <p>Precipitation: {precipitation_sum} mm</p>
        <p>Wind Speed Max: {wind_speed_max} km/h</p>
        <p>Wind Gust Max: {wind_gusts_max} km/h</p>
        <p>Wind Direction: {getWindDirection(wind_direction)}</p>
        <p>
          UV Index Max: {uv_index_max} ({uvCategory})
        </p>
        <p>UV Index Precautions: {precautions}</p>
        <p>Weather: {getWeatherDescription(weather_code)}</p>
        <p>Sunshine Duration: {convertSeconds(sunshine_duration)}</p>
        <p>Daylight Duration: {convertSeconds(daylight_duration)}</p>
      </div>
    </div>
  );
};

export default WeatherComponent;
