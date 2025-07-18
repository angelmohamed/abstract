import { Loader } from "lucide-react";

export default function Loading () {
  return (
    <div className="flex justify-center items-center h-screen">
        <Loader className="w-6 h-6 animate-spin" />
    </div>
  )
}