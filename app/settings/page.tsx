"use client";
import { useEffect, useState, useRef } from "react";
// import { useActiveAccount } from "thirdweb/react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/components/ui/avatar";
import { Label } from "@/app/components/ui/label";
import Header from "@/app/Header";
// import { Nav as NavigationComponent } from "@/app/components/ui/navigation-menu";
// import { navigationItems } from "@/constants";
import imageCompression from "browser-image-compression";
import { supabase } from "@/utils/supabaseClient";
import { Plus, Check } from "lucide-react";
import { Tabs, Switch, Separator, Checkbox, RadioGroup } from "radix-ui";
import Image from "next/image";
import { CheckIcon } from "@radix-ui/react-icons";
import { getUserData, updateUserData } from "@/services/user";
import { isEmpty } from "@/lib/isEmpty";
import { useDispatch } from "react-redux";
import NotificationSettings from "./NotificationSettings";
import WalletSettings from "./WalletSettings";
import ProfileSettings from "./ProfileSettings";
import { Footer } from "../components/customComponents/Footer";

// Helper function to upload image to Supabase storage
const uploadToStorage = async (file: File): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export default function ProfilePage() {

  // Add notification settings handlers
  const handleNotificationToggle = async (type: string, enabled: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          [`${type}_notifications`]: enabled
        });

      if (error) throw error;
    } catch (error) {
      console.error(`Error updating ${type} notifications:`, error);
      alert(`Failed to update ${type} notification settings`);
    }
  };

  
  // Add wallet settings handlers
  const handleGasPreferenceChange = async (preference: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          gas_preference: preference
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating gas preference:', error);
      alert('Failed to update gas preference');
    }
  };

  return (
    <div className="text-white bg-black h-auto items-center justify-items-center font-[family-name:var(--font-geist-sans)] p-0 m-0">
      <div className="sticky top-0 z-50 w-[100%] backdrop-blur-md">
        <Header />
      </div>

      <div className="container mx-auto py-10 px-4 container-sm">
        <Tabs.Root defaultValue="tab1" orientation="vertical">
          <div className="flex justify-center mb-0 w-full lg:flex-row flex-col">
            <div className="w-full pl-0 pr-0 lg:w-[20%] relative">
              <Tabs.List
                aria-label="tabs example"
                className="flex lg:flex-col flex-row lg:items-start items-center custom_tab justify-center mb-4 lg:mb-0"
              >
                <Tabs.Trigger value="tab1">Profile</Tabs.Trigger>
                <Tabs.Trigger value="tab2">Notifications</Tabs.Trigger>
                <Tabs.Trigger value="tab3">Wallet</Tabs.Trigger>
              </Tabs.List>
            </div>
            <div className="w-full pl-0 lg:pl-10 pr-0 lg:w-[80%]">
              <Tabs.Content value="tab1">
                <ProfileSettings />
              </Tabs.Content>

              <Tabs.Content value="tab2">
                <NotificationSettings />
              </Tabs.Content>
              <Tabs.Content value="tab3">
                <WalletSettings />
              </Tabs.Content>
            </div>
          </div>
        </Tabs.Root>
      </div>
      <Footer/>
    </div>
  );
}
