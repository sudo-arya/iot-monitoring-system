import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import SensorDataDisplay from "./SensorDataDisplay";
import WeatherComponent from "./WeatherComponent";
import WeatherForecastComponent from "./WeatherForecastComponent";
// eslint-disable-next-line
import PiGraph from "./PiGraph";
// eslint-disable-next-line
import { MapComponent, MapPage } from "./MapComponent";
import LatestSensorData from "./LatestSensorData";
import DisplayAlert from "./DisplayAlert";


const Dashboard = () => {
  const location = useLocation();
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState("");
  // eslint-disable-next-line
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  // eslint-disable-next-line
  const [isLoading, setIsLoading] = useState(false); // Loading state

  useEffect(() => {
    if (location.state?.toastMessage) {
      setToastMessage(location.state.toastMessage);
      setToastColor(location.state.toastColor);

      // Clear the toast message after 3 seconds
      const timer = setTimeout(() => {
        setToastMessage("");
      }, 3000);

      // Clear location.state to prevent reappearing on refresh
      window.history.replaceState({}, document.title);

      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [location.state]);

  const userId = localStorage.getItem("userId");
  console.log("User ID:", userId);
  const locations = JSON.parse(localStorage.getItem("locations")) || [];
  // console.log(locations); // This will log the array of locations

  // const locations = [
  //   { latitude: 28.6139, longitude: 77.209 },
  //   { latitude: 19.076, longitude: 72.8777 },
  //   { latitude: 13.0827, longitude: 80.2707 },
  // ];

  const [selectedLocation, setSelectedLocation] = useState(null); // State to store selected marker data

  useEffect(() => {
    if (location.state?.toastMessage) {
      setToastMessage(location.state.toastMessage);
      setToastColor(location.state.toastColor);
      const timer = setTimeout(() => {
        setToastMessage("");
      }, 3000);
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Update selected location when a marker is clicked
  const handleMarkerClick = (location) => {
    setSelectedLocation(location); // Set the selected location in the parent
  };

  return (
    <div className="w-full h-full flex  ">
      <div className="w-full h-full flex">
        <Sidebar />
      </div>
      {/* Ensure Sidebar takes full height */}
      {/* Content section */}
      <div className="absolute h-full my-20 ml-20 flex xl:flex-row flex-col">
        {toastMessage && (
          <div
            className={`toast-top ${toastColor} p-2 px-10 my-20 fixed text-xl rounded-xl xl:right-6 xl:top-2 top-0 right-2 text-green-700 border-green-300 border`}
          >
            {toastMessage}
          </div>
        )}

        {isLoading && ( // Display loading component when isLoading is true
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-24 w-24"></div>
          </div>
        )}

        {/* <h1>Welcome to Dashboard</h1> */}
        {/* <h2>{userId}</h2> */}
        <div className="">
          <div className="my-2">
            <WeatherComponent locations={locations} />
          </div>

          <div className=" my-2">
            {/* overflow-x-auto */}
            {/* Wrap the graph component in a div with limited width and scrollable overflow */}

            <WeatherForecastComponent locations={locations} />
          </div>

          <div className="h-40 xl:visible hidden">&nbsp;</div>
        </div>
        <div className="my-2 xl:mx-8">
          <div className=" relative">
            {/* White Div that will overlap on the MapComponent */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white p-3 underline shadow-lg rounded-md text-center text-sm xl:text-xl font-semibold text-gray-700 z-20">
              Select Farm Area
            </div>
            {/* MapComponent below the overlapping white div */}
            <MapComponent
              locations={locations}
              onMarkerClick={handleMarkerClick}
              setSelectedLocation={setSelectedLocation} // Pass the setSelectedLocation function as a prop
            />{" "}
          </div>
          {/* Target Div to show content based on selected location */}
          <div className="xl:w-full w-[calc(100vw-6rem)] mt-4  ">
            {selectedLocation ? (
              <div className="p-4 border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 rounded-3xl shadow-lg w-full h-full">
                <h2 className="text-xl font-semibold">
                  {selectedLocation.piLocation}
                </h2>
                <p>Status: {selectedLocation.piStatus}</p>
                {/* <p>ID: {selectedLocation.piId}</p> */}
                <p>
                  {/* Coordinates: {selectedLocation.latitude},{" "}
                  {selectedLocation.longitude} */}
                </p>
              </div>
            ) : (
              <div className="border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 rounded-3xl shadow-lg w-full h-full text-center justify-center items-center flex bg-gray-200 p-4">Select a location from the map to see details here.</div>
            )}
          </div>
          {/* <div className="mt-4 p-4 border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 rounded-3xl shadow-lg"> */}
          <SensorDataDisplay
            selectedLocation={selectedLocation}
            userId={userId}
            // piId={selectedLocation.piId}
          />
          {/* </div> */}

        </div>
        <div>
          <div className="my-2">
            {/* hii */}
            {selectedLocation ? (
            <LatestSensorData userId={userId} piId={selectedLocation.piId} piName={selectedLocation.piLocation} />):( <div className="overflow-x-auto shadow-lg rounded-3xl border-2 border-r-indigo-500 border-b-indigo-500 border-t-blue-500 border-l-blue-500 xl:h-[calc(100vh-40rem)] h-fit relative xl:w-[calc(100vw-84rem)] w-[calc(100vw-6rem)] text-center justify-center items-center flex bg-gray-200">Select a location from the map to see details here.</div>)}
          </div>
          <div><DisplayAlert userId={userId}/></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
