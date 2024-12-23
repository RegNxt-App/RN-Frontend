import * as React from 'react';
import {NavLink, useLocation, useNavigate} from 'react-router-dom';

import {useAuth} from '@/contexts/AuthContext';
import {cn} from '@/lib/utils';
import * as Icons from 'lucide-react';
import {ChevronDown, ChevronLeft, ChevronRight, LogOut, Settings} from 'lucide-react';

import {Avatar, AvatarFallback, AvatarImage} from '@rn/ui/components/ui/avatar';
import {Button} from '@rn/ui/components/ui/button';
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from '@rn/ui/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@rn/ui/components/ui/dialog';
import {Separator} from '@rn/ui/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
} from '@rn/ui/components/ui/sidebar';

interface DropdownItem {
  path: string;
  label: string;
}

interface NavigationLink {
  path: string;
  icon: keyof typeof Icons;
  label: string;
  dropdownItems?: DropdownItem[];
}

interface NavigationSection {
  title: string;
  links: NavigationLink[];
}

interface NavigationConfig {
  [key: string]: {
    sections: NavigationSection[];
  };
}

interface SidebarProps {
  sidebarOpen: boolean;

  setSidebarCollapsed: (open: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  selectedApp: string;
}

const navigationConfig: NavigationConfig = {
  reporting: {
    sections: [
      {
        title: 'Management Reports',
        links: [
          {path: '/', icon: 'LayoutDashboard', label: 'My Dashboard'},
          {path: '/reporting/overview', icon: 'TableOfContents', label: 'Overview'},
        ],
      },
      {
        title: 'Foundation Data Layer',
        links: [
          {
            path: '/reporting/accounting-layer',
            icon: 'ChartArea',
            label: 'Accounting Layer',
            dropdownItems: [
              {path: '/reporting/post-unpost', label: 'Post/Unpost'},
              {path: '/reporting/view-balance', label: 'View Balance'},
              {path: '/reporting/accounting-configuration', label: 'Configuration'},
            ],
          },
          {
            path: '/reporting/transaction-layer',
            icon: 'BadgeDollarSign',
            label: 'Transaction Layer',
            dropdownItems: [{path: '/reporting/transaction-layer', label: 'Transaction Layer 1'}],
          },
          {path: '/reporting/reconciliations', icon: 'MonitorCog', label: 'Reconciliations'},
        ],
      },
      {
        title: 'Regulatory Reports',
        links: [
          {path: '/reporting/reports-overview', icon: 'TableOfContents', label: 'Overview'},
          {
            path: '/reporting/configuration',
            icon: 'Cog',
            label: 'Configuration',
            dropdownItems: [
              {path: '/reporting/entity', label: 'Entity'},
              {path: '/reporting/template', label: 'Template'},
              {path: '/reporting/regulatory-calender', label: 'Regulatory Calender'},
              {path: '/reporting/validation', label: 'Validation'},
            ],
          },
          {path: '/reporting/inspect', icon: 'ZoomIn', label: 'Inspect'},
        ],
      },
    ],
  },
  orchestra: {
    sections: [
      {
        title: 'Orchestra Dashboard',
        links: [
          {path: '/orchestra/connections', icon: 'Cable', label: 'Connections'},
          {path: '/orchestra/variables', icon: 'BookA', label: 'Variables'},
          {path: '/orchestra/datasets', icon: 'HardDrive', label: 'Datasets'},
          {path: '/orchestra/dataviews', icon: 'Telescope', label: 'Dataviews'},
          {path: '/orchestra/data-loaders', icon: 'DatabaseBackup', label: 'Data Loaders'},
          {path: '/orchestra/tasks', icon: 'ListTodo', label: 'Tasks'},
          {path: '/orchestra/workflows', icon: 'Workflow', label: 'Workflows'},
          {path: '/orchestra/monitoring', icon: 'View', label: 'Monitoring'},
        ],
      },
      {
        title: 'Business Logic',
        links: [
          {
            path: '/orchestra/data',
            icon: 'Database',
            label: 'Data',
            dropdownItems: [{path: '/orchestra/data', label: 'Data 1'}],
          },
          {
            path: '/orchestra/business-rules',
            icon: 'Handshake',
            label: 'Business Rules',
            dropdownItems: [{path: '/orchestra/business-rules', label: 'Business 1'}],
          },
          {
            path: '/orchestra/processing',
            icon: 'LoaderPinwheel',
            label: 'Processing',
            dropdownItems: [{path: '/orchestra/processing', label: 'Process 1'}],
          },
        ],
      },
    ],
  },
  bird: {
    sections: [
      {
        title: 'Bird Dashboard',
        links: [
          {
            path: '/bird/configuration',
            icon: 'Settings',
            label: 'Configuration',
            dropdownItems: [
              {path: '/bird/configuration/dataset', label: 'Configure Datasets'},
              {path: '/bird/configuration/groups', label: 'Configure Groups'},
            ],
          },
          {path: '/bird/data', icon: 'Database', label: 'Data'},
          {path: '/bird/relationships', icon: 'GitBranch', label: 'Relationships'},
        ],
      },
    ],
  },
};

const SidebarComponent: React.FC<SidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
  selectedApp,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {logout, user} = useAuth();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = React.useState(false);
  const [currentApp, setCurrentApp] = React.useState(selectedApp);

  const handleAppChange = (app: string) => {
    setCurrentApp(app);
    switch (app) {
      case 'reporting':
        navigate('/');
        break;
      case 'orchestra':
        navigate('/orchestra/connections');
        break;
      case 'bird':
        navigate('/bird/data');
        break;
    }
  };

