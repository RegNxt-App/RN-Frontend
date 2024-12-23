import {useState} from 'react';

import {Button} from '@/components/ui/button';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';

import UpdateTemplateModel from '../CModels/TemplateModels/UpdateTemplateModel';

interface TemplateData {
  id: number;
  name: string;
  reportGroupId: number;
  reportGroupCode: string;
  reportSetId: number;
  reportSetCode: string;
  reportSubsetId: number;
  reportSubsetCode: string;
}

interface DataTableProps {
  data: TemplateData[];
  onDataChange: () => void;
}

const TemplateTable = ({data, onDataChange}: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TemplateData | null>(null);

  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / pageSize);

  const handleEditClick = (record: TemplateData) => {
    setSelectedRecord(record);
    setIsUpdateModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Id</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Report Group</TableHead>
            <TableHead>Report Set</TableHead>
            <TableHead>Report Subset</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.name || 'N/A'}</TableCell>
              <TableCell>{item.reportGroupCode}</TableCell>
              <TableCell>{item.reportSetCode}</TableCell>
              <TableCell>{item.reportSubsetCode}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  className="text-blue-600 hover:text-blue-800 p-0 h-auto font-normal"
                  onClick={() => handleEditClick(item)}
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, data.length)} of {data.length} entries
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 50, 100].map((size) => (
                  <SelectItem
                    key={size}
                    value={size.toString()}
                  >
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              {'<<'}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage((current) => Math.max(1, current - 1))}
              disabled={currentPage === 1}
            >
              {'<'}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage((current) => Math.min(totalPages, current + 1))}
              disabled={currentPage === totalPages}
            >
              {'>'}
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              {'>>'}
            </Button>
          </div>
        </div>
      </div>

      {selectedRecord && (
        <UpdateTemplateModel
          existingData={selectedRecord}
          onClose={() => setIsUpdateModalOpen(false)}
          onUpdate={onDataChange}
          isOpen={isUpdateModalOpen}
        />
      )}
    </div>
  );
};

export default TemplateTable;
