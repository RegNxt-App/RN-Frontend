import React, {useEffect, useState} from 'react';
import {Tooltip as ReactTooltip} from 'react-tooltip';

import {AlertTriangle, Database, Save} from 'lucide-react';

import {useAppDispatch, useAppSelector} from '../../app/hooks';
import {
  fetchTableStructure,
  selectChangedRows,
  selectStructureError,
  selectTableStructure,
  selectTableStructureLoading,
  selectTotalCounts,
} from '../../features/sheetData/sheetDataSlice';
import {Input} from '../ui/input';
import Tree from './Tree';

const StructureTab: React.FC<StructureTabProps> = ({workbookId}) => {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredData, setFilteredData] = useState<ApiResponse[]>([]);

  const tableStructure = useAppSelector(selectTableStructure);
  const isLoading = useAppSelector(selectTableStructureLoading);
  const error = useAppSelector(selectStructureError);
  const changedRows = useAppSelector(selectChangedRows);
  const selectedSheet = useAppSelector((state) => state.sheetData.selectedSheet);
  const totalCounts = useAppSelector(selectTotalCounts);

  useEffect(() => {
    dispatch(fetchTableStructure(workbookId));
  }, [workbookId, dispatch]);

  useEffect(() => {
    if (tableStructure) {
      if (searchTerm) {
        const filtered = filterTree(tableStructure, searchTerm.toLowerCase());
        setFilteredData(filtered);
      } else {
        setFilteredData(tableStructure);
      }
    }
  }, [tableStructure, searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (tableStructure) {
      if (term === '') {
        setFilteredData(tableStructure);
      } else {
        const filtered = filterTree(tableStructure, term.toLowerCase());
        setFilteredData(filtered);
      }
    }
  };

  const filterTree = (nodes: ApiResponse[], term: string): ApiResponse[] => {
    return nodes
      .map((node) => {
        const matches =
          node.label.toLowerCase().includes(term) ||
          (node.children && filterTree(node.children, term).length > 0);

        if (matches) {
          return {
            ...node,
            children: node.children ? filterTree(node.children, term) : [],
          };
        }
        return null;
      })
      .filter((node): node is ApiResponse => node !== null);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center p-4">Loading structure...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!tableStructure) {
    return <div className="p-4">No structure data available</div>;
  }
  console.log(filteredData, 'filteredData');
  return (
    <div className="flex flex-col h-full">
      <div className="flex-none">
        <div className="flex mb-4">
          <div
            className="relative mr-2"
            id="total-rows-tooltip"
          >
            <Database
              className="text-blue-500 cursor-pointer"
              size={32}
            />
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {totalCounts.totalCellCount}
            </span>
          </div>

          <div
            className="relative mr-2"
            id="changed-rows-tooltip"
          >
            <Save
              className="text-orange-500 cursor-pointer"
              size={32}
            />
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {changedRows.length}
            </span>
          </div>

          <div
            className="relative mr-2"
            id="invalid-cells-tooltip"
          >
            <AlertTriangle
              className="text-red-500 cursor-pointer"
              size={32}
            />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {selectedSheet.invalidcount || 0}
            </span>
          </div>

          <ReactTooltip
            anchorId="total-rows-tooltip"
            content="Persisted Cells"
            place="top"
            className="z-50"
          />
          <ReactTooltip
            anchorId="changed-rows-tooltip"
            content="Unsaved Cells"
            place="top"
            className="z-50"
          />
          <ReactTooltip
            anchorId="invalid-cells-tooltip"
            content="Invalid Cells"
            place="top"
            className="z-50"
          />
        </div>

        <div className="mb-4">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        {filteredData.length > 0 ? (
          <Tree
            data={filteredData}
            workbookId={workbookId}
          />
        ) : (
          <div className="text-gray-500 p-4">
            {searchTerm ? 'No matching items found' : 'No data available'}
          </div>
        )}
      </div>
    </div>
  );
};

export default StructureTab;
