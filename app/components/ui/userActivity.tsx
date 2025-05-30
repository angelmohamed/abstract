import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/app/components/ui/avatar";

export function Transition(): React.ReactElement {
  return (
    <div className="w-[400px] pl-0 pt-0 pb-6 bg-[#161616] rounded-md flex items-start space-x-3">
      {/* Avatar and username */}
      <div className="flex items-start">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex flex-col justify-between w-full">
        {/* Username and Yes count */}
        <div className="flex items-center space-x-2">
          <p className="text-sm font-semibold text-white">Angel Mo</p>
          <p className="text-xs text-[#27ae60]">• 274136 Yes</p>
                  {/* Date */}
          <div className="text-sm font-semibold">
            <p className="text-xs text-[#757575]">12/01/2025</p>
          </div>
        </div>

        {/* Comment text */}
        <div className="mt-1">
          <p className="text-xs text-white">Hi its a yes its a yes</p>
        </div>

      </div>
    </div>
  );
}
