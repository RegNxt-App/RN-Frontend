import React, { useState, useEffect } from 'react';
import Api from '../../../utils/Api';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface UpdateTemplateModelProps {
  existingData: { id: number };
  onClose: () => void;
  onUpdate: () => void;
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

const UpdateTemplateModel = ({
  existingData,
  onClose,
  onUpdate,
}: UpdateTemplateModelProps) => {
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
    const fetchTemplateDetails = async () => {
      try {
        const response = await Api.get(`/RI/Template/${existingData.id}`);
        const templateDetails = response.data;

        setFormData({
          templateName: templateDetails.name,
          regulatoryField: '',
          reportGroup: '',
          reportSet: '',
          reportSubset: '',
        });
      } catch (error) {
        console.error('Error fetching template details:', error);
      }
    };

    fetchTemplateDetails();
    fetchRegulatorData();
  }, [existingData.id]);

  const fetchRegulatorData = async () => {
    try {
      const response = await Api.get('/RD/RegulatorUI');
      setRegulators(response.data);
    } catch (error) {
      console.error('Error fetching regulators:', error);
    }
  };

  const fetchReportGroupData = async (regulatorId: string) => {
    try {
      const response = await Api.get(
        `/RD/RegportGroupUI?regulatorid=${regulatorId}`,
      );
      setReportGroups(response.data);
    } catch (error) {
      console.error('Error fetching report groups:', error);
    }
  };

  const fetchReportSetData = async (
    regulatorId: string,
    reportGroupId: string,
  ) => {
    try {
      const response = await Api.get(
        `/RD/RegportSetUI?regulatorid=${regulatorId}&reportGroupCode=${reportGroupId}`,
      );
      setReportSets(response.data);
    } catch (error) {
      console.error('Error fetching report sets:', error);
    }
  };

  const fetchReportSubsetData = async (
    regulatorId: string,
    reportGroupId: string,
    reportSetId: string,
  ) => {
    try {
      const response = await Api.get(
        `/RD/RegportSubSetUI?regulatorid=${regulatorId}&reportGroupCode=${reportGroupId}&reportSetcode=${reportSetId}`,
      );
      setReportSubsets(response.data);
    } catch (error) {
      console.error('Error fetching report subsets:', error);
    }
  };

  const handleInputChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'regulatoryField' && value) {
      await fetchReportGroupData(value);
    } else if (name === 'reportGroup' && value) {
      await fetchReportSetData(formData.regulatoryField, value);
    } else if (name === 'reportSet' && value) {
      await fetchReportSubsetData(
        formData.regulatoryField,
        formData.reportGroup,
        value,
      );
    } else if (name === 'reportSubset' && value) {
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
    let updatedSelectedTables = [...selectedTables];

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
      templateid: existingData.id,
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
          <div className="p-6.5 grid grid-cols-2 gap-4">
            <input
              type="text"
              name="templateName"
              value={formData.templateName}
              onChange={handleInputChange}
              placeholder="Template Name"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              required
            />
            <select
              name="regulatoryField"
              value={formData.regulatoryField}
              onChange={handleInputChange}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              required
            >
              <option value="">Select Regulator</option>
              {regulators.map((regulator) => (
                <option key={regulator.code} value={regulator.code}>
                  {regulator.name}
                </option>
              ))}
            </select>

            <select
              name="reportGroup"
              value={formData.reportGroup}
              onChange={handleInputChange}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              required
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
              value={formData.reportSet}
              onChange={handleInputChange}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              required
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
