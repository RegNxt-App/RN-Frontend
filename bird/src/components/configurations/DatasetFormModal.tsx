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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { fastApiInstance } from "@/lib/axios";
import { Dataset } from "@/types/databaseTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wand2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Code must only contain letters, numbers, and underscores"
    ),
  label: z.string().min(1, "Label is required"),
  description: z.string().optional(),
  framework: z.string().min(1, "Framework is required"),
  type: z.string().min(1, "Layer is required"),
  is_visible: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface DatasetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dataset: Partial<Dataset>) => void;
  initialData?: Dataset;
  frameworks: { code: string; name: string }[];
  layers: { code: string; name: string }[];
}

export const DatasetFormModal: React.FC<DatasetFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  frameworks,
  layers,
}) => {
  const { toast } = useToast();
  const [isCheckingCode, setIsCheckingCode] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...initialData,
      is_visible: initialData?.is_visible ?? true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
          ...initialData,
          is_visible: initialData.is_visible ?? true,
        });
      } else {
        form.reset({
          code: "",
          label: "",
          description: "",
          framework: "",
          type: "",
          is_visible: true,
        });
      }
    }
  }, [isOpen, initialData, form]);

  const generateValidCode = () => {
    const label = form.getValues("label");
    if (!label) {
      toast({
        title: "Error",
        description: "Please enter a label first",
        variant: "destructive",
      });
      return;
    }

    const validCode = label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_") // Replace invalid chars with underscore
      .replace(/^[^a-z]+/, "") // Remove leading non-letters
      .replace(/_+/g, "_") // Replace multiple underscores with single
      .replace(/^_+|_+$/g, ""); // Remove leading/trailing underscores

    checkCodeExists(validCode);
  };

  const checkCodeExists = async (code: string) => {
    setIsCheckingCode(true);
    try {
      const response = await fastApiInstance.get(`/api/v1/datasets/`, {
        params: { code },
      });

      const exists = response.data.results.some(
        (dataset: any) => dataset.code.toLowerCase() === code.toLowerCase()
      );

      if (exists) {
        // If code exists, append a number
        let counter = 1;
        let newCode = `${code}_${counter}`;

        while (
          response.data.results.some(
            (dataset: any) =>
              dataset.code.toLowerCase() === newCode.toLowerCase()
          )
        ) {
          counter++;
          newCode = `${code}_${counter}`;
        }

        form.setValue("code", newCode);
        toast({
          title: "Code Modified",
          description: "A unique code has been generated",
        });
      } else {
        form.setValue("code", code);
        toast({
          title: "Success",
          description: "Valid code generated",
        });
      }
    } catch (error) {
      console.error("Error checking code:", error);
      toast({
        title: "Error",
        description: "Failed to validate code",
        variant: "destructive",
      });
    } finally {
      setIsCheckingCode(false);
    }
  };

  const handleSubmit = async (data: FormValues) => {
    try {
      const response = await fastApiInstance.get(`/api/v1/datasets/`, {
        params: { code: data.code },
      });

      const exists = response.data.results.some(
        (dataset: any) =>
          dataset.code.toLowerCase() === data.code.toLowerCase() &&
          (!initialData || dataset.dataset_id !== initialData.dataset_id)
      );

      if (exists) {
        toast({
          title: "Error",
          description: "A dataset with this code already exists",
          variant: "destructive",
        });
        return;
      }

      onSubmit(data);
    } catch (error) {
      console.error("Error submitting form:", error);

      toast({
        title: "Error",
        description: "Failed to create dataset",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Dataset" : "Create Dataset"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        {...field}
                        disabled={initialData?.is_system_generated}
                        placeholder="Enter code"
                      />
                    </FormControl>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={generateValidCode}
                            disabled={
                              initialData?.is_system_generated || isCheckingCode
                            }
                          >
                            <Wand2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Generate valid code from current value
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rest of the form fields remain the same */}
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Label"
                      {...field}
                      disabled={initialData?.is_system_generated}
                    />
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
                    <Input
                      placeholder="Description"
                      {...field}
                      disabled={initialData?.is_system_generated}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="framework"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Framework</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={initialData?.is_system_generated}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Framework" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {frameworks.map((framework) => (
                        <SelectItem key={framework.code} value={framework.code}>
                          {framework.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Layer</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={initialData?.is_system_generated}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Layer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {layers.map((layer) => (
                        <SelectItem key={layer.code} value={layer.code}>
                          {layer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_visible"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Visible</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Make this dataset visible in data and diagram sections
                    </div>
                    <FormMessage />
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={initialData?.is_system_generated}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button type="submit" disabled={initialData?.is_system_generated}>
                {initialData ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DatasetFormModal;
