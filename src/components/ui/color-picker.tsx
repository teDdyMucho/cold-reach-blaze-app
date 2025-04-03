import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, className }) => {
  const [localColor, setLocalColor] = useState(color);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalColor(e.target.value);
  };

  const handleBlur = () => {
    onChange(localColor);
  };

  const predefinedColors = [
    "#FFFFFF", // White
    "#000000", // Black
    "#F87171", // Red
    "#FB923C", // Orange
    "#FBBF24", // Amber
    "#A3E635", // Lime
    "#34D399", // Emerald
    "#22D3EE", // Cyan
    "#60A5FA", // Blue
    "#A78BFA", // Violet
    "#F472B6", // Pink
    "#6B7280", // Gray
  ];

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-10 h-10 p-0 border-2"
            style={{ backgroundColor: localColor }}
          />
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-2">
            <div className="grid grid-cols-6 gap-2">
              {predefinedColors.map((presetColor) => (
                <Button
                  key={presetColor}
                  variant="outline"
                  className="w-8 h-8 p-0 border-2"
                  style={{ backgroundColor: presetColor }}
                  onClick={() => {
                    setLocalColor(presetColor);
                    onChange(presetColor);
                  }}
                />
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 border-2 rounded"
                style={{ backgroundColor: localColor }}
              />
              <Input
                type="text"
                value={localColor}
                onChange={handleColorChange}
                onBlur={handleBlur}
                className="flex-1"
              />
            </div>
            <Input
              type="color"
              value={localColor}
              onChange={(e) => {
                setLocalColor(e.target.value);
                onChange(e.target.value);
              }}
              className="w-full h-8"
            />
          </div>
        </PopoverContent>
      </Popover>
      <Input
        type="text"
        value={localColor}
        onChange={handleColorChange}
        onBlur={handleBlur}
        className="w-28"
      />
    </div>
  );
};
