import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import Api from '../../../utils/Api';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';

interface UpdateTemplateModelProps {
  existingData: { id: number; reportSubsetId?: number };
  onClose: () => void;
  onUpdate: () => void;
  isOpen: boolean;
}

interface Item {
  key: string;
  label: string;
  status: string;
  children?: Item[];
}

interface CheckboxState {
  checked: boolean;
  indeterminate: boolean;
}

const UpdateTemplateModel: React.FC<UpdateTemplateModelProps> = ({
  existingData,
  onClose,
  onUpdate,
  isOpen,
}) => {
  const [formData, setFormData] = useState({
    templateName: '',
    selectedItems: {} as Record<string, CheckboxState>,
  });

  const [tableFields, setTableFields] = useState<Item[]>([]);
  const [expandedParents, setExpandedParents] = useState<string[]>([]);

  useEffect(() => {
    const fetchTemplateDetails = async () => {
      try {
        const response = await Api.get(`/RI/Template/${existingData.id}`);
        const templateDetails = response.data;
        const parsedSelectedItems = JSON.parse(templateDetails.selectedItems);

        setFormData({
          templateName: templateDetails.name,
          selectedItems: parsedSelectedItems,
        });
      } catch (error) {
        console.error('Error fetching template details:', error);
      }
    };

    fetchTemplateDetails();
  }, [existingData.id]);

  useEffect(() => {
    if (existingData.reportSubsetId) {
      const fetchTableFields = async () => {
        try {
          const response = await Api.get(
            `/RD/Table?reportSubsetId=${existingData.reportSubsetId}&refReportSubsetId=0`,
          );
          setTableFields(response.data);
        } catch (error) {
          console.error('Error fetching table fields:', error);
        }
      };

      fetchTableFields();
    }
  }, [existingData.reportSubsetId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (key: string, hasChildren: boolean = false) => {
    setFormData((prev) => {
      const newSelectedItems = { ...prev.selectedItems };

      const updateItemAndChildren = (itemKey: string, checked: boolean) => {
        newSelectedItems[itemKey] = { checked, indeterminate: false };
        const item = findItemByKey(tableFields, itemKey);
        if (item?.children) {
          item.children.forEach((child) =>
            updateItemAndChildren(child.key, checked),
          );
        }
      };

      const currentState = newSelectedItems[key] || {
        checked: false,
        indeterminate: false,
      };
      const newCheckedState = !currentState.checked;

      updateItemAndChildren(key, newCheckedState);

      const updateParentState = (items: Item[]) => {
        items.forEach((item) => {
          if (item.children) {
            const childStates = item.children.map(
              (child) => newSelectedItems[child.key],
            );
            const allChecked = childStates.every((state) => state?.checked);
            const someChecked = childStates.some(
              (state) => state?.checked || state?.indeterminate,
            );

            newSelectedItems[item.key] = {
              checked: allChecked,
              indeterminate: !allChecked && someChecked,
            };

            updateParentState(item.children);
          }
        });
      };

      updateParentState(tableFields);

      return {
        ...prev,
        selectedItems: newSelectedItems,
      };
    });
  };

  const findItemByKey = (items: Item[], key: string): Item | undefined => {
    for (const item of items) {
      if (item.key === key) return item;
      if (item.children) {
        const found = findItemByKey(item.children, key);
        if (found) return found;
      }
    }
    return undefined;
  };

  const toggleExpand = (key: string) => {
    setExpandedParents((prevExpanded) =>
      prevExpanded.includes(key)
        ? prevExpanded.filter((item) => item !== key)
        : [...prevExpanded, key],
    );
  };

  const CheckboxWithRef: React.FC<{
    item: Item;
    state: CheckboxState;
    onChange: () => void;
  }> = React.memo(({ item, state, onChange }) => {
    const checkboxRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = state.indeterminate;
      }
    }, [state.indeterminate]);

    return (
      <input
        ref={checkboxRef}
        type="checkbox"
        id={item.key}
        checked={state.checked}
        onChange={onChange}
        className="ml-2"
      />
    );
  });

  const renderItems = (items: Item[]) => {
    return items.map((item) => {
      const state = formData.selectedItems[item.key] || {
        checked: false,
        indeterminate: false,
      };

      return (
        <div key={item.key}>
          <div className="flex items-center">
            {item.children && (
              <span onClick={() => toggleExpand(item.key)}>
                {expandedParents.includes(item.key) ? (
                  <ChevronDown className="cursor-pointer" />
                ) : (
                  <ChevronRight className="cursor-pointer" />
                )}
              </span>
            )}
            <CheckboxWithRef
              item={item}
              state={state}
              onChange={() => handleCheckboxChange(item.key, !!item.children)}
            />
            <label htmlFor={item.key} className="ml-2">
              {item.label}
            </label>
          </div>
          {expandedParents.includes(item.key) && item.children && (
            <div className="ml-6 mt-2">{renderItems(item.children)}</div>
          )}
        </div>
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.templateName,
      tables: JSON.stringify(formData.selectedItems),
      templateid: existingData.id,
      reportsubsetid: existingData.reportSubsetId,
    };

    try {
      const response = await Api.post(`/RI/Template/`, payload);
      console.log('Template updated successfully:', response.data);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Template</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="p-6.5 space-y-6">
            <div>
              <Input
                type="text"
                name="templateName"
                value={formData.templateName}
                onChange={handleInputChange}
                placeholder="Template Name"
                required
              />
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Select Tables</h4>
              <div className="border rounded-lg p-4">
                {renderItems(tableFields)}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button className="bg-purple-500 text-white" type="submit">
                Save Changes
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateTemplateModel;
