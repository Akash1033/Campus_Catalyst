import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Users, Layers, ArrowRight } from 'lucide-react';
import EventCard from '@/components/EventCard';

const OrganizerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { events } = useEvents();
  
  // Organizer's events
  const myEvents = events.filter(
    event => user && event.organizer_id === user.id
  );
  
  // Upcoming events created by this organizer
  const upcomingMyEvents = myEvents
    .filter(event => new Date(event.end_time) > new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  
  // Past events created by this organizer
  const pastMyEvents = myEvents
    .filter(event => new Date(event.end_time) < new Date())
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  
  // Total attendees across all events
  const totalAttendees = myEvents.reduce(
    (total, event) =>
      total +
      (typeof event.registration_count === 'number'
        ? event.registration_count
        : Array.isArray(event.attendees)
        ? event.attendees.length
        : 0),
    0
  );

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>
        <Link to="/organizer/events/create">
          <Button>Create New Event</Button>
        </Link>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-4">
                <div className="text-3xl font-bold">{myEvents.length}</div>
              </div>
              <CalendarDays size={24} className="text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-4">
                <div className="text-3xl font-bold">{upcomingMyEvents.length}</div>
              </div>
              <Layers size={24} className="text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Attendees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-4">
                <div className="text-3xl font-bold">{totalAttendees}</div>
              </div>
              <Users size={24} className="text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Upcoming Events */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          <Link to="/organizer/events" className="text-primary flex items-center hover:underline text-sm">
            View all <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        
        {upcomingMyEvents.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
            {upcomingMyEvents.slice(0, 3).map(event => (
              <EventCard key={event.id} event={event} showRegisterButton={false} />
            ))}
          </div>
        ) : (
          <Card className="bg-gray-50 border border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-gray-500 mb-4">You don't have any upcoming events</p>
              <Link to="/organizer/events/create">
                <Button>Create New Event</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </section>
      
      {/* Past Events */}
      {pastMyEvents.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Past Events</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
            {pastMyEvents.slice(0, 3).map(event => (
              <EventCard key={event.id} event={event} showRegisterButton={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default OrganizerDashboard;
