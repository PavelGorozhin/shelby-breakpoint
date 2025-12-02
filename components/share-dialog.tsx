"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title?: string;
}

export function ShareDialog({
  open,
  onOpenChange,
  url,
  title = "Share Video",
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-center">{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col w-full items-center gap-6 py-4">
          <QRCodeSVG value={url} size={200} level="M" marginSize={0} />

          {/* URL Display */}
          <div className="w-full flex items-center gap-2">
            <div className="flex-1 overflow-x-auto bg-muted rounded-md px-3 py-2 min-w-0">
              <span className="text-sm text-muted-foreground font-mono whitespace-nowrap">
                {url}
              </span>
            </div>
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Scan the QR code or copy the link to share this video
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
