import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Event } from '@/utils/databaseService';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import { useEvents } from '@/context/EventContext';

interface EventCardProps {
  event: Event;
  isCompact?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, isCompact = false }) => {
  const { user } = useAuth();
  const { registerForEvent, unregisterFromEvent } = useEvents();
  const isOrganizer = user?.id === event.organizer_id;
  const isRegistered = user && Array.isArray(event.attendees) && event.attendees.includes(user.id);
  const isPastEvent = new Date(event.end_time) < new Date();
  const availableSpots = event.max_capacity - (event.registration_count || 0);

  const handleRegistration = async () => {
    if (!user) return;
    if (isRegistered) {
      await unregisterFromEvent(event.id, user.id);
    } else {
      await registerForEvent(event.id, user.id);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      {event.image_url && !isCompact && (
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          <img
            src={event.image_url}
            alt={event.title}
            className="object-cover w-full h-full"
          />
          {!event.is_approved && (
            <Badge variant="secondary" className="absolute top-2 right-2">
              Pending Approval
            </Badge>
          )}
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="line-clamp-2">
          {event.title}
        </CardTitle>
        <div className="flex flex-col space-y-2 text-sm text-gray-500">
          <div className="flex items-center">
            <CalendarDays className="h-4 w-4 mr-2" />
            <span>
              {format(new Date(event.start_time), 'PPP')}
              {!isCompact && ` at ${format(new Date(event.start_time), 'p')}`}
            </span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          {!isCompact && (
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              <span>{event.registration_count || 0} / {event.max_capacity} registered</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      {!isCompact && (
        <CardContent>
          <p className="text-sm text-gray-600 line-clamp-3">
            {event.description}
          </p>
          {event.category && (
            <Badge variant="outline" className="mt-4">
              {event.category.name}
            </Badge>
          )}
        </CardContent>
      )}
      
      <CardFooter className="mt-auto pt-4">
        {isOrganizer ? (
          <Button asChild variant="outline" className="w-full">
            <Link to={`/events/${event.id}/edit`} className="w-full">
              Edit Event
            </Link>
          </Button>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            <Button asChild variant="outline" className="w-full">
              <Link to={`/events/${event.id}`} className="w-full">
                View Details
              </Link>
            </Button>
            {!isPastEvent && (
              <Button
                className="w-full"
                variant={isRegistered ? "outline" : "default"}
                onClick={handleRegistration}
                disabled={(!isRegistered && availableSpots === 0)}
              >
                {isRegistered ? "Cancel Registration" : "Register"}
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default EventCard;
