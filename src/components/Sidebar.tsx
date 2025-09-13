import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  CalendarDays, 
  Users, 
  UserPlus, 
  Home, 
  ClipboardList,
  MessageSquare,
  Settings,
  User,
  Plus,
  ClipboardCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  
  if (!user) return null;

  const linkClasses = "flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-all";
  const activeLinkClasses = "text-primary bg-primary/5 font-medium";

  const renderLinks = () => {
    switch (user.role) {
      case 'student':
        return (
          <>
            <NavLink to="/student" className={({ isActive }) => 
              cn(linkClasses, isActive ? activeLinkClasses : "")
            } end>
              <Home size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/events" className={({ isActive }) => 
              cn(linkClasses, isActive ? activeLinkClasses : "")
            }>
              <CalendarDays size={20} />
              <span>Browse Events</span>
            </NavLink>
            <NavLink to="/student/registered" className={({ isActive }) => 
              cn(linkClasses, isActive ? activeLinkClasses : "")
            }>
              <ClipboardList size={20} />
              <span>My Registrations</span>
            </NavLink>
            <NavLink to="/student/feedback" className={({ isActive }) => 
              cn(linkClasses, isActive ? activeLinkClasses : "")
            }>
              <MessageSquare size={20} />
              <span>My Feedback</span>
            </NavLink>
            <NavLink to="/student/profile" className={({ isActive }) => 
              cn(linkClasses, isActive ? activeLinkClasses : "")
            }>
              <User size={20} />
              <span>My Profile</span>
            </NavLink>
          </>
        );
      
      case 'organizer':
        return (
          <>
            <NavLink to="/organizer" className={({ isActive }) => 
              cn(linkClasses, isActive ? activeLinkClasses : "")
            } end>
              <Home size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/organizer/events/create" className={({ isActive }) => 
              cn(linkClasses, isActive ? activeLinkClasses : "")
            }>
              <Plus size={20} />
              <span>Create Event</span>
            </NavLink>
            <NavLink to="/organizer/events" className={({ isActive }) => 
              cn(linkClasses, isActive ? activeLinkClasses : "")
            }>
              <CalendarDays size={20} />
              <span>My Events</span>
            </NavLink>
            <NavLink to="/events" className={({ isActive }) => 
              cn(linkClasses, isActive ? activeLinkClasses : "")
            }>
              <ClipboardList size={20} />
              <span>Browse Events</span>
            </NavLink>
            <NavLink to="/organizer/profile" className={({ isActive }) => 
              cn(linkClasses, isActive ? activeLinkClasses : "")
            }>
              <User size={20} />
              <span>My Profile</span>
            </NavLink>
          </>
        );
      
      case 'admin':
        return (
          <>
            <NavLink to="/admin" className={({ isActive }) => 
              cn(linkClasses, isActive ? activeLinkClasses : "")
            } end>
              <Home size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => 
              cn(linkClasses, isActive ? activeLinkClasses : "")
            }>
              <Users size={20} />
              <span>Manage Users</span>
            </NavLink>
            <NavLink to="/admin/approvals" className={({ isActive }) => 
              cn(linkClasses, isActive ? activeLinkClasses : "")
            }>
              <UserPlus size={20} />
              <span>Organizer Approvals</span>
            </NavLink>
            <NavLink to="/admin/event-approvals" className={({ isActive }) => 
              cn(linkClasses, isActive ? activeLinkClasses : "")
            }>
              <ClipboardCheck size={20} />
              <span>Event Approvals</span>
            </NavLink>
            <NavLink to="/admin/events" className={({ isActive }) => 
              cn(linkClasses, isActive ? activeLinkClasses : "")
            }>
              <CalendarDays size={20} />
              <span>All Events</span>
            </NavLink>
            <NavLink to="/admin/feedback" className={({ isActive }) => 
              cn(linkClasses, isActive ? activeLinkClasses : "")
            }>
              <MessageSquare size={20} />
              <span>Feedback Moderation</span>
            </NavLink>
            <NavLink to="/admin/profile" className={({ isActive }) => 
              cn(linkClasses, isActive ? activeLinkClasses : "")
            }>
              <User size={20} />
              <span>My Profile</span>
            </NavLink>
            <NavLink to="/admin/settings" className={({ isActive }) => 
              cn(linkClasses, isActive ? activeLinkClasses : "")
            }>
              <Settings size={20} />
              <span>Settings</span>
            </NavLink>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <aside className={cn(
      "bg-white border-r border-gray-200 w-64 fixed h-full transition-all duration-300 ease-in-out z-20",
      isOpen ? "left-0" : "-left-64 md:left-0"
    )}>
      <div className="p-4">
        <div className="p-4 flex flex-col space-y-4">
          {renderLinks()}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
