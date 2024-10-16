import React, { useState, useEffect } from 'react';
import Api from '../../../utils/Api';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface AddTemplateModelProps {
  onClose: () => void;
  onSuccess: () => void;
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

const AddTemplateModel = ({ onClose, onSuccess }: AddTemplateModelProps) => {
  const [formData, setFormData] = useState({
    templateName: '',
    regulatoryField: '',
    reportGroup: '',
    reportSet: '',
    reportSubset: '',
  });

  const [regulators, setRegulators] = useState<Regulator[]>([]);
  const [reportGroups, setReportGroups] = useState<ReportGroup[]>([]);
  const [reportSets, setReportSets] = useState<ReportSet[]>([]);
  const [reportSubsets, setReportSubsets] = useState<ReportSubset[]>([]);
  const [reportTables, setReportTables] = useState<ReportTable[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [expandedParents, setExpandedParents] = useState<string[]>([]);

  useEffect(() => {
    const fetchRegulators = async () => {
      try {
        const response = await Api.get('/RD/RegulatorUI');
        setRegulators(response.data);
      } catch (error) {
        console.error('Error fetching regulators:', error);
      }
    };

    fetchRegulators();
  }, []);

  const handleInputChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'regulatoryField' && value) {
      try {
        const response = await Api.get(
          `/RD/RegportGroupUI?regulatorid=${value}`,
        );
        setReportGroups(response.data);
        setReportSets([]);
        setReportSubsets([]);
      } catch (error) {
        console.error('Error fetching report groups:', error);
      }
    }

    if (name === 'reportGroup' && value) {
      try {
        const response = await Api.get(
          `/RD/RegportSetUI?regulatorid=${formData.regulatoryField}&reportGroupCode=${value}`,
        );
        setReportSets(response.data);
        setReportSubsets([]);
      } catch (error) {
        console.error('Error fetching report sets:', error);
      }
    }

    if (name === 'reportSet' && value) {
      try {
        const response = await Api.get(
          `/RD/RegportSubSetUI?regulatorid=${formData.regulatoryField}&reportGroupCode=${formData.reportGroup}&reportSetcode=${value}`,
        );
        setReportSubsets(response.data);
      } catch (error) {
        console.error('Error fetching report subsets:', error);
      }
    }

    if (name === 'reportSubset' && value) {
      try {
        const response = await Api.get(
          `/RD/Table?reportSubsetId=${value}&refReportSubsetId=0`,
        );
        setReportTables(response.data);
      } catch (error) {
        console.error('Error fetching report tables:', error);
      }
    }
  };

  const handleCheckboxChange = (key: string, isParent: boolean) => {
    let updatedSelectedTables: string[] = [...selectedTables];

    if (isParent) {
      const parent = reportTables.find((table) => table.key === key);
      const childrenKeys = parent?.children?.map((child) => child.key) || [];

      if (selectedTables.includes(key)) {
        updatedSelectedTables = updatedSelectedTables.filter(
          (item) => item !== key && !childrenKeys.includes(item),
        );
      } else {
        updatedSelectedTables.push(key, ...childrenKeys);
      }
    } else {
      if (selectedTables.includes(key)) {
        updatedSelectedTables = updatedSelectedTables.filter(
          (item) => item !== key,
        );
      } else {
        updatedSelectedTables.push(key);
      }
    }

    setSelectedTables(updatedSelectedTables);
  };

  const toggleExpand = (key: string) => {
    setExpandedParents((prevExpanded) =>
      prevExpanded.includes(key)
        ? prevExpanded.filter((item) => item !== key)
        : [...prevExpanded, key],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedTables = reportTables.reduce(
      (acc, table) => {
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
      },
      {} as Record<string, { checked: boolean; partialChecked: boolean }>,
    );

    const payload = {
      name: formData.templateName,
      regulatoryField: formData.regulatoryField,
      reportGroup: formData.reportGroup,
      reportSet: formData.reportSet,
      reportsubsetid: Number(formData.reportSubset),
      tables: JSON.stringify(formattedTables),
      templateid: 0,
    };

    try {
      const response = await Api.post('/RI/Template', payload);
      console.log('Template created successfully:', response.data);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
      <div className="rounded-sm border border-stroke bg-white shadow-default p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="border-b border-stroke py-4 px-6.5">
          <h3 className="text-2xl font-extrabold text-black">
            Add New Template
          </h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6.5 grid grid-cols-2 gap-4">
            <input
              type="text"
              name="templateName"
              placeholder="Template Name"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.templateName}
              required
            />

            <select
              name="regulatoryField"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.regulatoryField}
              required
            >
              <option value="">Select Regulatory Field</option>
              {regulators.map((regulator) => (
                <option key={regulator.code} value={regulator.code}>
                  {regulator.name}
                </option>
              ))}
            </select>

            <select
              name="reportGroup"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.reportGroup}
              required
              disabled={!reportGroups.length}
            >
              <option value="">Select Report Group</option>
              {reportGroups.map((group) => (
                <option key={group.code} value={group.code}>
                  {group.name}
                </option>
              ))}
            </select>

            <select
              name="reportSet"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.reportSet}
              required
              disabled={!reportSets.length}
            >
              <option value="">Select Report Set</option>
              {reportSets.map((set) => (
                <option key={set.code} value={set.code}>
                  {set.name}
                </option>
              ))}
            </select>

            <select
              name="reportSubset"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.reportSubset}
              required
              disabled={!reportSubsets.length}
            >
              <option value="">Select Report Subset</option>
              {reportSubsets.map((subset) => (
                <option key={subset.code} value={subset.code}>
                  {subset.name}
                </option>
              ))}
            </select>
          </div>

          <div className="p-6.5">
            {reportTables.length > 0 && (
              <h4 className="text-xl font-bold mb-4">Select Tables</h4>
            )}
            <div>
              {reportTables.map((table) => (
                <div key={table.key}>
                  <div className="flex items-center">
                    <span onClick={() => toggleExpand(table.key)}>
                      {expandedParents.includes(table.key) ? (
                        <ChevronDown className="cursor-pointer" />
                      ) : (
                        <ChevronRight className="cursor-pointer" />
                      )}
                    </span>
                    <input
                      type="checkbox"
                      id={table.key}
                      checked={selectedTables.includes(table.key)}
                      onChange={() => handleCheckboxChange(table.key, true)}
                      className="ml-2"
                    />
                    <label htmlFor={table.key} className="ml-2">
                      {table.label}
                    </label>
                  </div>

                  {expandedParents.includes(table.key) && table.children && (
                    <div className="ml-6 mt-2">
                      {table.children.map((child) => (
                        <div key={child.key} className="flex items-center">
                          <input
                            type="checkbox"
                            id={child.key}
                            checked={selectedTables.includes(child.key)}
                            onChange={() =>
                              handleCheckboxChange(child.key, false)
                            }
                            className="ml-2"
                          />
                          <label htmlFor={child.key} className="ml-2">
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

          <div className="px-6.5 pb-6.5 flex justify-end gap-4">
            <button
              className="inline-flex items-center justify-center rounded bg-meta-1 py-2 px-6 text-center font-medium text-white hover:bg-primary focus:outline-none"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90 focus:outline-none"
            >
              Save Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTemplateModel;
