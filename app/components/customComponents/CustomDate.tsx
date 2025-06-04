import { Dialog } from "radix-ui";
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { setHours, setMinutes } from "date-fns";
import { Button } from "../ui/button";
import { Cross2Icon } from "@radix-ui/react-icons";

interface CustomDateProps {
  showCustomDialog: boolean;
  setShowCustomDialog: (value: boolean) => void;
  customDate: any;
  setCustomDate: (value: any) => void;
}

const CustomDateComponent: React.FC<CustomDateProps> = (props) => {
  const { showCustomDialog, setShowCustomDialog, customDate, setCustomDate } = props;

  // state 
  const [date, setDate] = useState<Date | null>(null);
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
            {/* <Input
                type="datetime-local"
                className="border p-2 rounded w-full justify-center"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
              /> */}
            <DatePicker
              className="custom_datepicker border p-2 rounded w-full"
              selected={date as any}
              onChange={(date) => setDate(date)}
              showTimeSelect
              minDate={new Date()}
              minTime={setHours(setMinutes(new Date(), 0), 17)}
              maxTime={setHours(setMinutes(new Date(), 30), 20)}
              dateFormat="MMMM d, yyyy h:mm aa"
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={() => {setCustomDate(date), setShowCustomDialog(false)}}>Apply</Button>
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
