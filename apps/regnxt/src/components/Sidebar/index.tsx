import {useEffect, useRef, useState} from 'react';
import {NavLink, useLocation} from 'react-router-dom';

import {cn} from '@/lib/utils';
import * as Icons from 'lucide-react';
import {LucideIcon} from 'lucide-react';

import SidebarLinkGroup from './SidebarLinkGroup';

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
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  selectedApp: string;
}

interface SidebarLinkProps {
  link: NavigationLink;
  sidebarCollapsed: boolean;
  pathname: string;
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
}

interface SidebarSectionProps {
  section: NavigationSection;
  sidebarCollapsed: boolean;
  pathname: string;
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
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
          {
            path: '/orchestra/configuration',
            icon: 'Settings',
            label: 'Configuration',
            dropdownItems: [
              {path: '/orchestra/configuration/dataset', label: 'Configure Datasets'},
              {path: '/orchestra/configuration/groups', label: 'Configure Groups'},
            ],
          },
          {path: '/orchestra/data', icon: 'Database', label: 'Data'},
          {path: '/orchestra/relationships', icon: 'GitBranch', label: 'Relationships'},
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

const SidebarLink: React.FC<SidebarLinkProps> = ({
  link,
  sidebarCollapsed,
  pathname,
  sidebarExpanded,
  setSidebarExpanded,
}) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const Icon: LucideIcon = Icons[link.icon] as LucideIcon;
  const isDropdown = link.dropdownItems && link.dropdownItems.length > 0;

  const isChildActive =
    isDropdown &&
    link.dropdownItems?.some((item) => currentPath === item.path || currentPath.startsWith(item.path));

  const isCurrentActive = currentPath === link.path || currentPath.startsWith(link.path);

  const isActive = isCurrentActive || isChildActive;

  if (isDropdown) {
    return (
      <SidebarLinkGroup
        activeCondition={isActive}
        sidebarCollapsed={sidebarCollapsed}
      >
        {(handleClick: () => void, open: boolean) => (
          <>
            <NavLink
              to={link.path}
              className={cn(
                'group relative flex items-center gap-2.5 rounded-sm font-medium text-white duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4',
                {
                  'bg-graydark dark:bg-meta-4': isActive,
                  'justify-center': sidebarCollapsed,
                  'py-2 px-4': !sidebarCollapsed,
                }
              )}
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                sidebarExpanded ? handleClick() : setSidebarExpanded(true);
              }}
            >
              <Icon
                size={20}
                strokeWidth={1.5}
              />
              {!sidebarCollapsed && (
                <>
                  {link.label}
                  <svg
                    className={cn('absolute right-4 top-1/2 -translate-y-1/2 fill-current', {
                      'rotate-180': open,
                    })}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                      fill=""
                    />
                  </svg>
                </>
              )}
            </NavLink>
            {!sidebarCollapsed && open && (
              <div className="translate transform overflow-hidden">
                <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                  {link?.dropdownItems?.map((item, index) => (
                    <li key={index}>
                      <NavLink
                        to={item.path}
                        className={({isActive: itemIsActive}) =>
                          cn(
                            'group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-gray-400 duration-300 ease-in-out hover:text-white',
                            {
                              '!text-white': itemIsActive || currentPath.startsWith(item.path),
                            }
                          )
                        }
                      >
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </SidebarLinkGroup>
    );
  }

  return (
    <li>
      <NavLink
        to={link.path}
        className={({isActive: navIsActive}) =>
          cn(
            'group relative flex items-center gap-2.5 rounded-sm font-medium text-white duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4',
            {
              'bg-graydark dark:bg-meta-4': navIsActive || currentPath.startsWith(link.path),
              'justify-center': sidebarCollapsed,
              'py-2 px-4': !sidebarCollapsed,
            }
          )
        }
      >
        <Icon
          size={20}
          strokeWidth={1.5}
        />
        {!sidebarCollapsed && <span>{link.label}</span>}
      </NavLink>
    </li>
  );
};

const SidebarSection: React.FC<SidebarSectionProps> = ({
  section,
  sidebarCollapsed,
  pathname,
  sidebarExpanded,
  setSidebarExpanded,
}) => (
  <div>
    <h3 className="mb-4 ml-4 text-sm font-semibold text-gray-400">{!sidebarCollapsed && section.title}</h3>
    <ul className="mb-6 flex flex-col gap-1.5">
      {section.links.map((link, index) => (
        <SidebarLink
          key={index}
          link={link}
          sidebarCollapsed={sidebarCollapsed}
          pathname={pathname}
          sidebarExpanded={sidebarExpanded}
          setSidebarExpanded={setSidebarExpanded}
        />
      ))}
    </ul>
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({sidebarOpen, setSidebarOpen, sidebarCollapsed, selectedApp}) => {
  const location = useLocation();
  const {pathname} = location;

  const trigger = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLElement>(null);

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true'
  );

  useEffect(() => {
    const clickHandler = ({target}: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target as Node) ||
        trigger.current.contains(target as Node)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({keyCode}: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${sidebarCollapsed ? 'lg:w-20' : ''}`}
    >
      <div
        className={`flex items-center px-6 py-5.5 lg:py-6.5 my-6 ${
          sidebarCollapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        <NavLink
          to="/"
          className={sidebarCollapsed ? 'w-full flex justify-center' : 'w-full'}
        >
          {sidebarCollapsed ? (
            <img
              src="/vite.svg"
              alt="R"
              className="h-10 w-10"
            />
          ) : (
            <img
              src="/white-logo.svg"
              alt="RegNxt"
              className="h-14 w-auto px-6"
            />
          )}
        </NavLink>
        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <Icons.ArrowRight
            size={20}
            strokeWidth={1.5}
          />
        </button>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          {navigationConfig[selectedApp]?.sections.map((section, index) => (
            <SidebarSection
              key={index}
              section={section}
              sidebarCollapsed={sidebarCollapsed}
              pathname={pathname}
              sidebarExpanded={sidebarExpanded}
              setSidebarExpanded={setSidebarExpanded}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
