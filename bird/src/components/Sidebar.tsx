import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import Avatar from "boring-avatars";
import { motion } from "framer-motion";
import {
  Database,
  GitBranch,
  LogOut,
  LucideIcon,
  Settings,
  User,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface SidebarProps {
  isLoading: boolean;
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

interface LogoProps {
  size: number;
  expanded?: boolean;
}

interface NavigationItem {
  icon: LucideIcon;
  href: string;
  name: string;
  current: boolean;
}

const CollapsibleSidebar: React.FC<SidebarProps> = ({
  isExpanded,
  setIsExpanded,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const navigation: NavigationItem[] = [
    {
      icon: Settings,
      href: "/configuration/",
      name: "Configuration",
      current: currentPath.startsWith("/configuration"),
    },
    {
      icon: Database,
      href: "/data/",
      name: "Data",
      current: currentPath.startsWith("/data"),
    },
    {
      icon: GitBranch,
      href: "/relationships/",
      name: "Relationships",
      current: currentPath.startsWith("/relationships"),
    },
  ];

  /**
   * Combines CSS classes
   */
  const classNames = (...classes: (string | boolean | undefined)[]) => {
    return classes.filter(Boolean).join(" ");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsExpanded]);

  const handleMouseEnter = () => {
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    if (!isDropdownOpen) {
      setIsExpanded(false);
    }
  };

  const handleLogout = () => {
    setIsLogoutDialogOpen(true);
    setIsDropdownOpen(false);
  };

  const confirmLogout = async () => {
    try {
      await logout();
      setIsLogoutDialogOpen(false);
      navigate("/auth/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <>
      <motion.div
        ref={sidebarRef}
        className="fixed left-0 top-0 z-40 h-screen bg-custom-primary-light dark:bg-custom-primary-dark border-r shadow-lg flex flex-col"
        initial={false}
        animate={{ width: isExpanded || isDropdownOpen ? 280 : 80 }}
        transition={{ duration: 0.3 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center py-2">
            <motion.div
              animate={{ width: isExpanded || isDropdownOpen ? 160 : 140 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={isExpanded || isDropdownOpen ? "/logo.svg" : "/vite.svg"}
                alt="logo"
                width={isExpanded || isDropdownOpen ? 200 : 50}
                height={400}
                className="mx-auto my-8"
              />
            </motion.div>
          </div>
          <nav className="flex-1 px-2">
            <ul className="space-y-2">
              {navigation.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.href}
                    className={classNames(
                      item.current
                        ? "bg-custom-primary text-white"
                        : "text-custom-text-light dark:text-custom-text-dark hover:bg-custom-primary hover:text-white",
                      "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6"
                    )}
                  >
                    <item.icon
                      className={`h-5 w-5 ${
                        isExpanded || isDropdownOpen ? "mr-3" : "mx-auto"
                      }`}
                    />
                    {(isExpanded || isDropdownOpen) && (
                      <span className="text-sm font-medium">{item.name}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-4" ref={dropdownRef}>
            <DropdownMenu
              open={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full p-0">
                  <div
                    className={`flex items-center ${
                      isExpanded || isDropdownOpen ? "w-full" : "justify-center"
                    }`}
                  >
                    <Avatar
                      className="h-10 w-10"
                      name={user?.firstName?.charAt(0)}
                    >
                      {/* <AvatarImage src={user?.avatar} alt={user?.firstName} />
                      <AvatarFallback>
                        {user?.firstName?.charAt(0)}
                      </AvatarFallback> */}
                    </Avatar>
                    {(isExpanded || isDropdownOpen) && (
                      <div className="ml-3 text-left">
                        <p className="text-sm font-medium">{`${user?.firstName} ${user?.lastName}`}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out of the system?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLogoutDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmLogout}>
              Log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CollapsibleSidebar;
