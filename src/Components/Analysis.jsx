import React from "react";
import Sidebar from "./Sidebar";
import { FaLightbulb } from "react-icons/fa"; // Importing FontAwesome icon

const Analysis = () => {
  return (
    <div className="w-full min-h-screen flex bg-gray-200">
      <Sidebar />
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <FaLightbulb className="text-6xl text-gray-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-500">Future Scope</h1>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
