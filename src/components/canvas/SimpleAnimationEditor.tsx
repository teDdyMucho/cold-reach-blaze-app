import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Download, Play, Pause, Plus, Trash2, Move, Type, Image as ImageIcon, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createGIF } from "gifshot";
import html2canvas from "html2canvas";

// Animation presets
const ANIMATION_PRESETS = [
  { 
    name: "Fade In", 
    value: "fadeIn",
    preview: { opacity: [0, 1] },
    config: { duration: 1, ease: "easeOut" }
  },
  { 
    name: "Fade Out", 
    value: "fadeOut",
    preview: { opacity: [1, 0] },
    config: { duration: 1, ease: "easeIn" }
  },
  { 
    name: "Slide In From Left", 
    value: "slideInLeft",
    preview: { x: ["-100%", "0%"] },
    config: { duration: 1, ease: "easeOut" }
  },
  { 
    name: "Slide In From Right", 
    value: "slideInRight",
    preview: { x: ["100%", "0%"] },
    config: { duration: 1, ease: "easeOut" }
  },
  { 
    name: "Slide In From Top", 
    value: "slideInTop",
    preview: { y: ["-100%", "0%"] },
    config: { duration: 1, ease: "easeOut" }
  },
  { 
    name: "Slide In From Bottom", 
    value: "slideInBottom",
    preview: { y: ["100%", "0%"] },
    config: { duration: 1, ease: "easeOut" }
  },
  { 
    name: "Bounce", 
    value: "bounce",
    preview: { y: ["0%", "-20%", "0%"] },
    config: { duration: 0.8, ease: "easeInOut", times: [0, 0.5, 1], repeat: 2 }
  },
  { 
    name: "Pulse", 
    value: "pulse",
    preview: { scale: [1, 1.1, 1] },
    config: { duration: 0.8, ease: "easeInOut", times: [0, 0.5, 1], repeat: 2 }
  },
  { 
    name: "Rotate", 
    value: "rotate",
    preview: { rotate: [0, 360] },
    config: { duration: 1.5, ease: "linear" }
  },
  { 
    name: "Flip X", 
    value: "flipX",
    preview: { rotateX: [0, 180, 360] },
    config: { duration: 1.5, ease: "easeInOut" }
  },
  { 
    name: "Flip Y", 
    value: "flipY",
    preview: { rotateY: [0, 180, 360] },
    config: { duration: 1.5, ease: "easeInOut" }
  },
  { 
    name: "Shake", 
    value: "shake",
    preview: { x: [0, -10, 10, -10, 10, 0] },
    config: { duration: 0.8, ease: "easeInOut", times: [0, 0.2, 0.4, 0.6, 0.8, 1] }
  },
];

interface AnimationElement {
  id: string;
  type: "text" | "image";
  content?: string;
  src?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  animation: {
    preset: string;
    duration: number;
    delay: number;
    repeat: number;
    easing: string;
  };
}

interface SimpleAnimationEditorProps {
  onSave: (gifUrl: string) => void;
  onCancel: () => void;
}

