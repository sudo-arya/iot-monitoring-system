// import React, { useState, useEffect } from "react";
// import { DatePicker } from "@mui/x-date-pickers";
// import { TimeClock } from "@mui/x-date-pickers/TimeClock";
// import { TextField, Box, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { format } from 'date-fns';

// const DateTimeInput = ({ onDateTimeChange }) => {
//   // Get current date and time for default values
//   const currentDate = new Date();
//   const currentHours = currentDate.getHours();
//   const currentMinutes = currentDate.getMinutes();

//   const [selectedDate, setSelectedDate] = useState(currentDate);
//   const [selectedHours, setSelectedHours] = useState(currentHours);
//   const [selectedMinutes, setSelectedMinutes] = useState(currentMinutes);
//   const [openHoursDialog, setOpenHoursDialog] = useState(false);
//   const [openMinutesDialog, setOpenMinutesDialog] = useState(false);

//   useEffect(() => {
//     // Set the selected date and time to current values on mount
//     setSelectedDate(currentDate);
//     setSelectedHours(currentHours);
//     setSelectedMinutes(currentMinutes);
//   }, []);

//     useEffect(() => {
//     // Notify the parent component whenever the date or time changes
//     if (onDateTimeChange) {
//       onDateTimeChange(selectedDate, selectedHours, selectedMinutes);
//     }
//   }, [selectedDate, selectedHours, selectedMinutes, onDateTimeChange]);

//   const handleDateChange = (newDate) => {
//     setSelectedDate(newDate);
//   };

//   const handleHoursChange = (newTime) => {
//     setSelectedHours(newTime);
//     setOpenHoursDialog(false);  // Close the hours dialog after time is selected

//     // Delay the opening of the minutes dialog by 0.5 seconds
//     setTimeout(() => {
//       setOpenMinutesDialog(true);  // Open the minutes dialog after delay
//     }, 500);
//   };

//   const handleMinutesChange = (newTime) => {
//     setSelectedMinutes(newTime);
//     setOpenMinutesDialog(false);  // Close the minutes dialog after time is selected
//   };

//   const handleHoursDialogOpen = () => {
//     setOpenHoursDialog(true);  // Open the hours dialog
//   };

//   const handleMinutesDialogClose = () => {
//     setOpenMinutesDialog(false);  // Close the minutes dialog if canceled
//   };

//   // Format selected date and time
//   const formattedDateTime = selectedDate && selectedHours && selectedMinutes ?
//     `${format(selectedDate, 'yyyy-MM-dd')} ${selectedHours} : ${selectedMinutes}` : "";

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Box className="p-4 flex flex-col gap-4">
//         {/* Date Picker */}
//         <DatePicker
//           label="Select Date"
//           value={selectedDate}
//           onChange={handleDateChange}
//           renderInput={(params) => (
//             <TextField {...params} className="w-full" />
//           )}
//         />

//         {/* Button to Open Hours Picker Dialog */}
//         <Button variant="contained" color="primary" onClick={handleHoursDialogOpen}>
//           Select Hours
//         </Button>

//         {/* Display selected date and time */}
//         {formattedDateTime && (
//           <Typography variant="h6" className="mt-4">
//             Selected Date and Time: {formattedDateTime}
//           </Typography>
//         )}

//         {/* Hours Picker Dialog */}
//         <Dialog open={openHoursDialog} onClose={handleMinutesDialogClose}>
//           <DialogTitle>Select Hours</DialogTitle>
//           <DialogContent>
//             <TimeClock
//               views={['hours']}  // Only allow hours to be selected
//               ampm={false}  // Enable AM/PM format
//               label="Select Hours"
//               value={selectedHours}
//               onChange={handleHoursChange}
//               renderInput={(params) => (
//                 <TextField {...params} className="w-full" />
//               )}
//             />
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={handleMinutesDialogClose} color="secondary">
//               Cancel
//             </Button>
//             <Button onClick={() => setOpenHoursDialog(false)} color="primary">
//               Done
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* Minutes Picker Dialog */}
//         <Dialog open={openMinutesDialog} onClose={handleMinutesDialogClose}>
//           <DialogTitle>Select Minutes</DialogTitle>
//           <DialogContent>
//             <TimeClock
//               views={['minutes']}  // Only allow minutes to be selected
//               label="Select Minutes"
//               value={selectedMinutes}
//               onChange={handleMinutesChange}
//               renderInput={(params) => (
//                 <TextField {...params} className="w-full" />
//               )}
//             />
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={handleMinutesDialogClose} color="secondary">
//               Cancel
//             </Button>
//             <Button onClick={() => setOpenMinutesDialog(false)} color="primary">
//               Done
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Box>
//     </LocalizationProvider>
//   );
// };

