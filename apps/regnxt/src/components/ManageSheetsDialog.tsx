import React, {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {Dialog} from '@headlessui/react';
import {Plus, X} from 'lucide-react';

import {fetchTableStructure} from '../features/sheetData/sheetDataSlice';
import Api from '../utils/Api';

interface Member {
  regulatorId: number;
  id: number;
  domainId: number;
  code: string;
  name: string;
  isDefault: boolean;
}

interface SheetMember {
  structureId: number;
  structureLabel: string;
  members: Member[];
}

interface ManageSheetsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workbookId: number;
  tableId: number;
}

interface SheetPayload {
  WorkbookId: number;
  TableId: number;
  MemberId1: number;
  MemberId2: number;
}

const ManageSheetsDialog: React.FC<ManageSheetsDialogProps> = ({isOpen, onClose, workbookId, tableId}) => {
  const dispatch = useDispatch();
  const [sheetMembers, setSheetMembers] = useState<SheetMember[]>([]);
  const [selectedSheets, setSelectedSheets] = useState<{member1: string; member2: string}[]>([
    {member1: '', member2: ''},
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSheetMembers = async () => {
      try {
        setIsLoading(true);
        const response = await Api.get<SheetMember[]>(
          `/RI/Workbook/SheetMember?workbookId=${workbookId}&tableId=${tableId}`
        );
        setSheetMembers(response.data);
        setSelectedSheets([{member1: '', member2: ''}]);
      } catch (error) {
        console.error('Error fetching sheet members:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchSheetMembers();
    }
  }, [isOpen, workbookId, tableId]);

  const handleAddSheet = () => {
    setSelectedSheets([...selectedSheets, {member1: '', member2: ''}]);
  };

  const handleSheetChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    index: number,
    memberType: 'member1' | 'member2'
  ) => {
    const newSelectedSheets = [...selectedSheets];
    newSelectedSheets[index] = {
      ...newSelectedSheets[index],
      [memberType]: e.target.value,
    };
    setSelectedSheets(newSelectedSheets);
  };

  const handleCreateSheet = async () => {
    try {
      const validSheets = selectedSheets.filter((sheet) =>
        sheetMembers.length === 1 ? sheet.member1 : sheet.member1 && sheet.member2
      );

      if (validSheets.length === 0) return;

      setIsLoading(true);

      const payload: SheetPayload[] = validSheets.map((sheet) => ({
        WorkbookId: workbookId,
        TableId: tableId,
        MemberId1: parseInt(sheet.member1),
        MemberId2: sheetMembers.length > 1 ? parseInt(sheet.member2) : 0,
      }));

      console.log('Creating sheets with payload:', payload);

      const response = await Api.post('/RI/Workbook/sheet', payload);

      if (response.status === 200) {
        console.log('Sheets created successfully');
        await dispatch(fetchTableStructure(workbookId)).unwrap();
        onClose();
      } else {
        console.error('Failed to create sheets:', response);
      }
    } catch (error) {
      console.error('Error creating sheets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{zIndex: 10001}}
    >
      <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-slate-50 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <Dialog.Title className="text-lg font-medium">Manage Sheets</Dialog.Title>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {selectedSheets.map((selectedSheet, index) => (
            <div
              key={index}
              className={`flex gap-4 ${sheetMembers.length > 1 ? 'flex-row' : 'flex-col'}`}
            >
              {/* First Select Field */}
              <div className={`space-y-2 ${sheetMembers.length > 1 ? 'w-1/2' : 'w-full'}`}>
                <label className="block text-sm font-medium text-gray-700">
                  {sheetMembers[0]?.structureLabel || 'Select first dimension'}
                </label>
                <div className="relative">
                  <select
                    value={selectedSheet.member1}
                    onChange={(e) => handleSheetChange(e, index, 'member1')}
                    disabled={isLoading}
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select a value...</option>
                    {sheetMembers[0]?.members.map((member) => (
                      <option
                        key={member.id}
                        value={member.id}
                      >
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Second Select Field - Only show if there's a second sheet member */}
              {sheetMembers.length > 1 && (
                <div className="space-y-2 w-1/2">
                  <label className="block text-sm font-medium text-gray-700">
                    {sheetMembers[1]?.structureLabel || 'Select second dimension'}
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSheet.member2}
                      onChange={(e) => handleSheetChange(e, index, 'member2')}
                      disabled={isLoading}
                      className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select a value...</option>
                      {sheetMembers[1]?.members.map((member) => (
                        <option
                          key={member.id}
                          value={member.id}
                        >
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={handleAddSheet}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            <Plus size={16} />
            Add
          </button>
          <button
            onClick={handleCreateSheet}
            disabled={
              isLoading ||
              selectedSheets.every((sheet) =>
                sheetMembers.length === 1 ? !sheet.member1 : !sheet.member1 || !sheet.member2
              )
            }
            className="w-32 inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {isLoading ? 'Loading...' : 'Create Sheet'}
          </button>
        </div>
      </Dialog.Panel>
    </div>
  );
};

export default ManageSheetsDialog;
