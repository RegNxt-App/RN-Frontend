import { GroupFormModal } from "@/components/configurations/GroupFormModal";
import { GroupItemsModal } from "@/components/configurations/GroupItemsModal";
import { SharedDataTable } from "@/components/SharedDataTable";
import { SharedColumnFilters } from "@/components/SharedFilters";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { fastApiInstance } from "@/lib/axios";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye, Plus, Trash } from "lucide-react";
import React, { useState } from "react";
import useSWR from "swr";
import { Skeleton } from "../ui/skeleton";

interface Group {
  code: string;
  label: string;
  description: string;
  is_system_generated: boolean;
  items: string;
}

interface GroupsResponse {
  count: number;
  num_pages: number;
  results: Group[];
}

interface Grouping {
  data: GroupsResponse;
}

export const ConfigureGrouping: React.FC = () => {
  const { toast } = useToast();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [columnFilters, setColumnFilters] = useState({
    code: "",
    label: "",
    group: "",
    type: "",
    description: "",
  });

  const {
    data: groupsResponse,
    mutate: mutateGroups,
    isLoading,
  } = useSWR<Grouping>("/api/v1/groups/", fastApiInstance);

  const handleCreateGroup = async (newGroup: Partial<Group>) => {
    try {
      await fastApiInstance.post("/api/v1/groups/", newGroup);
      await mutateGroups();
      setIsGroupModalOpen(false); // Close modal first
      toast({ title: "Success", description: "Group created successfully." });
    } catch (error: any) {
      setIsGroupModalOpen(false); // Close modal
      const errorMessage =
        error.response?.data?.error ||
        "Failed to create group. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleUpdateGroup = async (updatedGroup: Group) => {
    try {
      await fastApiInstance.put(
        `/api/v1/groups/${updatedGroup.code}/`,
        updatedGroup
      );
      await mutateGroups();
      toast({ title: "Success", description: "Group updated successfully." });
      setIsGroupModalOpen(false);
      setEditingGroup(null);
    } catch (error) {
      console.error("Error updating group:", error);
      toast({
        title: "Error",
        description: "Failed to update group. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGroup = async (groupCode: string) => {
    try {
      await fastApiInstance.delete(`/api/v1/groups/${groupCode}/`);
      await mutateGroups();
      toast({ title: "Success", description: "Group deleted successfully." });
    } catch (error) {
      console.error("Error deleting group:", error);
      toast({
        title: "Error",
        description: "Failed to delete group. Please try again.",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<Group>[] = [
    { accessorKey: "code", header: "Code" },
    { accessorKey: "label", header: "Label" },
    { accessorKey: "description", header: "Description" },
    {
      accessorKey: "is_system_generated",
      header: "System Generated",
      cell: ({ row }) => (row.getValue("is_system_generated") ? "Yes" : "No"),
    },
    {
      accessorKey: "items",
      header: "Items Count",
      cell: ({ row }) => {
        const items = JSON.parse(row.getValue("items") as string);
        return items.length;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingGroup(row.original);
                      setIsGroupModalOpen(true);
                    }}
                    disabled={row.original.is_system_generated}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {row.original.is_system_generated
                  ? "Cannot edit system-generated group"
                  : "Edit group"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteGroup(row.original.code)}
                    disabled={row.original.is_system_generated}
                    className="h-8 w-8 text-destructive hover:text-destructive/90"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {row.original.is_system_generated
                  ? "Cannot delete system-generated group"
                  : "Delete group"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedGroup(row.original);
                    setIsItemsModalOpen(true);
                  }}
                  className="h-8 w-8"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View group items</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Configure Groups</h2>

      <SharedColumnFilters
        filters={columnFilters}
        setFilter={(key, value) =>
          setColumnFilters((prev) => ({ ...prev, [key]: value }))
        }
      />

      <div className="mt-4 flex flex-row-reverse">
        <Button onClick={() => setIsGroupModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Group
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : groupsResponse && groupsResponse.data.results ? (
        <SharedDataTable
          data={groupsResponse.data.results}
          columns={columns}
          onRowClick={() => {}}
          showPagination={true}
        />
      ) : null}

      <GroupFormModal
        isOpen={isGroupModalOpen}
        onClose={() => {
          setIsGroupModalOpen(false);
          setEditingGroup(null);
        }}
        onSubmit={(group) => {
          if (editingGroup) {
            handleUpdateGroup({ ...editingGroup, ...group } as Group);
          } else {
            handleCreateGroup(group);
          }
        }}
        initialData={editingGroup || undefined}
      />

      {selectedGroup && (
        <GroupItemsModal
          isOpen={isItemsModalOpen}
          onClose={() => setIsItemsModalOpen(false)}
          group={selectedGroup}
        />
      )}
    </div>
  );
};
