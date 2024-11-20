import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import WeatherComponent from "./WeatherComponent";
import WeatherForecastComponent from "./WeatherForecastComponent";


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

  return (
    <div className="w-full h-full flex  ">
      <div className="w-full h-full flex">
        <Sidebar />
      </div>
      {/* Ensure Sidebar takes full height */}
      {/* Content section */}
      <div className="absolute w-full h-full my-20 mx-20 flex-grow flex-col">
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

        <h1>Welcome to Dashboard</h1>
        {/* <h2>{userId}</h2> */}
        <WeatherComponent />
        <div className="graph-container overflow-x-auto my-4">
          {/* Wrap the graph component in a div with limited width and scrollable overflow */}

          <WeatherForecastComponent />
        </div>

        <div className="h-40">&nbsp;</div>
      </div>
    </div>
  );

};

export default Dashboard;
