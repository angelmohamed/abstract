import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { getUserData, updateUserData } from "@/services/user";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/components/ui/avatar";
import { Plus, Check } from "lucide-react";
import { Label } from "@/app/components/ui/label";

export default function ProfileSettings() {
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
    const inputFileRef = useRef(null);
    const [updateImage, setUpdateImage] = useState(null);

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

    const validateUsername = (value)  => {
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

    const handleUsernameChange = (e) => {
      const value = e.target.value;
      setUsername(value);
      validateUsername(value);
    };

    const handleSubmit = async (e) => {
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
    return (
        <>
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
                    className="bg-black border-[#252525] focus-visible:outline-none"
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
                    className="bg-black border-[#252525] focus-visible:outline-none"
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
        </>
    );
}