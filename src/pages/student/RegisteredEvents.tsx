import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CalendarDays } from 'lucide-react';
import EventCard from '@/components/EventCard';
import { getUserRegisteredEvents } from '@/lib/api/events';

const RegisteredEvents: React.FC = () => {
  const { user } = useAuth();
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const events = await getUserRegisteredEvents(user.id);
        console.log('Fetched registered events:', events);
        setRegisteredEvents(events);
      } catch (err) {
        setRegisteredEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRegisteredEvents();
  }, [user]);

  // Split events into upcoming and past
  const currentDate = new Date();
  const upcomingEvents = registeredEvents.filter(event => new Date(event.end_time) >= currentDate)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  const pastEvents = registeredEvents.filter(event => new Date(event.end_time) < currentDate)
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

  const renderEventList = (eventList: any[]) => {
    if (loading) {
      return <div className="p-8 text-center">Loading...</div>;
    }
    if (eventList.length === 0) {
      return (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <CalendarDays className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">No events found</h3>
            <p className="text-gray-500 mt-1">
              You haven't registered for any events in this category.
            </p>
          </CardContent>
        </Card>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {eventList.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    );
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-2">My Registrations</h1>
        <p className="text-gray-600">Events you've registered for</p>
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
          {renderEventList(upcomingEvents)}
        </TabsContent>
        <TabsContent value="past" className="mt-4">
          {renderEventList(pastEvents)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RegisteredEvents;
