import Image from "next/image";
import { Checkbox, Separator, Switch } from "radix-ui";
import { CheckIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { setUserEmailNotification } from "@/services/user";
import { setInAppNotification } from "@/services/user";

export default function NotificationSettings() {
    const [emailNotification, setEmailNotification] = useState(false);
    const [orderFill, setOrderFill] = useState(false)

    const handleEmailNotificationToggle = async (enabled) => {
        try {
          let respData = await setUserEmailNotification({status: enabled});
          if(respData.success){
            setEmailNotification(enabled);
          }
        } catch (error) {
          console.error("Error updating email notification:", error);
        }
    }

    const handleOrderFillToggle = async (enabled) => {
        try {
          let respData = await setInAppNotification({status: enabled});
          if(respData.success){
            setOrderFill(enabled);
          }
        } catch (error) {
          console.error("Error updating email notification:", error);
        }
    }

    return (
        <>
            <h1 className="text-2xl font-bold mb-8">Notification Settings</h1>
            <div className="space-y-6 rounded-lg border bg-[#131212] p-8">
            <div className="flex items-center space-x-3">
                <Image
                src="/images/email_icon.png"
                alt="Icon"
                width={40}
                height={40}
                />
                <span className="text-lg font-semibold">Email</span>
            </div>
            <div className="flex items-center justify-between">
                <label
                    className="Label"
                    htmlFor="airplane-mode"
                    style={{ paddingRight: 15 }}
                >
                Resolutions
                </label>
                <Switch.Root
                    className="SwitchRoot"
                    id="airplane-mode"
                    checked={emailNotification}
                    onCheckedChange={handleEmailNotificationToggle}
                >
                <Switch.Thumb className="SwitchThumb" />
                </Switch.Root>
            </div>
            <Separator.Root
                className="SeparatorRoot"
                style={{ margin: "15px 0" }}
            />
            <div className="flex items-center space-x-3">
                <Image
                src="/images/bell_icon.png"
                alt="Icon"
                width={40}
                height={40}
                />
                <span className="text-lg font-semibold">In App</span>
            </div>
            <div className="flex items-center justify-between">
                <label
                className="Label"
                htmlFor="airplane-mode"
                style={{ paddingRight: 15 }}
                > 
                Order Fills
                </label>
                <Switch.Root 
                className="SwitchRoot"
                id="airplane-mode"
                checked={orderFill}
                onCheckedChange={handleOrderFillToggle}
                >
                <Switch.Thumb className="SwitchThumb" />
                </Switch.Root>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox.Root
                className="CheckboxRoot"
                defaultChecked
                id="c1"
                >
                <Checkbox.Indicator className="CheckboxIndicator">
                    <CheckIcon className="h-[20px] w-[20px]" />
                </Checkbox.Indicator>
                </Checkbox.Root>
                <label className="Label" htmlFor="c1">
                Hide small fills (Less than 1 share)
                </label>
            </div>
            </div>
        </>
    );
}