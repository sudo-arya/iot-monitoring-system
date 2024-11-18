import React, { useState, useEffect } from "react";
import { FaHome, FaUser,  FaDatabase, FaBell, FaBug, FaMicrochip, FaChevronLeft } from "react-icons/fa";
import { FaBarsProgress, FaGear, FaMagnifyingGlassChart } from "react-icons/fa6";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false); // Sidebar expansion state
  const [isSmallScreen, setIsSmallScreen] = useState(false); // Small screen detection

  // Detect if the screen size is small
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024); // Adjust breakpoint as needed
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize); // Update on resize

    return () => window.removeEventListener("resize", handleResize); // Cleanup
  }, []);

  return (
    <div
      className={`h-screen bg-gray-900 text-white transition-all duration-300 z-40 opacity-85 ${
        isExpanded ? "w-64" : "w-16"
      }`}
      onMouseEnter={() => !isSmallScreen && setIsExpanded(true)} // Expand on hover for large screens
      onMouseLeave={() => !isSmallScreen && setIsExpanded(false)} // Collapse on leave for large screens
    >
      {/* Toggle Button for Small Screens */}
      {/* <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`lg:hidden absolute m-2 bg-gray-700 p-2  py-4 rounded focus:outline-none transform transition-transform ease-in-out duration-300 ${
          isExpanded ? " object-cover" : "px-5"
        }`}
      >
        {isExpanded ? "<" : ">"}
      </button> */}

      {/* Sidebar Content */}
      <div
        className={`flex flex-col items-center lg:items-start mt-2 fixed text-white transition-all duration-300  ${
          isExpanded ? "space-y-1 w-64" : "space-y-2 w-16"
        } `}
      >
        <div className={`xl:hidden`}>&nbsp;</div>
        <SidebarButton
          icon={
            <FaChevronLeft
              size={24}
              className={` xl:hidden ${
                isExpanded ? "rotate-0" : "rotate-180"
              }`}
            />
          }
          title="Back"
          isExpanded={isExpanded}
          directTo=""
          onClick={() => setIsExpanded(!isExpanded)}
          className="xl:hidden"
        />
        <SidebarButton
          icon={<FaHome size={24} />}
          title="Dashboard"
          isExpanded={isExpanded}
          directTo="/dashboard"
        />
        <SidebarButton
          icon={<FaBarsProgress size={24} />}
          title="Irrigation Management & Control"
          isExpanded={isExpanded}
          directTo="/irrigation"
        />
        <SidebarButton
          icon={<FaMagnifyingGlassChart size={24} />}
          title="Predictive Analysis & Recommendations"
          isExpanded={isExpanded}
          directTo="/analysis"
        />
        <SidebarButton
          icon={<FaBug size={24} />}
          title="Pest Protection"
          isExpanded={isExpanded}
          directTo="/pest"
        />
        <SidebarButton
          icon={<FaMicrochip size={24} />}
          title="Sensor & Device Management"
          isExpanded={isExpanded}
          directTo="/management"
        />
        <SidebarButton
          icon={<FaDatabase size={24} />}
          title="Data Logging & Historical Analysis"
          isExpanded={isExpanded}
          directTo="/logging"
        />
        <SidebarButton
          icon={<FaBell size={24} />}
          title="Alert Management"
          isExpanded={isExpanded}
          directTo="/alert"
        />
        <SidebarButton
          icon={<FaGear size={24} />}
          title="System Control"
          isExpanded={isExpanded}
          directTo="/control"
        />
        <SidebarButton
          icon={<FaUser size={24} />}
          title="Support"
          isExpanded={isExpanded}
          directTo="/support"
        />
      </div>
    </div>
  );
};

const SidebarButton = ({ icon, title, isExpanded, directTo,onClick }) => {
  return (
    <Link to={directTo} className="flex items-center w-full">
      <div
        className={`flex items-center w-full px-4 py-2 hover:bg-gray-700 z-40 ${
          isExpanded ? "justify-start" : "justify-center"
        }`}
        onClick={onClick}
      >
        <div>{icon}</div>

        {isExpanded && (
          <span
            className={`ml-4 text-sm font-medium transition-opacity duration-300 ${
              title === "Back" ? "xl:hidden block" : ""
            }`}
          >
            {title}
          </span>
        )}
      </div>
    </Link>
  );
};

export default Sidebar;
