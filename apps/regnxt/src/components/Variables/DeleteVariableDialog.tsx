import React, {useState} from 'react';

import {Button} from '@rn/ui/components/ui/button';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@rn/ui/components/ui/dialog';

interface DeleteVariableDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  variable: {
    variable_id: number;
    name: string;
  } | null;
  onConfirm: () => Promise<void>;
}

const DeleteVariableDialog: React.FC<DeleteVariableDialogProps> = ({
  isOpen,
  onOpenChange,
  variable,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!variable || isDeleting) return;

    try {
      setIsDeleting(true);
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete Variable</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to delete variable "{variable?.name}"? This action cannot be undone.</p>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteVariableDialog;
