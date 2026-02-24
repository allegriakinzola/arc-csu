"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2, X } from "lucide-react";

interface PDFPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfUrl: string;
  fileName: string;
}

export function PDFPreviewModal({
  open,
  onOpenChange,
  pdfUrl,
  fileName,
}: PDFPreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  const handleDownload = () => {
    const downloadUrl = `${pdfUrl}?download=true`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Certificat d&apos;accréditation</DialogTitle>
              <DialogDescription>
                Prévisualisation du certificat PDF
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleDownload} size="sm">
                <Download className="mr-2 h-4 w-4" />
                Télécharger
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 relative bg-gray-100">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
            title="Certificat PDF"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
