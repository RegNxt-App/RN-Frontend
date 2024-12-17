/* eslint-disable react-hooks/exhaustive-deps */
import { SharedDataTable } from "@/components/SharedDataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { fastApiInstance } from "@/lib/axios";
import { ColumnDef } from "@tanstack/react-table";
import React, { useEffect, useState } from "react";
import GenericComboBox from "../ComboBox";

interface Group {
  code: string;
  label: string;
  description: string;
  is_system_generated: boolean;
}

interface GroupItem {
  dataset_code: string;
  dataset_version_id: string;
  order: number;
  is_system_generated: boolean;
}

interface DatasetVersion {
  version_nr: string;
  dataset_id: string;
  dataset_version_id: string;
  version_code: string;
  code: string;
  label: string;
  description: string;
}

interface GroupItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
}

export const GroupItemsModal: React.FC<GroupItemsModalProps> = ({
  isOpen,
  onClose,
  group,
}) => {
  const [items, setItems] = useState<GroupItem[]>([]);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<GroupItem>>({
    dataset_version_id: "",
    order: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchGroupItems();
    }
  }, [isOpen, group.code]);

  const fetchGroupItems = async () => {
    try {
      const response = await fastApiInstance.get(
        `/api/v1/groups/${group.code}/items/`
      );
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching group items:", error);
    }
  };

  const calculateNextOrder = () => {
    if (items.length === 0) return 1;
    return Math.max(...items.map((item) => item.order)) + 1;
  };

  const handleAddItem = async () => {
    try {
      if (!newItem.dataset_version_id) {
        toast({
          title: "Error",
          description: "Please select a dataset.",
          variant: "destructive",
        });
        return;
      }

      const itemToAdd = {
        dataset_version_id: newItem.dataset_version_id,
        order: calculateNextOrder(),
      };

      await fastApiInstance.post(
        `/api/v1/groups/${group.code}/add_item/`,
        itemToAdd
      );
      await fetchGroupItems();
      toast({ title: "Success", description: "Item added successfully." });
      setIsAddItemModalOpen(false);
      setNewItem({ dataset_version_id: "", order: 0 });
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = async (datasetVersionId: string) => {
    try {
      await fastApiInstance.delete(
        `/api/v1/groups/${group.code}/remove_item/`,
        {
          data: { dataset_version_id: datasetVersionId },
        }
      );
      await fetchGroupItems();
      toast({ title: "Success", description: "Item removed successfully." });
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDatasetSelect = (dataset: DatasetVersion) => {
    setNewItem({
      ...newItem,
      dataset_version_id: dataset.dataset_version_id.toString(),
    });
  };

  const columns: ColumnDef<GroupItem>[] = [
    { accessorKey: "dataset_code", header: "Dataset Code" },
    { accessorKey: "order", header: "Order" },
    {
      accessorKey: "is_system_generated",
      header: "System Generated",
      cell: ({ row }) => (row.getValue("is_system_generated") ? "Yes" : "No"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleRemoveItem(row.original.dataset_version_id)}
          disabled={row.original.is_system_generated}
        >
          Remove
        </Button>
      ),
    },
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Items for Group: {group.label}</DialogTitle>
          </DialogHeader>
          <SharedDataTable
            data={items}
            columns={columns}
            onRowClick={() => {}}
            showPagination={true}
          />
          <Button onClick={() => setIsAddItemModalOpen(true)}>Add Item</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddItemModalOpen} onOpenChange={setIsAddItemModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dataset_code" className="text-right">
                Dataset
              </Label>
              <div className="col-span-3">
                <GenericComboBox
                  apiEndpoint="/api/v1/datasets/"
                  placeholder="Select a Dataset"
                  onSelect={handleDatasetSelect as any}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
