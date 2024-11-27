import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Api from '../../../utils/Api';
import { useToast } from '@/hooks/use-toast';
import Loader from '../../loader';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';

interface EntityOption {
  name: string;
  code: number;
}

interface TemplateOption {
  name: string;
  code: number;
}

interface CurrencyOption {
  name: string;
  code: string;
}

interface AddWorkbookModelProps {
  onClose: () => void;
  onWorkbookAdded: () => void;
  isOpen: boolean;
}

const formSchema = z.object({
  name: z.string().min(1, 'Report name is required'),
  entityId: z.number({ required_error: 'Entity is required' }),
  templateId: z.number({ required_error: 'Template is required' }),
  reportingCurrency: z.string().optional(),
  reportingDate: z.string().min(1, 'Reporting date is required'),
});

type FormValues = z.infer<typeof formSchema>;

const AddWorkbookModel = ({
  onClose,
  onWorkbookAdded,
  isOpen,
}: AddWorkbookModelProps) => {
  const [entities, setEntities] = useState<EntityOption[]>([]);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      entityId: undefined,
      templateId: undefined,
      reportingCurrency: '',
      reportingDate: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [entityResponse, templateResponse, currencyResponse] =
          await Promise.all([
            Api.get<EntityOption[]>('RI/UIInput?type=Entity'),
            Api.get<TemplateOption[]>('RI/UIInput?type=Template'),
            Api.get<CurrencyOption[]>('RI/UIInput?type=Currency'),
          ]);

        setEntities(entityResponse.data);
        setTemplates(templateResponse.data);
        setCurrencies(currencyResponse.data);
      } catch (err) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description:
            err instanceof Error
              ? err.message
              : 'An error occurred while fetching data',
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, toast]);

  const formatDate = (dateString: string): string => {
    return dateString.replace(/\D/g, '');
  };

  const onSubmit = async (data: FormValues) => {
    try {
      await Api.post('/RI/Workbook', {
        Name: data.name.trim(),
        TemplateId: data.templateId,
        EntityId: data.entityId,
        ReportingCurrency: data.reportingCurrency?.trim(),
        ReportingDate: formatDate(data.reportingDate),
      });

      toast({
        title: 'Success',
        description: 'Workbook created successfully',
        duration: 3000,
      });

      onWorkbookAdded();
      onClose();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          err instanceof Error ? err.message : 'Failed to create workbook',
        duration: 3000,
      });
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center p-6">
            <Loader />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-black">Add New Workbook</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter report name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="entityId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reporting Entity</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Reporting Entity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {entities.map((entity) => (
                        <SelectItem
                          key={entity.code}
                          value={entity.code.toString()}
                        >
                          {entity.name}
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
              name="templateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem
                          key={template.code}
                          value={template.code.toString()}
                        >
                          {template.name}
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
              name="reportingCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reporting Currency (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Reporting Currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.name}
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
              name="reportingDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reporting Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button className="text-white" type="submit">
                Create Report
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddWorkbookModel;
