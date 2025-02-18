import {useNavigate} from 'react-router-dom';

import {Edit, Trash2} from 'lucide-react';

import {Button} from '@rn/ui/components/ui/button';

import {TooltipWrapper} from '../TooltipWrapper';

interface ActionButtonsProps {
  connection: {
    id: number;
    name: string;
    is_system_generated: boolean;
  };
  onDeleteClick: (connection: {id: number; name: string}) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({connection, onDeleteClick}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2">
      <TooltipWrapper
        disabled={connection.is_system_generated}
        disabledMessage="System generated connections cannot be edited"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/orchestra/connections/edit/${connection.id}`)}
          className="h-8 w-8"
          disabled={connection.is_system_generated}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </TooltipWrapper>

      <TooltipWrapper
        disabled={connection.is_system_generated}
        disabledMessage="System generated connections cannot be deleted"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDeleteClick({id: connection.id, name: connection.name})}
          className="h-8 w-8 text-destructive hover:text-destructive"
          disabled={connection.is_system_generated}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TooltipWrapper>
    </div>
  );
};

export default ActionButtons;
