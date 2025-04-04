import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Download, Play, Pause, Plus, Trash2, Move, Type, Image as ImageIcon } from "lucide-react";

interface AnimationFrame {
  id: string;
  elements: AnimationElement[];
}

interface AnimationElement {
  id: string;
  type: "text" | "image";
  content?: string;
  src?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  animation?: Animation;
}

interface Animation {
  type: "fade" | "slide" | "bounce" | "rotate" | "scale";
  duration: number;
  delay: number;
}

const TEXT_ANIMATIONS = [
  { label: "None", value: "none" },
  { label: "Fade In", value: "fade" },
  { label: "Slide In", value: "slide" },
  { label: "Bounce", value: "bounce" },
  { label: "Rotate", value: "rotate" },
  { label: "Scale", value: "scale" },
];

const AnimationEditor: React.FC<{
  onSave: (gifUrl: string) => void;
  onCancel: () => void;
}> = ({ onSave, onCancel }) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [frames, setFrames] = useState<AnimationFrame[]>([
    {
      id: "frame-1",
      elements: [],
    },
  ]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [fps, setFps] = useState(12);
  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<"select" | "text" | "image">("select");
  // Add cache for loaded images to improve performance
  const [imageCache, setImageCache] = useState<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        setCtx(context);
      }
    }
  }, []);

  // Animation frame handler with improved timing
  useEffect(() => {
    if (!ctx || !canvasRef.current) return;

    let animationFrameId: number;
    let frameIndex = currentFrame;
    let lastFrameTime = 0;
    const frameDuration = 1000 / fps;

    const renderAnimation = (timestamp: number) => {
      if (!isPlaying) return;
      
      if (!lastFrameTime || timestamp - lastFrameTime >= frameDuration) {
        ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        
        // Draw the current frame with animations
        const frame = frames[frameIndex];
        drawFrameWithAnimations(frame, timestamp);
        
        frameIndex = (frameIndex + 1) % frames.length;
        if (frameIndex === 0 && frames.length > 1) {
          // Loop completed
          console.log("Animation loop completed");
        }
        
        setCurrentFrame(frameIndex);
        lastFrameTime = timestamp;
      }
      
      animationFrameId = requestAnimationFrame(renderAnimation);
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      drawFrame(frames[currentFrame]);
    };

    if (isPlaying) {
      lastFrameTime = 0;
      animationFrameId = requestAnimationFrame(renderAnimation);
    } else {
      drawStatic();
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, currentFrame, frames, fps, ctx]);

  // When frames or currentFrame changes, redraw static content
  useEffect(() => {
    if (!isPlaying && ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      drawFrame(frames[currentFrame]);
    }
  }, [frames, currentFrame, ctx, isPlaying]);

  const drawFrameWithAnimations = (frame: AnimationFrame, timestamp: number) => {
    if (!ctx || !canvasRef.current) return;

    frame.elements.forEach((element) => {
      // Apply animations
      let x = element.x;
      let y = element.y;
      let opacity = 1;
      let scale = 1;
      let rotation = element.rotation;

      if (element.animation) {
        const { type, duration, delay } = element.animation;
        const animationTime = Math.max(0, timestamp - delay);
        const progress = Math.min(1, animationTime / duration);
        
        switch (type) {
          case "fade":
            opacity = progress;
            break;
          case "slide":
            x = element.x - (canvasRef.current.width * (1 - progress));
            break;
          case "bounce":
            const bounce = Math.sin(progress * Math.PI * 2) * 20 * (1 - progress);
            y = element.y - bounce;
            break;
          case "rotate":
            rotation = element.rotation + (360 * progress);
            break;
          case "scale":
            scale = progress;
            break;
        }
      }

      ctx.save();
      ctx.globalAlpha = opacity;
      
      if (element.type === "text" && element.content) {
        ctx.translate(x + element.width / 2, y + element.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(scale, scale);
        ctx.font = "20px Arial";
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(element.content, 0, 0);
      } else if (element.type === "image" && element.src) {
        let img: HTMLImageElement;
        
        // Use cached image or create a new one
        if (imageCache[element.src]) {
          img = imageCache[element.src];
          drawImageWithTransforms(ctx, img, x, y, element.width, element.height, rotation, scale);
        } else {
          img = new Image();
          img.src = element.src;
          
          if (img.complete) {
            drawImageWithTransforms(ctx, img, x, y, element.width, element.height, rotation, scale);
            // Cache the image for future use
            setImageCache(prev => ({ ...prev, [element.src!]: img }));
          } else {
            img.onload = () => {
              drawImageWithTransforms(ctx, img, x, y, element.width, element.height, rotation, scale);
              // Cache the image for future use
              setImageCache(prev => ({ ...prev, [element.src!]: img }));
            };
          }
        }
      }
      
      ctx.restore();
    });
  };

  const drawImageWithTransforms = (
    ctx: CanvasRenderingContext2D, 
    img: HTMLImageElement, 
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    rotation: number, 
    scale: number
  ) => {
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.drawImage(img, -width / 2, -height / 2, width, height);
  };

  const drawFrame = (frame: AnimationFrame) => {
    if (!ctx || !canvasRef.current) return;

    frame.elements.forEach((element) => {
      if (element.type === "text" && element.content) {
        ctx.save();
        ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
        ctx.rotate((element.rotation * Math.PI) / 180);
        ctx.font = "20px Arial";
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(element.content, 0, 0);
        ctx.restore();
      } else if (element.type === "image" && element.src) {
        let img: HTMLImageElement;
        
        // Use cached image or create a new one
        if (imageCache[element.src]) {
          img = imageCache[element.src];
          ctx.save();
          ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
          ctx.rotate((element.rotation * Math.PI) / 180);
          ctx.drawImage(img, -element.width / 2, -element.height / 2, element.width, element.height);
          ctx.restore();
        } else {
          img = new Image();
          img.src = element.src;
          
          img.onload = () => {
            // Store in cache
            setImageCache(prev => ({ ...prev, [element.src!]: img }));
            
            // Automatically resize the element to match image aspect ratio
            if (element.width === 200 && element.height === 200) {
              // Only auto-resize if it's still at the default size
              const aspectRatio = img.width / img.height;
              const newWidth = 200;
              const newHeight = newWidth / aspectRatio;
              
              // Update the element dimensions
              const updatedFrames = [...frames];
              const elementIndex = updatedFrames[currentFrame].elements.findIndex(
                (el) => el.id === element.id
              );
              
              if (elementIndex !== -1) {
                updatedFrames[currentFrame].elements[elementIndex] = {
                  ...updatedFrames[currentFrame].elements[elementIndex],
                  width: newWidth,
                  height: newHeight
                };
                
                // Debounce the state update
                setTimeout(() => {
                  setFrames(updatedFrames);
                }, 10);
              }
            }
            
            ctx.save();
            ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
            ctx.rotate((element.rotation * Math.PI) / 180);
            ctx.drawImage(img, -element.width / 2, -element.height / 2, element.width, element.height);
            ctx.restore();
          };
        }
      }
    });
  };

  const drawImage = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, element: AnimationElement) => {
    ctx.save();
    ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
    ctx.rotate((element.rotation * Math.PI) / 180);
    ctx.drawImage(img, -element.width / 2, -element.height / 2, element.width, element.height);
    ctx.restore();
  };

  const addFrame = () => {
    const newFrame: AnimationFrame = {
      id: `frame-${frames.length + 1}`,
      elements: [...frames[currentFrame].elements],
    };
    
    setFrames([...frames, newFrame]);
    setCurrentFrame(frames.length);
    
    toast({
      title: "Frame Added",
      description: `New frame ${frames.length + 1} has been added`,
    });
  };

  const deleteFrame = () => {
    if (frames.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one frame",
      });
      return;
    }
    
    const newFrames = frames.filter((_, index) => index !== currentFrame);
    setFrames(newFrames);
    setCurrentFrame(Math.max(0, currentFrame - 1));
    
    toast({
      title: "Frame Deleted",
      description: `Frame ${currentFrame + 1} has been removed`,
    });
  };

  const addElement = (type: "text" | "image") => {
    const newElement: AnimationElement = {
      id: `element-${Date.now()}`,
      type,
      content: type === "text" ? "Your Text Here" : undefined,
      src: type === "image" ? "https://placehold.co/200/e2e8f0/1e40af" : undefined,
      x: 100,
      y: 100,
      width: type === "text" ? 200 : 200,
      height: type === "text" ? 40 : 200,
      rotation: 0,
    };
    
    const updatedFrames = [...frames];
    updatedFrames[currentFrame] = {
      ...updatedFrames[currentFrame],
      elements: [...updatedFrames[currentFrame].elements, newElement],
    };
    
    setFrames(updatedFrames);
    setSelectedElement(newElement.id);
    
    toast({
      title: "Element Added",
      description: `New ${type} element has been added to frame ${currentFrame + 1}`,
    });
  };

  const deleteElement = () => {
    if (!selectedElement) return;
    
    const updatedFrames = [...frames];
    updatedFrames[currentFrame] = {
      ...updatedFrames[currentFrame],
      elements: updatedFrames[currentFrame].elements.filter(
        (element) => element.id !== selectedElement
      ),
    };
    
    setFrames(updatedFrames);
    setSelectedElement(null);
    
    toast({
      title: "Element Deleted",
      description: `Element has been removed from frame ${currentFrame + 1}`,
    });
  };

  const updateSelectedElement = (properties: Partial<AnimationElement>) => {
    if (!selectedElement) return;
    
    const updatedFrames = [...frames];
    const elementIndex = updatedFrames[currentFrame].elements.findIndex(
      (element) => element.id === selectedElement
    );
    
    if (elementIndex !== -1) {
      updatedFrames[currentFrame].elements[elementIndex] = {
        ...updatedFrames[currentFrame].elements[elementIndex],
        ...properties,
      };
      
      setFrames(updatedFrames);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== "select" || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const elements = frames[currentFrame].elements;
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if (
        x >= element.x &&
        x <= element.x + element.width &&
        y >= element.y &&
        y <= element.y + element.height
      ) {
        setSelectedElement(element.id);
        setIsDragging(true);
        setDragOffset({
          x: x - element.x,
          y: y - element.y,
        });
        break;
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedElement || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    updateSelectedElement({
      x: x - dragOffset.x,
      y: y - dragOffset.y,
    });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const generateGif = () => {
    setIsRecording(true);
    
    // Force play the animation to see what will be captured
    setIsPlaying(true);
    
    toast({
      title: "Generating GIF",
      description: "Please wait while your animation is being converted to a GIF...",
    });
    
    // In a real implementation, we would capture frames and create an actual GIF
    // For this example, we'll simulate the process with a timeout
    setTimeout(() => {
      // Stop playing after recording
      setIsPlaying(false);
      
      // Generate a simple animated GIF
      const simulatedGifUrl = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
      
      onSave(simulatedGifUrl);
      setIsRecording(false);
      
      toast({
        title: "GIF Created",
        description: "Your animated GIF has been created successfully!",
      });
    }, 3000);
  };

  const getSelectedElement = () => {
    if (!selectedElement) return null;
    
    return frames[currentFrame].elements.find(
      (element) => element.id === selectedElement
    );
  };

  const selectedElementData = getSelectedElement();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold">Animation Editor</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled={isRecording} onClick={generateGif}>
            <Download className="mr-2 h-4 w-4" />
            {isRecording ? "Processing..." : "Export as GIF"}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-200px)]">
        <div className="col-span-2 border rounded-lg p-3">
          <div className="mb-4">
            <h3 className="font-medium mb-2">Tools</h3>
            <div className="flex flex-col gap-2">
              <Button
                variant={tool === "select" ? "default" : "outline"}
                size="sm"
                className="justify-start"
                onClick={() => setTool("select")}
              >
                <Move className="h-4 w-4 mr-2" />
                Select
              </Button>
              
              <Button
                variant={tool === "text" ? "default" : "outline"}
                size="sm"
                className="justify-start"
                onClick={() => {
                  setTool("text");
                  addElement("text");
                }}
              >
                <Type className="h-4 w-4 mr-2" />
                Text
              </Button>
              
              <Button
                variant={tool === "image" ? "default" : "outline"}
                size="sm"
                className="justify-start"
                onClick={() => {
                  setTool("image");
                  addElement("image");
                }}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Image
              </Button>
            </div>
          </div>
          
          {selectedElementData && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Animation</h3>
              <div className="space-y-2">
                <Select
                  value={selectedElementData?.animation?.type || "none"}
                  onValueChange={(value) => {
                    if (value === "none") {
                      updateSelectedElement({ animation: undefined });
                    } else {
                      updateSelectedElement({
                        animation: {
                          type: value as "fade" | "slide" | "bounce" | "rotate" | "scale",
                          duration: selectedElementData?.animation?.duration || 1000,
                          delay: selectedElementData?.animation?.delay || 0,
                        },
                      });
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select animation" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEXT_ANIMATIONS.map((animation) => (
                      <SelectItem key={animation.value} value={animation.value}>
                        {animation.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedElementData?.animation && (
                  <>
                    <div>
                      <span className="text-xs text-muted-foreground">Duration: {selectedElementData.animation.duration}ms</span>
                      <Slider
                        value={[selectedElementData.animation.duration]}
                        min={100}
                        max={3000}
                        step={100}
                        onValueChange={(value) => {
                          updateSelectedElement({
                            animation: {
                              ...selectedElementData.animation!,
                              duration: value[0],
                            },
                          });
                        }}
                      />
                    </div>
                    
                    <div>
                      <span className="text-xs text-muted-foreground">Delay: {selectedElementData.animation.delay}ms</span>
                      <Slider
                        value={[selectedElementData.animation.delay]}
                        min={0}
                        max={2000}
                        step={100}
                        onValueChange={(value) => {
                          updateSelectedElement({
                            animation: {
                              ...selectedElementData.animation!,
                              delay: value[0],
                            },
                          });
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="col-span-7 border rounded-lg p-4 flex flex-col">
          <div 
            className="bg-white flex-1 flex items-center justify-center overflow-hidden"
            style={{ position: "relative" }}
          >
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="border shadow"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            />
          </div>
          
          <div className="mt-4 border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={isRecording}
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                
                <span className="text-sm">
                  Frame: {currentFrame + 1} / {frames.length}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm">FPS:</span>
                <Select
                  value={fps.toString()}
                  onValueChange={(value) => setFps(Number(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={addFrame}
                  disabled={isRecording}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Frame
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deleteFrame}
                  disabled={isRecording || frames.length <= 1}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete Frame
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2">
              {frames.map((frame, index) => (
                <Card
                  key={frame.id}
                  className={`w-16 h-12 p-1 cursor-pointer flex-shrink-0 transition-all ${
                    currentFrame === index
                      ? "ring-2 ring-primary"
                      : "hover:bg-accent"
                  }`}
                  onClick={() => {
                    if (!isPlaying) {
                      setCurrentFrame(index);
                    }
                  }}
                >
                  <div className="text-xs text-center">{index + 1}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
        
        <div className="col-span-3 border rounded-lg p-3">
          <Tabs defaultValue="properties">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="properties" className="flex-1">Properties</TabsTrigger>
              <TabsTrigger value="styles" className="flex-1">Styles</TabsTrigger>
            </TabsList>
            
            <TabsContent value="properties" className="space-y-4">
              {selectedElementData ? (
                <>
                  <div>
                    <h3 className="font-medium mb-2">Element Properties</h3>
                    
                    {selectedElementData.type === "text" && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium block mb-1">Text Content</label>
                          <Textarea
                            value={selectedElementData.content || ""}
                            onChange={(e) => updateSelectedElement({ content: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                    
                    {selectedElementData.type === "image" && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium block mb-1">Image URL</label>
                          <Input
                            value={selectedElementData.src || ""}
                            onChange={(e) => {
                              // When image URL changes, remove from cache to force reload
                              if (selectedElementData.src && imageCache[selectedElementData.src]) {
                                setImageCache(prev => {
                                  const newCache = {...prev};
                                  delete newCache[selectedElementData.src!];
                                  return newCache;
                                });
                              }
                              updateSelectedElement({ src: e.target.value });
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div>
                        <label className="text-xs font-medium block mb-1">Position X</label>
                        <Input
                          type="number"
                          value={selectedElementData.x}
                          onChange={(e) => updateSelectedElement({ x: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium block mb-1">Position Y</label>
                        <Input
                          type="number"
                          value={selectedElementData.y}
                          onChange={(e) => updateSelectedElement({ y: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div>
                        <label className="text-xs font-medium block mb-1">Width</label>
                        <Input
                          type="number"
                          value={selectedElementData.width}
                          onChange={(e) => updateSelectedElement({ width: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium block mb-1">Height</label>
                        <Input
                          type="number"
                          value={selectedElementData.height}
                          onChange={(e) => updateSelectedElement({ height: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="text-xs font-medium block mb-1">Rotation</label>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[selectedElementData.rotation]}
                          min={0}
                          max={360}
                          step={1}
                          onValueChange={(value) => updateSelectedElement({ rotation: value[0] })}
                          className="flex-1"
                        />
                        <div className="w-12 text-center">{selectedElementData.rotation}°</div>
                      </div>
                    </div>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      className="mt-4 w-full"
                      onClick={deleteElement}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete Element
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                  <p className="mb-2">No element selected</p>
                  <p className="text-sm">Click an element on the canvas to edit its properties</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="styles" className="space-y-4">
              {selectedElementData ? (
                <>
                  <h3 className="font-medium mb-2">Style Options</h3>
                  <p className="text-sm text-muted-foreground">
                    Style options coming soon in the next update!
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                  <p className="mb-2">No element selected</p>
                  <p className="text-sm">Click an element on the canvas to edit its styles</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AnimationEditor;
