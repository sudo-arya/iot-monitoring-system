import React, { useState, useEffect } from "react";
import { DatePicker } from "@mui/x-date-pickers";
import { TimeClock } from "@mui/x-date-pickers/TimeClock";
import { TextField, Box, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';

const DateTimeInput = ({ onDateTimeChange }) => {
  // Get current date and time for default values
  const currentDate = new Date();
  const currentHours = currentDate.getHours();
  const currentMinutes = currentDate.getMinutes();

  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [selectedHours, setSelectedHours] = useState(currentHours);
  const [selectedMinutes, setSelectedMinutes] = useState(currentMinutes);
  const [openHoursDialog, setOpenHoursDialog] = useState(false);
  const [openMinutesDialog, setOpenMinutesDialog] = useState(false);

  useEffect(() => {
    // Set the selected date and time to current values on mount
    setSelectedDate(currentDate);
    setSelectedHours(currentHours);
    setSelectedMinutes(currentMinutes);
  }, []);

    useEffect(() => {
    // Notify the parent component whenever the date or time changes
    if (onDateTimeChange) {
      onDateTimeChange(selectedDate, selectedHours, selectedMinutes);
    }
  }, [selectedDate, selectedHours, selectedMinutes, onDateTimeChange]);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const handleHoursChange = (newTime) => {
    setSelectedHours(newTime);
    setOpenHoursDialog(false);  // Close the hours dialog after time is selected

    // Delay the opening of the minutes dialog by 0.5 seconds
    setTimeout(() => {
      setOpenMinutesDialog(true);  // Open the minutes dialog after delay
    }, 500);
  };

  const handleMinutesChange = (newTime) => {
    setSelectedMinutes(newTime);
    setOpenMinutesDialog(false);  // Close the minutes dialog after time is selected
  };

  const handleHoursDialogOpen = () => {
    setOpenHoursDialog(true);  // Open the hours dialog
  };

  const handleMinutesDialogClose = () => {
    setOpenMinutesDialog(false);  // Close the minutes dialog if canceled
  };

  // Format selected date and time
  const formattedDateTime = selectedDate && selectedHours && selectedMinutes ?
    `${format(selectedDate, 'yyyy-MM-dd')} ${selectedHours} : ${selectedMinutes}` : "";

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box className="p-4 flex flex-col gap-4">
        {/* Date Picker */}
        <DatePicker
          label="Select Date"
          value={selectedDate}
          onChange={handleDateChange}
          renderInput={(params) => (
            <TextField {...params} className="w-full" />
          )}
        />

        {/* Button to Open Hours Picker Dialog */}
        <Button variant="contained" color="primary" onClick={handleHoursDialogOpen}>
          Select Hours
        </Button>

        {/* Display selected date and time */}
        {formattedDateTime && (
          <Typography variant="h6" className="mt-4">
            Selected Date and Time: {formattedDateTime}
          </Typography>
        )}

        {/* Hours Picker Dialog */}
        <Dialog open={openHoursDialog} onClose={handleMinutesDialogClose}>
          <DialogTitle>Select Hours</DialogTitle>
          <DialogContent>
            <TimeClock
              views={['hours']}  // Only allow hours to be selected
              ampm={false}  // Enable AM/PM format
              label="Select Hours"
              value={selectedHours}
              onChange={handleHoursChange}
              renderInput={(params) => (
                <TextField {...params} className="w-full" />
              )}
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
        </Dialog>

        {/* Minutes Picker Dialog */}
        <Dialog open={openMinutesDialog} onClose={handleMinutesDialogClose}>
          <DialogTitle>Select Minutes</DialogTitle>
          <DialogContent>
            <TimeClock
              views={['minutes']}  // Only allow minutes to be selected
              label="Select Minutes"
              value={selectedMinutes}
              onChange={handleMinutesChange}
              renderInput={(params) => (
                <TextField {...params} className="w-full" />
              )}
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
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default DateTimeInput;
