import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

const UploadPan = () => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="journal-upload">
        <AccordionTrigger className="font-semibold text-black px-4 py-3">
          Journal Upload
        </AccordionTrigger>
        <AccordionContent>
          <div className="p-4">
            <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg">
              <Upload className="w-12 h-20 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 text-center">
                Drag and drop files here to upload
              </p>
            </div>
            <Button className="mt-4 w-full bg-purple text-white">
              Upload Journal
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default UploadPan;