// export default DateTimeInput;

import React, { useState, useEffect } from "react";
// eslint-disable-next-line
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Box, Typography, Button } from "@mui/material";
// eslint-disable-next-line
import { TimeClock } from "@mui/x-date-pickers/TimeClock";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
// eslint-disable-next-line
import { format } from 'date-fns';
import dayjs from 'dayjs';

const DateTimeInput = ({ onDateTimeChange }) => {
  const currentDate = new Date();
  const currentHours = currentDate.getHours();
  const currentMinutes = currentDate.getMinutes();

  const [selectedDateTime, setSelectedDateTime] = useState(dayjs(currentDate));
  const [selectedHours, setSelectedHours] = useState(currentHours);
  const [selectedMinutes, setSelectedMinutes] = useState(currentMinutes);
  // eslint-disable-next-line
  const [openHoursDialog, setOpenHoursDialog] = useState(false);
  // eslint-disable-next-line
  const [openMinutesDialog, setOpenMinutesDialog] = useState(false);

  useEffect(() => {
    setSelectedDateTime(dayjs(currentDate));
    setSelectedHours(currentHours);
    setSelectedMinutes(currentMinutes);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (onDateTimeChange) {
      onDateTimeChange(selectedDateTime.toDate(), selectedHours, selectedMinutes);
    }
  }, [selectedDateTime, selectedHours, selectedMinutes, onDateTimeChange]);

  const handleDateTimeChange = (newDateTime) => {
    setSelectedDateTime(newDateTime);

    // Update hours and minutes as well
    setSelectedHours(newDateTime.hour());
    setSelectedMinutes(newDateTime.minute());
  };
// eslint-disable-next-line
  const handleHoursChange = (newTime) => {
    setSelectedHours(newTime);
    setOpenHoursDialog(false);

    // Delay opening the minutes dialog
    setTimeout(() => {
      setOpenMinutesDialog(true);
    }, 500);
  };
// eslint-disable-next-line
  const handleMinutesChange = (newTime) => {
    setSelectedMinutes(newTime);
    setOpenMinutesDialog(false);
  };
// eslint-disable-next-line
  const handleHoursDialogOpen = () => {
    setOpenHoursDialog(true);
  };
// eslint-disable-next-line
  const handleMinutesDialogClose = () => {
    setOpenMinutesDialog(false);
  };

  const formattedDateTime = selectedDateTime
    ? `${selectedDateTime.format('YYYY-MM-DD')} ${selectedHours} : ${selectedMinutes}`
    : "";

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className=" flex flex-col gap-3">
        {/* New DateTime Picker */}
        <DemoContainer components={['DateTimePicker']}>
          <DateTimePicker
            label="Select Date and Time"
            value={selectedDateTime}
            onChange={handleDateTimeChange}
          />
        </DemoContainer>

        {/* Button to Open Hours Picker Dialog
        <Button variant="contained" color="primary" onClick={handleHoursDialogOpen}>
          Select Hours
        </Button> */}

        {/* Display selected date and time */}
        {formattedDateTime && (
          <Typography variant="" className=" text-center text-lg font-semibold text-gray-800">
            Selected Date and Time: <span className="text-blue-600">{formattedDateTime}</span>
          </Typography>
        )}

        {/* Hours Picker Dialog */}
        {/* <Dialog open={openHoursDialog} onClose={handleMinutesDialogClose}>
          <DialogTitle>Select Hours</DialogTitle>
          <DialogContent>
            <TimeClock
              views={['hours']}
              ampm={false}
              value={dayjs().hour(selectedHours).minute(0)} // Use dayjs for value consistency
              onChange={(newValue) => handleHoursChange(newValue.hour())}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleMinutesDialogClose} color="secondary">
              Cancel
            </Button>
            <Button onClick={() => setOpenHoursDialog(false)} color="primary">
              Done
            </Button>
          </DialogActions>
        </Dialog> */}

        {/* Minutes Picker Dialog */}
        {/* <Dialog open={openMinutesDialog} onClose={handleMinutesDialogClose}>
          <DialogTitle>Select Minutes</DialogTitle>
          <DialogContent>
            <TimeClock
              views={['minutes']}
              value={dayjs().hour(selectedHours).minute(selectedMinutes)}
              onChange={(newValue) => handleMinutesChange(newValue.minute())}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleMinutesDialogClose} color="secondary">
              Cancel
            </Button>
            <Button onClick={() => setOpenMinutesDialog(false)} color="primary">
              Done
            </Button>
          </DialogActions>
        </Dialog> */}
      </Box>
    </LocalizationProvider>
  );
};

export default DateTimeInput;
