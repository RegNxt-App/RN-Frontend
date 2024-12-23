import React from 'react';

interface WorkbookData {
  id: number;
  name: string;
  template: string;
  templateId: number;
  reportSubsetId: number;
  module: string;
  entity: string;
  reportingCurrency: string;
  reportingDate: number;
  status: string;
}

interface KanbanViewProps {
  data: WorkbookData[];
}

const KanbanView = ({data}: KanbanViewProps) => {
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.status]) {
      acc[item.status] = [];
    }
    acc[item.status].push(item);
    return acc;
  }, {} as Record<string, WorkbookData[]>);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
      {Object.keys(groupedData).map((status) => (
        <div
          key={status}
          className="p-4 bg-white rounded shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-4">{status}</h3>
          {groupedData[status].map((item) => (
            <div
              key={item.id}
              className="mb-4 p-4 bg-gray-100 rounded"
            >
              <h4 className="text-md font-medium">{item.name}</h4>
              <p>{item.entity}</p>
              <p>{item.reportingDate}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default KanbanView;
