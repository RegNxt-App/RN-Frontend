import React, { useState, useEffect, useRef } from 'react';
import Api from '../../../utils/Api';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface UpdateTemplateModelProps {
  existingData: { id: number; reportSubsetId?: number };
  onClose: () => void;
  onUpdate: () => void;
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

      // Update parent states
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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
      <div className="rounded-sm border border-stroke bg-white shadow-default p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="border-b border-stroke py-4 px-6.5">
          <h3 className="text-2xl font-extrabold text-black">Edit Template</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6.5 grid grid-cols-1 gap-4">
            <input
              type="text"
              name="templateName"
              value={formData.templateName}
              onChange={handleInputChange}
              placeholder="Template Name"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              required
            />
          </div>

          <div className="p-6.5">
            <h4 className="text-xl font-bold mb-4">Select Tables</h4>
            <div>{renderItems(tableFields)}</div>
          </div>

          <div className="border-t border-stroke bg-gray p-4 text-right">
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-success px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Save
            </button>
            <button
              type="button"
              className="ml-2 inline-flex justify-center rounded-md border border-transparent bg-danger px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateTemplateModel;
