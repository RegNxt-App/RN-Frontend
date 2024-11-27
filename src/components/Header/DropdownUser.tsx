import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ClickOutside from '../ClickOutside';
import UserOne from '../../images/user/user-01.png';
import { BookUser, ChevronDown, LogOut, User } from 'lucide-react';

const DropdownUser = () => {
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setUserEmail] = useState('');

  useEffect(() => {
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');

    if (username) {
      setUsername(username);
    }
    if (email) {
      setUserEmail(email);
    }
  }, []);
  const handleLogout = () => {
    localStorage.removeItem('email');
    localStorage.removeItem('id');
    localStorage.removeItem('jwtToken');

    navigate('/auth/signin');
  };

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <Link
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4"
        to="#"
      >
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-white">
            {username || 'User Name'}
          </span>
          <span className="block text-xs">{email || 'Software Engineer'}</span>
        </span>
        <span className="h-12 w-12 rounded-full">
          <img src={UserOne} alt="User" />
        </span>

        <ChevronDown size={20} strokeWidth={1.75} />
      </Link>

      {dropdownOpen && (
        <div
          className={`absolute right-0 mt-4 flex w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark`}
        >
          <ul className="flex flex-col gap-5 border-b border-stroke px-6 py-7.5 dark:border-strokedark">
            <li>
              <Link
                to="/profile"
                className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
              >
                <User size={20} strokeWidth={1.75} />
                My Profile
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
              >
                <BookUser size={20} strokeWidth={1.75} />
                My Contacts
              </Link>
            </li>
          </ul>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3.5 px-6 py-4 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
          >
            <LogOut size={20} strokeWidth={1.75} />
            Log Out
          </button>
        </div>
      )}
    </ClickOutside>
  );
};

export default DropdownUser;
