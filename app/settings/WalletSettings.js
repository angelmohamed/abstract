import Image from "next/image";
import { RadioGroup, Switch } from "radix-ui";
import { Button } from "@/app/components/ui/button";
import { useEffect, useState } from "react";
import { toastAlert } from "@/lib/toast";
import { getWalletSettings, setWalletSettings } from "@/services/user";

export default function WalletSettings() {
    const [gas, setGas] = useState("low");
    const [customRPC, setCustomRPC] = useState(false);

    const handleGasChange = (value) => {
        setGas(value);
    }

    const handleCustomRPCChange = (value) => {
        setCustomRPC(value);
    }

    const getWalletSettingsData = async () => {
        try {
            let respData = await getWalletSettings();
            if(respData.success){
                setGas(respData.result.gas);
                setCustomRPC(respData.result.customRPC);
            }
        } catch (error) {
            console.error("Error getting wallet settings:", error);
        }
    }

    useEffect(() => {
        getWalletSettingsData();
    }, []);

    const handleSaveChanges = async () => {
        try {
            let respData = await setWalletSettings({gas: gas, customRPC: customRPC});
            if(respData.success){
                toastAlert("success", "Changes saved successfully");
            }
        } catch (error) {
            console.error("Error saving changes:", error);
        }
    }
  return (
    <>
        <h1 className="text-2xl font-bold mb-8">Wallet Settings</h1>
        <div className="space-y-6 rounded-lg border bg-[#131212] p-8">
            <div className="flex items-center space-x-3">
                <Image
                  src="/images/gas_icon.png"
                  alt="Icon"
                  width={40}
                  height={40}
                />
                <span className="text-lg font-semibold">
                  Pay your own gas
                </span>
              </div>
              <div className="flex items-center justify-between">
                <label
                  className="Label"
                  htmlFor="airplane-mode"
                  style={{ paddingRight: 15 }}
                >
                  Use a custom RPC (must own $MATIC in your connected
                  wallet)
                </label>
                <Switch.Root 
                    className="SwitchRoot" 
                    id="airplane-mode"
                    checked={customRPC}
                    onCheckedChange={handleCustomRPCChange} 
                >
                  <Switch.Thumb className="SwitchThumb" />
                </Switch.Root>
              </div>
              <RadioGroup.Root
                className="RadioGroupRoot"
                defaultValue="default"
                aria-label="View density"
                value={gas}
                onValueChange={handleGasChange}
              >
                <div className="flex items-center justify-between">
                  <label className="Label" htmlFor="r1">
                    Low gas
                  </label>
                  <RadioGroup.Item
                    className="RadioGroupItem"
                    value="low"
                    id="r1"
                    checked={gas === "low"}
                  >
                    <RadioGroup.Indicator className="RadioGroupIndicator" />
                  </RadioGroup.Item>
                </div>
                <div className="flex items-center justify-between">
                  <label className="Label" htmlFor="r2">
                    Medium gas
                  </label>
                  <RadioGroup.Item
                    className="RadioGroupItem"
                    value="medium"
                    id="r2"
                    checked={gas === "medium"}
                  >
                    <RadioGroup.Indicator className="RadioGroupIndicator" />
                  </RadioGroup.Item>
                </div>
                <div className="flex items-center justify-between">
                  <label className="Label" htmlFor="r3">
                    High gas
                  </label>
                  <RadioGroup.Item
                    className="RadioGroupItem"
                    value="high"
                    id="r3"
                    checked={gas === "high"}
                  >
                    <RadioGroup.Indicator className="RadioGroupIndicator" />
                  </RadioGroup.Item>
                </div>
              </RadioGroup.Root>
              <div className="text-center">
                <Button
                  type="submit"
                  className="border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300"
                  onClick={handleSaveChanges}
                >
                  Save Changes
                </Button>
            </div>
        </div>
    </>
  );
}