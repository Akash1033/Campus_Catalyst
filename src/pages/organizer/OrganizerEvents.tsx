import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Plus, Award, Users } from 'lucide-react';
import EventCard from '@/components/EventCard';

const OrganizerEvents: React.FC = () => {
  const { user } = useAuth();
  const { events } = useEvents();
  
  if (!user) return null;
  
  // Get events created by this organizer
  const myEvents = events.filter(event => event.organizer_id === user.id);
  
  // Split events into upcoming and past
  const currentDate = new Date();
  const upcomingEvents = myEvents.filter(event => new Date(event.end_time) >= currentDate)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    
  const pastEvents = myEvents.filter(event => new Date(event.end_time) < currentDate)
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  
  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">My Events</h1>
          <p className="text-gray-600">Manage events you've created</p>
        </div>
        <Link to="/organizer/events/create">
          <Button>
            <Plus size={16} className="mr-1" />
            Create Event
          </Button>
        </Link>
      </header>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastEvents.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-4">
          {upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <CalendarDays className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium">No upcoming events</h3>
                <p className="text-gray-500 mt-1 mb-4">
                  You haven't created any upcoming events yet.
                </p>
                <Link to="/organizer/events/create">
                  <Button>
                    <Plus size={16} className="mr-1" />
                    Create Your First Event
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map(event => (
                <div key={event.id} className="flex flex-col gap-2">
                  <EventCard event={event} showRegisterButton={false} />
                  <Link to={`/events/${event.id}/attendees`}>
                    <Button variant="outline" className="w-full flex items-center justify-center mt-2">
                      <Users size={16} className="mr-2" />
                      Take Attendance
                    </Button>
                  </Link>
                  <Link to={`/organizer/events/${event.id}/certificates`}>
                    <Button variant="outline" className="w-full flex items-center justify-center mt-2">
                      <Award size={16} className="mr-2" />
                      Issue Certificates
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="mt-4">
          {pastEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <CalendarDays className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium">No past events</h3>
                <p className="text-gray-500 mt-1">
                  You haven't created any past events.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map(event => (
                <div key={event.id} className="flex flex-col gap-2">
                  <EventCard event={event} showRegisterButton={false} />
                  <Link to={`/organizer/events/${event.id}/certificates`}>
                    <Button variant="outline" className="w-full flex items-center justify-center mt-2">
                      <Award size={16} className="mr-2" />
                      Issue Certificates
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrganizerEvents;
