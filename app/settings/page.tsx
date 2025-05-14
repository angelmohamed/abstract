"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useActiveAccount } from "thirdweb/react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/app/components/ui/avatar";
import { Label } from "@/app/components/ui/label";
import Header from "@/app/Header";
import { Nav as NavigationComponent } from "@/app/components/ui/navigation-menu";
import { navigationItems } from "@/app/components/constants";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";
import { supabase } from "@/utils/supabaseClient";
import { Plus, Check } from 'lucide-react';

// helper to load image for cropping
async function createImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
}

export default function ProfilePage() {
  const router = useRouter();
  const account = useActiveAccount();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCrop, setShowCrop] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const inputFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!account) {
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/profile?wallet=${account.address}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched profile data:', data);
          setUsername(data.username || "");
          setName(data.name || "");
          setAvatarUrl(data.avatar_url || "");
          setBio(data.bio || "");
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [account]);

  const validateUsername = (value) => {
    if (!value.trim()) {
      setUsernameError("Username cannot be empty");
      return false;
    }

    if (value.includes(" ")) {
      setUsernameError("Username cannot contain spaces");
      return false;
    }

    const alphanumericRegex = /^[a-zA-Z0-9_]+$/;
    if (!alphanumericRegex.test(value)) {
      setUsernameError("Username can only contain letters, numbers, and underscores");
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

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImageBlob = useCallback(async () => {
    if (!selectedFile || !croppedAreaPixels) return null;
    const image = await createImage(URL.createObjectURL(selectedFile));
    const canvas = document.createElement("canvas");
    const { width, height, x, y } = croppedAreaPixels;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
    return new Promise<Blob | null>((resolve) =>
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9)
    );
  }, [selectedFile, croppedAreaPixels]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = [
      "image/png",
      "image/jpg",
      "image/jpeg",
      "image/heic",
      "image/heif",
    ];
    if (!validTypes.includes(file.type)) {
      alert("Invalid file type");
      return;
    }
    setSelectedFile(file);
    console.log('Selected file for avatar:', { file });
    setShowCrop(true);
  };

  const uploadCroppedImage = async () => {
    console.log('uploadCroppedImage called', { selectedFile, croppedAreaPixels });
    if (!selectedFile) return;
    if (!account) {
      setUploading(false);
      return;
    }
    // store previous avatar URL to delete later upon success
    const prevUrl = avatarUrl;
    setUploading(true);
    const blob = await getCroppedImageBlob();
    console.log('Cropped blob size:', blob ? blob.size : null);
    if (!blob) return;
    let finalBlob = blob;
    // Only compress if above size limit
    if (blob.size > 500 * 1024) {
      console.log('Blob exceeds 500KB, compressing...');
      finalBlob = await imageCompression(blob, { maxSizeMB: 0.5, useWebWorker: true });
      console.log('Compressed blob size:', finalBlob.size);
    }
    const fileExt = "jpg";
    const fileName = `avatars/${account.address}_${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("user-profile-avatar")
      .upload(fileName, finalBlob, { upsert: true });
    console.log('Supabase upload result:', { uploadData, uploadError });
    if (uploadError) {
      console.error(uploadError);
      alert('Upload failed');
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage
      .from("user-profile-avatar")
      .getPublicUrl(fileName);
    console.log('Public URL:', urlData?.publicUrl);
    // delete old avatar file now that new upload succeeded
    if (prevUrl) {
      try {
        const oldPath = prevUrl.split('/storage/v1/object/public/user-profile-avatar/')[1];
        if (oldPath) {
          const { error: deleteError } = await supabase.storage
            .from('user-profile-avatar')
            .remove([oldPath]);
          console.log('Deleted old avatar file:', { oldPath, deleteError });
        }
      } catch (err) {
        console.error('Error deleting previous avatar:', err);
      }
    }
    setAvatarUrl(urlData.publicUrl);
    setShowCrop(false);
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!account) {
      return;
    }

    if (!validateUsername(username)) {
      return;
    }

    try {
      setSaving(true);
      setSubmitError("");
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet: account.address,
          username,
          name,
          avatar_url: avatarUrl,
          bio,
        }),
      });

      if (response.ok) {
        setSaving(false);
        setSaved(true);
        // show Saved then navigate back
        setTimeout(() => router.back(), 1500);
      } else {
        const err = await response.json();
        setSubmitError(err.error || err.message || "Failed to save profile");
        setSaving(false);
      }
    } catch (error: any) {
      console.error("Error saving profile:", error);
      setSubmitError(error.message || "Error saving profile. Please try again later.");
      alert("Error saving profile. Please try again later.");
    } finally {
      if (!saved) setSaving(false);
    }
  };

  return (
    <div className="text-white bg-black h-auto items-center justify-items-center font-[family-name:var(--font-geist-sans)] p-0 m-0">
      <div className="sticky top-0 z-50 w-[100%] backdrop-blur-md">
        <Header />
        <NavigationComponent menuItems={navigationItems} showLiveTag={true} />
      </div>

      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Profile Settings</h1>

        {!account ? (
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
        ) : loading ? (
          <div className="text-center p-8">
            <p>Loading...</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-lg border bg-[#131212] p-8"
          >
            <div className="relative w-24 h-24 mb-6 mx-auto">
              {/* Hidden file input */}
              <input
                ref={inputFileRef}
                type="file"
                accept="image/png,image/jpg,image/jpeg,image/heic,image/heif"
                className="hidden"
                onChange={handleFileChange}
              />
              <Avatar className="w-full h-full">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={username || "User Avatar"} />
                ) : (
                  <AvatarFallback className="bg-blue-500 text-lg">
                    {username
                      ? username.charAt(0).toUpperCase()
                      : account.address.slice(0, 2)}
                  </AvatarFallback>
                )}
              </Avatar>
              {/* Floating upload button */}
              <button
                type="button"
                onClick={() => inputFileRef.current?.click()}
                className="absolute bottom-0 right-0 bg-white w-4 h-4 rounded-full shadow-md z-10 flex items-center justify-center origin-bottom-right hover:scale-110 transition-transform duration-200 ring-4 ring-[#131212]"
                style={{ transformOrigin: '100% 100%' }}
              >
                <Plus className="w-3 h-3 text-black" strokeWidth={3} />
              </button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={handleUsernameChange}
                className="bg-black border-gray-700 focus:border-blue-500"
                placeholder="Set a unique username (letters, numbers, underscore only)"
              />
              {usernameError && (
                <p className="text-red-500 text-sm mt-1">{usernameError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-black border-gray-700 focus:border-blue-500"
                placeholder="Your name (optional)"
              />
            </div>

            {showCrop && (
              <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
                <div className="relative w-80 h-80 bg-white rounded-lg overflow-hidden">
                  <Cropper
                    image={selectedFile ? URL.createObjectURL(selectedFile) : ''}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>
                <div className="mt-4 flex space-x-4">
                  <Button
                    type="button"
                    onClick={() => setShowCrop(false)}
                    className="border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={uploadCroppedImage}
                    disabled={uploading}
                    className="border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300"
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-md p-2 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Tell us about yourself... (optional)"
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={saving || !!usernameError || saved}
              className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300"
            >
              {saving
                ? "Saving..."
                : saved
                ? (<><Check className="inline w-4 h-4 text-green-500 mr-1"/>Saved</>)
                : "Save Settings"}
            </Button>
            {/* show error message if submitError */}
            {submitError && (
              <p className="text-red-500 text-sm mt-1">{submitError}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}