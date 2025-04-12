// src/components/SEO.js
import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";

const Support = () => {

  const location = useLocation();
  const userId = localStorage.getItem("userId");
  const [sensorData, setSensorData] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState("bg-green-200");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
        if (toastMessage) {
          const timer = setTimeout(() => setToastMessage(""), 3000);
          return () => clearTimeout(timer);
        }
      }, [toastMessage]);


  return (
    <div className=" w-full h-full flex">
      <div className="w-full h-full flex">
        <Sidebar />
      </div>
      {/* Alert */}
      <div className="absolute xl:w-[calc(100vw-6rem)] h-full my-20 ml-20 flex xl:flex-col flex-col px-">

        {/* Toast Notification */}
        {toastMessage && (
          <div className={`fixed xl:right-6 xl:top-2 right-2 top-2 text-xl rounded-xl border p-3 px-6 z-50 ${toastColor}`}>
            {toastMessage}
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50 z-40">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-white h-20 w-20 animate-spin"></div>
          </div>
        )}

        Support
        <div className="flex flex-col md:flex-row md:space-x-4">

        </div>

    </div>
    </div>
  );
};

export default Support;
