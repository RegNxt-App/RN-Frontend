import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import SidebarLinkGroup from './SidebarLinkGroup';
import {
  ArrowRight,
  BadgeDollarSign,
  BookA,
  Cable,
  ChartArea,
  Cog,
  Database,
  DatabaseBackup,
  DatabaseZap,
  Handshake,
  HardDrive,
  LayoutDashboard,
  ListTodo,
  LoaderPinwheel,
  MonitorCog,
  TableOfContents,
  Telescope,
  Variable,
  View,
  Workflow,
  ZoomIn,
} from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
  sidebarCollapsed: boolean;
  selectedApp: string;
}

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  selectedApp,
}: SidebarProps) => {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true',
  );

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
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
  const renderSidebarContent = () => {
    switch (selectedApp) {
      case 'reporting':
        return (
          <>
            <div>
              <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
                {!sidebarCollapsed && 'Management Reports'}
              </h3>

              <ul className="mb-6 flex flex-col gap-1.5">
                <li>
                  <NavLink
                    to="/"
                    className={`group relative flex items-center gap-2.5 rounded-sm font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                      (pathname === '/' || pathname.includes('dashboard')) &&
                      'bg-graydark dark:bg-meta-4'
                    } ${sidebarCollapsed ? 'justify-center' : 'py-2 px-4'}`}
                  >
                    <LayoutDashboard size={20} strokeWidth={1.5} />
                    {!sidebarCollapsed && <span>My Dashboard</span>}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/reporting/overview"
                    className={`group relative flex items-center gap-2.5 rounded-sm font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                      pathname === '/reporting/overview' &&
                      'bg-graydark dark:bg-meta-4'
                    } ${sidebarCollapsed ? 'justify-center' : 'py-2 px-4'}`}
                  >
                    <TableOfContents size={20} strokeWidth={1.5} />
                    {!sidebarCollapsed && 'Overview'}
                  </NavLink>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
                {!sidebarCollapsed && 'Business Logic'}
              </h3>

              <ul className="mb-6 flex flex-col gap-1.5">
                <SidebarLinkGroup
                  activeCondition={
                    pathname === '/data' || pathname.includes('data')
                  }
                >
                  {(handleClick, open) => (
                    <>
                      <NavLink
                        to="/reporting/data"
                        className={`group relative flex items-center gap-2.5 rounded-sm font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                          (pathname === '/reporting/data' ||
                            pathname.includes('/reporting/data')) &&
                          'bg-graydark dark:bg-meta-4'
                        } ${sidebarCollapsed ? 'justify-center' : 'py-2 px-4'}`}
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded
                            ? handleClick()
                            : setSidebarExpanded(true);
                        }}
                      >
                        <Database size={20} strokeWidth={1.5} />
                        {!sidebarCollapsed && (
                          <>
                            Data
                            <svg
                              className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                                open && 'rotate-180'
                              }`}
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
                        <div className={`translate transform overflow-hidden`}>
                          <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                            <li>
                              <NavLink
                                to="/reporting/data"
                                className={({ isActive }) =>
                                  'group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ' +
                                  (isActive && '!text-white')
                                }
                              >
                                Data 1
                              </NavLink>
                            </li>
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </SidebarLinkGroup>

                <SidebarLinkGroup
                  activeCondition={
                    pathname === '/reporting/business-rules' ||
                    pathname.includes('/reporting/business-rules')
                  }
                >
                  {(handleClick, open) => (
                    <>
                      <NavLink
                        to="/reporting/business-rules"
                        className={`group relative flex items-center gap-2.5 rounded-sm font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                          (pathname === '/reporting/business-rules' ||
                            pathname.includes('/reporting/business-rules')) &&
                          'bg-graydark dark:bg-meta-4'
                        } ${sidebarCollapsed ? 'justify-center' : 'py-2 px-4'}`}
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded
                            ? handleClick()
                            : setSidebarExpanded(true);
                        }}
                      >
                        <Handshake size={20} strokeWidth={1.5} />
                        {!sidebarCollapsed && (
                          <>
                            Business Rules
                            <svg
                              className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                                open && 'rotate-180'
                              }`}
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
                        <div className={`translate transform overflow-hidden`}>
                          <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                            <li>
                              <NavLink
                                to="/reporting/business-rules"
                                className={({ isActive }) =>
                                  'group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ' +
                                  (isActive && '!text-white')
                                }
                              >
                                Business 1
                              </NavLink>
                            </li>
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </SidebarLinkGroup>

                <SidebarLinkGroup
                  activeCondition={
                    pathname === '/reporting/processing' ||
                    pathname.includes('/reporting/processing')
                  }
                >
                  {(handleClick, open) => (
                    <>
                      <NavLink
                        to="/reporting/processing"
                        className={`group relative flex items-center gap-2.5 rounded-sm font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                          (pathname === '/reporting/processing' ||
                            pathname.includes('/reporting/processing')) &&
                          'bg-graydark dark:bg-meta-4'
                        } ${sidebarCollapsed ? 'justify-center' : 'py-2 px-4'}`}
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded
                            ? handleClick()
                            : setSidebarExpanded(true);
                        }}
                      >
                        <LoaderPinwheel size={20} strokeWidth={1.5} />
                        {!sidebarCollapsed && (
                          <>
                            Processing
                            <svg
                              className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                                open && 'rotate-180'
                              }`}
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
                        <div className={`translate transform overflow-hidden`}>
                          <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                            <li>
                              <NavLink
                                to="/reporting/processing"
                                className={({ isActive }) =>
                                  'group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ' +
                                  (isActive && '!text-white')
                                }
                              >
                                Process 1
                              </NavLink>
                            </li>
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </SidebarLinkGroup>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
                {!sidebarCollapsed && 'Foundation Data Layer'}
              </h3>

              <ul className="mb-6 flex flex-col gap-1.5">
                <SidebarLinkGroup
                  activeCondition={
                    pathname === '/reporting/accounting-layer' ||
                    pathname.includes('/reporting/accounting-layer')
                  }
                >
                  {(handleClick, open) => (
                    <React.Fragment>
                      <NavLink
                        to="/reporting/accounting-layer"
                        className={`group relative flex items-center gap-2.5 rounded-sm font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                          (pathname === '/accounting-layer' ||
                            pathname.includes('accounting-layer')) &&
                          'bg-graydark dark:bg-meta-4'
                        }  ${sidebarCollapsed ? 'justify-center' : 'py-2 px-4'}`}
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded
                            ? handleClick()
                            : setSidebarExpanded(true);
                        }}
                      >
                        <ChartArea size={20} strokeWidth={1.5} />
                        {!sidebarCollapsed && 'Accounting Layer'}
                        <svg
                          className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                            open && 'rotate-180'
                          }`}
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
                      </NavLink>
                      <div
                        className={`translate transform overflow-hidden ${
                          !open && 'hidden'
                        }`}
                      >
                        <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                          <li>
                            <NavLink
                              to="/reporting/post-unpost"
                              className={({ isActive }) =>
                                'group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ' +
                                (isActive && '!text-white')
                              }
                            >
                              {!sidebarCollapsed && 'Post/Unpost'}
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/reporting/view-balance"
                              className={({ isActive }) =>
                                'group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ' +
                                (isActive && '!text-white')
                              }
                            >
                              {!sidebarCollapsed && 'View Balance'}
                            </NavLink>
                          </li>

                          <li>
                            <NavLink
                              to="/reporting/accounting-configuration"
                              className={({ isActive }) =>
                                'group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ' +
                                (isActive && '!text-white')
                              }
                            >
                              {!sidebarCollapsed && 'Configuration'}
                            </NavLink>
                          </li>
                        </ul>
                      </div>
                    </React.Fragment>
                  )}
                </SidebarLinkGroup>

                <SidebarLinkGroup
                  activeCondition={
                    pathname === '/reporting/forms' ||
                    pathname.includes('/reporting/forms')
                  }
                >
                  {(handleClick, open) => (
                    <React.Fragment>
                      <NavLink
                        to="/reporting/transaction-layer"
                        className={`group relative flex items-center gap-2.5 rounded-sm font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                          (pathname === '/reporting/transaction-layer' ||
                            pathname.includes(
                              '/reporting/transaction-layer',
                            )) &&
                          'bg-graydark dark:bg-meta-4'
                        }  ${sidebarCollapsed ? 'justify-center' : 'py-2 px-4'}`}
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded
                            ? handleClick()
                            : setSidebarExpanded(true);
                        }}
                      >
                        <BadgeDollarSign size={20} strokeWidth={1.5} />
                        {!sidebarCollapsed && 'Transaction Layer'}
                        <svg
                          className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                            open && 'rotate-180'
                          }`}
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
                      </NavLink>
                      <div
                        className={`translate transform overflow-hidden ${
                          !open && 'hidden'
                        }`}
                      >
                        <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                          <li>
                            <NavLink
                              to="/reporting/transaction-layer"
                              className={({ isActive }) =>
                                'group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ' +
                                (isActive && '!text-white')
                              }
                            >
                              {!sidebarCollapsed && 'Transaction Layer 1'}
                            </NavLink>
                          </li>
                        </ul>
                      </div>
                    </React.Fragment>
                  )}
                </SidebarLinkGroup>

                <li>
                  <NavLink
                    to="/reporting/reconciliations"
                    className={`group relative flex items-center gap-2.5 rounded-sm font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                      pathname === '/reporting/reconciliations' &&
                      'bg-graydark dark:bg-meta-4'
                    }  ${sidebarCollapsed ? 'justify-center' : 'py-2 px-4'}`}
                  >
                    <MonitorCog size={20} strokeWidth={1.5} />
                    {!sidebarCollapsed && 'Reconciliations'}
                  </NavLink>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
                {!sidebarCollapsed && 'Regulatory Reports'}
              </h3>

              <ul className="mb-6 flex flex-col gap-1.5">
                <li>
                  <NavLink
                    to="/reporting/reports-overview"
                    className={`group relative flex items-center gap-2.5 rounded-sm font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                      pathname === '/reporting/reports-overview' &&
                      'bg-graydark dark:bg-meta-4'
                    }  ${sidebarCollapsed ? 'justify-center' : 'py-2 px-4'}`}
                  >
                    <TableOfContents size={20} strokeWidth={1.5} />
                    {!sidebarCollapsed && 'Overview'}
                  </NavLink>
                </li>

                <SidebarLinkGroup
                  activeCondition={
                    pathname === '/reporting/forms' ||
                    pathname.includes('/reporting/forms')
                  }
                >
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <NavLink
                          to="/reporting/configuration"
                          className={`group relative flex items-center gap-2.5 rounded-sm font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                            (pathname === '/reporting/configuration' ||
                              pathname.includes('/reporting/configuration')) &&
                            'bg-graydark dark:bg-meta-4'
                          } ${sidebarCollapsed ? 'justify-center' : 'py-2 px-4'}`}
                          onClick={(e) => {
                            e.preventDefault();
                            sidebarExpanded
                              ? handleClick()
                              : setSidebarExpanded(true);
                          }}
                        >
                          <Cog size={20} strokeWidth={1.5} />
                          {!sidebarCollapsed && 'Configuration'}

                          <svg
                            className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                              open && 'rotate-180'
                            }`}
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
                        </NavLink>
                        {/* <!-- Dropdown Menu Start --> */}

                        <div
                          className={`translate transform overflow-hidden ${
                            !open && 'hidden'
                          }`}
                        >
                          <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                            <li>
                              <NavLink
                                to="/reporting/entity"
                                className={({ isActive }) =>
                                  'group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ' +
                                  (isActive && '!text-white')
                                }
                              >
                                Entity
                              </NavLink>
                            </li>
                            <li>
                              <NavLink
                                to="/reporting/template"
                                className={({ isActive }) =>
                                  'group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ' +
                                  (isActive && '!text-white')
                                }
                              >
                                Template
                              </NavLink>
                            </li>
                            <li>
                              <NavLink
                                to="/reporting/regulatory-calender"
                                className={({ isActive }) =>
                                  'group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ' +
                                  (isActive && '!text-white')
                                }
                              >
                                Regulatory Calender
                              </NavLink>
                            </li>
                            <li>
                              <NavLink
                                to="/reporting/validation"
                                className={({ isActive }) =>
                                  'group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ' +
                                  (isActive && '!text-white')
                                }
                              >
                                Validation
                              </NavLink>
                            </li>
                          </ul>
                        </div>
                        {/* <!-- Dropdown Menu End --> */}
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                <li>
                  <NavLink
                    to="/reporting/inspect"
                    className={`group relative flex items-center gap-2.5 rounded-sm font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                      pathname === '/reporting/inspect' &&
                      'bg-graydark dark:bg-meta-4'
                    } ${sidebarCollapsed ? 'justify-center' : 'py-2 px-4'}`}
                  >
                    <ZoomIn size={20} strokeWidth={1.5} />
                    {!sidebarCollapsed && 'Inspect'}
                  </NavLink>
                </li>
              </ul>
            </div>
          </>
        );
      case 'orchestra':
        return (
          <>
            <div>
              <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
                {!sidebarCollapsed && 'Orchestra Dashboard'}
              </h3>

              <ul className="mb-6 flex flex-col gap-1.5">
                <li>
                  <NavLink
                    to="/orchestra/connections"
                    className={`group relative flex items-center gap-2.5 rounded-sm font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                      (pathname === '/orchestra/connections' ||
                        pathname.includes('connections')) &&
                      'bg-graydark dark:bg-meta-4'
                    } ${sidebarCollapsed ? 'justify-center' : 'py-2 px-4'}`}
                  >
                    <Cable size={20} strokeWidth={1.5} />
                    {!sidebarCollapsed && <span>Connections</span>}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/orchestra/variables"
                    className={`group relative flex items-center gap-2.5 rounded-sm font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                      pathname === '/orchestra/variables' &&
                      'bg-graydark dark:bg-meta-4'
                    } ${sidebarCollapsed ? 'justify-center' : 'py-2 px-4'}`}
                  >
                    <BookA size={20} strokeWidth={1.5} />
                    {!sidebarCollapsed && 'Variables'}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/orchestra/datasets"
                    className={`group relative flex items-center gap-2.5 rounded-sm font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                      pathname === '/orchestra/datasets' &&
                      'bg-graydark dark:bg-meta-4'
                    } ${sidebarCollapsed ? 'justify-center' : 'py-2 px-4'}`}
                  >
                    <HardDrive size={20} strokeWidth={1.5} />
                    {!sidebarCollapsed && 'Datasets'}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/orchestra/dataviews"
                    className={`group relative flex items-center gap-2.5 rounded-sm font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                      pathname === '/dataviews' && 'bg-graydark dark:bg-meta-4'
                    } ${sidebarCollapsed ? 'justify-center' : 'py-2 px-4'}`}
                  >
                    <Telescope size={20} strokeWidth={1.5} />
                    {!sidebarCollapsed && 'Dataviews'}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/orchestra/data-loaders"
                    className={`group relative flex items-center gap-2.5 rounded-sm font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                      pathname === '/orchestra/data-loaders' &&
                      'bg-graydark dark:bg-meta-4'
                    } ${sidebarCollapsed ? 'justify-center' : 'py-2 px-4'}`}
                  >
                    <DatabaseBackup size={20} strokeWidth={1.5} />
                    {!sidebarCollapsed && 'Data Loaders'}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/orchestra/tasks"
                    className={`group relative flex items-center gap-2.5 rounded-sm font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                      pathname === '/orchestra/tasks' &&
                      'bg-graydark dark:bg-meta-4'
                    } ${sidebarCollapsed ? 'justify-center' : 'py-2 px-4'}`}
                  >
                    <ListTodo size={20} strokeWidth={1.5} />
                    {!sidebarCollapsed && 'Tasks'}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/orchestra/workflows"
                    className={`group relative flex items-center gap-2.5 rounded-sm font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                      pathname === '/orchestra/workflows' &&
                      'bg-graydark dark:bg-meta-4'
                    } ${sidebarCollapsed ? 'justify-center' : 'py-2 px-4'}`}
                  >
                    <Workflow size={20} strokeWidth={1.5} />
                    {!sidebarCollapsed && 'Workflows'}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/orchestra/monitoring"
                    className={`group relative flex items-center gap-2.5 rounded-sm font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                      pathname === '/orchestra/monitoring' &&
                      'bg-graydark dark:bg-meta-4'
                    } ${sidebarCollapsed ? 'justify-center' : 'py-2 px-4'}`}
                  >
                    <View size={20} strokeWidth={1.5} />
                    {!sidebarCollapsed && 'Monitoring'}
                  </NavLink>
                </li>
              </ul>
            </div>
          </>
        );
      case 'bird':
        return (
          <>
            <div>
              <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
                {!sidebarCollapsed && 'Bird Dashboard'}
              </h3>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${sidebarCollapsed ? 'lg:w-20' : ''}`}
    >
      {/* SIDEBAR HEADER */}
      <div
        className={`flex items-center px-6 py-5.5 lg:py-6.5 ${
          sidebarCollapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        <NavLink
          to="/"
          className={sidebarCollapsed ? 'w-full flex justify-center' : 'w-full'}
        >
          {sidebarCollapsed ? (
            <img src="/vite.svg" alt="R" className="h-10 w-10" />
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
          <ArrowRight size={20} strokeWidth={1.5} />
        </button>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          {renderSidebarContent()}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