  return (
    <div className="relative z-50">
      <SidebarProvider>
        <Sidebar
          className={cn(
            'fixed left-0 top-0 min-h-screen border-r border-border bg-background transition-all duration-300 ease-in-out',
            sidebarCollapsed ? 'w-16' : 'w-[280px]'
          )}
        >
          <SidebarHeader className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed ? (
                <img
                  src="/white-logo.svg"
                  alt="RegNxt"
                  className="h-14 w-auto dark:brightness-0 dark:invert"
                />
              ) : (
                <img
                  src="/vite.svg"
                  alt="R"
                  className="mx-auto h-8 w-8 dark:brightness-0 dark:invert"
                />
              )}
            </div>

            <div className={cn('mt-4 flex gap-2', sidebarCollapsed ? 'flex-col items-center' : '')}>
              {['reporting', 'orchestra', 'bird'].map((app) => (
                <Button
                  size="icon"
                  key={app}
                  variant={currentApp === app ? 'default' : 'ghost'}
                  className={cn(
                    'justify-center px-8',
                    sidebarCollapsed ? 'w-10 justify-center p-0' : 'flex-1 '
                  )}
                  onClick={() => handleAppChange(app)}
                  title={sidebarCollapsed ? app.charAt(0).toUpperCase() + app.slice(1) : undefined}
                >
                  <span
                    className={cn('transition-all duration-200', sidebarCollapsed ? 'scale-75' : 'scale-100')}
                  >
                    {sidebarCollapsed
                      ? app.charAt(0).toUpperCase()
                      : app.charAt(0).toUpperCase() + app.slice(1)}
                  </span>
                </Button>
              ))}
            </div>
          </SidebarHeader>

          <SidebarContent className="flex-grow overflow-y-auto">
            {navigationConfig[currentApp]?.sections.map((section, index) => (
              <Collapsible
                key={index}
                defaultOpen
              >
                <SidebarGroup>
                  {!sidebarCollapsed && (
                    <CollapsibleTrigger className="w-full">
                      <SidebarGroupLabel className="flex items-center justify-between px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
                        {section.title}
                        <ChevronDown className="h-4 w-4" />
                      </SidebarGroupLabel>
                    </CollapsibleTrigger>
                  )}
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {section.links.map((item, itemIndex) => (
                          <SidebarMenuItem key={itemIndex}>
                            <SidebarMenuButton asChild>
                              <NavLink
                                to={item.path}
                                className={({isActive}) =>
                                  cn(
                                    'flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition-all hover:bg-accent',
                                    isActive
                                      ? 'bg-accent font-medium text-accent-foreground'
                                      : 'text-foreground/70 hover:text-accent-foreground',
                                    sidebarCollapsed && 'justify-center px-2'
                                  )
                                }
                                title={sidebarCollapsed ? item.label : undefined}
                              >
                                {React.createElement(Icons[item.icon as keyof typeof Icons], {
                                  className: cn('h-4 w-4', sidebarCollapsed && 'h-5 w-5'),
                                })}
                                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                              </NavLink>
                            </SidebarMenuButton>
                            {!sidebarCollapsed && item.dropdownItems && (
                              <SidebarMenuSub>
                                {item.dropdownItems.map((subItem, subIndex) => (
                                  <SidebarMenuSubItem key={subIndex}>
                                    <SidebarMenuSubButton asChild>
                                      <NavLink
                                        to={subItem.path}
                                        className={({isActive}) =>
                                          cn(
                                            'block rounded-lg px-8 py-2 text-sm transition-all hover:bg-accent',
                                            isActive
                                              ? 'bg-accent font-medium text-accent-foreground'
                                              : 'text-foreground/70 hover:text-accent-foreground'
                                          )
                                        }
                                      >
                                        <span className="truncate">{subItem.label}</span>
                                      </NavLink>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            )}
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            ))}
          </SidebarContent>

          <SidebarFooter className="border-t border-border p-4">
            <div className={cn('flex flex-col gap-4', sidebarCollapsed ? 'items-center' : '')}>
              <Button
                variant="ghost"
                className={cn('justify-start', sidebarCollapsed ? 'w-10 justify-center p-0' : '')}
                asChild
              >
                <NavLink
                  to="/settings"
                  className="flex items-center"
                >
                  <Settings className="h-4 w-4" />
                  {!sidebarCollapsed && <span className="ml-2 truncate">Settings</span>}
                </NavLink>
              </Button>
              <Separator />
              <div className={cn('flex items-center gap-4', sidebarCollapsed ? 'flex-col' : '')}>
                <Avatar>
                  <AvatarImage
                    //  src={user?.avatar}
                    alt={user?.firstName}
                  />
                  <AvatarFallback>{user?.firstName?.charAt(0)}</AvatarFallback>
                </Avatar>
                {!sidebarCollapsed && (
                  <div className="flex flex-1 flex-col">
                    <span className="truncate text-sm font-medium">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsLogoutDialogOpen(true)}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SidebarFooter>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute right-[-12px] top-6 z-50 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-md transition-all hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          <SidebarRail />
        </Sidebar>
      </SidebarProvider>

      {/* Logout Dialog */}
      <Dialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>Are you sure you want to log out of the system?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLogoutDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await logout();
                setIsLogoutDialogOpen(false);
                navigate('/auth/login');
              }}
            >
              Log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SidebarComponent;
