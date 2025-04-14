import React, { useEffect, useState } from "react";
import axios from "axios";

const WeatherForecastComponent = ({ locations }) => {
  const [forecastData, setForecastData] = useState(null);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("hourly"); // "hourly" or "weekly" 
  const [firstLat, setFirstLat] = useState(null);
  const [firstLong, setFirstLong] = useState(null);
 useEffect(() => {
   if (locations?.length > 0) {
     const { latitude, longitude } = locations[0];
     if (latitude && longitude) {
       setFirstLat(latitude);
       setFirstLong(longitude);
     } else {
       console.error("Latitude or longitude is missing in the first location.");
     }
   } else {
     console.warn("No locations provided");
   }
 }, [locations]);
  // const lat = 22.314806706030907;
  // const lon = 87.32086776565481;
  // console.log("Locations:", locations);

  // const lat = firstLat;
  // const lon = firstLong;
  //   31.1350486585548
  // -96.9723425856168
  // console.log(typeof lat);

 useEffect(() => {
   const fetchForecastData = async () => {
     if (!firstLat || !firstLong) {
       setError("Latitude and longitude are not available");
       return;
     }

     try {
       const response = await axios.get(
         "https://api.open-meteo.com/v1/forecast",
         {
           params: {
             latitude: firstLat,
             longitude: firstLong,
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
        //  console.log("Forecast Data:", response.data);
       } else {
         setError("Unable to fetch forecast data");
       }
     } catch (err) {
       setError("Error fetching forecast data");
       console.error(err);
     }
   };

   if (firstLat && firstLong) {
     fetchForecastData();
   }
 }, [firstLat, firstLong]);

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
    ? hourly.time.filter(
        (time, index) => new Date(time).toLocaleDateString() === todayDate
      )
    : [];

  const todayHourly = {
    temperature: {
      max: Math.max(
        ...todayHourlyData.map((_, index) => hourly.temperature_2m[index])
      ),
      min: Math.min(
        ...todayHourlyData.map((_, index) => hourly.temperature_2m[index])
      ),
      avg: calculateAverage(
        todayHourlyData.map((_, index) => hourly.temperature_2m[index])
      ),
    },
    wind: {
      max: Math.max(
        ...todayHourlyData.map((_, index) => hourly.wind_speed_10m[index])
      ),
      min: Math.min(
        ...todayHourlyData.map((_, index) => hourly.wind_speed_10m[index])
      ),
      avg: calculateAverage(
        todayHourlyData.map((_, index) => hourly.wind_speed_10m[index])
      ),
      direction: hourly.wind_direction_10m[0], // Simplified, show first value
    },
    pressure: {
      max: Math.max(
        ...todayHourlyData.map((_, index) => hourly.pressure_msl[index])
      ),
      min: Math.min(
        ...todayHourlyData.map((_, index) => hourly.pressure_msl[index])
      ),
      avg: calculateAverage(
        todayHourlyData.map((_, index) => hourly.pressure_msl[index])
      ),
    },
    humidity: {
      max: Math.max(
        ...todayHourlyData.map((_, index) => hourly.relative_humidity_2m[index])
      ),
      min: Math.min(
        ...todayHourlyData.map((_, index) => hourly.relative_humidity_2m[index])
      ),
      avg: calculateAverage(
        todayHourlyData.map((_, index) => hourly.relative_humidity_2m[index])
      ),
      maxTime:
        hourly.time[
          hourly.relative_humidity_2m.indexOf(
            Math.max(
              ...todayHourlyData.map(
                (_, index) => hourly.relative_humidity_2m[index]
              )
            )
          )
        ], // Time when humidity is highest
    },
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="xl:w-full w-[calc(100vw-6rem)] bg-white px-6 xl:px-0 py-4 text-gray-700" >
      <div className="flex text-center justify-center flex-row xl:flex-row text-white font-semibold text-base">
        <div
          className={`flex xl:w-1/3 py-2 xl:px-1 px-4 justify-center items-center xl:hover:bg-gradient-to-r xl:hover:from-gray-500 xl:hover:to-black transition-transform ease-in-out duration-300 cursor-pointer rounded-l-full shodow-2xl  ${
            viewMode === "hourly"
              ? "bg-gradient-to-r from-blue-500 to-indigo-500"
              : "bg-gray-400"
          }`}
          onClick={() => setViewMode("hourly")}
        >
          <button>Today's Forecast</button>
        </div>
        <div
          className={`flex xl:w-1/3 py-2 px-1 justify-center xl:hover:bg-gradient-to-r xl:hover:to-gray-500 xl:hover:from-black transition-transform ease-in-out duration-300 cursor-pointer rounded-r-full shadow-2xl ${
            viewMode === "weekly"
              ? "bg-gradient-to-r from-blue-500 to-indigo-500"
              : "bg-gray-400"
          }`}
          onClick={() => setViewMode("weekly")}
        >
          <button>Weekly Forecast</button>
        </div>
      </div>

      {viewMode === "hourly" && todayHourly && (
        <div className="data-display mt-4">
          {/* Responsive and visually appealing table container */}
          <div className="overflow-x-auto shadow-lg rounded-lg border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 ">
            <table className="min-w-full divide-y divide-gray-200 bg-white">
              <thead className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Parameter
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Min
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Avg
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Max
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Temperature (°C)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                    {todayHourly.temperature.min.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                    {todayHourly.temperature.avg.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                    {todayHourly.temperature.max.toFixed(2)}
                  </td>
                </tr>
                <tr className="hover:bg-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Wind Speed (km/h)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                    {todayHourly.wind.min.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                    {todayHourly.wind.avg.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                    {todayHourly.wind.max.toFixed(2)}
                  </td>
                </tr>
                <tr className="hover:bg-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Pressure (hPa)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                    {todayHourly.pressure.min.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                    {todayHourly.pressure.avg.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                    {todayHourly.pressure.max.toFixed(2)}
                  </td>
                </tr>
                <tr className="hover:bg-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Humidity (%)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                    {todayHourly.humidity.min.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                    {todayHourly.humidity.avg.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                    {todayHourly.humidity.max.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-sm font-medium text-gray-600">
            <strong>Time of Max Humidity:</strong>{" "}
            {formatTime(todayHourly.humidity.maxTime)}
          </p>
        </div>
      )}

      {viewMode === "weekly" && daily && (
        <div className="data-display mt-4">
          {/* Compact Weekly Forecast Table */}
          <div className="overflow-x-auto shadow-md rounded-lg border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 ">
            <table className="min-w-full divide-y divide-gray-200 bg-white">
              <thead className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-semibold uppercase tracking-wider">
                    Max Temp (°C)
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-semibold uppercase tracking-wider">
                    Min Temp (°C)
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-semibold uppercase tracking-wider">
                    Precipitation (mm)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {daily.time.map((date, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-800">
                      {new Date(date).toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                      })}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center text-sm text-gray-600">
                      {daily.temperature_2m_max[index].toFixed(2)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center text-sm text-gray-600">
                      {daily.temperature_2m_min[index].toFixed(2)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center text-sm text-gray-600">
                      {(daily.precipitation_sum[index] || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherForecastComponent;
