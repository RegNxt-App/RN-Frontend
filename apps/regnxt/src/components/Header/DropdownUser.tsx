import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';

import {useAuth} from '@/contexts/AuthContext';
import {BookUser, ChevronDown, LogOut, User} from 'lucide-react';

import {Avatar, AvatarFallback, AvatarImage} from '@rn/ui/components/ui/avatar';
import {Button} from '@rn/ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@rn/ui/components/ui/dialog';

import ClickOutside from '../ClickOutside';

const DropdownUser = () => {
  const navigate = useNavigate();
  const {logout, user} = useAuth();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    setIsLogoutDialogOpen(true);
  };

  const confirmLogout = async () => {
    try {
      await logout();
      setIsLogoutDialogOpen(false);
      navigate('/auth/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <ClickOutside
      onClick={() => setDropdownOpen(false)}
      className="relative"
    >
      <Link
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4"
        to="#"
      >
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-white">
            {user?.firstName + ' ' + user?.lastName || 'User Name'}
          </span>
          <span className="block text-xs">{user?.email || 'Software Engineer'}</span>
        </span>
        <Avatar className="b-12 h-10 w-10">
          <AvatarImage
            // src={user?.avatar}
            alt={user?.firstName}
          />
          <AvatarFallback>{user?.firstName?.charAt(0)}</AvatarFallback>
        </Avatar>

        <ChevronDown
          size={20}
          strokeWidth={1.75}
        />
      </Link>

      {dropdownOpen && (
        <div
          className={`w-62.5 border-stroke shadow-default dark:border-strokedark dark:bg-boxdark absolute right-0 mt-4 flex flex-col rounded-sm border bg-white`}
        >
          <ul className="border-stroke py-7.5 dark:border-strokedark flex flex-col gap-5 border-b px-6">
            <li>
              <Link
                to="/reporting/profile"
                className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
              >
                <User
                  size={20}
                  strokeWidth={1.75}
                />
                My Profile
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
              >
                <BookUser
                  size={20}
                  strokeWidth={1.75}
                />
                My Contacts
              </Link>
            </li>
          </ul>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3.5 px-6 py-4 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
          >
            <LogOut
              size={20}
              strokeWidth={1.75}
            />
            Log Out
          </button>
        </div>
      )}
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
              onClick={confirmLogout}
            >
              Log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ClickOutside>
  );
};

export default DropdownUser;
