import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { TemplateElement } from "@/types";
import { Trash2, Play, Pause, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";

// Animation presets
const ANIMATION_PRESETS = [
  { name: "None", value: "" },
  { name: "Fade In", value: "fadeIn" },
  { name: "Fade Out", value: "fadeOut" },
  { name: "Slide In From Left", value: "slideInLeft" },
  { name: "Slide In From Right", value: "slideInRight" },
  { name: "Slide In From Top", value: "slideInTop" },
  { name: "Slide In From Bottom", value: "slideInBottom" },
  { name: "Bounce", value: "bounce" },
  { name: "Pulse", value: "pulse" },
  { name: "Rotate", value: "rotate" },
  { name: "Flip X", value: "flipX" },
  { name: "Flip Y", value: "flipY" },
  { name: "Shake", value: "shake" },
];

interface TemplateElementEditorProps {
  element: TemplateElement;
  onUpdate: (updatedElement: TemplateElement) => void;
  onDelete?: () => void;
}

const TemplateElementEditor: React.FC<TemplateElementEditorProps> = ({ 
  element, 
  onUpdate,
  onDelete
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Handle resize start/end
  const handleResizeStart = () => setIsResizing(true);
  const handleResizeEnd = () => setIsResizing(false);

  const updateElementContent = (content: string) => {
    onUpdate({
      ...element,
      content
    });
  };

  const updateElementImage = (src: string) => {
    onUpdate({
      ...element,
      src
    });
  };

  const updateElementLink = (link: string) => {
    onUpdate({
      ...element,
      link
    });
  };
  
  const updateElementSize = (width?: number, height?: number) => {
    onUpdate({
      ...element,
      width: width !== undefined ? width : element.width,
      height: height !== undefined ? height : element.height
    });
  };

  const updateElementAnimation = (animation: Partial<TemplateElement['animation']>) => {
    onUpdate({
      ...element,
      animation: {
        preset: element.animation?.preset || "",
        duration: element.animation?.duration || 1,
        delay: element.animation?.delay || 0,
        repeat: element.animation?.repeat || 0,
        easing: element.animation?.easing || "easeOut",
        ...animation
      }
    });
  };

  // Helper function to get animation properties
  const getAnimationProps = () => {
    if (!element.animation || !element.animation.preset) return {};
    
    const preset = element.animation.preset;
    let animationProps: any = {};
    
    switch (preset) {
      case "fadeIn":
        animationProps = { opacity: [0, 1] };
        break;
      case "fadeOut":
        animationProps = { opacity: [1, 0] };
        break;
      case "slideInLeft":
        animationProps = { x: ["-100%", "0%"] };
        break;
      case "slideInRight":
        animationProps = { x: ["100%", "0%"] };
        break;
      case "slideInTop":
        animationProps = { y: ["-100%", "0%"] };
        break;
      case "slideInBottom":
        animationProps = { y: ["100%", "0%"] };
        break;
      case "bounce":
        animationProps = { y: ["0%", "-20%", "0%"], transition: { times: [0, 0.5, 1] } };
        break;
      case "pulse":
        animationProps = { scale: [1, 1.1, 1], transition: { times: [0, 0.5, 1] } };
        break;
      case "rotate":
        animationProps = { rotate: [0, 360] };
        break;
      case "flipX":
        animationProps = { rotateX: [0, 180, 360] };
        break;
      case "flipY":
        animationProps = { rotateY: [0, 180, 360] };
        break;
      case "shake":
        animationProps = { x: [0, -10, 10, -10, 10, 0], transition: { times: [0, 0.2, 0.4, 0.6, 0.8, 1] } };
        break;
      default:
        break;
    }
    
    return animationProps;
  };

  // Handle specific element types
  const renderElementEditor = () => {
    switch (element.type) {
      case "text":
        return (
          <div className="w-full">
            <Textarea 
              value={element.content || ""}
              onChange={(e) => updateElementContent(e.target.value)}
              placeholder="Enter text here..."
              className={`min-h-[100px] w-full transition-all ${isResizing ? 'pointer-events-none' : ''}`}
            />
          </div>
        );
        
      case "image":
        return (
          <div className="flex flex-col items-center gap-4 w-full">
            <div 
              className="relative border rounded overflow-hidden"
              style={{ 
                width: element.width || 600,
                maxWidth: '100%'
              }}
            >
              {element.animation && element.animation.preset ? (
                <motion.div
                  initial="initial"
                  animate={isPlaying ? "animate" : "initial"}
                  variants={{
                    initial: {},
                    animate: {
                      ...getAnimationProps(),
                      transition: {
                        duration: element.animation.duration,
                        delay: element.animation.delay,
                        repeat: element.animation.repeat,
                        ease: element.animation.easing as any,
                      }
                    }
                  }}
                  style={{ width: '100%', height: '100%' }}
                >
                  <img 
                    src={element.src} 
                    alt="Template" 
                    className="max-w-full h-auto"
                    style={{ 
                      width: '100%',
                      height: element.height ? `${element.height}px` : 'auto'
                    }}
                  />
                </motion.div>
              ) : (
                <img 
                  src={element.src} 
                  alt="Template" 
                  className="max-w-full h-auto"
                  style={{ 
                    width: '100%',
                    height: element.height ? `${element.height}px` : 'auto'
                  }}
                />
              )}
              
              <div className="flex gap-2 mt-2">
                <div className="flex gap-1 items-center">
                  <span className="text-xs">W:</span>
                  <Input 
                    type="number" 
                    value={element.width || 600}
                    onChange={(e) => updateElementSize(Number(e.target.value), element.height)}
                    className="w-20 h-8 text-xs"
                  />
                </div>
                <div className="flex gap-1 items-center">
                  <span className="text-xs">H:</span>
                  <Input 
                    type="number" 
                    value={element.height || 'auto'}
                    onChange={(e) => updateElementSize(element.width, Number(e.target.value))}
                    className="w-20 h-8 text-xs"
                  />
                </div>
              </div>
            </div>
            
            <Input 
              value={element.src || ""}
              onChange={(e) => updateElementImage(e.target.value)}
              placeholder="Image URL"
              className="max-w-sm"
            />
          </div>
        );
        
      case "button":
        return (
          <div className="flex flex-col items-center gap-4 w-full">
            {element.animation && element.animation.preset ? (
              <motion.div
                initial="initial"
                animate={isPlaying ? "animate" : "initial"}
                variants={{
                  initial: {},
                  animate: {
                    ...getAnimationProps(),
                    transition: {
                      duration: element.animation.duration,
                      delay: element.animation.delay,
                      repeat: element.animation.repeat,
                      ease: element.animation.easing as any,
                    }
                  }
                }}
              >
                <Button className="pointer-events-none">
                  {element.content || "Click Here"}
                </Button>
              </motion.div>
            ) : (
              <Button className="pointer-events-none">
                {element.content || "Click Here"}
              </Button>
            )}
            
            <div className="flex gap-2 w-full max-w-md">
              <Input 
                value={element.content || ""}
                onChange={(e) => updateElementContent(e.target.value)}
                placeholder="Button Text"
              />
              <Input 
                value={element.link || ""}
                onChange={(e) => updateElementLink(e.target.value)}
                placeholder="Link URL"
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Render animation controls
  const renderAnimationControls = () => {
    if (element.type !== "text" && element.type !== "image" && element.type !== "button") {
      return null;
    }

    return (
      <div className="mt-4 border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium flex items-center">
            <Sparkles className="h-4 w-4 mr-1" />
            Animation
          </h3>
          
          {element.animation && element.animation.preset && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-7 px-2"
            >
              {isPlaying ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
              {isPlaying ? "Stop" : "Preview"}
            </Button>
          )}
        </div>
        
        <div className="grid gap-2">
          <Select 
            value={element.animation?.preset || ""}
            onValueChange={(value) => updateElementAnimation({ preset: value })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select animation" />
            </SelectTrigger>
            <SelectContent>
              {ANIMATION_PRESETS.map(preset => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {element.animation && element.animation.preset && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Duration</label>
                  <div className="flex items-center gap-2">
                    <Slider 
                      value={[element.animation.duration]} 
                      min={0.1} 
                      max={5} 
                      step={0.1}
                      onValueChange={(value) => updateElementAnimation({ duration: value[0] })}
                      className="flex-1"
                    />
                    <span className="text-xs w-8">{element.animation.duration.toFixed(1)}s</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-muted-foreground">Delay</label>
                  <div className="flex items-center gap-2">
                    <Slider 
                      value={[element.animation.delay]} 
                      min={0} 
                      max={3} 
                      step={0.1}
                      onValueChange={(value) => updateElementAnimation({ delay: value[0] })}
                      className="flex-1"
                    />
                    <span className="text-xs w-8">{element.animation.delay.toFixed(1)}s</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Repeat</label>
                  <div className="flex items-center gap-2">
                    <Slider 
                      value={[element.animation.repeat]} 
                      min={0} 
                      max={10} 
                      step={1}
                      onValueChange={(value) => updateElementAnimation({ repeat: value[0] })}
                      className="flex-1"
                    />
                    <span className="text-xs w-8">{element.animation.repeat}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-muted-foreground">Easing</label>
                  <Select 
                    value={element.animation.easing}
                    onValueChange={(value) => updateElementAnimation({ easing: value })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">Linear</SelectItem>
                      <SelectItem value="easeIn">Ease In</SelectItem>
                      <SelectItem value="easeOut">Ease Out</SelectItem>
                      <SelectItem value="easeInOut">Ease In Out</SelectItem>
                      <SelectItem value="circIn">Circular In</SelectItem>
                      <SelectItem value="circOut">Circular Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <ResizablePanelGroup 
      direction={element.type === "image" ? "vertical" : "horizontal"}
      onLayout={handleResizeEnd}
      className="border border-dashed rounded-lg hover:border-primary transition-all"
    >
      <ResizablePanel defaultSize={100}>
        <div className="p-3 relative">
          {onDelete && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 h-8 w-8 opacity-50 hover:opacity-100"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          {renderElementEditor()}
          {renderAnimationControls()}
        </div>
      </ResizablePanel>
      
      {element.type === "image" && (
        <>
          <ResizableHandle withHandle onDrag={handleResizeStart} />
          <ResizablePanel defaultSize={20}>
            <div className="p-3 text-center text-xs text-muted-foreground">
              Resize image height by dragging this handle
            </div>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
};

export default TemplateElementEditor;
