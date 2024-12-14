import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useEffect, useState } from "react";

interface Column {
  column_name: string;
  data_type: string;
  description: string;
  is_primary_key: boolean;
}

interface Node {
  id: string;
  data: {
    label: string;
    columns: Column[];
  };
}

interface ColumnSelectionModalProps {
  sourceNode: Node;
  targetNode: Node;
  onClose: () => void;
  onSelect: (
    sourceColumn: string,
    targetColumn: string,
    sourceCardinality: string,
    targetCardinality: string
  ) => void;
  initialSourceColumn?: string;
  initialTargetColumn?: string;
  initialSourceCardinality?: string;
  initialTargetCardinality?: string;
}

const ColumnSelectionModal: React.FC<ColumnSelectionModalProps> = ({
  sourceNode,
  targetNode,
  onClose,
  onSelect,
  initialSourceColumn,
  initialTargetColumn,
  initialSourceCardinality,
  initialTargetCardinality,
}) => {
  const [sourceColumn, setSourceColumn] = useState(initialSourceColumn || "");
  const [targetColumn, setTargetColumn] = useState(initialTargetColumn || "");
  const [sourceCardinality, setSourceCardinality] = useState(
    initialSourceCardinality || "1"
  );
  const [targetCardinality, setTargetCardinality] = useState(
    initialTargetCardinality || "1"
  );

  useEffect(() => {
    setSourceColumn(initialSourceColumn || "");
    setTargetColumn(initialTargetColumn || "");
    setSourceCardinality(initialSourceCardinality || "1");
    setTargetCardinality(initialTargetCardinality || "1");
  }, [
    initialSourceColumn,
    initialTargetColumn,
    initialSourceCardinality,
    initialTargetCardinality,
  ]);

  const handleSubmit = () => {
    onSelect(sourceColumn, targetColumn, sourceCardinality, targetCardinality);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Relationship</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="sourceColumn" className="text-right">
              Source Column
            </label>
            <Select value={sourceColumn} onValueChange={setSourceColumn}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select source column" />
              </SelectTrigger>
              <SelectContent>
                {sourceNode.data.columns.map((column) => (
                  <SelectItem
                    key={column.column_name}
                    value={column.column_name}
                  >
                    {column.column_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="targetColumn" className="text-right">
              Target Column
            </label>
            <Select value={targetColumn} onValueChange={setTargetColumn}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select target column" />
              </SelectTrigger>
              <SelectContent>
                {targetNode.data.columns.map((column) => (
                  <SelectItem
                    key={column.column_name}
                    value={column.column_name}
                  >
                    {column.column_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="sourceCardinality" className="text-right">
              Source Cardinality
            </label>
            <Select
              value={sourceCardinality}
              onValueChange={setSourceCardinality}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select source cardinality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="0..1">0..1</SelectItem>
                <SelectItem value="*">*</SelectItem>
                <SelectItem value="1..*">1..*</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="targetCardinality" className="text-right">
              Target Cardinality
            </label>
            <Select
              value={targetCardinality}
              onValueChange={setTargetCardinality}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select target cardinality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="0..1">0..1</SelectItem>
                <SelectItem value="*">*</SelectItem>
                <SelectItem value="1..*">1..*</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSubmit}>Create Relationship</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnSelectionModal;
