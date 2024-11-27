import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaUser,
  FaDatabase,
  FaBell,
  FaBug,
  FaMicrochip,
  FaChevronLeft,
} from "react-icons/fa";
import {
  FaBarsProgress,
  FaGear,
  FaMagnifyingGlassChart,
} from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false); // Sidebar expansion state
  const [isSmallScreen, setIsSmallScreen] = useState(false); // Small screen detection
  const location = useLocation();

  // Detect if the screen size is small
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024); // Adjust breakpoint as needed
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize); // Update on resize

    return () => window.removeEventListener("resize", handleResize); // Cleanup
  }, []);

  const getNavItemClass = (path) =>
    location.pathname === path
      ? "text-green-600 py-2 cursor-pointer transform transition duration-300 ease-in-out"
      : "text-white py-2 cursor-pointer transform transition duration-300 ease-in-out";

  return (
    <div
      className={`bg-gray-900 h-full text-white transition-all duration-300 z-40 opacity-85 ${
        isExpanded ? "w-64" : "w-16"
      } h-full`} // Add h-full here to make the sidebar take full height
      onMouseEnter={() => !isSmallScreen && setIsExpanded(true)} // Expand on hover for large screens
      onMouseLeave={() => !isSmallScreen && setIsExpanded(false)} // Collapse on leave for large screens
    >
      {/* Toggle Button for Small Screens */}
      {/* <button
    onClick={() => setIsExpanded(!isExpanded)}
    className={`lg:hidden absolute m-2 bg-gray-700 p-2 py-4 rounded focus:outline-none transform transition-transform ease-in-out duration-300 ${
      isExpanded ? " object-cover" : "px-5"
    }`}
  >
    {isExpanded ? "<" : ">"}
  </button> */}

      {/* Sidebar Content */}
      <div
        className={`flex flex-col items-center lg:items-start h-full fixed bg-gray-900 text-white transition-all duration-300 ${
          isExpanded ? "space-y-1 w-64" : "space-y-2 w-16"
        } h-full`} // Add h-full here to ensure the content div takes full height
      >
        <div className="mb-8 xl:mb-0 ">&nbsp;</div>
        {/* Sidebar Buttons */}
        <SidebarButton
          icon={
            <FaChevronLeft
              size={24}
              className={` xl:hidden  ${
                isExpanded ? "rotate-0" : "rotate-180"
              }`}
            />
          }
          title="Back"
          isExpanded={isExpanded}
          directTo=""
          getNavItemClass={getNavItemClass}
          onClick={() => setIsExpanded(!isExpanded)}
          className="xl:hidden "
        />
        <SidebarButton
          icon={<FaHome size={24} />}
          title="Dashboard"
          isExpanded={isExpanded}
          directTo="/dashboard"
          getNavItemClass={getNavItemClass}
        />
        <SidebarButton
          icon={<FaBarsProgress size={24} />}
          title="Irrigation Management & Control"
          isExpanded={isExpanded}
          directTo="/irrigation"
          getNavItemClass={getNavItemClass}
        />
        <SidebarButton
          icon={<FaMagnifyingGlassChart size={24} />}
          title="Predictive Analysis & Recommendations"
          isExpanded={isExpanded}
          directTo="/analysis"
          getNavItemClass={getNavItemClass}
        />
        <SidebarButton
          icon={<FaBug size={24} />}
          title="Pest Protection"
          isExpanded={isExpanded}
          directTo="/pest"
          getNavItemClass={getNavItemClass}
        />
        <SidebarButton
          icon={<FaMicrochip size={24} />}
          title="Sensor & Device Management"
          isExpanded={isExpanded}
          directTo="/management"
          getNavItemClass={getNavItemClass}
        />
        <SidebarButton
          icon={<FaDatabase size={24} />}
          title="Data Logging & Historical Analysis"
          isExpanded={isExpanded}
          directTo="/logging"
          getNavItemClass={getNavItemClass}
        />
        <SidebarButton
          icon={<FaBell size={24} />}
          title="Alert Management"
          isExpanded={isExpanded}
          directTo="/alert"
          getNavItemClass={getNavItemClass}
        />
        <SidebarButton
          icon={<FaGear size={24} />}
          title="System Control"
          isExpanded={isExpanded}
          directTo="/control"
          getNavItemClass={getNavItemClass}
        />
        <SidebarButton
          icon={<FaUser size={24} />}
          title="Support"
          isExpanded={isExpanded}
          directTo="/support"
          getNavItemClass={getNavItemClass}
        />
      </div>
    </div>
  );
};

const SidebarButton = ({
  icon,
  title,
  isExpanded,
  directTo,
  onClick,
  getNavItemClass = () => "", // Default to avoid errors if undefined
}) => {
  return (
    <Link
      to={directTo}
      className={`flex items-center w-full ${getNavItemClass(directTo)}`}
    >
      <div
        className={`flex items-center w-full px-4 py-2 hover:bg-gray-700 z-40 ${
          isExpanded ? "justify-start" : "justify-center"
        } `}
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
