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
  const router = useRouter();
  const dispatch = useDispatch();

  const [username, setUsername] = useState("");
  const [isDisable, setIsDisable] = useState(false);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [updateImage, setUpdateImage] = useState(null);
  const [emailNotification, setEmailNotification] = useState(false);
  const [orderFill, setOrderFill] = useState(false)
  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { status, result } = await getUserData(dispatch);
        if (status && isMounted) {
          if (result.userName) {
            setUsername(result.userName);
            setIsDisable(true);
          }
          setName(result.name || "");
          if (result.profileImg) setAvatarUrl(result.profileImg);
          setBio(result.bio || "");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const validateUsername = (value: string): boolean => {
    if (!value.trim()) {
      setUsernameError("Username cannot be empty");
      return false;
    }

    if (value.includes(" ")) {
      setUsernameError("Username cannot contain spaces");
      return false;
    }

    if (value.length > 16) {
      setUsernameError("Username must contain at most 16 characters");
      return false;
    }

    const alphanumericRegex = /^[a-zA-Z0-9_]+$/;
    if (!alphanumericRegex.test(value)) {
      setUsernameError(
        "Username can only contain letters, numbers, and underscores"
      );
      return false;
    }

    setUsernameError("");
    return true;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    validateUsername(value);
  };

  const handleFile = e => {
    e.preventDefault();
    const { files } = e.target;
    // let formData = { ...formValue, ...{ [name]: files[0] } };
    // setFormValue(formData);
    // setError(prev => ({ ...prev, image: "" }));
    console.log("files",files[0])
    setUpdateImage(files[0]);
    setAvatarUrl(URL.createObjectURL(files[0]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateUsername(username)) {
      return;
    }

    try {
      setSaving(true);
      setSubmitError("");
      
      // Check if username is already taken (if it's changed)
      if (!isDisable) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('userName')
          .eq('userName', username)
          .single();

        if (existingUser) {
          setSubmitError("Username is already taken");
          return;
        }
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("userName", username);
      formData.append("bio", bio);
      if(updateImage!==null)formData.append("image", updateImage);
      
      const { success, message, error } = await updateUserData(formData);
      
      if (success) {
        setSaved(true);
        localStorage.setItem('userName', username);
        setTimeout(() => router.back(), 1500);
      } else {
        setSubmitError(error || "Failed to save profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Error saving profile. Please try again later."
      );
    } finally {
      if (!saved) setSaving(false);
    }
  };

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

  const handleEmailNotificationToggle = async (enabled: boolean) => {
    try {
      console.log("enabled", enabled);
      // let respData = await emailNotificationToggle({status: enabled});
      // if(respData.success){
        setEmailNotification(enabled);
      // }
    } catch (error) {
      console.error("Error updating email notification:", error);
    }
  }

  const handleOrderFillToggle = async (enabled: boolean) => {
    try {
      console.log("enabled", enabled);
      // let respData = await emailNotificationToggle({status: enabled});
      // if(respData.success){
        setOrderFill(enabled);
      // }
    } catch (error) {
      console.error("Error updating email notification:", error);
    }
  }
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
                <h1 className="text-2xl font-bold mb-8">Profile Settings</h1>

                {false ? (
                  <div className="text-center p-8 bg-[#131212] rounded-lg">
                    <p className="mb-4">
                      Please connect your wallet to set up your profile
                    </p>
                    <Button
                      onClick={() => router.push("/")}
                      className="text-white px-4 py-2 hover:bg-gray-800 transition duration-300 h-[95%] bg-blue-500"
                    >
                      Back to Home
                    </Button>
                  </div>
                ) : false ? (
                  <div className="text-center p-8">
                    <p>Loading...</p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-lg border bg-[#131212] p-8"
                  >
                    <div className="relative w-24 h-24 mb-6 mx-auto">
                      <input
                        ref={inputFileRef}
                        type="file"
                        accept="image/png,image/jpg,image/jpeg,image/heic,image/heif"
                        className="hidden"
                        onChange={handleFile}
                      />
                      <Avatar className="w-full h-full">
                        {avatarUrl ? (
                          <AvatarImage
                            src={avatarUrl}
                            alt={username || "User Avatar"}
                          />
                        ) : (
                          <AvatarFallback className="bg-blue-500 text-lg">
                            {username
                              ? username.charAt(0).toUpperCase()
                              : "--"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <button
                        type="button"
                        onClick={() => inputFileRef.current?.click()}
                        disabled={uploading}
                        className="absolute bottom-0 right-0 bg-white w-4 h-4 rounded-full shadow-md z-10 flex items-center justify-center origin-bottom-right hover:scale-110 transition-transform duration-200 ring-4 ring-[#131212]"
                        style={{ transformOrigin: "100% 100%" }}
                      >
                        {uploading ? (
                          <span className="animate-spin">⌛</span>
                        ) : (
                          <Plus className="w-3 h-3 text-black" strokeWidth={3} />
                        )}
                      </button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={handleUsernameChange}
                        className="bg-black border-[#252525]"
                        placeholder="Set a unique username (letters, numbers, underscore only)"
                        disabled={isDisable}
                      />
                      {usernameError && (
                        <p className="text-red-500 text-sm mt-1">
                          {usernameError}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-black border-[#252525]"
                        placeholder="Your name (optional)"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full bg-black border border-[#252525] rounded-md p-2 text-white"
                        placeholder="Tell us about yourself... (optional)"
                        rows={3}
                      />
                    </div>

                    <div className="text-center">
                      <Button
                        type="submit"
                        disabled={saving || !!usernameError || saved}
                        className="border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300"
                      >
                        {saving ? (
                          "Saving..."
                        ) : saved ? (
                          <>
                            <Check className="inline w-4 h-4 text-green-500 mr-1" />
                            Saved
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                    {submitError && (
                      <p className="text-red-500 text-sm mt-1">{submitError}</p>
                    )}
                  </form>
                )}
              </Tabs.Content>

              <Tabs.Content value="tab2">
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
              </Tabs.Content>
              <Tabs.Content value="tab3">
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
                    <Switch.Root className="SwitchRoot" id="airplane-mode">
                      <Switch.Thumb className="SwitchThumb" />
                    </Switch.Root>
                  </div>
                  <RadioGroup.Root
                    className="RadioGroupRoot"
                    defaultValue="default"
                    aria-label="View density"
                  >
                    <div className="flex items-center justify-between">
                      <label className="Label" htmlFor="r1">
                        Low gas
                      </label>
                      <RadioGroup.Item
                        className="RadioGroupItem"
                        value="default"
                        id="r1"
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
                        value="comfortable"
                        id="r2"
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
                        value="compact"
                        id="r3"
                      >
                        <RadioGroup.Indicator className="RadioGroupIndicator" />
                      </RadioGroup.Item>
                    </div>
                  </RadioGroup.Root>
                  <div className="text-center">
                    <Button
                      type="submit"
                      className="border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </Tabs.Content>
            </div>
          </div>
        </Tabs.Root>
      </div>
    </div>
  );
}
