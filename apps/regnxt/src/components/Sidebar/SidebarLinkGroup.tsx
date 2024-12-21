import {ReactNode, useState} from 'react';

interface SidebarLinkGroupProps {
  children: (handleClick: () => void, open: boolean) => ReactNode;
  activeCondition?: boolean;
  sidebarCollapsed: boolean;
}

const SidebarLinkGroup = ({children, activeCondition, sidebarCollapsed}: SidebarLinkGroupProps) => {
  const [open, setOpen] = useState<boolean>(activeCondition);

  const handleClick = () => {
    setOpen(!open);
  };

  return <li>{children(handleClick, open && !sidebarCollapsed)}</li>;
};

export default SidebarLinkGroup;
