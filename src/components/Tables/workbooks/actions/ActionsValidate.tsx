import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import Api from '../../../../utils/Api';

interface ValidationResponse {
  rulecount: number;
  totaltime: number;
  datafetchtime: number;
  dataupdates: number;
  rulecompilecount: number;
  rulecompileerrorcount: number;
  expressioncount: number;
  expressionerrorcount: number;
}

interface Toast {
  visible: boolean;
  data: ValidationResponse | null;
}

interface WorkbookTablesProps {
  workbookId: number;
  onClose: () => void;
  onUpdate: (selectedTables: Record<string, CheckboxState>) => void;
}

interface TableItem {
  key: string;
  label: string;
  data: string;
  children?: TableItem[] | null;
  cellcount: number;
  invalidcount: number;
}

interface CheckboxState {
  checked: boolean;
  indeterminate: boolean;
}

const ActionsValidate: React.FC<WorkbookTablesProps> = ({
  workbookId,
  onClose,
  onUpdate,
}) => {
  const [tableData, setTableData] = useState<TableItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<
    Record<string, CheckboxState>
  >({});
  const [isValidating, setIsValidating] = useState(false);
  const [toast, setToast] = useState<Toast>({ visible: false, data: null });

  const formatTime = (ms: number) => (ms / 1000).toFixed(2);

  const showToast = (data: ValidationResponse) => {
    setToast({ visible: true, data });
    setTimeout(() => {
      setToast({ visible: false, data: null });
    }, 5000);
  };

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const response = await Api.get(
          `/RI/Workbook/Tables?workbookId=${workbookId}&includeSheets=false`,
        );
        setTableData(response.data);
      } catch (error) {
        console.error('Error fetching workbook tables:', error);
      }
    };

    fetchTableData();
  }, [workbookId]);

  const toggleExpand = (key: string) => {
    setExpandedItems((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const handleCheckboxChange = (key: string, hasChildren: boolean = false) => {
    setSelectedItems((prev) => {
      const newSelectedItems = { ...prev };

      const updateItemAndChildren = (item: TableItem, checked: boolean) => {
        newSelectedItems[item.key] = { checked, indeterminate: false };
        if (item.children) {
          item.children.forEach((child) => {
            updateItemAndChildren(child, checked);
          });
        }
      };

      const findAndUpdateItem = (
        items: TableItem[],
        targetKey: string,
      ): boolean => {
        for (const item of items) {
          if (item.key === targetKey) {
            const newState = !newSelectedItems[item.key]?.checked;
            updateItemAndChildren(item, newState);
            return true;
          }
          if (item.children) {
            if (findAndUpdateItem(item.children, targetKey)) return true;
          }
        }
        return false;
      };

      findAndUpdateItem(tableData, key);

      const updateParentStates = (items: TableItem[]) => {
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
          }
        });
      };

      updateParentStates(tableData);
      return newSelectedItems;
    });
  };

  const getSelectedTableIds = (): string[] => {
    const selectedIds: string[] = [];

    const processItem = (item: TableItem) => {
      if (item.data === 'sheet' && selectedItems[item.key]?.checked) {
        const id = item.key.split('-')[1];
        selectedIds.push(id);
      }

      if (item.children) {
        item.children.forEach(processItem);
      }
    };

    tableData.forEach(processItem);
    return selectedIds;
  };

  const handleValidate = async () => {
    const selectedTableIds = getSelectedTableIds();

    if (selectedTableIds.length === 0) {
      alert('Please select at least one table to validate');
      return;
    }

    setIsValidating(true);

    try {
      const response = await Api.post<ValidationResponse>('/RQ/validate', {
        tables: selectedTableIds.join(','),
        workbookId: workbookId,
      });

      showToast(response.data);
    } catch (error) {
      console.error('Error during validation:', error);
      alert('Error occurred during validation');
    } finally {
      setIsValidating(false);
    }
  };

  const CheckboxWithRef: React.FC<{
    item: TableItem;
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

  const Toast: React.FC<{ data: ValidationResponse }> = ({ data }) => (
    <div className="fixed top-4 right-4 z-50 animate-slide-left">
      <div className="min-w-[400px] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              {data.rulecompileerrorcount === 0 &&
              data.expressionerrorcount === 0 ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
              )}
              <h3 className="text-lg font-semibold">
                Validation{' '}
                {data.rulecompileerrorcount === 0 &&
                data.expressionerrorcount === 0
                  ? 'Successful'
                  : 'Completed with Errors'}
              </h3>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Time:</span>
              <span className="font-medium">{formatTime(data.totaltime)}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Data Fetch Time:</span>
              <span className="font-medium">
                {formatTime(data.datafetchtime)}s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rules Count:</span>
              <span className="font-medium">{data.rulecount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Data Updates:</span>
              <span className="font-medium">{data.dataupdates}</span>
            </div>
            {(data.rulecompileerrorcount > 0 ||
              data.expressionerrorcount > 0) && (
              <div className="mt-2 text-red-500">
                {data.rulecompileerrorcount > 0 && (
                  <div>
                    Rule Compilation Errors: {data.rulecompileerrorcount}
                  </div>
                )}
                {data.expressionerrorcount > 0 && (
                  <div>Expression Errors: {data.expressionerrorcount}</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-blue-500 transition-all duration-5000 ease-linear"
            style={{ width: '100%', animation: 'shrink 5s linear forwards' }}
          />
        </div>
      </div>
    </div>
  );

  const renderTableItems = (items: TableItem[]) => {
    return items.map((item) => {
      const state = selectedItems[item.key] || {
        checked: false,
        indeterminate: false,
      };
      const hasChildren = item.children && item.children.length > 0;

      return (
        <div key={item.key} className="my-2">
          <div className="flex items-center">
            {hasChildren && (
              <span
                onClick={() => toggleExpand(item.key)}
                className="cursor-pointer"
              >
                {expandedItems.includes(item.key) ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </span>
            )}
            <CheckboxWithRef
              item={item}
              state={state}
              onChange={() => handleCheckboxChange(item.key, hasChildren)}
            />
            <label htmlFor={item.key} className="ml-2 text-sm">
              {item.label}
            </label>
          </div>
          {hasChildren && expandedItems.includes(item.key) && (
            <div className="ml-6 mt-2">{renderTableItems(item.children)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="rounded-lg bg-white shadow-sm">
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <button
          className={`px-4 py-2 bg-green-500 text-white rounded-md mb-4 ${
            isValidating
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-green-600'
          }`}
          onClick={handleValidate}
          disabled={isValidating}
        >
          {isValidating ? 'Validating...' : 'Validate'}
        </button>
        <div className="max-h-[60vh] overflow-y-auto">
          {renderTableItems(tableData)}
        </div>
      </div>
      {toast.visible && toast.data && <Toast data={toast.data} />}

      <style jsx global>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        @keyframes slide-left {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-slide-left {
          animation: slide-left 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ActionsValidate;
