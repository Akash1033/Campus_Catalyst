
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventContext';
import { useUsers } from '@/context/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Users, UserPlus, MessageSquare, ArrowRight, ClipboardCheck } from 'lucide-react';
import EventCard from '@/components/EventCard';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { events, feedback, pendingEvents, refreshPendingEvents } = useEvents();
  const { users } = useUsers();
  
  useEffect(() => {
    refreshPendingEvents();
  }, [refreshPendingEvents]);
  
  // Count of pending organizer approvals
  const pendingApprovals = users.filter(
    user => user.role === 'organizer' && !user.isApproved
  ).length;
  
  // Count of pending event approvals
  const pendingEventCount = pendingEvents.length;
  
  // Count of different user types
  const studentCount = users.filter(user => user.role === 'student').length;
  const organizerCount = users.filter(user => user.role === 'organizer' && user.isApproved).length;
  
  // Upcoming events
  const upcomingEvents = events
    .filter(event => new Date(event.date) > new Date() && event.isApproved)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-4">
                <div className="text-3xl font-bold">{events.filter(e => e.isApproved).length}</div>
              </div>
              <CalendarDays size={24} className="text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-4">
                <div className="text-3xl font-bold">{users.length}</div>
                <div className="text-xs text-gray-500">
                  {studentCount} students, {organizerCount} organizers
                </div>
              </div>
              <Users size={24} className="text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className={pendingEventCount > 0 ? "border-amber-300 bg-amber-50" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Event Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-4">
                <div className="text-3xl font-bold">{pendingEventCount}</div>
                <div className="text-xs text-gray-500">
                  {pendingEventCount === 0 ? "No action needed" : "Requires attention"}
                </div>
              </div>
              <ClipboardCheck size={24} className={pendingEventCount > 0 ? "text-amber-500" : "text-gray-400"} />
            </div>
            {pendingEventCount > 0 && (
              <Link to="/admin/event-approvals">
                <Button variant="outline" className="w-full mt-3" size="sm">
                  Review Pending
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
        
        <Card className={pendingApprovals > 0 ? "border-amber-300 bg-amber-50" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Organizer Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-4">
                <div className="text-3xl font-bold">{pendingApprovals}</div>
                <div className="text-xs text-gray-500">
                  {pendingApprovals === 0 ? "No action needed" : "Requires attention"}
                </div>
              </div>
              <UserPlus size={24} className={pendingApprovals > 0 ? "text-amber-500" : "text-gray-400"} />
            </div>
            {pendingApprovals > 0 && (
              <Link to="/admin/approvals">
                <Button variant="outline" className="w-full mt-3" size="sm">
                  Review Pending
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button asChild variant="outline" className="h-auto py-3 justify-start">
            <Link to="/admin/events" className="flex flex-col items-start">
              <span className="text-sm font-medium">Manage Events</span>
              <span className="text-xs text-gray-500 mt-1">Edit or delete events</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto py-3 justify-start">
            <Link to="/admin/event-approvals" className="flex flex-col items-start">
              <span className="text-sm font-medium">Event Approvals</span>
              <span className="text-xs text-gray-500 mt-1">Review event submissions</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto py-3 justify-start">
            <Link to="/admin/users" className="flex flex-col items-start">
              <span className="text-sm font-medium">Manage Users</span>
              <span className="text-xs text-gray-500 mt-1">View and modify user accounts</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto py-3 justify-start">
            <Link to="/admin/approvals" className="flex flex-col items-start">
              <span className="text-sm font-medium">Organizer Approvals</span>
              <span className="text-xs text-gray-500 mt-1">Review pending organizer requests</span>
            </Link>
          </Button>
        </div>
      </section>
      
      {/* Upcoming Events */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          <Link to="/admin/events" className="text-primary flex items-center hover:underline text-sm">
            View all <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        
        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
            {upcomingEvents.slice(0, 3).map(event => (
              <EventCard key={event.id} event={event} showRegisterButton={false} />
            ))}
          </div>
        ) : (
          <Card className="bg-gray-50 border border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">No upcoming events found</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
