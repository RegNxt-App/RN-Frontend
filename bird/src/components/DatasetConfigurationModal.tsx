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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface DatasetConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ConfigFormData) => void;
  initialData?: {
    is_visible: boolean;
    historization_type: number;
  };
  isSystemGenerated?: boolean;
}

interface ConfigFormData {
  is_visible: boolean;
  historization_type: string;
}

const formSchema = z.object({
  is_visible: z.boolean(),
  historization_type: z.string(),
});

const HISTORIZATION_OPTIONS = [
  { value: "0", label: "No historization" },
  { value: "1", label: "Always latest" },
  { value: "2", label: "Versioning" },
];

export default function DatasetConfigurationModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSystemGenerated = false,
}: DatasetConfigurationModalProps) {
  const form = useForm<ConfigFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      is_visible: initialData?.is_visible ?? true,
      historization_type: (initialData?.historization_type ?? 1).toString(),
    },
  });

  const handleSubmit = (data: ConfigFormData) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dataset Configuration</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="is_visible"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Visible in Data/Diagram
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Show this dataset in data and diagram sections
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSystemGenerated}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="historization_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Historization Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSystemGenerated}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select historization type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {HISTORIZATION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={isSystemGenerated}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
