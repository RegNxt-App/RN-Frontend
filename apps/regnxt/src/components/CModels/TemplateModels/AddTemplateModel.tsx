import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';

import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/Dialog';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {useToast} from '@/hooks/use-toast';
import {zodResolver} from '@hookform/resolvers/zod';
import {ChevronDown, ChevronRight} from 'lucide-react';
import * as z from 'zod';

import Api from '../../../utils/Api';

interface AddTemplateModelProps {
  onClose: () => void;
  onSuccess: () => void;
  isOpen: boolean;
}

interface Regulator {
  name: string;
  code: number;
}

interface ReportGroup {
  name: string;
  code: string;
}

interface ReportSet {
  name: string;
  code: string;
}

interface ReportSubset {
  name: string;
  code: number;
}

interface ReportTable {
  key: string;
  label: string;
  status: string;
  children?: ReportTable[];
}

const formSchema = z.object({
  templateName: z.string().min(1, 'Template name is required'),
  regulatoryField: z.string().min(1, 'Regulatory field is required'),
  reportGroup: z.string().min(1, 'Report group is required'),
  reportSet: z.string().min(1, 'Report set is required'),
  reportSubset: z.string().min(1, 'Report subset is required'),
});

type FormValues = z.infer<typeof formSchema>;

const AddTemplateModel = ({onClose, onSuccess, isOpen}: AddTemplateModelProps) => {
  const {toast} = useToast();
  const [regulators, setRegulators] = useState<Regulator[]>([]);
  const [reportGroups, setReportGroups] = useState<ReportGroup[]>([]);
  const [reportSets, setReportSets] = useState<ReportSet[]>([]);
  const [reportSubsets, setReportSubsets] = useState<ReportSubset[]>([]);
  const [reportTables, setReportTables] = useState<ReportTable[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [expandedParents, setExpandedParents] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templateName: '',
      regulatoryField: '',
      reportGroup: '',
      reportSet: '',
      reportSubset: '',
    },
  });

  useEffect(() => {
    const fetchRegulators = async () => {
      try {
        const response = await Api.get('/RD/RegulatorUI');
        setRegulators(response.data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch regulators',
        });
      }
    };

    if (isOpen) {
      fetchRegulators();
    }
  }, [isOpen, toast]);

  const fetchReportGroups = async (regulatorId: string) => {
    try {
      const response = await Api.get(`/RD/RegportGroupUI?regulatorid=${regulatorId}`);
      setReportGroups(response.data);
      setReportSets([]);
      setReportSubsets([]);
      form.setValue('reportGroup', '');
      form.setValue('reportSet', '');
      form.setValue('reportSubset', '');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch report groups',
      });
    }
  };

  const fetchReportSets = async (regulatorId: string, groupCode: string) => {
    try {
      const response = await Api.get(
        `/RD/RegportSetUI?regulatorid=${regulatorId}&reportGroupCode=${groupCode}`
      );
      setReportSets(response.data);
      setReportSubsets([]);
      form.setValue('reportSet', '');
      form.setValue('reportSubset', '');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch report sets',
      });
    }
  };

  const fetchReportSubsets = async (regulatorId: string, groupCode: string, setCode: string) => {
    try {
      const response = await Api.get(
        `/RD/RegportSubSetUI?regulatorid=${regulatorId}&reportGroupCode=${groupCode}&reportSetcode=${setCode}`
      );
      setReportSubsets(response.data);
      form.setValue('reportSubset', '');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch report subsets',
      });
    }
  };

  const fetchReportTables = async (subsetId: string) => {
    try {
      const response = await Api.get(`/RD/Table?reportSubsetId=${subsetId}&refReportSubsetId=0`);
      setReportTables(response.data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch report tables',
      });
    }
  };

  const handleCheckboxChange = (key: string, isParent: boolean) => {
    let updatedSelectedTables: string[] = [...selectedTables];

    if (isParent) {
      const parent = reportTables.find((table) => table.key === key);
      const childrenKeys = parent?.children?.map((child) => child.key) || [];

      if (selectedTables.includes(key)) {
        updatedSelectedTables = updatedSelectedTables.filter(
          (item) => item !== key && !childrenKeys.includes(item)
        );
      } else {
        updatedSelectedTables.push(key, ...childrenKeys);
      }
    } else {
      if (selectedTables.includes(key)) {
        updatedSelectedTables = updatedSelectedTables.filter((item) => item !== key);
      } else {
        updatedSelectedTables.push(key);
      }
    }

    setSelectedTables(updatedSelectedTables);
  };

  const toggleExpand = (key: string) => {
    setExpandedParents((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const formattedTables = reportTables.reduce((acc, table) => {
        const isChecked = selectedTables.includes(table.key);
        acc[table.key] = {
          checked: isChecked,
          partialChecked: !isChecked,
        };

        if (table.children) {
          table.children.forEach((child) => {
            const isChildChecked = selectedTables.includes(child.key);
            acc[child.key] = {
              checked: isChildChecked,
              partialChecked: !isChildChecked,
            };
          });
        }

        return acc;
      }, {} as Record<string, {checked: boolean; partialChecked: boolean}>);

      const payload = {
        name: data.templateName,
        regulatoryField: data.regulatoryField,
        reportGroup: data.reportGroup,
        reportSet: data.reportSet,
        reportsubsetid: Number(data.reportSubset),
        tables: JSON.stringify(formattedTables),
        templateid: 0,
      };

      await Api.post('/RI/Template', payload);

      toast({
        title: 'Success',
        description: 'Template created successfully',
      });

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create template',
      });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Template</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="templateName"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter template name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="regulatoryField"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Regulatory Field</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        fetchReportGroups(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select regulatory field" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {regulators.map((regulator) => (
                          <SelectItem
                            key={regulator.code}
                            value={regulator.code.toString()}
                          >
                            {regulator.name}
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
                name="reportGroup"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Report Group</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (form.getValues('regulatoryField')) {
                          fetchReportSets(form.getValues('regulatoryField'), value);
                        }
                      }}
                      value={field.value}
                      disabled={!reportGroups.length}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select report group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {reportGroups.map((group) => (
                          <SelectItem
                            key={group.code}
                            value={group.code}
                          >
                            {group.name}
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
                name="reportSet"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Report Set</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (form.getValues('regulatoryField') && form.getValues('reportGroup')) {
                          fetchReportSubsets(
                            form.getValues('regulatoryField'),
                            form.getValues('reportGroup'),
                            value
                          );
                        }
                      }}
                      value={field.value}
                      disabled={!reportSets.length}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select report set" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {reportSets.map((set) => (
                          <SelectItem
                            key={set.code}
                            value={set.code}
                          >
                            {set.name}
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
                name="reportSubset"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Report Subset</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        fetchReportTables(value);
                      }}
                      value={field.value}
                      disabled={!reportSubsets.length}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select report subset" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {reportSubsets.map((subset) => (
                          <SelectItem
                            key={subset.code}
                            value={subset.code.toString()}
                          >
                            {subset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {reportTables.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Select Tables</h4>
                <div className="space-y-2">
                  {reportTables.map((table) => (
                    <div
                      key={table.key}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="p-0 h-auto"
                          onClick={() => toggleExpand(table.key)}
                        >
                          {expandedParents.includes(table.key) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        <Checkbox
                          className="text-white"
                          id={table.key}
                          checked={selectedTables.includes(table.key)}
                          onCheckedChange={() => handleCheckboxChange(table.key, true)}
                        />
                        <label
                          htmlFor={table.key}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {table.label}
                        </label>
                      </div>

                      {expandedParents.includes(table.key) && table.children && (
                        <div className="ml-6 space-y-2">
                          {table.children.map((child) => (
                            <div
                              key={child.key}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                className="text-white"
                                id={child.key}
                                checked={selectedTables.includes(child.key)}
                                onCheckedChange={() => handleCheckboxChange(child.key, false)}
                              />
                              <label
                                htmlFor={child.key}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {child.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                className="bg-purple-500 text-white"
                type="submit"
              >
                Save Template
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTemplateModel;
