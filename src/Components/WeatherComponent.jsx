import React, { useEffect, useState } from "react";
import axios from "axios";
// import WindDirection from "./WindDirection";
import { FaCloudRain } from "react-icons/fa";
// import sunrise from "../Asset/noun-sunrise-7393088.svg";
// import sunset from "../Asset/noun-sunrise-7393088.svg";

const WeatherComponent = ({ locations }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);

  const [firstLat, setFirstLat] = useState(null);
  const [firstLong, setFirstLong] = useState(null);
  useEffect(() => {
    if (locations?.length > 0) {
      const { latitude, longitude } = locations[0];
      if (latitude && longitude) {
        setFirstLat(latitude);
        setFirstLong(longitude);
        
      } else {
        console.error(
          "Latitude or longitude is missing in the first location."
        );
      }
    } else {
      console.warn("No locations provided");
    }
  }, [locations]);

  // Coordinates for the location
  // const lat = 22.314806706030907;
  // const lon = 87.32086776565481;
  //  const lat = firstLat;
  //  const lon = firstLong;
  // const lat = firstLat;
  // const lon = firstLong;
  // console.log(lat);
  // console.log(lon);

// console.log(firstLat);
// console.log(firstLong);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        // Fetching weather data from Open-Meteo API
        const response = await axios.get(
          `https://api.open-meteo.com/v1/forecast`,
          {
            params: {
              latitude: firstLat,
              longitude: firstLong,
              current_weather: true, // Requesting the current weather
              timezone: "auto", // Automatically detect timezone
            },
          }
        );

        // Extracting the last updated timestamp
        const lastUpdatedTime = response.data.current_weather?.time;
        if (lastUpdatedTime) {
          setLastUpdated(lastUpdatedTime);
        }
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    fetchWeatherData();
  }, [firstLat, firstLong]);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        // Fetching hourly and daily weather data from Open-Meteo API
        const response = await axios.get(
          `https://api.open-meteo.com/v1/forecast`,
          {
            params: {
              latitude: firstLat,
              longitude: firstLong,
              daily: [
                "temperature_2m_max",
                "temperature_2m_min",
                "precipitation_sum",
                "wind_speed_10m_max",
                "wind_gusts_10m_max",
                "uv_index_max",
                "weather_code",
                // "time",
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

        // console.log("Full Response:", response.data); // Log response for debugging

        // Checking if data is available and setting it
        if (response.data && response.data.daily && response.data.hourly) {
          // eslint-disable-next-line
          const { daily, hourly, current_weather } = response.data;
          const currentHour = new Date().getHours();
          const fetchTime = new Date(); // Capture the current time

          setWeatherData({
            temperature_max: daily.temperature_2m_max[0],
            temperature_min: daily.temperature_2m_min[0],
            precipitation_sum: daily.precipitation_sum[0],
            wind_speed_max: daily.wind_speed_10m_max[0],
            wind_gusts_max: daily.wind_gusts_10m_max[0],
            uv_index_max: daily.uv_index_max[0],
            weather_code: daily.weather_code[0],
            time: daily.time[0], // Today's date from daily.time
            sunrise: daily.sunrise[0],
            sunset: daily.sunset[0],
            sunshine_duration: daily.sunshine_duration[0],
            daylight_duration: daily.daylight_duration[0],
            wind_direction: daily.wind_direction_10m_dominant[0],
            current_temperature: hourly.temperature_2m[currentHour],
            current_wind_speed: hourly.wind_speed_10m[currentHour],
            last_updated: fetchTime.toISOString(), // Add fetch timestamp
          });
          // console.log("Daily Time:", daily.time);
        } else {
          setError("Location not found or unable to fetch data");
        }
      } catch (err) {
        setError("Error fetching weather data");
        console.error(err);
      }
    };
    if (firstLat && firstLong) {
      fetchWeatherData();
    }
  }, [firstLat, firstLong]); // Run once on mount

  const convertSeconds = (seconds) => {
    if (seconds < 3600) {
      return `${(seconds / 60).toFixed(0)} min`;
    } else {
      return `${(seconds / 3600).toFixed(2)} hrs`;
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

  // const getWeatherDescription = (code) => {
  //   const weatherCodes = {
  //     0: "Clear sky",
  //     1: "Mainly clear",
  //     2: "Partly cloudy",
  //     3: "Cloudy",
  //     4: "Overcast",
  //     5: "Fog",
  //     6: "Freezing fog",
  //     7: "Light rain",
  //     8: "Moderate rain",
  //     9: "Heavy rain",
  //     10: "Light snow",
  //     11: "Moderate snow",
  //     12: "Heavy snow",
  //     13: "Snow grains",
  //     14: "Hail",
  //     15: "Thunderstorm",
  //     16: "Light thunderstorm",
  //     17: "Moderate thunderstorm",
  //     18: "Heavy thunderstorm",
  //     19: "Dust",
  //     20: "Sand",
  //     21: "Ash",
  //     22: "Squall",
  //     23: "Tornado",
  //   };

  //   return weatherCodes[code] || "Unknown weather condition";
  // };

  const getWeatherInfo = (code) => {
    const weatherData = {
      0: {
        description: "Cloud development not observed or not observable",
        image: "https://cdn-icons-png.flaticon.com/512/869/869869.png",
      },
      1: {
        description: "Clouds generally dissolving or becoming less developed",
        image: "https://cdn-icons-png.flaticon.com/512/1163/1163661.png",
      },
      2: {
        description: "State of sky unchanged",
        image: "https://cdn-icons-png.flaticon.com/512/414/414825.png",
      },
      3: {
        description: "Clouds generally forming or developing",
        image: "https://cdn-icons-png.flaticon.com/512/1163/1163624.png",
      },
      4: {
        description: "Visibility reduced by smoke",
        image: "https://cdn-icons-png.flaticon.com/512/869/869864.png",
      },
      5: {
        description: "Haze",
        image: "https://cdn-icons-png.flaticon.com/512/6363/6363108.png",
      },
      6: {
        description: "Widespread dust in suspension",
        image: "https://cdn-icons-png.flaticon.com/512/2917/2917995.png",
      },
      7: {
        description: "Dust or sand raised by wind",
        image: "https://cdn-icons-png.flaticon.com/512/2917/2917999.png",
      },
      8: {
        description: "Well developed dust whirl(s) or sand whirl(s)",
        image: "https://cdn-icons-png.flaticon.com/512/2917/2918000.png",
      },
      9: {
        description: "Duststorm or sandstorm within sight",
        image: "https://cdn-icons-png.flaticon.com/512/869/869870.png",
      },
      10: {
        description: "Mist",
        image: "https://cdn-icons-png.flaticon.com/512/4089/4089253.png",
      },
      11: {
        description: "Patches shallow fog or ice fog",
        image: "https://cdn-icons-png.flaticon.com/512/1146/1146869.png",
      },
      12: {
        description: "More or less continuous fog or ice fog",
        image: "https://cdn-icons-png.flaticon.com/512/3216/3216953.png",
      },
      13: {
        description: "Lightning visible, no thunder heard",
        image: "https://cdn-icons-png.flaticon.com/512/869/869862.png",
      },
      14: {
        description: "Precipitation within sight, not reaching the ground",
        image: "https://cdn-icons-png.flaticon.com/512/4089/4089253.png",
      },
      15: {
        description:
          "Precipitation within sight, reaching the ground but distant",
        image: "https://cdn-icons-png.flaticon.com/512/414/414979.png",
      },
      16: {
        description: "Precipitation within sight, near to the station",
        image: "https://cdn-icons-png.flaticon.com/512/414/414974.png",
      },
      17: {
        description: "Thunderstorm, no precipitation",
        image: "https://cdn-icons-png.flaticon.com/512/4089/4089253.png",
      },
      18: {
        description: "Squalls",
        image: "https://cdn-icons-png.flaticon.com/512/869/869864.png",
      },
      19: {
        description: "Funnel cloud(s) (Tornado or water-spout)",
        image: "https://cdn-icons-png.flaticon.com/512/869/869870.png",
      },
      20: {
        description: "Drizzle, not freezing",
        image: "https://cdn-icons-png.flaticon.com/512/6363/6363108.png",
      },
      21: {
        description: "Rain (not freezing)",
        image: "https://cdn-icons-png.flaticon.com/512/4088/4088981.png",
      },
      22: {
        description: "Snow",
        image: "https://cdn-icons-png.flaticon.com/512/6363/6363108.png",
      },
      23: {
        description: "Rain and snow or ice pellets",
        image: "https://cdn-icons-png.flaticon.com/512/414/414986.png",
      },
      24: {
        description: "Freezing drizzle or freezing rain",
        image: "https://cdn-icons-png.flaticon.com/512/6363/6363108.png",
      },
      25: {
        description: "Shower(s) of rain",
        image: "https://cdn-icons-png.flaticon.com/512/4088/4088981.png",
      },
      26: {
        description: "Shower(s) of snow or rain and snow",
        image: "https://cdn-icons-png.flaticon.com/512/6363/6363108.png",
      },
      27: {
        description: "Shower(s) of hail or rain and hail",
        image: "https://cdn-icons-png.flaticon.com/512/1146/1146893.png",
      },
      28: {
        description: "Fog or ice fog",
        image: "https://cdn-icons-png.flaticon.com/512/1146/1146882.png",
      },
      29: {
        description: "Thunderstorm (with or without precipitation)",
        image: "https://cdn-icons-png.flaticon.com/512/4089/4089253.png",
      },
      30: {
        description: "Slight or moderate duststorm or sandstorm",
        image: "https://cdn-icons-png.flaticon.com/512/2917/2917995.png",
      },
      31: {
        description: "No appreciable change in duststorm or sandstorm",
        image: "https://cdn-icons-png.flaticon.com/512/2917/2917999.png",
      },
      32: {
        description: "Slight or moderate blowing snow",
        image: "https://cdn-icons-png.flaticon.com/512/869/869862.png",
      },
      33: {
        description: "Severe duststorm or sandstorm",
        image: "https://cdn-icons-png.flaticon.com/512/2917/2917995.png",
      },
      34: {
        description: "No appreciable change in blowing snow",
        image: "https://cdn-icons-png.flaticon.com/512/6363/6363108.png",
      },
      35: {
        description: "Increasing blowing snow",
        image: "https://cdn-icons-png.flaticon.com/512/4089/4089253.png",
      },
      36: {
        description: "Slight or moderate blowing snow (low)",
        image: "https://cdn-icons-png.flaticon.com/512/6363/6363108.png",
      },
      37: {
        description: "Heavy drifting snow",
        image: "https://cdn-icons-png.flaticon.com/512/6363/6363108.png",
      },
      38: {
        description: "Slight or moderate blowing snow (high)",
        image: "https://cdn-icons-png.flaticon.com/512/6363/6363108.png",
      },
      39: {
        description: "Heavy drifting snow",
        image: "https://cdn-icons-png.flaticon.com/512/6363/6363108.png",
      },
      40: {
        description: "Fog or ice fog at a distance",
        image: "https://cdn-icons-png.flaticon.com/512/869/869864.png",
      },
      41: {
        description: "Fog or ice fog in patches",
        image: "https://cdn-icons-png.flaticon.com/512/4089/4089253.png",
      },
      42: {
        description: "Fog or ice fog, sky visible",
        image: "https://cdn-icons-png.flaticon.com/512/4089/4089253.png",
      },
      43: {
        description: "Fog or ice fog, sky invisible",
        image: "https://cdn-icons-png.flaticon.com/512/4089/4089253.png",
      },
      44: {
        description: "Fog or ice fog, sky visible, no appreciable change",
        image: "https://cdn-icons-png.flaticon.com/512/4089/4089253.png",
      },
      45: {
        description: "Fog or ice fog, sky invisible",
        image: "https://cdn-icons-png.flaticon.com/512/4089/4089253.png",
      },
      46: {
        description: "Fog or ice fog, sky visible, becoming thicker",
        image: "https://cdn-icons-png.flaticon.com/512/4089/4089253.png",
      },
      47: {
        description: "Fog or ice fog, sky invisible",
        image: "https://cdn-icons-png.flaticon.com/512/4089/4089253.png",
      },
      48: {
        description: "Fog, depositing rime",
        image: "https://cdn-icons-png.flaticon.com/512/4089/4089253.png",
      },
      49: {
        description: "Fog, freezing",
        image: "https://cdn-icons-png.flaticon.com/512/4089/4089253.png",
      },

      50: {
        description: "Fog, with visibility restricted",
        image: "https://cdn-icons-png.flaticon.com/512/4089/4089253.png", // fog icon
      },
      51: {
        description: "Light snow with moderate wind",
        image: "https://cdn-icons-png.flaticon.com/512/6363/6363108.png", // snow icon
      },
      52: {
        description: "Moderate snow with moderate wind",
        image: "https://cdn-icons-png.flaticon.com/512/6363/6363108.png", // snow icon
      },
      53: {
        description: "Heavy snow with moderate wind",
        image: "https://cdn-icons-png.flaticon.com/512/6363/6363108.png", // snow icon
      },
      54: {
        description: "Light snow with strong wind",
        image: "https://cdn-icons-png.flaticon.com/512/6363/6363108.png", // snow icon
      },
      55: {
        description: "Moderate snow with strong wind",
        image: "https://cdn-icons-png.flaticon.com/512/6363/6363108.png", // snow icon
      },
      56: {
        description: "Heavy snow with strong wind",
        image: "https://cdn-icons-png.flaticon.com/512/6363/6363108.png", // snow icon
      },
      57: {
        description: "Light rain with moderate wind",
        image: "https://cdn-icons-png.flaticon.com/512/4088/4088981.png", // rain icon
      },
      58: {
        description: "Moderate rain with moderate wind",
        image: "https://cdn-icons-png.flaticon.com/512/4088/4088981.png", // rain icon
      },
      59: {
        description: "Heavy rain with moderate wind",
        image: "https://cdn-icons-png.flaticon.com/512/4088/4088981.png", // rain icon
      },
      60: {
        description: "Light rain with strong wind",
        image: "https://cdn-icons-png.flaticon.com/512/4088/4088981.png", // rain icon
      },
      61: {
        description: "Moderate rain with strong wind",
        image: "https://cdn-icons-png.flaticon.com/512/4088/4088981.png", // rain icon
      },
      62: {
        description: "Heavy rain with strong wind",
        image: "https://cdn-icons-png.flaticon.com/512/4088/4088981.png", // rain icon
      },
      63: {
        description: "Light snow with freezing rain",
        image: "https://cdn-icons-png.flaticon.com/512/6363/6363108.png", // snow icon
      },
      64: {
        description: "Moderate snow with freezing rain",
        image: "https://cdn-icons-png.flaticon.com/512/6363/6363108.png", // snow icon
      },
      65: {
        description: "Heavy snow with freezing rain",
        image: "https://cdn-icons-png.flaticon.com/512/6363/6363108.png", // snow icon
      },
      66: {
        description: "Light snow with sleet",
        image: "https://cdn-icons-png.flaticon.com/512/6363/6363108.png", // snow icon
      },
      67: {
        description: "Moderate snow with sleet",
        image: "https://cdn-icons-png.flaticon.com/512/6363/6363108.png", // snow icon
      },
      68: {
        description: "Heavy snow with sleet",
        image: "https://cdn-icons-png.flaticon.com/512/6363/6363108.png", // snow icon
      },
      69: {
        description: "Light snow with thunderstorms",
        image: "https://cdn-icons-png.flaticon.com/512/4724/4724103.png", // thunderstorm icon
      },
      70: {
        description: "Moderate snow with thunderstorms",
        image: "https://cdn-icons-png.flaticon.com/512/4724/4724103.png", // thunderstorm icon
      },
      71: {
        description: "Heavy snow with thunderstorms",
        image: "https://cdn-icons-png.flaticon.com/512/4724/4724103.png", // thunderstorm icon
      },
      72: {
        description: "Light snow with heavy fog",
        image: "https://cdn-icons-png.flaticon.com/512/4089/4089253.png", // fog icon
      },
      73: {
        description: "Moderate snow with heavy fog",
        image: "https://cdn-icons-png.flaticon.com/512/4089/4089253.png", // fog icon
      },
      74: {
        description: "Heavy snow with heavy fog",
        image: "https://cdn-icons-png.flaticon.com/512/4089/4089253.png", // fog icon
      },
      75: {
        description: "Light snow with visibility reduction",
        image: "https://cdn-icons-png.flaticon.com/512/6363/6363108.png", // snow icon
      },
      76: {
        description: "Moderate snow with visibility reduction",
        image: "https://cdn-icons-png.flaticon.com/512/6363/6363108.png", // snow icon
      },
      77: {
        description: "Heavy snow with visibility reduction",
        image: "https://cdn-icons-png.flaticon.com/512/6363/6363108.png", // snow icon
      },
      78: {
        description: "Light snow with freezing fog",
        image: "https://cdn-icons-png.flaticon.com/512/4089/4089253.png", // fog icon
      },
      79: {
        description: "Moderate snow with freezing fog",
        image: "https://cdn-icons-png.flaticon.com/512/4089/4089253.png", // fog icon
      },
      80: {
        description: "Heavy snow with freezing fog",
        image: "https://cdn-icons-png.flaticon.com/512/4089/4089253.png", // fog icon
      },
      81: {
        description: "Thunderstorm with light rain",
        image: "https://cdn-icons-png.flaticon.com/512/4724/4724103.png", // thunderstorm icon
      },
      82: {
        description: "Thunderstorm with moderate rain",
        image: "https://cdn-icons-png.flaticon.com/512/4724/4724103.png", // thunderstorm icon
      },
      83: {
        description: "Thunderstorm with heavy rain",
        image: "https://cdn-icons-png.flaticon.com/512/4724/4724103.png", // thunderstorm icon
      },
      84: {
        description: "Thunderstorm with light snow",
        image: "https://cdn-icons-png.flaticon.com/512/4724/4724103.png", // thunderstorm icon
      },
      85: {
        description: "Thunderstorm with moderate snow",
        image: "https://cdn-icons-png.flaticon.com/512/4724/4724103.png", // thunderstorm icon
      },
      86: {
        description: "Thunderstorm with heavy snow",
        image: "https://cdn-icons-png.flaticon.com/512/4724/4724103.png", // thunderstorm icon
      },
      87: {
        description: "Heavy rain with hail",
        image: "https://cdn-icons-png.flaticon.com/512/4165/4165590.png", // hail icon
      },
      88: {
        description: "Light rain with hail",
        image: "https://cdn-icons-png.flaticon.com/512/4165/4165590.png", // hail icon
      },
      89: {
        description: "Moderate rain with hail",
        image: "https://cdn-icons-png.flaticon.com/512/4165/4165590.png", // hail icon
      },
      90: {
        description: "Light snow with hail",
        image: "https://cdn-icons-png.flaticon.com/512/6363/6363108.png", // snow icon
      },
      91: {
        description: "Moderate snow with hail",
        image: "https://cdn-icons-png.flaticon.com/512/6363/6363108.png", // snow icon
      },
      92: {
        description: "Heavy snow with hail",
        image: "https://cdn-icons-png.flaticon.com/512/6363/6363108.png", // snow icon
      },
      93: {
        description: "Light snow with thunder",
        image: "https://cdn-icons-png.flaticon.com/512/5454/5454492.png", // thunderstorm icon
      },
      94: {
        description: "Moderate snow with thunder",
        image: "https://cdn-icons-png.flaticon.com/512/5454/5454492.png", // thunderstorm icon
      },
      95: {
        description: "Heavy snow with thunder",
        image: "https://cdn-icons-png.flaticon.com/512/5454/5454492.png", // thunderstorm icon
      },
      96: {
        description: "Thunderstorm with snow",
        image: "https://cdn-icons-png.flaticon.com/512/5454/5454492.png", // thunderstorm icon
      },
      97: {
        description: "Severe thunderstorm with snow",
        image: "https://cdn-icons-png.flaticon.com/512/5454/5454492.png", // thunderstorm icon
      },
      98: {
        description: "Severe thunderstorm with ice pellets",
        image: "https://cdn-icons-png.flaticon.com/512/5454/5454492.png", // thunderstorm icon
      },
      99: {
        description: "Extremely severe thunderstorm with ice pellets",
        image: "https://cdn-icons-png.flaticon.com/512/5454/5454492.png", // thunderstorm icon
      },
    };

    return (
      weatherData[code] || {
        description: "Unknown weather condition",
        image: "https://cdn-icons-png.flaticon.com/512/869/869869.png",
      }
    );
  };


  const getUVIndexInfo = (uvIndex) => {
    let uvCategory = "";
    let precautions = "";

    if (uvIndex >= 0 && uvIndex < 3) {
      // UV Index 0 to 2.99
      uvCategory = "Low";
      precautions = "Enjoy the sun safely with minimal protection.";
    } else if (uvIndex >= 3 && uvIndex < 6) {
      // UV Index 3 to 5.99
      uvCategory = "Moderate";
      precautions = "Wear sunscreen and protective clothing.";
    } else if (uvIndex >= 6 && uvIndex < 8) {
      // UV Index 6 to 7.99
      uvCategory = "High";
      precautions = "Seek shade and wear sunscreen frequently.";
    } else if (uvIndex >= 8 && uvIndex < 11) {
      // UV Index 8 to 10.99
      uvCategory = "Very High";
      precautions = "Avoid direct sun exposure during peak hours.";
    } else if (uvIndex >= 11) {
      // UV Index 11 and above
      uvCategory = "Extreme";
      precautions = "Avoid being outside; use full sun protection.";
    } else {
      uvCategory = "Unknown";
      precautions = "UV Index data unavailable or out of range.";
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
    // time,
    // last_updated,
    // getWeatherDescription,
  } = weatherData;

  const { uvCategory, precautions } = getUVIndexInfo(uv_index_max);
  const { description, image } = getWeatherInfo(weather_code);
  // eslint-disable-next-line
  const windDegree = wind_direction;

  return (
    <div className="xl:w-fit w-[calc(100vw-6rem)] bg-white px-6 xl:px-14 py-4 border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 rounded-3xl shadow-lg  text-gray-700">
      {/* <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-500 to-emerald-500 -z-10"></div> */}
      <div className="current-weather">
        <div className=" inline-flex">
          <p className=" underline text-4xl font-bold">Current Weather</p>
          {lastUpdated ? (
            <p className="flex items-end ml-2 justify-end text-md font-bold whitespace-nowrap">
              {" "}
              - on&nbsp;
              {new Date(lastUpdated).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          ) : (
            <p>Loading...</p>
          )}
        </div>
        <div className="flex text-start items-center text-2xl font-semibold mt-2 justify-start">
          {new Date(lastUpdated).toLocaleDateString("en-GB", {
            weekday: "long", // Adds abbreviated day name
            day: "2-digit",
            month: "short",
            year: "2-digit",
          })}
        </div>

        <div className="flex xl:text-center xl:justify-center items-center flex-col xl:flex-row my-4 ">
          <div className="weather-info">
            <img
              src={image}
              alt={description}
              // style={{ width: "60px", height: "60px" }}
              className=" w-16 h-16"
            />
          </div>
          <div className="flex xl:flex-col flex-col-reverse xl:ml-2">
            <p className=" text-4xl flex justify-center xl:mt-1  items-end font-bold ">
              {current_temperature}°C
            </p>
            <p className="flex items-center  justify-center text-sm font-semibold ">
              ({description})
            </p>
          </div>
          <p className="flex items-center xl:mt-3 xl:ml-2 justify-center text-md font-semibold ">
            {temperature_min}°/{temperature_max}°
          </p>
        </div>

        <div className="flex xl:text-center xl:justify-center items-start justify-start flex-col xl:flex-row">
          <div className="flex xl:w-1/2 my-1">
            {/* <FaWind size={26} title="Wind" className="mr-2" /> */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              viewBox="8.0 12.0 120.0 120.0"
              width="40"
              height="40"
            >
              <path
                d="m33.289 8.4961h1.793c0.71094 0 1.2852 0.57422 1.2852 1.2617v2.1914c16.434 7.4844 38.535-0.35547 52.465 6.7539 1.4844 0.75391 2.3477 2.1953 2.3477 3.8555v8.5039c0 0.57422-0.22266 1.043-0.64063 1.4219-0.42187 0.37891-0.92969 0.53125-1.4844 0.44141-18.535-2.6133-32.047 11.383-52.688 9.082v1.2617c0 0.6875-0.57422 1.2617-1.2852 1.2617l-1.793-0.003906c-0.70703 0-1.2852-0.57422-1.2852-1.2617l0.003906-33.504c0-0.6875 0.57422-1.2656 1.2812-1.2656zm-22.523 15.859h3.8984c0.042969-0.042969 0.10938-0.089844 0.15234-0.13281l14.375-11.672v3.8516l-11.184 9.082v2.0352l11.184 9.1055v3.8555l-14.547-11.832h-3.875c-0.53125 0-0.97266-0.44141-0.97266-0.97266v-2.3477c-0.003906-0.53125 0.4375-0.97266 0.96875-0.97266zm-1.9492 70.648c-0.82031 0-1.5078-0.66406-1.5078-1.4844 0-0.83984 0.6875-1.5039 1.5078-1.5039h1.7266l0.003906-60.555h0.22266 2.7695v60.551h1.7266c0.82031 0 1.5078 0.66406 1.5078 1.5039 0 0.82031-0.6875 1.4844-1.5078 1.4844zm1.7305-73.441v-10.605c-0.99609-0.55469-1.6602-1.5938-1.6602-2.7891 0-1.75 1.418-3.168 3.1641-3.168 1.7305 0 3.1445 1.418 3.1445 3.168 0 1.1953-0.66406 2.2344-1.6602 2.7891v10.586h-2.7695c-0.066406-0.003907-0.15234-0.003907-0.21875 0.019531zm43.34 55.676c0.39844-0.73047 1.3281-0.99609 2.0352-0.57422 0.73047 0.39844 0.97266 1.3086 0.57422 2.0391-0.26562 0.48438-0.48828 1.0195-0.64453 1.5703-0.13281 0.50781-0.19922 1.0859-0.19922 1.6836 0 1.8398 0.73047 3.5 1.9492 4.7188 1.1953 1.1953 2.8789 1.9492 4.7188 1.9492 1.8398 0 3.5-0.75 4.7188-1.9492 1.1953-1.2188 1.9492-2.8789 1.9492-4.7188 0-1.8398-0.75391-3.5-1.9492-4.7188-1.2188-1.1953-2.8789-1.9492-4.7188-1.9492h-32.727c-0.84375 0-1.5078-0.66406-1.5078-1.5039 0-0.82031 0.66406-1.4844 1.5078-1.4844h32.73c2.6562 0 5.0703 1.0625 6.8203 2.8125s2.8359 4.1641 2.8359 6.8438c0 2.6602-1.0859 5.0938-2.8359 6.8438s-4.1641 2.8125-6.8203 2.8125c-2.6797 0-5.0938-1.0625-6.8438-2.8125s-2.8359-4.1836-2.8359-6.8438c0-0.84375 0.10938-1.6602 0.33203-2.4375 0.20313-0.81641 0.51172-1.5898 0.91016-2.2812zm3.8984-26.465c0.13281 0.82031-0.44141 1.5742-1.2617 1.7031-0.82031 0.11328-1.5703-0.44141-1.7031-1.2617-0.019531-0.15234-0.019531-0.30859-0.042968-0.48828 0-0.15234-0.023438-0.30859-0.023438-0.46484 0-1.75 0.73047-3.3438 1.8828-4.4961 1.1523-1.1758 2.7461-1.8828 4.5156-1.8828 1.75 0 3.3438 0.71094 4.4961 1.8828h0.019531c1.1523 1.1484 1.8594 2.7461 1.8594 4.4961 0 1.7695-0.70703 3.3672-1.8594 4.5195h-0.019531 0.019531c-1.1758 1.1523-2.7695 1.8828-4.5195 1.8828h-24.934c-0.82031 0-1.4844-0.6875-1.4844-1.5039 0-0.82031 0.66406-1.5078 1.4844-1.5078h24.938c0.93359 0 1.7734-0.375 2.3945-0.97266 0.59766-0.61719 0.99609-1.4609 0.99609-2.4141 0-0.93359-0.39844-1.7734-0.99609-2.3906-0.62109-0.59766-1.4609-0.97656-2.3945-0.97656-0.95312 0-1.793 0.37891-2.4141 0.97656-0.59766 0.61719-0.97266 1.4609-0.97266 2.3906v0.26562c-0.003906 0.066406 0.019531 0.15625 0.019531 0.24219zm16.809 17.145c0.39844-0.73047 1.3047-0.97656 2.0352-0.57422 0.73047 0.39844 0.97266 1.3047 0.57422 2.0352-0.28906 0.48828-0.48828 1.0195-0.64062 1.5703-0.13281 0.53125-0.19922 1.0859-0.19922 1.6836 0 1.8398 0.73047 3.5234 1.9492 4.7188 1.1953 1.2188 2.8555 1.9492 4.6953 1.9492 1.8594 0 3.5195-0.73047 4.7188-1.9492 1.2188-1.1953 1.9492-2.8828 1.9492-4.7188 0-1.8398-0.73047-3.4961-1.9492-4.6953-1.1953-1.2188-2.8555-1.9688-4.7188-1.9688h-38.688c-0.84375 0-1.5078-0.66406-1.5078-1.4844 0-0.83984 0.66406-1.5078 1.5078-1.5078h38.688c2.6797 0 5.0938 1.0859 6.8438 2.8359s2.8359 4.1641 2.8359 6.8203c0 2.6836-1.0859 5.0977-2.8359 6.8477s-4.1641 2.832-6.8438 2.832c-2.6562 0-5.0703-1.0859-6.8203-2.832-1.75-1.75-2.8359-4.1641-2.8359-6.8477 0-0.82031 0.10938-1.6406 0.3125-2.4375 0.22266-0.81641 0.53125-1.5703 0.92969-2.2773zm-38.227-28.883c4.7617 0.70703 9.168 0.39844 13.688-0.57422v-20.418c-4.6953-0.39844-8.7031-1.2383-13.688-2.8555zm27.398-4.7578c3.6094-1.2422 7.1953-2.4609 10.918-3.3242 0.93359-0.19922 1.8594-0.39844 2.7891-0.55469v-11.824c-0.97266-0.10938-1.9492-0.17969-2.9023-0.22266-3.5898-0.19922-7.1953-0.13281-10.809-0.089843z"
                fill-rule="evenodd"
              />
            </svg>
            <p className=" font-semibold inline-flex whitespace-nowrap">
              Wind:
              {current_wind_speed}/{wind_speed_max}{" "}
              <p className=" text-xs ml-1 items-end justify-end text-end mt-2 mr-2">
                km/h
              </p>{" "}
              {/* {getWindDirection(wind_direction)} */}
            </p>
          </div>
          <div className="flex my-1 xl:w-1/2 font-semibold xl:pl-4 whitespace-nowrap">
            {/* <FaCloudRain size={26} title="Wind" className="mr-2" /> */}
            <svg
              version="1.1"
              viewBox="8 8 64 80"
              width="40"
              height="40"
              // viewBox="0 0 64 80"
              // style="enable-background:new 0 0 64 64;"
            >
              <g>
                <path d="M9.0300293,31h-5v-0.0900269c0.0099487-0.1799927,0.0199585-0.3599854,0.0299683-0.539978   c0.0200195-0.2000122,0.0300293-0.4100342,0.0499878-0.6099854c0.0200195-0.1800537,0.0400391-0.3600464,0.0599976-0.5400391   C4.2000122,29.0199585,4.2199707,28.8200073,4.25,28.6199951c0.0300293-0.1799927,0.0599976-0.3599854,0.0900269-0.5300293   C4.3699951,27.8900146,4.4099731,27.7000122,4.4400024,27.5c0.039978-0.1799927,0.0800171-0.3500366,0.1199951-0.5300293   c0.039978-0.1900024,0.0800171-0.3800049,0.1300049-0.5700073c0.0499878-0.1699829,0.0900269-0.3399658,0.1400146-0.5199585   s0.1099854-0.3699951,0.1599731-0.5599976c0.0499878-0.1700439,0.1099854-0.3400269,0.1699829-0.5100098   c0.0599976-0.1799927,0.1200562-0.3599854,0.1800537-0.5400391c0.0599976-0.1699829,0.1299438-0.3399658,0.1900024-0.5099487   c0.0699463-0.1800537,0.1399536-0.3500366,0.2099609-0.5300293c0.0700073-0.1599731,0.1400146-0.3300171,0.2200317-0.4899902   c0.0700073-0.1799927,0.1499634-0.3499756,0.2299805-0.5200195c0.0700073-0.1599731,0.1500244-0.3200073,0.2299805-0.4799805   C6.4799805,21.6199951,6.5499878,21.5,6.6099854,21.3800049l4.2999878,2.4899902   c0.0200195,0,0.0300293,0.0100098,0.0400391,0.0100098C9.8599854,26.0499878,9.1699829,28.4500122,9.0300293,31z    M11.9500122,22.1699829c-0.0100098-0.0100098-0.0200195-0.0299683-0.0400391-0.039978l-4.2999878-2.4800415   c0.0599976-0.0999756,0.1300049-0.1999512,0.1900024-0.289978C7.9000244,19.2099609,8,19.0599976,8.0999756,18.9099731   c0.1100464-0.1499634,0.210022-0.2999878,0.3200073-0.4500122C8.5300293,18.3200073,8.6400146,18.1699829,8.75,18.0299683   c0.1099854-0.1499634,0.2199707-0.289978,0.3400269-0.4299927c0.1099854-0.1400146,0.2299805-0.2799683,0.3399658-0.4199829   c0.1199951-0.1400146,0.2399902-0.2800293,0.3599854-0.4199829c0.1199951-0.1300049,0.2400513-0.2700195,0.3699951-0.4000244   c0.1200562-0.1300049,0.25-0.2600098,0.3700562-0.3900146c0.1299438-0.1300049,0.2599487-0.2600098,0.3899536-0.3900146   c0.1300049-0.1299438,0.2600098-0.25,0.3900146-0.3799438c0.1300049-0.1200562,0.2700195-0.2400513,0.4000244-0.3600464   c0.1399536-0.1300049,0.2799683-0.2399902,0.4099731-0.3599854c0.1400146-0.1199951,0.2800293-0.2399902,0.4199829-0.3499756   c0.1400146-0.1199951,0.2900391-0.2300415,0.4299927-0.3400269c0.1500244-0.1099854,0.2900391-0.2199707,0.4300537-0.3300171   c0.1499634-0.1099854,0.2999878-0.2099609,0.4499512-0.3199463C14,13.039978,14.1500244,12.9400024,14.2999878,12.8399658   c0.1199951-0.0799561,0.2300415-0.1499634,0.3500366-0.2299805l2.4799805,4.2999878   c0.0100098,0.0100098,0.0200195,0.0200195,0.0299683,0.0300293C15.0800171,18.2999878,13.3099976,20.0899658,11.9500122,22.1699829   z M18.8800049,15.9500122c-0.0100098-0.0100098-0.0100098-0.0300293-0.0100098-0.0400391l-2.4899902-4.2999878   c0.0999756-0.0499878,0.2000122-0.0999756,0.2999878-0.1500244C16.8400269,11.3699951,17,11.289978,17.1599731,11.2199707   c0.1700439-0.0799561,0.3400269-0.1599731,0.5200195-0.2399902C17.8400269,10.9099731,18,10.8399658,18.1699829,10.7699585   c0.1700439-0.0799561,0.3500366-0.1499634,0.5300293-0.2199707c0.1699829-0.0599976,0.3300171-0.1300049,0.5-0.1900024   c0.1799927-0.0599976,0.3699951-0.1199951,0.5499878-0.1799927c0.1699829-0.0599976,0.3400269-0.1199951,0.5100098-0.1699829   c0.1799927-0.0599976,0.3800049-0.1100464,0.5700073-0.1600342c0.1599731-0.0499878,0.3299561-0.0999756,0.5-0.1400146   c0.2000122-0.0499878,0.3999634-0.0999756,0.5999756-0.1399536c0.1699829-0.0400391,0.3300171-0.0800171,0.5-0.1100464   c0.210022-0.039978,0.4199829-0.0799561,0.6300049-0.1199951c0.1599731-0.0199585,0.3200073-0.0599976,0.4899902-0.0799561   C23.7700195,9.2299805,24,9.2000122,24.2199707,9.1699829c0.1600342-0.0100098,0.3100586-0.039978,0.460022-0.0499878   c0.25-0.0300293,0.5-0.0400391,0.7600098-0.0599976l0.3900146-0.0300293H26V14   c0,0.0199585,0.0100098,0.0299683,0.0100098,0.0499878C23.460022,14.1900024,21.039978,14.8499756,18.8800049,15.9500122z    M30.1300049,36.9599609c-0.5300293,0.9700317-1.3699951,1.6500244-2.3800049,1.9200439   c-0.960022,0.25-1.960022,0.1099854-2.8099976-0.4200439c-1.8599854-1.1399536-2.4899902-3.6900024-1.4099731-5.6699829   c0.7799683-1.4400024,6.2099609-7.1099854,10.7599487-11.6799927   C32.8400269,27.6099854,30.9199829,35.5100098,30.1300049,36.9599609z M34.3300171,15.5700073   c-1.9800415-0.8900146-4.1199951-1.4100342-6.3400269-1.5300293C27.9899902,14.0299683,28,14.0199585,28,14V9.0499878   c0.4099731,0.0200195,0.8200073,0.0200195,1.2199707,0.0599976c0.2400513,0.0200195,0.4800415,0.0700073,0.7200317,0.0999756   c0.4899902,0.0599976,0.9799805,0.1199951,1.4500122,0.210022c0.289978,0.0599976,0.5700073,0.1400146,0.8499756,0.2000122   c0.4299927,0.0999756,0.8599854,0.2000122,1.2700195,0.3200073c0.2999878,0.0899658,0.5899658,0.1900024,0.8800049,0.289978   c0.3900146,0.1400146,0.789978,0.2700195,1.1799927,0.4199829c0.289978,0.1199951,0.5800171,0.2600098,0.8699951,0.3900146   c0.1300049,0.0599976,0.2700195,0.1199951,0.4000244,0.1900024L34.3300171,15.5700073z M38.9799805,18.5599976   c-0.8899536-0.7900391-1.8499756-1.4800415-2.8699951-2.0800171l2.5-4.3200073   c0.2700195,0.1699829,0.5499878,0.3200073,0.8200073,0.4899902c0.2700195,0.1799927,0.539978,0.3699951,0.8099976,0.5700073   c0.3300171,0.2300415,0.6600342,0.460022,0.9700317,0.710022c0.2599487,0.210022,0.5199585,0.4299927,0.7699585,0.6400146   c0.1700439,0.1499634,0.3400269,0.3099976,0.5100098,0.4699707L38.9799805,18.5599976z M50.25,38.039978   c-0.5300293-0.1599731-1.0800171,0.1400146-1.2399902,0.6699829C46.039978,48.4500122,37.2000122,55,27,55   C14.6799927,55,4.5999756,45.2699585,4.039978,33.0899658H2.0300293C2.5900269,46.3699951,13.5700073,57,27,57   c11.0800171,0,20.6900024-7.1199951,23.9199829-17.710022C51.0800171,38.7600098,50.7800293,38.2000122,50.25,38.039978z" />
                <path d="M22,45c-0.5527344,0-1,0.4472656-1,1s0.4472656,1,1,1h10c0.5527344,0,1-0.4472656,1-1s-0.4472656-1-1-1H22z" />
                <path d="M51,17c0.5517578,0,1,0.4487305,1,1s-0.4482422,1-1,1h-8c-0.5527344,0-1,0.4477539-1,1s0.4472656,1,1,1h8   c1.6542969,0,3-1.3457031,3-3s-1.3457031-3-3-3c-0.5527344,0-1,0.4477539-1,1S50.4472656,17,51,17z" />
                <path d="M57,28H47c-0.5527344,0-1,0.4477539-1,1s0.4472656,1,1,1h10c1.6542969,0,3,1.3457031,3,3s-1.3457031,3-3,3   s-3-1.3457031-3-3c0-0.5522461-0.4472656-1-1-1s-1,0.4477539-1,1c0,2.7568359,2.2431641,5,5,5s5-2.2431641,5-5S59.7568359,28,57,28   z" />
                <path d="M38,24c0,0.5522461,0.4472656,1,1,1h16c0.5527344,0,1-0.4477539,1-1s-0.4472656-1-1-1H39   C38.4472656,23,38,23.4477539,38,24z" />
                <path d="M43,28h-6c-0.5527344,0-1,0.4477539-1,1s0.4472656,1,1,1h6c0.5527344,0,1-0.4477539,1-1S43.5527344,28,43,28z" />
                <path d="M38,35c0,0.5527344,0.4472656,1,1,1h10c0.5527344,0,1-0.4472656,1-1s-0.4472656-1-1-1H39   C38.4472656,34,38,34.4472656,38,35z" />
              </g>
            </svg>
            Wind Gust: {wind_gusts_max}
            <p className=" text-xs ml-1 items-end justify-end text-end mt-2 mr-2">
              km/h
            </p>{" "}
          </div>
        </div>
        <div className="flex xl:text-center xl:justify-center items-start justify-start flex-col xl:flex-row">
          <div className="flex xl:w-1/2 my-1">
            {/* <FaWind size={26} title="Wind" className="mr-2" /> */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              viewBox="8.0 2.0 100.0 100.0"
              width="40"
              height="40"
            >
              <path d="m31.609 51.094c-0.58984-0.57422-0.60547-1.5234-0.03125-2.1172 0.57422-0.58984 1.5234-0.60547 2.1172-0.03125l0.16016 0.15625c0.58984 0.57422 0.60547 1.5234 0.03125 2.1172-0.57422 0.58984-1.5234 0.60547-2.1172 0.03125zm32.395-31.824c0.83203 0 1.5078 0.67188 1.5078 1.5s-0.67188 1.5-1.5 1.5c-0.83984 0-1.5117-0.67188-1.5117-1.5s0.67188-1.5 1.5078-1.5zm-4.5781-4.2344c0.11719 0.023438 0.23047 0.058594 0.33594 0.10547 1.25-0.85547 2.7578-1.3516 4.3672-1.3516 1.5742 0 3.0469 0.47266 4.2773 1.2891 0.054688-0.019531 0.11328-0.03125 0.17188-0.042969 0.66016-0.125 1.2227-0.49609 1.6016-0.99609 0.375-0.50391 0.57031-1.1445 0.50781-1.8164s-0.38281-1.2617-0.85156-1.6836c-0.45703-0.41016-1.0625-0.66406-1.7109-0.67578-0.73047 0.03125-1.3984-0.47656-1.5352-1.2188-0.11719-0.61719-0.44922-1.1562-0.90625-1.5352-0.45312-0.38281-1.043-0.60547-1.6797-0.60547-0.60547 0-1.168 0.19922-1.6094 0.54297l-0.070312 0.0625c-0.45703 0.37891-0.78906 0.91797-0.90625 1.5352-0.13281 0.69531-0.74219 1.2227-1.4766 1.2188-0.67188-0.003906-1.3008 0.25-1.7695 0.67578-0.46875 0.42188-0.78906 1.0156-0.85156 1.6836-0.0625 0.67188 0.13281 1.3164 0.50781 1.8203 0.375 0.50391 0.9375 0.87109 1.6016 0.99609zm-1.9258 2.4922c-0.82422-0.39453-1.5312-0.98047-2.0664-1.6953-0.8125-1.0859-1.2344-2.4609-1.0938-3.8984 0.14062-1.4492 0.82031-2.7227 1.8242-3.625 0.73047-0.65625 1.6367-1.125 2.6367-1.3242 0.35547-0.85938 0.91406-1.6094 1.6094-2.1836l0.10547-0.082031c0.96875-0.76953 2.1875-1.2188 3.4844-1.2188 1.3438 0 2.6016 0.48438 3.5898 1.3008 0.69922 0.57422 1.2578 1.3203 1.6094 2.1797 0.99609 0.19922 1.9062 0.66797 2.6367 1.3242 1.0039 0.90234 1.6836 2.1758 1.8242 3.6172s-0.28125 2.8203-1.0898 3.9023c-0.49219 0.65625-1.1289 1.207-1.8711 1.5977 0.49219 0.78516 0.84766 1.6641 1.0352 2.6094l2.8164 1.4883c0.19531 0.09375 0.37109 0.23438 0.51172 0.41406 0.51562 0.64453 0.40625 1.5898-0.23828 2.1055l-3.2734 2.5977v7.0859c0.11328 4.2695-0.92969 8.4062-2.9219 12.012-2.0039 3.6211-4.9648 6.7188-8.668 8.8906-1.5664 0.91797-3.2109 1.6406-4.9023 2.168v9.3945h15.004l-1.8516-4.3906c-0.32031-0.75781 0.039062-1.6367 0.79687-1.957 0.46875-0.19531 0.98047-0.13672 1.3789 0.11719l15.074 9.543c0.69922 0.44141 0.90625 1.3711 0.46484 2.0703-0.12891 0.20313-0.29688 0.36328-0.48828 0.47656l-15.047 9.5352c-0.69922 0.44141-1.625 0.23438-2.0703-0.46484-0.29687-0.46875-0.30078-1.0391-0.0625-1.5l1.8008-4.2773h-15.004v16.164c0 1.3789-0.5625 2.6289-1.4688 3.5312-0.90625 0.90625-2.1562 1.4688-3.5312 1.4688h-0.10938c-1.375 0-2.625-0.5625-3.5273-1.4688-0.91016-0.90234-1.4688-2.1523-1.4688-3.5273v-16.164h-15.242l-2.3438 5.5547-0.011719 0.027343-0.003906 0.007813-0.03125 0.070312-0.039062 0.074219-0.03125 0.046875-0.007813 0.007812-0.058593 0.085938-0.007813 0.007812-0.011719 0.015626-0.035156 0.042968-0.027344 0.027344c-0.039062 0.046875-0.082031 0.089844-0.12891 0.12891l-0.027344 0.027344-0.027344 0.023438-0.007812 0.007812-0.039062 0.03125-0.007813 0.003906-0.011719 0.011719-0.015625 0.011719-0.007812 0.003906-0.046875 0.03125-0.22656 0.11328-0.03125 0.011719-0.023437 0.007812-0.023438 0.011719-0.019531 0.007813-0.007813 0.003906-0.046874 0.015625-0.007813 0.003906-0.015625 0.003907-0.019531 0.003906-0.007813 0.003906-0.054687 0.015625h-0.007813l-0.039062 0.007813h-0.007813l-0.054687 0.007812h-0.027344l-0.019531 0.003906h-0.007813l-0.027344 0.003906h-0.10937l-10.637 0.007813c-0.82812 0-1.5-0.67188-1.5-1.5 0-0.25391 0.0625-0.49219 0.17188-0.70312l3.7305-8.8477-3.7812-8.9688c-0.32031-0.75781 0.039063-1.6367 0.79688-1.957 0.1875-0.082031 0.38672-0.11719 0.57812-0.11719l10.637-0.007813c0.66797 0 1.2344 0.4375 1.4297 1.043l2.2891 5.4297h15.246v-8.5469c-2.9453-0.39844-5.8359-1.3555-8.4961-2.875-0.71875-0.40625-0.96875-1.3203-0.5625-2.0391s1.3203-0.96875 2.0391-0.5625c3.1836 1.8164 6.7344 2.7148 10.277 2.6992 3.5352-0.019531 7.0742-0.95703 10.238-2.8125 3.2227-1.8906 5.8086-4.5898 7.5547-7.7539 1.7461-3.1641 2.6641-6.793 2.5508-10.531l-0.007813-7.8477c0-0.50781 0.25391-0.95703 0.64062-1.2305l1.9766-1.5664-1.5039-0.79297c-0.46875-0.24609-0.75391-0.70703-0.79297-1.2031-0.10938-1.2266-0.67578-2.3125-1.5234-3.0938-0.84375-0.77734-1.9766-1.25-3.2148-1.25-1.2383 0-2.3672 0.47266-3.2148 1.25-0.83203 0.76562-1.3945 1.8281-1.5156 3.0273v12.453c0 0.82812-0.67188 1.5-1.5 1.5h-30.281c0.046874 1.5234 0.26172 3.0195 0.63281 4.4648 0.49219 1.9258 1.2734 3.7695 2.3047 5.4766 0.42578 0.70703 0.19922 1.6289-0.50781 2.0547s-1.6289 0.19922-2.0547-0.50781c-1.168-1.9375-2.0586-4.0586-2.6328-6.2852-0.53125-2.0664-0.78125-4.2266-0.73047-6.4102l-0.007812-0.14844v-1.8516c0-0.12891-0.054688-0.25-0.13672-0.33594-0.085937-0.085938-0.20312-0.13672-0.33594-0.13672h-4.793c-0.82812 0-1.5-0.67188-1.5-1.5s0.67188-1.5 1.5-1.5h4.793c0.95703 0 1.8281 0.39062 2.457 1.0156 0.62891 0.62891 1.0156 1.4961 1.0156 2.457v0.20703h2.7227v-0.16016c-0.23047-2.0156-0.96094-3.5781-2.0117-4.6328-1.0547-1.0547-2.4688-1.6172-4.0391-1.6172l-4.9375 0.007813c-0.82812 0-1.5-0.67188-1.5-1.5s0.67188-1.5 1.5-1.5l4.9102 0.003906c2.3945-0.007812 4.5547 0.85156 6.1875 2.4844 1.5391 1.5391 2.5859 3.7578 2.8789 6.5547l0.007813 0.35938h2.7266l0.003906-0.20703c-0.007812-3.293-1.3398-6.2734-3.4922-8.4297-2.1562-2.1523-5.1406-3.4883-8.4297-3.4883h-4.793c-0.82812 0-1.5-0.67188-1.5-1.5 0-0.82813 0.67188-1.5 1.5-1.5h4.793c4.1172 0 7.8516 1.6719 10.547 4.3711 2.6992 2.7031 4.3672 6.4336 4.3672 10.547l-0.007812 0.20703h2.7344l0.003907-0.20703c-0.007813-2.5273-0.53516-4.9297-1.4844-7.0938-0.99609-2.2578-2.4492-4.2656-4.2383-5.9102-1.6016-1.4688-3.4727-2.6484-5.5234-3.4453-1.9766-0.76953-4.1367-1.1914-6.4023-1.1914h-4.793c-0.82812 0-1.5-0.67188-1.5-1.5s0.67188-1.5 1.5-1.5h4.793c2.6289 0 5.1523 0.49609 7.4766 1.4023 2.4141 0.9375 4.6094 2.3203 6.4766 4.0312 2.0898 1.9219 3.793 4.2734 4.9492 6.9102 1.1172 2.5508 1.7383 5.3555 1.7383 8.2969l-0.003906 0.20703h11.617l0.007812-11.137c0.10547-1.2266 0.49219-2.3633 1.0938-3.3555zm-18.938 24.379c-0.43359-0.70703-0.21484-1.6289 0.49219-2.0625 0.70703-0.43359 1.6289-0.21484 2.0625 0.49219 0.83203 1.3555 1.9844 2.4453 3.3164 3.1875 1.3359 0.74609 2.8672 1.1562 4.4609 1.1562s3.125-0.41406 4.4609-1.1562c1.332-0.74219 2.4844-1.8359 3.3164-3.1875 0.43359-0.70703 1.3555-0.92578 2.0625-0.49219s0.92578 1.3555 0.49219 2.0625c-1.1016 1.7891-2.6328 3.2344-4.418 4.2305-1.7852 0.99609-3.8164 1.543-5.9141 1.543-2.0977 0-4.1289-0.55078-5.9141-1.543-1.7852-0.99609-3.3203-2.4414-4.418-4.2305zm9.3867 15.945v8.3359h4.1055v-8.6719c-1.2695 0.21875-2.5508 0.33203-3.832 0.33594zm-20.559 15.281 1-2.3711-1.0273-2.4414-0.023437-0.054687-2.3398-5.5508h-2.0742l3.1484 7.4688c0.14844 0.35938 0.16406 0.77344 0 1.1602l-3.1484 7.4688h2.0742l2.2891-5.4336c0.027344-0.085937 0.0625-0.16797 0.10547-0.24609zm3.5781-3.9453 0.41797 0.99609c0.14844 0.35938 0.16406 0.77344 0 1.1602l-0.41797 0.99609h41.344c0.19531 0.007812 0.39062 0.042968 0.57812 0.12109 0.75781 0.32031 1.1172 1.1992 0.79688 1.957l-0.87109 2.0703 9.0352-5.7266-9.0352-5.7227 0.82031 1.9492c0.10938 0.21094 0.17188 0.44922 0.17188 0.70312 0 0.82812-0.67188 1.5-1.5 1.5h-41.344zm-11.289 9.625 3.3945-8.0469-3.3945-8.0469h-2.0742l3.1484 7.4688c0.14844 0.35938 0.16406 0.77344 0 1.1602l-3.1484 7.4688h2.0742zm32.375-3.4727h-4.1055v16.164c0 0.55078 0.22656 1.0508 0.58984 1.4102 0.35938 0.36328 0.85938 0.58984 1.4102 0.58984h0.10938c0.55078 0 1.0508-0.22656 1.4102-0.58984 0.36328-0.36328 0.58984-0.86328 0.58984-1.4102v-16.164z" />
            </svg>
            <p className="font-semibold inline-flex">
              Wind Direction: &nbsp;
              {getWindDirection(wind_direction)}
            </p>
          </div>
          <div className="flex my-1 xl:w-1/2 font-semibold xl:pl-4 ">
            <FaCloudRain size={26} title="Wind" className="mr-2" />
            Precipitation: {precipitation_sum}
            {/* Weather code: {weather_code} */}
          </div>
        </div>

        <div className="flex xl:items-center xl:text-center xl:justify-center items-start justify-start flex-col xl:flex-row">
          <div className="flex  xl:w-1/2 items-center font-semibold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              viewBox="8.0 2.0 100.0 100.0"
              width="52"
              height="52"
            >
              <path d="m32.086 28.629c-0.39844-0.70703-0.15234-1.6367 0.55469-2.0352 0.73047-0.42188 1.6367-0.15625 2.0352 0.55469l2.8125 4.8516c0.42188 0.73047 0.17578 1.6406-0.55469 2.0586-0.71094 0.39844-1.6172 0.15625-2.0352-0.55469zm38.426 32.688c1.8828-8.1914-1.3281-16.809-8.2383-21.77-7.3281-5.2695-17.23-5.2695-24.559 0-6.9102 4.9609-10.121 13.578-8.2383 21.77h-22.992c-0.82031 0-1.4844 0.6875-1.4844 1.5078 0 0.82031 0.66406 1.5078 1.4844 1.5078h39v0.75391c0 0.81641 0.6875 1.5039 1.5078 1.5039 0.84375 0 1.5078-0.6875 1.5078-1.5039v-14.777l-2.9688 3.2773c-0.55469 0.61719-1.5039 0.66406-2.1055 0.10937-0.62109-0.55469-0.66406-1.5078-0.10938-2.1055l5.5781-6.1562c0.57422-0.66406 1.6406-0.66406 2.2148 0l5.5586 6.1562c0.55469 0.59766 0.50781 1.5508-0.10938 2.1055-0.59766 0.55469-1.5508 0.50781-2.1055-0.10937l-2.9688-3.2773v14.02h42.012c0.81641 0 1.5078-0.6875 1.5078-1.5078 0-0.82031-0.6875-1.5078-1.5078-1.5078zm21.395 16.5c0.61719 0.55469 0.66406 1.5078 0.10938 2.125-0.55469 0.59766-1.5039 0.64453-2.125 0.089844-0.62109-0.57422-1.4648-1.043-2.4141-1.3516-0.99609-0.33203-2.125-0.53125-3.3008-0.53125-3.2344 0-4.7617 1.2188-6.2695 2.4375-1.9258 1.5508-3.875 3.1016-8.1484 3.1016-4.2734 0-6.2227-1.5508-8.1484-3.1016-0.97656-0.77344-1.9492-1.5742-3.3203-2.0156-0.77344-0.24219-1.2188-1.1055-0.95312-1.8828 0.24219-0.79688 1.0859-1.2188 1.8828-0.95312 1.8594 0.59766 3.0547 1.5508 4.2539 2.5273 1.5273 1.2148 3.0312 2.4141 6.2891 2.4141 3.2344 0 4.7617-1.2188 6.2695-2.4141 1.9297-1.5508 3.875-3.1016 8.1484-3.1016 1.4844 0 2.9453 0.24609 4.2539 0.6875 1.3438 0.44141 2.543 1.1289 3.4727 1.9688zm-42.012-1.4414c0.73047-0.375 1.6133-0.085938 2.0156 0.64453 0.375 0.73047 0.089844 1.6406-0.64453 2.0156-0.79688 0.42188-1.5078 0.97656-2.2148 1.5508-0.023437 0.019531-0.042969 0.042968-0.066406 0.066406-1.9297 1.5273-3.8555 3.0352-8.0859 3.0352-4.2734 0-6.1992-1.5508-8.1484-3.1016-1.5078-1.2188-3.0352-2.4375-6.2695-2.4375s-4.7617 1.2188-6.2695 2.4375c-1.9492 1.5508-3.875 3.1016-8.1484 3.1016-1.2383 0-2.3047-0.13281-3.2109-0.37891-0.95312-0.24219-1.75-0.57422-2.457-0.97656-0.73047-0.39844-0.99609-1.3047-0.59766-2.0352s1.3281-0.97266 2.0391-0.57422c0.50781 0.26562 1.0625 0.50781 1.75 0.6875 0.6875 0.17578 1.4844 0.26562 2.4805 0.26562 3.2344 0 4.7617-1.2188 6.2695-2.4141 1.9297-1.5508 3.875-3.1016 8.1484-3.1016s6.2227 1.5508 8.1484 3.1016c1.5078 1.1953 3.0352 2.4141 6.2695 2.4141 3.1875 0 4.7188-1.1758 6.2031-2.3477 0.019531-0.023437 0.042969-0.042969 0.089843-0.066406 0.79297-0.66797 1.6133-1.3086 2.6992-1.8867zm-44.25-3.5664c-0.66406-0.44141-0.86328-1.3711-0.39844-2.0586s1.3711-0.86328 2.0586-0.39844c0.64453 0.42188 1.418 0.77344 2.2812 1.0195 0.86328 0.22266 1.793 0.35547 2.7891 0.35547 3.2344 0 4.7383-1.1953 6.2461-2.4141 1.9258-1.5508 3.8555-3.0781 8.1055-3.0781 4.2734 0 6.1992 1.5273 8.1055 3.0781 0.99609 0.77344 1.9727 1.5742 3.3203 1.9961 0.77344 0.26562 1.1953 1.1055 0.95312 1.8828-0.26562 0.79688-1.1094 1.2188-1.8828 0.95312-1.8359-0.59766-3.0312-1.5508-4.2305-2.5039-1.5078-1.2188-3.0352-2.4141-6.2656-2.4141-3.2148 0-4.7188 1.1953-6.2461 2.4141-1.9062 1.5273-3.832 3.0781-8.1055 3.0781-1.2383 0-2.4609-0.17969-3.5898-0.48828-1.1484-0.3125-2.2344-0.79688-3.1406-1.4219zm40.883 0.6875c-0.73047 0.375-1.6406 0.085937-2.0156-0.64453-0.37891-0.73047-0.089844-1.6172 0.62109-1.9922 0.79688-0.42188 1.5078-0.99609 2.2148-1.5508l0.066406-0.066406c1.9062-1.5078 3.832-3.0117 8.0391-3.0117 4.2734 0 6.1797 1.5273 8.1055 3.0781 1.5078 1.2188 3.0352 2.4141 6.2461 2.4141 3.2344 0 4.7383-1.1953 6.2461-2.4141 1.9258-1.5508 3.8555-3.0781 8.1289-3.0781 4.2539 0 6.1797 1.5273 8.1055 3.0781 0.61719 0.51172 1.2617 1.0195 1.9727 1.418 0.70703 0.39844 0.95313 1.3086 0.55469 2.0156-0.42188 0.73047-1.3281 0.97656-2.0391 0.57422-0.90625-0.53125-1.6367-1.1055-2.3477-1.6836-1.5273-1.2188-3.0312-2.4141-6.2461-2.4141-3.2344 0-4.7383 1.1953-6.2422 2.4141-1.9297 1.5273-3.8555 3.0781-8.1289 3.0781-4.2539 0-6.1797-1.5508-8.1055-3.0781-1.5078-1.2188-3.0117-2.4141-6.2461-2.4141-3.168 0-4.6953 1.1523-6.1797 2.3477-0.019532 0.023438-0.042969 0.042969-0.066406 0.066406-0.82422 0.64453-1.6211 1.2891-2.6836 1.8633zm1.9727-55.676c0-0.81641 0.66406-1.5078 1.5078-1.5078 0.82031 0 1.4844 0.6875 1.4844 1.5078v11.227c0 0.84375-0.66406 1.5078-1.4844 1.5078-0.84375 0-1.5078-0.66406-1.5078-1.5078zm16.809 9.3242c0.39844-0.70703 1.3281-0.97656 2.0391-0.55469 0.71094 0.39844 0.95312 1.3281 0.55469 2.0352l-2.8164 4.875c-0.42188 0.71094-1.3281 0.95312-2.0391 0.55469-0.70703-0.42188-0.97266-1.3281-0.55469-2.0586zm17.562 8.793c0.70703-0.42188 1.6172-0.17578 2.0352 0.55469 0.42188 0.70703 0.17578 1.6172-0.53125 2.0391l-9.7422 5.6016c-0.71094 0.42188-1.6172 0.17578-2.0391-0.53125-0.42188-0.71094-0.17578-1.6406 0.53125-2.0391zm0.33203 19.199c0.82031 0 1.5078 0.66406 1.5078 1.5078 0 0.81641-0.6875 1.5039-1.5078 1.5039h-5.625c-0.82031 0-1.4844-0.6875-1.4844-1.5039 0-0.84375 0.66406-1.5078 1.4844-1.5078zm-66.418 3.0117c-0.82031 0-1.4844-0.6875-1.4844-1.5039 0-0.84375 0.66406-1.5078 1.4844-1.5078h5.625c0.82031 0 1.5039 0.66406 1.5039 1.5078 0 0.81641-0.6875 1.5039-1.5039 1.5039zm-1.1523-19.621c-0.70703-0.42188-0.97266-1.3281-0.55469-2.0391 0.42188-0.73047 1.3281-0.97656 2.0391-0.55469l9.7227 5.625c0.73047 0.39844 0.97656 1.3047 0.55469 2.0391-0.39844 0.70703-1.3047 0.95312-2.0352 0.53125z" />
            </svg>
            {/* <FaSun size={26} title="Sunrise" className="mr-2" /> */}
            <>Sunrise: &nbsp;</>{" "}
            {new Date(sunrise).toLocaleString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="flex  xl:w-1/2 items-center font-semibold xl:pl-4">
            {/* <FaMoon size={22} title="Sunset" className=" mr-2" /> */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              viewBox="8.0 2.0 100.0 100.0"
              width="52"
              height="52"
            >
              <path d="m32.098 28.629c-0.39844-0.70703-0.15234-1.6367 0.55469-2.0352 0.71094-0.42188 1.6406-0.15625 2.0391 0.55469l2.8125 4.8516c0.42188 0.73047 0.15625 1.6406-0.55469 2.0586-0.70703 0.39844-1.6172 0.15625-2.0352-0.55469zm38.426 32.688c1.8828-8.1914-1.3281-16.809-8.2383-21.77-7.332-5.2695-17.23-5.2695-24.562 0-6.9102 4.9609-10.121 13.578-8.2383 21.77h-22.988c-0.82031 0-1.5078 0.6875-1.5078 1.5078 0 0.82031 0.6875 1.5078 1.5078 1.5078h36.766l1.7695 1.9258c0.55469 0.62109 1.4844 0.66406 2.1016 0.10938 0.59766-0.53125 0.66406-1.4375 0.15625-2.0352l-3.9648-4.4062c-0.55469-0.59766-0.51172-1.5508 0.10938-2.1016 0.60156-0.55469 1.5508-0.51172 2.1055 0.10938l2.9688 3.2773v-14.777c0-0.82031 0.66406-1.5078 1.4844-1.5078 0.84375 0 1.5078 0.6875 1.5078 1.5078v14.77l2.9688-3.2773c0.55469-0.62109 1.5039-0.66406 2.1055-0.10938 0.61719 0.55469 0.66406 1.5039 0.10938 2.1016l-3.9648 4.4062h40.793c0.82031 0 1.4844-0.6875 1.4844-1.5078 0-0.82031-0.66406-1.5078-1.4844-1.5078zm21.395 16.5c0.62109 0.55469 0.66406 1.5078 0.11328 2.125-0.55469 0.59766-1.5078 0.64453-2.1289 0.089844-0.62109-0.57422-1.4648-1.043-2.4141-1.3516-0.99609-0.33203-2.125-0.53125-3.3008-0.53125-3.2344 0-4.7617 1.2188-6.2656 2.4375-1.9492 1.5508-3.8789 3.1016-8.1484 3.1016-4.2734 0-6.2227-1.5508-8.1523-3.1016-0.97656-0.77344-1.9727-1.5742-3.3203-2.0156-0.79688-0.24219-1.2188-1.1055-0.95312-1.8828 0.24609-0.79688 1.0859-1.2188 1.8828-0.95312 1.8594 0.59766 3.0586 1.5508 4.2539 2.5273 1.5273 1.2148 3.0352 2.4141 6.2891 2.4141 3.2305 0 4.7617-1.2188 6.2656-2.4141 1.9297-1.5508 3.875-3.1016 8.1484-3.1016 1.4844 0 2.9453 0.24609 4.25 0.6875 1.3516 0.44141 2.5469 1.1289 3.4805 1.9688zm-42.035-1.4414c0.73047-0.375 1.6406-0.085938 2.0156 0.64453 0.39844 0.73047 0.10937 1.6406-0.62109 2.0156-0.79688 0.42188-1.5039 0.97656-2.2148 1.5508-2.7031 2.1719-4.5625 3.1016-8.1484 3.1016-4.2734 0-6.2227-1.5508-8.1484-3.1016-1.5078-1.2188-3.0352-2.4375-6.2695-2.4375-3.2578 0-4.7617 1.2188-6.2695 2.4375-1.9492 1.5508-3.875 3.1016-8.1484 3.1016-1.2383 0-2.3047-0.13281-3.2109-0.37891-0.95313-0.24219-1.75-0.57422-2.4805-0.97656-0.71094-0.39844-0.97266-1.3047-0.57422-2.0352s1.3086-0.97266 2.0391-0.57422c0.48828 0.26562 1.0625 0.50781 1.7266 0.6875 0.6875 0.17578 1.5078 0.26562 2.5039 0.26562 3.2344 0 4.7383-1.2188 6.2695-2.4141 1.9258-1.5508 3.8555-3.1016 8.1484-3.1016 4.2734 0 6.2227 1.5508 8.1484 3.1016 1.5078 1.1953 3.0352 2.4141 6.2695 2.4141 3.1875 0 4.7188-1.1758 6.1992-2.3477 0.73047-0.66797 1.9023-1.4844 2.7656-1.9531zm-44.227-3.5664c-0.6875-0.44141-0.86328-1.3711-0.39844-2.0586 0.44141-0.6875 1.3711-0.86328 2.0586-0.39844 0.64453 0.42188 1.418 0.77344 2.2812 1.0195 0.83984 0.22266 1.793 0.35547 2.7891 0.35547 3.2344 0 4.7383-1.1953 6.2461-2.4141 1.9258-1.5508 3.8555-3.0781 8.1055-3.0781 4.2539 0 6.1797 1.5273 8.1055 3.0781 0.97656 0.77344 1.9492 1.5742 3.3242 1.9961 0.77344 0.26562 1.1953 1.1055 0.95312 1.8828-0.26562 0.79688-1.1055 1.2188-1.8828 0.95312-1.8398-0.59766-3.0352-1.5508-4.2305-2.5039-1.5273-1.2188-3.0312-2.4141-6.2656-2.4141-3.2305 0-4.7383 1.1953-6.2461 2.4141-1.9258 1.5273-3.8555 3.0781-8.1055 3.0781-1.2383 0-2.4609-0.17969-3.5898-0.48828-1.1719-0.3125-2.2383-0.79688-3.1445-1.4219zm40.863 0.6875c-0.73047 0.375-1.6172 0.085937-1.9922-0.64453-0.375-0.73047-0.10938-1.6172 0.62109-1.9922 0.79687-0.42188 1.5078-0.99609 2.1914-1.5508 2.7031-2.1484 4.5391-3.0781 8.1289-3.0781 4.2539 0 6.1797 1.5273 8.1055 3.0781 1.5078 1.2188 3.0117 2.4141 6.2461 2.4141 3.2344 0 4.7383-1.1953 6.2461-2.4141 1.9258-1.5508 3.8555-3.0781 8.1055-3.0781 4.2734 0 6.1992 1.5273 8.1289 3.0781 0.62109 0.51172 1.2617 1.0195 1.9492 1.418 0.73047 0.39844 0.97656 1.3086 0.57422 2.0156-0.41797 0.73047-1.3281 0.97656-2.0352 0.57422-0.90625-0.53125-1.6406-1.1055-2.3672-1.6836-1.5078-1.2188-3.0117-2.4141-6.2461-2.4141-3.2109 0-4.7422 1.1953-6.2461 2.4141-1.9297 1.5273-3.832 3.0781-8.1055 3.0781-4.2539 0-6.1797-1.5508-8.1055-3.0781-1.5078-1.2188-3.0117-2.4141-6.2461-2.4141-3.1875 0-4.6953 1.1523-6.1797 2.3477-0.71484 0.66797-1.9102 1.4648-2.7734 1.9297zm1.9922-55.676c0-0.81641 0.66406-1.5078 1.4844-1.5078 0.84375 0 1.5078 0.6875 1.5078 1.5078v11.227c0 0.84375-0.66406 1.5078-1.5078 1.5078-0.82031 0-1.4844-0.66406-1.4844-1.5078zm16.809 9.3242c0.39844-0.70703 1.3086-0.97656 2.0391-0.55469 0.71094 0.39844 0.94922 1.3281 0.55469 2.0352l-2.8164 4.875c-0.42188 0.71094-1.3281 0.95312-2.0352 0.55469-0.73047-0.42188-0.97656-1.3281-0.55469-2.0586zm17.562 8.793c0.71094-0.42188 1.6172-0.17578 2.0352 0.55469 0.42188 0.70703 0.17578 1.6172-0.55469 2.0391l-9.7227 5.6016c-0.71094 0.42188-1.6406 0.17578-2.0391-0.53125-0.42187-0.71094-0.17578-1.6406 0.53125-2.0391zm0.33203 19.199c0.81641 0 1.4844 0.66406 1.4844 1.5078 0 0.81641-0.66406 1.5039-1.4844 1.5039h-5.625c-0.82031 0-1.5078-0.6875-1.5078-1.5039 0-0.84375 0.6875-1.5078 1.5078-1.5078zm-66.418 3.0117c-0.82031 0-1.5039-0.6875-1.5039-1.5039 0-0.84375 0.6875-1.5078 1.5039-1.5078h5.625c0.82031 0 1.4844 0.66406 1.4844 1.5078 0 0.81641-0.66406 1.5039-1.4844 1.5039zm-1.1523-19.621c-0.73047-0.42188-0.97266-1.3281-0.55469-2.0391 0.39844-0.73047 1.3281-0.97656 2.0391-0.55469l9.7227 5.625c0.73047 0.39844 0.97266 1.3047 0.55469 2.0391-0.39844 0.70703-1.3281 0.95312-2.0391 0.53125z" />
            </svg>
            <>Sunset: &nbsp;</>{" "}
            {new Date(sunset).toLocaleString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        <div className="flex xl:items-center xl:text-center xl:justify-center items-start justify-start flex-col xl:flex-row">
          <div className="flex  xl:w-1/2 items-center font-semibold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="8 -8 64 80"
              width="40"
              height="40"
            >
              <path d="M16.242,2.563a4.623,4.623,0,0,0-3.591.931L7.538,7.466a4.623,4.623,0,0,0-1.792,3.252c-.206,1.259.784,4.77,2.528,3.727l10.954-8.51C20.673,4.5,17.508,2.678,16.242,2.563ZM7.919,12.189a2.71,2.71,0,0,1,.843-3.142l5.12-3.976a2.7,2.7,0,0,1,3.248-.039Z" />
              <path d="M51.3,3.5a4.742,4.742,0,0,0-6.793,1.086,1,1,0,0,0,.213,1.352l10.953,8.51c1.749,1.045,2.731-2.473,2.529-3.728a4.625,4.625,0,0,0-1.79-3.249Zm4.728,8.692L46.818,5.032a2.708,2.708,0,0,1,3.253.041L55.189,9.05A2.7,2.7,0,0,1,56.029,12.189Z" />
              <path d="M32.015,6.21C14.511,5.635.292,24.094,5.267,40.876a1,1,0,1,0,1.927-.532C2.592,24.819,15.793,7.662,32,8.211c13.781-.284,25.926,11.86,25.639,25.645.32,14.658-13.416,27.164-27.973,25.528a1,1,0,0,0-1.091.9c0,1.672,2.378,1.044,3.469,1.214a27.637,27.637,0,0,0,18.594-7.262C69.192,37.2,57.112,6.281,32.015,6.21Z" />
              <path d="M31.807,54.57a1,1,0,0,0,.066,2C62.156,55.3,62.319,12.611,32.01,11.14c-13.636-.39-25.1,13.25-22.383,26.63a1,1,0,0,0,1.967-.36C9.122,25.259,19.569,12.78,31.959,13.139,59.655,14.492,59.508,53.418,31.807,54.57Z" />
              <path d="M29.541,20.943,31.21,19.25c.015.094.078,14.555.122,14.629a.99.99,0,0,0,1,1.025l10.032-.022-1.671,1.643a1.007,1.007,0,0,0,.7,1.713,1,1,0,0,0,.7-.287l3.416-3.36a1,1,0,0,0,.012-1.414l-3.361-3.416a1,1,0,0,0-1.426,1.4l1.691,1.718L33.31,32.9l-.1-13.666L34.9,20.905a1,1,0,0,0,1.405-1.425L32.9,16.116a1.019,1.019,0,0,0-1.415.011l-3.363,3.412A1,1,0,0,0,29.541,20.943Z" />
              <path d="M16.7,44.554A6.565,6.565,0,0,0,10.031,51.2c.329,8.755,13,8.755,13.33,0v-.061A6.549,6.549,0,0,0,16.7,44.554Zm0,11.231A4.487,4.487,0,0,1,12.031,51.2a4.665,4.665,0,0,1,9.329-.031A4.5,4.5,0,0,1,16.7,55.785Z" />
              <path d="M26.312,48.934a4.266,4.266,0,0,1-.739-.642c.063-1.11,1.013-2.563.168-3.695-.81-1.141-2.482-.722-3.553-.969-.589-.953-.679-2.669-2.036-3.093-1.331-.452-2.424.913-3.452,1.306-1.035-.387-2.127-1.76-3.459-1.306-1.342.418-1.462,2.131-2.021,3.082-1.082.275-2.747-.174-3.568.98-.835,1.118.088,2.585.174,3.675-.737.852-2.322,1.469-2.309,2.9-.014,1.412,1.558,2.057,2.3,2.879-.062,1.109-1.012,2.563-.167,3.694.809,1.141,2.482.723,3.552.968.589.954.68,2.669,2.037,3.095,1.287.458,2.441-.913,3.451-1.306,1.036.385,2.127,1.757,3.459,1.306,1.343-.42,1.462-2.131,2.022-3.082,1.081-.275,2.748.173,3.568-.98.837-1.119-.088-2.586-.175-3.676a3.838,3.838,0,0,1,.745-.661C28.38,52.033,28.378,50.305,26.312,48.934ZM25.1,51.816c-2.157,1.436-1.516,2.644-1.01,4.727-.979.174-2.21-.085-3.084.558S20,58.985,19.529,59.858c-.9-.45-1.736-1.363-2.833-1.359s-1.935.909-2.832,1.359c-.468-.872-.6-2.126-1.474-2.758s-2.107-.384-3.085-.557c.14-.986.759-2.075.419-3.106-.307-1.014-1.513-1.545-2.178-2.268.666-.721,1.871-1.252,2.178-2.265.34-1.033-.277-2.121-.418-3.108.978-.173,2.21.085,3.083-.557s1.007-1.886,1.475-2.758c.9.45,1.736,1.363,2.832,1.36s1.936-.91,2.833-1.36c.467.873.6,2.127,1.475,2.758s2.105.384,3.084.557c-.141.987-.76,2.074-.419,3.107.307,1.014,1.512,1.545,2.178,2.266A5.013,5.013,0,0,1,25.1,51.816Z" />
            </svg>
            Sunshine:&nbsp;
            {convertSeconds(sunshine_duration)}
          </div>
          <div className="flex xl:w-1/2 items-center font-semibold xl:pl-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              // viewBox="-5.0 -10.0 110.0 135.0"
              viewBox="8.0 8.0 100.0 100.0"
              width="56"
              height="56"
            >
              <g>
                <path d="m31.398 28.398c0.10156 0 0.10156 0 0 0 1-0.10156 1.6016-0.80078 1.6016-1.6016l-0.19922-3.8008c0-0.89844-0.80078-1.5-1.6016-1.5-0.89844 0-1.5 0.80078-1.5 1.6016l0.19922 3.8008c0 0.80078 0.70312 1.5 1.5 1.5z" />
                <path d="m40.199 30.102c0.60156 0 1.1016-0.30078 1.3984-0.89844l1.6992-3.3984c0.39844-0.80078 0.10156-1.6992-0.69922-2.1016-0.80078-0.39844-1.6992-0.10156-2.1016 0.69922l-1.6992 3.3984c-0.39844 0.80078-0.10156 1.6992 0.69922 2.1016 0.20312 0.097656 0.50391 0.19922 0.70312 0.19922z" />
                <path d="m46.898 36c0.30078 0 0.60156-0.10156 0.89844-0.30078l3.1992-2.1016c0.69922-0.5 0.89844-1.3984 0.39844-2.1992-0.39453-0.69922-1.3945-0.89844-2.0938-0.39844l-3.1992 2.1016c-0.69922 0.5-0.89844 1.3984-0.39844 2.1992 0.19531 0.39844 0.69531 0.69922 1.1953 0.69922z" />
                <path d="m10 45.5c0 0.80078 0.69922 1.5 1.6016 1.5h0.10156l3.8008-0.19922c0.89844 0 1.5-0.80078 1.5-1.6016s-0.80078-1.5-1.6016-1.5l-3.8008 0.19922c-1 0-1.6016 0.70312-1.6016 1.6016z" />
                <path d="m16.398 37.801c0.19922 0.10156 0.5 0.19922 0.69922 0.19922 0.60156 0 1.1016-0.30078 1.3984-0.89844 0.39844-0.80078 0.10156-1.6992-0.69922-2.1016l-3.3984-1.6992c-0.80078-0.39844-1.6992-0.10156-2.1016 0.69922-0.39844 0.80078-0.10156 1.6992 0.69922 2.1016z" />
                <path d="m22.199 25.602c-0.5-0.69922-1.3984-0.89844-2.1992-0.39844-0.69922 0.5-0.89844 1.3984-0.39844 2.1992l2.1016 3.1992c0.30078 0.5 0.80078 0.69922 1.3008 0.69922 0.30078 0 0.60156-0.10156 0.89844-0.30078 0.69922-0.5 0.89844-1.3984 0.39844-2.1992z" />
                <path d="m61.102 44.398c-2.3008-1.8984-5.1992-3.1016-8.3008-3.1016-5.5 0-10.301 3.5-12.102 8.5 0 0.10156-0.10156 0.30078-0.10156 0.39844-0.19922 0.69922-0.39844 1.5-0.5 2.3008-0.10156 0.39844-0.30078 0.80078-0.69922 1.1016h-0.10156c-0.39844 0.19922-0.89844 0.30078-1.3984 0.10156-1.1992-0.39844-2.3984-0.69922-3.6016-0.69922-5.8008 0-10.5 4.6992-10.5 10.5 0 5.1016 3.6016 9.3008 8.3984 10.301 0.69922 0.10156 1.3984 0.19922 2.1016 0.19922h24.703c-2.3984-3.1992-3.8008-7.1016-3.8008-11.301 0-3.1016 0.80078-6.1016 2.1016-8.6992 1.3008-2.5 3.1016-4.6016 5.3008-6.3008 0.30078-0.19922 0.60156-0.5 0.89844-0.69922-0.69922-0.89844-1.5-1.8008-2.3984-2.6016z" />
                <path d="m29.199 34.301c-1.3984 0.5-2.6016 1.1992-3.6992 2.3008-0.39844 0.30078-0.69922 0.69922-1 1.1016-1.1992 1.6016-1.8984 3.3984-2 5.3984 0 0.60156 0 1.3008 0.10156 2 0.39844 3.1016 2.1992 5.6016 4.6016 7.1016l0.10156-0.10156c2-1.1992 4.3984-2 7-2 0.69922 0 1.5 0.10156 2.1992 0.19922 0.30078 0 0.5 0.10156 0.80078 0.10156 0.69922-2.8008 2.1016-5.3008 4-7.1992 0.30078-0.30078 0.60156-0.60156 0.89844-0.80078-0.39844-2.6016-1.6992-4.8984-3.8008-6.5-1.8008-1.3008-3.8008-2-6-2-0.30078 0-0.5 0-0.80078 0.10156h-0.5c-0.60156 0.10156-1.1016 0.19922-1.6992 0.39844-0.10156-0.20312-0.10156-0.20312-0.20312-0.10156z" />
                <path d="m74.102 46.898c-8.6992 0-15.898 7.1016-15.898 15.898 0 8.6992 7.1016 15.898 15.898 15.898 8.6992 0 15.898-7.1016 15.898-15.898s-7.1016-15.898-15.898-15.898zm9 17.402h-9c-0.89844 0-1.6016-0.69922-1.6016-1.6016v-9c0-0.89844 0.69922-1.6016 1.6016-1.6016 0.89844 0 1.6016 0.69922 1.6016 1.6016v7.3984h7.3984c0.89844 0 1.6016 0.69922 1.6016 1.6016-0.003906 0.90234-0.70312 1.6016-1.6016 1.6016z" />
              </g>
            </svg>
            Daytime:&nbsp;
            {convertSeconds(daylight_duration)}
          </div>
        </div>

        <div className="flex xl:items-center xl:text-center xl:justify-center items-start justify-start flex-col xl:flex-col">
          <div className="flex items-center font-semibold justify-center">
            <svg
              data-name="Layer 2"
              viewBox="8 -8 64 80"
              width="50"
              height="50"
              // x="0px"
              // y="0px"
            >
              <path
                d="m16.00717,28.88343c0-.55225-.44727-1-1-1H6.00717c-.55273,0-1,.44775-1,1s.44727,1,1,1h9c.55273,0,1-.44775,1-1Z"
                // style=""
                stroke-width=" 0px"
              />
              <path
                d="m19.98666,17.86292c.85425.02905,1.34558-1.11218.70703-1.70703l-6.36426-6.36377c-.92676-.91956-2.33594.48444-1.41406,1.41406l6.36426,6.36377c.19531.19531.45117.29297.70703.29297Z"
                // style=""
                stroke-width=" 0px"
              />
              <path
                d="m31.00717,2.88343v9c.02112,1.31171,1.97791,1.31653,2-.00006,0,.00006,0-8.99994,0-8.99994-.02112-1.31177-1.97791-1.31653-2,0Z"
                // style=""
                stroke-width=" 0px"
              />
              <path
                d="m51.09897,9.79163c-.39062-.39062-1.02344-.39062-1.41406,0l-6.36426,6.36377c-.39062.39062-.39062,1.02344,0,1.41406s1.02344.39062,1.41406,0l6.36426-6.36377c.39062-.39062.39062-1.02344,0-1.41406Z"
                // style=""
                stroke-width=" 0px"
              />
              <path
                d="m58.00717,27.88343h-9c-1.31177.02124-1.31665,1.97778,0,2h9c1.31177-.02124,1.31665-1.97784,0-2Z"
                // style=""
                stroke-width=" 0px"
              />
              <path
                d="m15.7601,21.07142c-1.22192-.48193-1.97144,1.32269-.76562,1.84766l.92383.38281c1.21509.48474,1.9751-1.32074.76562-1.84772,0,.00006-.92383-.38275-.92383-.38275Z"
                // style=""
                stroke-width=" 0px"
              />
              <path
                d="m10.37534,21.00599l1.84766.76514c1.21436.48438,1.97571-1.3205.76562-1.84772,0,.00006-1.84766-.76508-1.84766-.76508-1.2207-.48175-1.97217,1.32257-.76562,1.84766Z"
                // style=""
                stroke-width=" 0px"
              />
              <path
                d="m24.57748,13.56019c.51257,1.21027,2.34106.44019,1.84766-.76569,0,.00006-.38281-.92377-.38281-.92377-.52515-1.20508-2.32935-.45715-1.84766.76562l.38281.92383Z"
                // style=""
                stroke-width=" 0px"
              />
              <path
                d="m24.89487,9.09925l-.76562-1.84766c-.52405-1.20477-2.32959-.45728-1.84766.76562l.76562,1.84766c.51245,1.21002,2.34106.44037,1.84766-.76562Z"
                // style=""
                stroke-width=" 0px"
              />
              <path
                d="m37.97104,11.87074l-.38281.92383c-.4812,1.21802,1.31848,1.97546,1.84766.76556,0,.00006.38281-.92377.38281-.92377.48157-1.22223-1.323-1.97162-1.84766-.76562Z"
                // style=""
                stroke-width=" 0px"
              />
              <path
                d="m40.96713,9.86439l.76562-1.84766c.48157-1.22211-1.32251-1.97125-1.84766-.76562l-.76562,1.84766c-.49304,1.20538,1.33496,1.97632,1.84766.76562Z"
                // style=""
                stroke-width=" 0px"
              />
              <path
                d="m48.25424,21.07142l-.92383.38232c-1.20923.526-.44971,2.3327.76562,1.8476,0,.00006.92383-.38226.92383-.38226,1.20532-.52356.45654-2.33002-.76562-1.84766Z"
                // style=""
                stroke-width=" 0px"
              />
              <path
                d="m51.40854,21.84779c.26025.05054,1.9624-.7594,2.23047-.84229,1.20557-.5249.45642-2.32928-.76562-1.84766l-1.84766.76562c-1.00366.39917-.68054,1.94482.38281,1.92432Z"
                // style=""
                stroke-width=" 0px"
              />
              <path
                d="m39.73862,48.66468l-2.73145.00098v-13.00098c0-1.10254-.89746-2-2-2h-6c-1.10254,0-2,.89746-2,2v13h-2.99805c-1.64307-.05872-2.63696,2.05389-1.53711,3.28027l7.86523,9.4375c.38086.45801.94141.71973,1.53613.71973.5957,0,1.15625-.26172,1.53711-.71875l7.86523-9.43848c1.09619-1.22485.1106-3.34045-1.53711-3.28027Z"
                // style=""
                stroke-width=" 0px"
              />
              <path
                d="m54.30893,43.91175h-1.74414v-9.29297c0-.95703-.77832-1.73535-1.73535-1.73535h-4.41113c-.95703,0-1.73535.77832-1.73535,1.73535v9.29297h-1.93945c-1.42603-.05133-2.28723,1.78333-1.33301,2.84668l5.7832,6.93945c.33008.39648.81641.62402,1.33203.62402.5166,0,1.00293-.22754,1.33398-.62402l5.78125-6.93945c.95349-1.06219.09619-2.89899-1.33203-2.84668Z"
                // style=""
                stroke-width=" 0px"
              />
              <path
                d="m45.83847,30.94209c1.35132-8.34003-5.3894-16.13251-13.8313-16.05859-8.44092-.07434-15.18408,7.71918-13.8313,16.05859.94629.14917,1.76709.6524,2.33716,1.37231-2.37256-7.49725,3.60596-15.56091,11.49426-15.43085,7.8866-.13043,13.86853,7.93439,11.49402,15.43085.57007-.71991,1.39087-1.22314,2.33716-1.37231Z"
                // style=""
                stroke-width=" 0px"
              />
              <path
                d="m39.00717,38.61042v2.37878c1.39453-.80957,2.63892-1.8468,3.67578-3.06989.0083-.14856-.02734-3.65753.03601-3.65674-.87317,1.73169-2.15051,3.22107-3.71179,4.34784Z"
                // style=""
                stroke-width=" 0px"
              />
              <path
                d="m21.33139,37.91932c1.03687,1.22308,2.28125,2.26031,3.67578,3.06989v-2.37878c-1.56128-1.12677-2.83862-2.61615-3.71179-4.34784.06079.00281.02917,3.50848.03601,3.65674Z"
                // style=""
                stroke-width=" 0px"
              />
              <path
                d="m22.84213,44.91175c-.58521-1.37366-2.35022-.93414-3.51074-1v-9.29297c0-.95703-.77832-1.73535-1.73535-1.73535h-4.41113c-.95703,0-1.73535.77832-1.73535,1.73535v9.29297h-1.74414c-1.42615-.05121-2.28711,1.78326-1.33301,2.84668l5.7832,6.93945c.65295.82385,2.01196.82446,2.66602-.00006,0,.00006,5.78125-6.93939,5.78125-6.93939.43652-.52246.52832-1.23047.23926-1.84668Z"
                // style=""
                stroke-width=" 0px"
              />
            </svg>
            UV Index Max : {uv_index_max} ({uvCategory})
          </div>
          <div className="flex items-center font-semibold xl:px-4">
            Precautions: {precautions}
          </div>
        </div>
        {/* <p>Precipitation: {precipitation_sum} mm</p> */}
        {/* <p>Wind Speed Max: {wind_speed_max} km/h</p> */}
        {/* <p>Wind Gust Max: {wind_gusts_max} km/h</p> */}
        {/* <p>Wind Direction: {getWindDirection(wind_direction)}</p> */}
        {/* <div>
          <h1>Wind Direction</h1>
          <WindDirection degree={windDegree} />
        </div> */}
        {/* <p>
          UV Index Max: {uv_index_max} ({uvCategory})
        </p>
        <p>UV Index Precautions: {precautions}</p> */}
        {/* <p>Weather: {getWeatherDescription(weather_code)}</p> */}

        {/* <p>Sunshine Duration: {convertSeconds(sunshine_duration)}</p>
        <p>Daylight Duration: {convertSeconds(daylight_duration)}</p> */}
      </div>
    </div>
  );
};

export default WeatherComponent;
