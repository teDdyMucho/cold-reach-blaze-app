import { useState } from 'react';
import { Wand2, X, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface AIImageDialogProps {
  onImageGenerated: (imageUrl: string) => void;
  componentType?: 'image' | 'text-image';
}

const AIImageDialog = ({ onImageGenerated, componentType = 'image' }: AIImageDialogProps) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [showResponse, setShowResponse] = useState(false);
  const { toast } = useToast();

  // Set default size based on component type
  const imageSize = componentType === 'text-image' ? '300x200' : '600x200';

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://primary-production-166e.up.railway.app/webhook-test/048d74a5-77a4-4b2b-b4f1-14f44e7c5740', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          size: imageSize
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const url = await response.text();
      console.log('Received image URL:', url);
      setImageUrl(url);
      setShowResponse(true);
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Error",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUseImage = () => {
    if (imageUrl) {
      onImageGenerated(imageUrl);
      setShowResponse(false);
      setOpen(false);
      toast({
        title: "Success",
        description: "Image has been applied successfully.",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Wand2 className="h-4 w-4 mr-2" />
            AI Generate
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate AI Image</DialogTitle>
            <DialogDescription>
              Enter a description of the image you want to generate. 
              The image will be generated at {imageSize} pixels.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="prompt">Image Description</Label>
              <Input
                id="prompt"
                placeholder="A serene mountain landscape at sunset..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || loading}
            >
              {loading ? 'Generating...' : 'Generate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={showResponse} onOpenChange={setShowResponse}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Generated Image</SheetTitle>
            <SheetDescription>
              Review and choose what to do with the generated image
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {imageUrl && (
              <div className="space-y-4">
                <div className="rounded-lg border overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt="Generated" 
                    className="w-full h-auto"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={handleUseImage}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Use This Image
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={handleGenerate}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate Another
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowResponse(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default AIImageDialog;