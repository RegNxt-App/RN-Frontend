import React, { useEffect, useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import Api from '../../../utils/Api';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';

interface AddEntityModelProps {
  onClose: () => void;
  onSuccess: () => void;
  isOpen: boolean;
}

interface CurrencyOption {
  name: string;
  code: string;
}

const formSchema = z.object({
  entityCode: z.string().min(1, 'Entity code is required'),
  entityLabel: z.string().min(1, 'Entity label is required'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  identificationType: z.string().min(1, 'Identification type is required'),
  vat: z.string().min(1, 'VAT is required'),
  bicCode: z.string().min(1, 'BIC code is required'),
  kboCode: z.string().min(1, 'KBO code is required'),
  leiCode: z.string().min(1, 'LEI code is required'),
  reportingCurrency: z.string().min(1, 'Reporting currency is required'),
  significantCurrencies: z
    .string()
    .min(1, 'Significant currencies are required'),
  email: z.string().email('Invalid email address'),
  consolidationScope: z.string().min(1, 'Consolidation scope is required'),
});

type FormValues = z.infer<typeof formSchema>;

const AddEntityModel = ({
  onClose,
  onSuccess,
  isOpen,
}: AddEntityModelProps) => {
  const [identificationTypes, setIdentificationTypes] = useState<
    { name: string; code: number }[]
  >([]);
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entityCode: '',
      entityLabel: '',
      country: '',
      city: '',
      identificationType: '',
      vat: '',
      bicCode: '',
      kboCode: '',
      leiCode: '',
      reportingCurrency: '',
      significantCurrencies: '',
      email: '',
      consolidationScope: '',
    },
  });

  useEffect(() => {
    const fetchIdentificationTypes = async () => {
      try {
        const response = await Api.get('/RI/UIInput?type=IdentificationType');
        setIdentificationTypes(response.data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch identification types',
        });
      }
    };

    const fetchCurrencies = async () => {
      try {
        const response = await Api.get<CurrencyOption[]>(
          'RI/UIInput?type=Currency',
        );
        setCurrencies(response.data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch currencies',
        });
      }
    };

    if (isOpen) {
      fetchIdentificationTypes();
      fetchCurrencies();
    }
  }, [isOpen, toast]);

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        code: data.entityCode,
        label: data.entityLabel,
        country: data.country,
        city: data.city,
        identificationtype: data.identificationType,
        vat: data.vat,
        biccode: data.bicCode,
        kbo: data.kboCode,
        lei: data.leiCode,
        reportingcurrency: data.reportingCurrency,
        significantcurrencies: data.significantCurrencies,
        email: data.email,
        consolidationscope: data.consolidationScope,
        entityid: 0,
      };

      await Api.post('/RI/Entity', payload);

      toast({
        title: 'Success',
        description: 'Entity created successfully',
      });

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create entity',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[780px]">
        <DialogHeader>
          <DialogTitle>Add New Entity</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="entityCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entity Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter entity code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entityLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entity Label</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter entity label" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="identificationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Identification Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select identification type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {identificationTypes.map((type) => (
                          <SelectItem
                            key={type.code}
                            value={type.code.toString()}
                          >
                            {type.name}
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
                name="vat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VAT</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter VAT" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bicCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BIC Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter BIC code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="kboCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>KBO Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter KBO code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="leiCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LEI Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter LEI code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reportingCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reporting Currency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
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
                name="significantCurrencies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Significant Currencies</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter significant currencies"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="consolidationScope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consolidation Scope</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter consolidation scope"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button className="bg-purple-500 text-white" type="submit">
                Create Entity
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEntityModel;
