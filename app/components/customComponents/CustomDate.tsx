import { Dialog } from "radix-ui";
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { addHours, isSameDay, setMinutes, setSeconds, setMilliseconds } from "date-fns";
import { Button } from "../ui/button";
import { Cross2Icon } from "@radix-ui/react-icons";

interface CustomDateProps {
  showCustomDialog: boolean;
  setShowCustomDialog: (value: boolean) => void;
  customDate: any;
  setCustomDate: (value: any) => void;
}

const now = new Date();
const minDateTime = setMilliseconds(setSeconds(setMinutes(addHours(now, 1), 0), 0), 0); // round to next full hour

const CustomDateComponent: React.FC<CustomDateProps> = (props) => {
  const { showCustomDialog, setShowCustomDialog, customDate, setCustomDate } = props;
  const [selectedDateTime, setSelectedDateTime] = useState<any>(null);
  
  // Calculate the minimum allowed time (current time + 1 hour)
  const getOneHourAhead = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now;
  };

  // Set the initial selected date and time to be valid
  useEffect(() => {
    if (!selectedDateTime) {
      setSelectedDateTime(getOneHourAhead()); // Initialize to a valid future time on mount
    }
  }, [selectedDateTime]); // Only run once on component mount

  const filterPassedTime = (time) => {
    const oneHourAhead = getOneHourAhead();
    // Compare selected time with the one hour ahead time for the current day
    return selectedDateTime && 
           selectedDateTime.getDate() === new Date().getDate() && 
           selectedDateTime.getMonth() === new Date().getMonth() && 
           selectedDateTime.getFullYear() === new Date().getFullYear()
      ? time.getTime() > oneHourAhead.getTime()
      : true; // Allow any time for other days
  };

  // state 
  const [date, setDate] = useState<Date | null>(minDateTime);
  return (
    <Dialog.Root open={showCustomDialog} onOpenChange={setShowCustomDialog}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#181818] p-6 rounded-lg w-full max-w-md shadow-lg">
          <Dialog.Title className="text-lg font-bold mb-4 text-center">
            Set Custom Expiry
          </Dialog.Title>
          <div className="mt-4">
            <label className="block mb-2">Pick a date and time:</label>
            <DatePicker
              className="custom_datepicker border p-2 rounded w-full"
              selected={selectedDateTime}
              onChange={(date) => setSelectedDateTime(date)}
              showTimeSelect
              dateFormat="Pp"
              minDate={new Date()} // Prevents selection of dates before today
              filterTime={filterPassedTime} // Conditionally disables times based on selected date
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={() => {setCustomDate(selectedDateTime), setShowCustomDialog(false)}}>Apply</Button>
          </div>
          <Dialog.Close asChild>
            <button className="modal_close_brn" aria-label="Close">
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CustomDateComponent;
