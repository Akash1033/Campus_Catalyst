import { useEffect } from 'react';
import { useEvents } from '../../hooks/useEvents';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const EventList = () => {
  const { events, loading, error, fetchEvents } = useEvents();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error: {error}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500">No events found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {events.map((event) => (
        <Card key={event.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>{event.title}</CardTitle>
            <CardDescription>
              {format(new Date(event.start_time), 'PPP p')} - {format(new Date(event.end_time), 'p')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-2">{event.description}</p>
            <p className="text-sm font-medium">Location: {event.location}</p>
            <p className="text-sm font-medium">Capacity: {event.capacity} attendees</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigate(`/events/${event.id}`)}
            >
              View Details
            </Button>
            <Button
              variant="default"
              onClick={() => navigate(`/events/${event.id}/register`)}
            >
              Register
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}; 