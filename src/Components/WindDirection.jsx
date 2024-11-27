import React from "react";
// import "./WindDirection.css";

const WindDirection = ({ degree }) => {
  return (
    <div className="modern-compass">
      <div
        className="needle"
        style={{
          transform: `rotate(${degree}deg)`,
        }}
      ></div>
      <div className="compass-markers">
        <span className="marker north">N</span>
        <span className="marker east">E</span>
        <span className="marker south">S</span>
        <span className="marker west">W</span>
      </div>
      <div className="radial-lines">
        {/* {[...Array(36)].map((_, i) => (
          <div
            key={i}
            className="radial-line"
            style={{
              transform: `rotate(${i * 10}deg)`,
            }}
          ></div>
        ))} */}
      </div>
    </div>
  );
};

export default WindDirection;
