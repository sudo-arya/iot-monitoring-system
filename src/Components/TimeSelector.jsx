// import React, { useState } from 'react';
// import { Box, Button, Typography, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

// const TimeSelector = () => {
//   const [openDialog, setOpenDialog] = useState(false);
//   const [selectedMinutes, setSelectedMinutes] = useState(60); // Default to 60 minutes (1 hour)
//   const [selectedTimeDisplay, setSelectedTimeDisplay] = useState('1 hr'); // Display time in hours/minutes

//   // Time ranges from 5 minutes to 12 hours (720 minutes), in increments of 5 minutes
//   const minuteOptions = [];
//   for (let i = 5; i <= 720; i += 5) {
//     minuteOptions.push(i);
//   }

//   // Function to handle closing the dialog
//   const handleDialogClose = () => {
//     setOpenDialog(false);
//   };

//   // Function to handle opening the dialog
//   const handleDialogOpen = () => {
//     setOpenDialog(true);
//   };

//   // Handle selection of time intervals
//   const handleMinuteSelection = (minute) => {
//     setSelectedMinutes(minute);
//     // If minutes are greater than or equal to 60, display in hours
//     if (minute >= 60) {
//       setSelectedTimeDisplay(`${(minute / 60).toFixed(1)} hr`);
//     } else {
//       setSelectedTimeDisplay(`${minute} min`);
//     }
//     setOpenDialog(false);
//   };

//   // Function to calculate rotation for each interval
//   const calculateRotation = (minute) => {
//     const totalMinutes = minuteOptions.length;
//     const index = minuteOptions.indexOf(minute);
//     return (index / totalMinutes) * 360; // Calculate degree for rotation
//   };

//   return (
//     <Box className="p-4 flex flex-col gap-4">
//       {/* Button to open time clock selector dialog */}
//       <Button variant="contained" color="primary" onClick={handleDialogOpen}>
//         Select Time Interval
//       </Button>

//       {/* Display selected time */}
//       {selectedTimeDisplay && (
//         <Typography variant="h6" className="mt-4">
//           Selected Time Interval: {selectedTimeDisplay}
//         </Typography>
//       )}

//       {/* Dialog for time clock selector */}
//       <Dialog open={openDialog} onClose={handleDialogClose}>
//         <DialogTitle>Select Minutes</DialogTitle>
//         <DialogContent>
//           <Box className="flex flex-col items-center">
//             <svg
//               width="300"
//               height="300"
//               viewBox="0 0 300 300"
//               xmlns="http://www.w3.org/2000/svg"
//               className="time-clock"
//               style={{ display: 'block', margin: '0 auto' }}
//             >
//               {/* Circle representing the clock face */}
//               <circle cx="150" cy="150" r="140" stroke="black" strokeWidth="2" fill="none" />
//               <circle cx="150" cy="150" r="10" fill="black" /> {/* Center dot */}

//               {/* Minute options arranged along the circle */}
//               {minuteOptions.map((minute, index) => {
//                 const angle = (index / minuteOptions.length) * 360; // Divide the circle into equal parts
//                 const radian = (angle - 90) * (Math.PI / 180); // Convert to radians
//                 const x = 150 + 110 * Math.cos(radian); // X coordinate (increased radius for better spacing)
//                 const y = 150 + 110 * Math.sin(radian); // Y coordinate (increased radius for better spacing)

//                 return (
//                   <circle
//                     key={minute}
//                     cx={x}
//                     cy={y}
//                     r="5" // Small circle to indicate clickable area
//                     fill="blue"

//                     stroke="transparent" // Invisible stroke, just the clickable area
//                     style={{ cursor: 'pointer' }}
//                     onClick={() => handleMinuteSelection(minute)}
//                   />
//                 );
//               })}

//               {/* 12 Segments with numbers from 1 to 12 */}
//               {[...Array(12)].map((_, index) => {
//                 const angle = (index / 12) * 360; // Divide the clock into 12 equal parts
//                 const radian = (angle - 60) * (Math.PI / 180); // Convert to radians
//                 const x = 150 + 120 * Math.cos(radian); // X coordinate for the number (further out than the clickable circles)
//                 const y = 150 + 120 * Math.sin(radian); // Y coordinate for the number
//                 return (
//                   <text
//                     key={index}
//                     x={x}
//                     y={y}
//                     textAnchor="middle"
//                     alignmentBaseline="middle"
//                     fontSize="16"
//                     fontWeight="bold"
//                     fill="black"
//                   >
//                     {index+1}
//                   </text>
//                 );
//               })}

//               {/* Indicator for selected minute */}
//               {selectedMinutes && (
//                 <line
//                   x1="150"
//                   y1="150"
//                   x2={150 + 110 * Math.cos((calculateRotation(selectedMinutes) - 90) * (Math.PI / 180))}
//                   y2={150 + 110 * Math.sin((calculateRotation(selectedMinutes) - 90) * (Math.PI / 180))}
//                   stroke="blue"
//                   strokeWidth="3"
//                   markerEnd="url(#arrowhead)"
//                 />
//               )}

//               {/* Arrowhead marker for the line */}
//               <defs>
//                 <marker
//                   id="arrowhead"
//                   viewBox="0 0 10 10"
//                   refX="5"
//                   refY="5"
//                   markerWidth="4"
//                   markerHeight="4"
//                   orient="auto"
//                 >
//                   <polygon points="0,0 10,5 0,10" fill="blue" />
//                 </marker>
//               </defs>
//             </svg>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleDialogClose} color="secondary">
//             Cancel
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default TimeSelector;




import React, { useState, useEffect } from 'react';

const TimeSelector = ({ onTimeChange }) => {
  const [sliderValue, setSliderValue] = useState(0); // Range input (0 to 1)

  // Quadratic scaling: y = 12x^2
  const transformedTime = 12 * Math.pow(sliderValue, 1.8);

  // Extract the decimal part and convert it to minutes
  const minutes = (transformedTime - Math.floor(transformedTime)) * 60;

  // Display time in minutes until 1 hour, then switch to hours
  const displayTime =
    transformedTime < 1
      ? `${(transformedTime * 60).toFixed(0)} min`
      : `${Math.floor(transformedTime)} hrs ${minutes.toFixed(0)} min`;

// Call the onTimeChange function whenever the slider value changes
useEffect(() => {
  onTimeChange(transformedTime);
}, [sliderValue, onTimeChange]);

  const resetSlider = () => {
    setSliderValue(0);
  };

  return (
    <div className="p-2 flex flex-col items-center w-full max-w-md">
      {/* Display selected time */}
      <div className="text-center text-lg font-semibold text-gray-800">
        Run for : <span className="text-blue-600">{displayTime}</span>
      </div>

      {/* Slider + Reset Button Row */}
      <div className="flex w-full items-center justify-center">
        {/* Slider */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={sliderValue}
          onChange={(e) => setSliderValue(parseFloat(e.target.value))}
          className="w-full accent-blue-500 cursor-pointer"
        />

        {/* Reset Button */}
        <button
          onClick={resetSlider}
          className="text-black px-3 py-2 bg-white rounded-e-full rounded-s-full ml-3 shadow-lg hover:bg-gray-100 border-2 border-gray-400 border-opacity-50 focus:outline-none z-[1000]"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/3031/3031710.png"
            alt="Reset View"
            className="w-4 h-4 opacity-70"
          />
        </button>
      </div>

      {/* Scale Labels */}
      <div className="flex justify-between w-full text-sm text-gray-500 mt-2 pr-14 px-1">
        <span>0 hrs</span>
        <span>12 hrs</span>
      </div>
    </div>
  );
};

export default TimeSelector;
