"use client";

import { useState, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, Timer, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomSlider } from "@/components/ui/custom-slider";
import { PlayerCard } from "@/components/player-card";
import { CustomRadioGroup, CustomRadioGroupItem } from "@/components/ui/custom-radio-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function BinauralBeatExperience() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const duration = 1800; // 30 minutes in seconds
  const [isMuted, setIsMuted] = useState(false);

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <PlayerCard>
      <div className="p-8 space-y-8">
        {/* Main Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play/Pause Button */}
            <Button 
              size="lg"
              variant="ghost"
              className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 hover:scale-105 transition-all"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? 
                <Pause className="h-6 w-6 text-white" /> : 
                <Play className="h-6 w-6 text-white ml-1" />
              }
            </Button>

            {/* Time Display */}
            <div className="text-sm font-medium text-gray-400">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Volume */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:scale-105 transition-all"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? 
                    <VolumeX className="h-5 w-5 text-gray-400" /> :
                    <Volume2 className="h-5 w-5 text-gray-400" />
                  }
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isMuted ? "Unmute" : "Mute"}
              </TooltipContent>
            </Tooltip>

            {/* Timer */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:scale-105 transition-all"
                >
                  <Timer className="h-5 w-5 text-gray-400" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Set Duration</SheetTitle>
                  <SheetDescription>
                    Choose how long you want to focus
                  </SheetDescription>
                </SheetHeader>
                {/* Timer Settings Here */}
              </SheetContent>
            </Sheet>

            {/* Settings */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:scale-105 transition-all"
                >
                  <Settings2 className="h-5 w-5 text-gray-400" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Sound Settings</SheetTitle>
                  <SheetDescription>
                    Customize your sound experience
                  </SheetDescription>
                </SheetHeader>
                {/* Volume & Frequency Controls Here */}
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Progress Bar */}
        <CustomSlider
          value={[currentTime]}
          max={duration}
          step={1}
          onValueChange={([value]) => setCurrentTime(value)}
          className="my-4"
        />

        {/* Audio Mode Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-400">Sound Type</h3>
          <CustomRadioGroup defaultValue="binaural" className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <CustomRadioGroupItem value="binaural" className="cursor-pointer">
              <div className="ml-2">
                <div className="font-semibold text-sm">Binaural Beats</div>
                <div className="text-xs text-gray-400">For deep focus</div>
              </div>
            </CustomRadioGroupItem>
            <CustomRadioGroupItem value="noise" className="cursor-pointer">
              <div className="ml-2">
                <div className="font-semibold text-sm">White Noise</div>
                <div className="text-xs text-gray-400">For concentration</div>
              </div>
            </CustomRadioGroupItem>
            <CustomRadioGroupItem value="ambient" className="cursor-pointer">
              <div className="ml-2">
                <div className="font-semibold text-sm">Ambient</div>
                <div className="text-xs text-gray-400">For relaxation</div>
              </div>
            </CustomRadioGroupItem>
          </CustomRadioGroup>
        </div>
      </div>
    </PlayerCard>
  );
}