const SimpleAnimationEditor: React.FC<SimpleAnimationEditorProps> = ({ onSave, onCancel }) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<AnimationElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draggedElement, setDraggedElement] = useState<AnimationElement | null>(null);
  const [previewTab, setPreviewTab] = useState<"edit" | "preview">("edit");
  const [gifDuration, setGifDuration] = useState(3);
  const [gifFrameRate, setGifFrameRate] = useState(10);

  // Get selected element
  const getSelectedElement = () => {
    if (!selectedElement) return null;
    return elements.find(el => el.id === selectedElement) || null;
  };

  // Add new element
  const handleAddElement = (type: "text" | "image") => {
    const newElement: AnimationElement = {
      id: `element-${Date.now()}`,
      type,
      content: type === "text" ? "Sample Text" : undefined,
      src: type === "image" ? "https://picsum.photos/300/200" : undefined,
      x: 100,
      y: 100,
      width: type === "text" ? 200 : 300,
      height: type === "text" ? 50 : 200,
      animation: {
        preset: "fadeIn",
        duration: 1,
        delay: 0,
        repeat: 0,
        easing: "easeOut"
      }
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  // Update element
  const handleUpdateElement = (id: string, updates: Partial<AnimationElement>) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  // Delete element
  const handleDeleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  // Handle element drag
  const handleDragStart = (element: AnimationElement) => {
    setDraggedElement(element);
  };

  const handleDragEnd = (e: React.DragEvent, element: AnimationElement) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      handleUpdateElement(element.id, { x, y });
    }
    setDraggedElement(null);
  };

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedElement(null);
    }
  };

  // Generate GIF
  const handleGenerateGif = () => {
    if (elements.length === 0) {
      toast({
        title: "No elements",
        description: "Please add at least one element to create an animation.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Pre-load all images before starting the capture process
    const imageElements = elements.filter(el => el.type === 'image' && el.src);
    const imagesToLoad = imageElements.length;
    let imagesLoaded = 0;
    const imageCache: Record<string, HTMLImageElement> = {};
    
    if (imagesToLoad === 0) {
      // No images to load, proceed with capture
      startCapture();
    } else {
      // Load all images first
      imageElements.forEach(element => {
        if (element.src) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          
          img.onload = () => {
            imageCache[element.src!] = img;
            imagesLoaded++;
            
            if (imagesLoaded === imagesToLoad) {
              startCapture(imageCache);
            }
          };
          
          img.onerror = () => {
            toast({
              title: "Image Error",
              description: `Failed to load image: ${element.src}. Using fallback.`,
              variant: "destructive"
            });
            
            // Use a fallback image
            const fallbackImg = new Image();
            fallbackImg.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23666666'%3EImage Error%3C/text%3E%3C/svg%3E";
            
            fallbackImg.onload = () => {
              imageCache[element.src!] = fallbackImg;
              imagesLoaded++;
              
              if (imagesLoaded === imagesToLoad) {
                startCapture(imageCache);
              }
            };
          };
          
          img.src = element.src;
        }
      });
    }
    
    function startCapture(imgCache: Record<string, HTMLImageElement> = {}) {
      // Capture the animation as frames
      const canvasElement = document.createElement('div');
      canvasElement.style.width = '600px';
      canvasElement.style.height = '400px';
      canvasElement.style.position = 'absolute';
      canvasElement.style.left = '-9999px';
      document.body.appendChild(canvasElement);
      
      const frames: string[] = [];
      const totalFrames = gifDuration * gifFrameRate;
      let frameCount = 0;
      
      const captureFrame = () => {
        if (frameCount >= totalFrames) {
          document.body.removeChild(canvasElement);
          
          createGIF({
            images: frames,
            gifWidth: 600,
            gifHeight: 400,
            numWorkers: 2,
            frameDuration: 1000 / gifFrameRate,
            quality: 10
          }, (obj) => {
            if (!obj.error) {
              onSave(obj.image);
            } else {
              toast({
                title: "Error",
                description: "Failed to generate GIF. Please try again.",
                variant: "destructive"
              });
            }
            setIsGenerating(false);
          });
          
          return;
        }
        
        // Render elements at this frame time
        const time = frameCount / gifFrameRate;
        canvasElement.innerHTML = '';
        
        elements.forEach(element => {
          const el = document.createElement(element.type === 'text' ? 'div' : 'img');
          el.style.position = 'absolute';
          el.style.left = `${element.x}px`;
          el.style.top = `${element.y}px`;
          el.style.width = `${element.width}px`;
          el.style.height = `${element.height}px`;
          
          if (element.type === 'text') {
            el.textContent = element.content || '';
            el.style.fontSize = '20px';
            el.style.fontFamily = 'Arial';
          } else if (element.src) {
            // Use cached image if available
            if (imgCache[element.src]) {
              (el as HTMLImageElement).src = imgCache[element.src].src;
            } else {
              (el as HTMLImageElement).src = element.src;
            }
            el.style.objectFit = 'contain';
          }
          
          // Apply animation based on time
          const { animation } = element;
          const preset = ANIMATION_PRESETS.find(p => p.value === animation.preset);
          
          if (preset) {
            const elapsedTime = Math.max(0, time - animation.delay);
            const duration = animation.duration;
            
            if (elapsedTime >= 0 && elapsedTime <= duration * (animation.repeat + 1)) {
              const progress = (elapsedTime % duration) / duration;
              
              // Apply animation effects based on progress
              Object.entries(preset.preview).forEach(([prop, values]) => {
                if (Array.isArray(values)) {
                  const [start, end] = values;
                  const value = start + (end - start) * progress;
                  
                  switch (prop) {
                    case 'opacity':
                      el.style.opacity = String(value);
                      break;
                    case 'x':
                      el.style.transform = `translateX(${typeof value === 'string' ? value : `${value}px`})`;
                      break;
                    case 'y':
                      el.style.transform = `translateY(${typeof value === 'string' ? value : `${value}px`})`;
                      break;
                    case 'scale':
                      el.style.transform = `scale(${value})`;
                      break;
                    case 'rotate':
                      el.style.transform = `rotate(${value}deg)`;
                      break;
                  }
                }
              });
            }
          }
          
          canvasElement.appendChild(el);
        });
        
        // Capture the frame
        html2canvas(canvasElement, { 
          allowTaint: true,
          useCORS: true,
          logging: false
        }).then(canvas => {
          frames.push(canvas.toDataURL());
          frameCount++;
          captureFrame();
        }).catch(err => {
          console.error("Error capturing frame:", err);
          // Continue with next frame even if there's an error
          frameCount++;
          captureFrame();
        });
      };
      
      // Start capturing frames
      captureFrame();
    }
  };

  // Preview animation
  const renderPreview = () => {
    return (
      <div 
        className="relative w-full h-[400px] border rounded-md bg-gray-50 overflow-hidden"
        style={{ perspective: '1000px' }}
      >
        {elements.map(element => (
          <motion.div
            key={element.id}
            initial="initial"
            animate={isPlaying ? "animate" : "initial"}
            style={{
              position: 'absolute',
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              transformOrigin: 'center'
            }}
            variants={{
              initial: { 
                ...getInitialAnimationState(element.animation.preset)
              },
              animate: {
                ...getFinalAnimationState(element.animation.preset),
                transition: {
                  duration: element.animation.duration,
                  delay: element.animation.delay,
                  ease: element.animation.easing,
                  repeat: element.animation.repeat,
                }
              }
            }}
          >
            {element.type === "text" ? (
              <div 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontFamily: 'Arial'
                }}
              >
                {element.content}
              </div>
            ) : (
              <img 
                src={element.src} 
                alt="Element" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  // Helper functions for animation states
  const getInitialAnimationState = (preset: string) => {
    const animation = ANIMATION_PRESETS.find(p => p.value === preset);
    if (!animation) return {};
    
    const result: Record<string, any> = {};
    
    Object.entries(animation.preview).forEach(([prop, values]) => {
      if (Array.isArray(values)) {
        result[prop] = values[0];
      }
    });
    
    return result;
  };
  
  const getFinalAnimationState = (preset: string) => {
    const animation = ANIMATION_PRESETS.find(p => p.value === preset);
    if (!animation) return {};
    
    const result: Record<string, any> = {};
    
    Object.entries(animation.preview).forEach(([prop, values]) => {
      if (Array.isArray(values)) {
        result[prop] = values[values.length - 1];
      }
    });
    
    return result;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button 
            variant={isPlaying ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button 
            variant="default" 
            onClick={handleGenerateGif}
            disabled={isGenerating || elements.length === 0}
          >
            {isGenerating ? (
              <>Generating...</>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate GIF
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="edit" onValueChange={(value) => setPreviewTab(value as "edit" | "preview")}>
        <TabsList className="mb-4">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="flex-1">
          <div className="grid grid-cols-4 gap-4 h-full">
            <div className="col-span-1 border rounded-md p-4 flex flex-col gap-4">
              <h3 className="text-lg font-medium">Elements</h3>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleAddElement("text")}
                >
                  <Type className="h-4 w-4 mr-2" />
                  Add Text
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleAddElement("image")}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Add Image
                </Button>
              </div>
              
              <div className="flex flex-col gap-2 mt-4">
                {elements.map(element => (
                  <div 
                    key={element.id}
                    className={`p-2 border rounded-md cursor-pointer flex items-center gap-2 ${
                      selectedElement === element.id ? 'border-primary bg-primary/10' : ''
                    }`}
                    onClick={() => setSelectedElement(element.id)}
                  >
                    {element.type === "text" ? (
                      <Type className="h-4 w-4" />
                    ) : (
                      <ImageIcon className="h-4 w-4" />
                    )}
                    <span className="text-sm truncate flex-1">
                      {element.type === "text" 
                        ? (element.content || "Text").substring(0, 15) 
                        : "Image"
                      }
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteElement(element.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="mt-auto">
                <h3 className="text-lg font-medium mb-2">GIF Settings</h3>
                <div className="flex flex-col gap-2">
                  <div>
                    <label className="text-sm">Duration (seconds)</label>
                    <div className="flex gap-2 items-center">
                      <Slider 
                        value={[gifDuration]} 
                        min={1} 
                        max={10} 
                        step={0.5}
                        onValueChange={(value) => setGifDuration(value[0])}
                      />
                      <span className="text-sm w-8">{gifDuration}s</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm">Frame Rate</label>
                    <div className="flex gap-2 items-center">
                      <Slider 
                        value={[gifFrameRate]} 
                        min={5} 
                        max={30} 
                        step={1}
                        onValueChange={(value) => setGifFrameRate(value[0])}
                      />
                      <span className="text-sm w-8">{gifFrameRate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-span-2">
              <div 
                ref={canvasRef}
                className="relative w-full h-[400px] border rounded-md bg-gray-50 overflow-hidden"
                onClick={handleCanvasClick}
              >
                {elements.map(element => (
                  <div
                    key={element.id}
                    className={`absolute cursor-move ${
                      selectedElement === element.id ? 'ring-2 ring-primary' : ''
                    }`}
                    style={{
                      left: element.x,
                      top: element.y,
                      width: element.width,
                      height: element.height,
                    }}
                    draggable
                    onDragStart={() => handleDragStart(element)}
                    onDragEnd={(e) => handleDragEnd(e, element)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedElement(element.id);
                    }}
                  >
                    {element.type === "text" ? (
                      <div 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '20px',
                          fontFamily: 'Arial'
                        }}
                      >
                        {element.content}
                      </div>
                    ) : (
                      <img 
                        src={element.src} 
                        alt="Element" 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>Drag elements to position them on the canvas</p>
              </div>
            </div>
            
            <div className="col-span-1 border rounded-md p-4">
              <h3 className="text-lg font-medium mb-4">Properties</h3>
              
              {selectedElement ? (
                <div className="flex flex-col gap-4">
                  {getSelectedElement()?.type === "text" && (
                    <div>
                      <label className="text-sm">Text Content</label>
                      <Input 
                        value={getSelectedElement()?.content || ""}
                        onChange={(e) => {
                          if (selectedElement) {
                            handleUpdateElement(selectedElement, { content: e.target.value });
                          }
                        }}
                      />
                    </div>
                  )}
                  
                  {getSelectedElement()?.type === "image" && (
                    <div>
                      <label className="text-sm">Image URL</label>
                      <Input 
                        value={getSelectedElement()?.src || ""}
                        onChange={(e) => {
                          if (selectedElement) {
                            handleUpdateElement(selectedElement, { src: e.target.value });
                          }
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm">Width</label>
                      <Input 
                        type="number"
                        value={getSelectedElement()?.width || 0}
                        onChange={(e) => {
                          if (selectedElement) {
                            handleUpdateElement(selectedElement, { width: Number(e.target.value) });
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm">Height</label>
                      <Input 
                        type="number"
                        value={getSelectedElement()?.height || 0}
                        onChange={(e) => {
                          if (selectedElement) {
                            handleUpdateElement(selectedElement, { height: Number(e.target.value) });
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm">Animation</label>
                    <Select 
                      value={getSelectedElement()?.animation.preset || "fadeIn"}
                      onValueChange={(value) => {
                        if (selectedElement) {
                          handleUpdateElement(selectedElement, { 
                            animation: {
                              ...getSelectedElement()!.animation,
                              preset: value
                            }
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ANIMATION_PRESETS.map(preset => (
                          <SelectItem key={preset.value} value={preset.value}>
                            {preset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm">Duration (seconds)</label>
                    <div className="flex gap-2 items-center">
                      <Slider 
                        value={[getSelectedElement()?.animation.duration || 1]} 
                        min={0.1} 
                        max={5} 
                        step={0.1}
                        onValueChange={(value) => {
                          if (selectedElement) {
                            handleUpdateElement(selectedElement, { 
                              animation: {
                                ...getSelectedElement()!.animation,
                                duration: value[0]
                              }
                            });
                          }
                        }}
                      />
                      <span className="text-sm w-8">
                        {getSelectedElement()?.animation.duration.toFixed(1)}s
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm">Delay (seconds)</label>
                    <div className="flex gap-2 items-center">
                      <Slider 
                        value={[getSelectedElement()?.animation.delay || 0]} 
                        min={0} 
                        max={3} 
                        step={0.1}
                        onValueChange={(value) => {
                          if (selectedElement) {
                            handleUpdateElement(selectedElement, { 
                              animation: {
                                ...getSelectedElement()!.animation,
                                delay: value[0]
                              }
                            });
                          }
                        }}
                      />
                      <span className="text-sm w-8">
                        {getSelectedElement()?.animation.delay.toFixed(1)}s
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm">Repeat</label>
                    <div className="flex gap-2 items-center">
                      <Slider 
                        value={[getSelectedElement()?.animation.repeat || 0]} 
                        min={0} 
                        max={10} 
                        step={1}
                        onValueChange={(value) => {
                          if (selectedElement) {
                            handleUpdateElement(selectedElement, { 
                              animation: {
                                ...getSelectedElement()!.animation,
                                repeat: value[0]
                              }
                            });
                          }
                        }}
                      />
                      <span className="text-sm w-8">
                        {getSelectedElement()?.animation.repeat}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm">Easing</label>
                    <Select 
                      value={getSelectedElement()?.animation.easing || "easeOut"}
                      onValueChange={(value) => {
                        if (selectedElement) {
                          handleUpdateElement(selectedElement, { 
                            animation: {
                              ...getSelectedElement()!.animation,
                              easing: value
                            }
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linear">Linear</SelectItem>
                        <SelectItem value="easeIn">Ease In</SelectItem>
                        <SelectItem value="easeOut">Ease Out</SelectItem>
                        <SelectItem value="easeInOut">Ease In Out</SelectItem>
                        <SelectItem value="circIn">Circular In</SelectItem>
                        <SelectItem value="circOut">Circular Out</SelectItem>
                        <SelectItem value="backIn">Back In</SelectItem>
                        <SelectItem value="backOut">Back Out</SelectItem>
                        <SelectItem value="bounceIn">Bounce In</SelectItem>
                        <SelectItem value="bounceOut">Bounce Out</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Select an element to edit its properties</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="flex-1">
          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-3xl">
              {renderPreview()}
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={isPlaying ? "secondary" : "outline"} 
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>
              <Button 
                variant="default" 
                onClick={handleGenerateGif}
                disabled={isGenerating || elements.length === 0}
              >
                {isGenerating ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generate GIF
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimpleAnimationEditor;
