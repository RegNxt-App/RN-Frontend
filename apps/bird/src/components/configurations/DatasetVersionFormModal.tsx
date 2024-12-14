import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DatasetVersion } from "@/types/databaseTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Badge } from "../ui/badge";

interface DatasetVersionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  currentVersion?: DatasetVersion;
  datasetCode: string;
}

const formSchema = z.object({
  label: z.string().min(1, "Label is required"),
  description: z.string().optional(),
  code: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function DatasetVersionFormModal({
  isOpen,
  onClose,
  onSubmit,
  currentVersion,
  datasetCode,
}: DatasetVersionFormModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      description: "",
      code: "",
    },
  });

  const nextVersionNumber = currentVersion ? currentVersion.version_nr + 1 : 1;
  const nextVersionCode = `${datasetCode}_${nextVersionNumber}`;

  const handleSubmit = (data: FormData) => {
    onSubmit({
      ...data,
      code: datasetCode,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Version</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-medium">Next Version:</span>
            <Badge variant="secondary">{nextVersionNumber}</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">Version Code:</span>
            <Badge>{nextVersionCode}</Badge>
          </div>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter label" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Create Version</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
