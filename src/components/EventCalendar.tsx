import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay, parseISO } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import EventCard from './EventCard';
import { getUserRegisteredEvents } from '@/lib/api/events';

const EventCalendar: React.FC = () => {
  const { user } = useAuth();
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const events = await getUserRegisteredEvents(user.id);
        setRegisteredEvents(events);
      } catch (err) {
        setRegisteredEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRegisteredEvents();
  }, [user]);

  // Only consider upcoming events
  const now = new Date();
  const upcomingEvents = registeredEvents.filter(event => new Date(event.end_time) >= now);

  // Get events for the selected date
  const eventsOnSelectedDate = selectedDate 
    ? upcomingEvents.filter(event => 
        isSameDay(new Date(event.start_time), selectedDate)
      )
    : [];

  // Create a map of dates to event counts for highlighting in calendar
  const eventDateMap = upcomingEvents.reduce<Record<string, number>>((acc, event) => {
    const dateKey = format(new Date(event.start_time), 'yyyy-MM-dd');
    acc[dateKey] = (acc[dateKey] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <Card className="lg:w-96 h-fit">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <CalendarDays className="h-5 w-5 mr-2" />
            Event Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar 
            mode="single" 
            selected={selectedDate} 
            onSelect={setSelectedDate}
            modifiers={{
              hasEvents: Object.keys(eventDateMap).map(dateStr => new Date(dateStr))
            }}
            modifiersClassNames={{
              hasEvents: "has-events"
            }}
            className="pointer-events-auto"
          />
          <style dangerouslySetInnerHTML={{ __html: `
            .has-events::after {
              content: '';
              display: block;
              width: 4px;
              height: 4px;
              border-radius: 50%;
              background-color: hsl(var(--primary));
              position: absolute;
              bottom: 2px;
              left: 50%;
              transform: translateX(-50%);
            }
          `}} />
          <div className="mt-4 text-sm text-gray-500 flex items-center">
            <div className="mr-2">
              <Badge className="h-2 w-2 p-0 rounded-full bg-primary" />
            </div>
            Events scheduled
          </div>
        </CardContent>
      </Card>
      <div className="flex-grow">
        <div className="mb-4">
          <h3 className="text-lg font-medium">
            {selectedDate 
              ? `Events on ${format(selectedDate, 'MMMM d, yyyy')}` 
              : 'Select a date to see events'}
          </h3>
        </div>
        {loading ? (
          <Card className="bg-gray-50 border-dashed">
            <CardContent className="p-6 text-center text-gray-500">
              Loading...
            </CardContent>
          </Card>
        ) : eventsOnSelectedDate.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eventsOnSelectedDate.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <Card className="bg-gray-50 border-dashed">
            <CardContent className="p-6 text-center text-gray-500">
              No events scheduled for this date
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EventCalendar;
