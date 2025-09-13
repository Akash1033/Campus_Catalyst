
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventContext';
import { Button } from '@/components/ui/button';
import EventTicket from '@/components/EventTicket';

const EventTicketPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events } = useEvents();
  
  const event = events.find(e => e.id === id);
  
  if (!user) {
    // If not logged in, redirect to login
    navigate('/login');
    return null;
  }
  
  if (!event) {
    return (
      <div className="text-center py-12">
        <div className="text-lg mb-4">Event not found</div>
        <Button onClick={() => navigate('/events')}>Back to Events</Button>
      </div>
    );
  }
  
  const isRegistered = event.attendees.includes(user.id);
  
  if (!isRegistered) {
    return (
      <div className="text-center py-12">
        <div className="text-lg mb-4">You are not registered for this event</div>
        <Button onClick={() => navigate(`/events/${id}`)}>Go to Event Page</Button>
      </div>
    );
  }
  
  return (
    <div className="ticket-container">
      <div className="mb-6 print:hidden">
        <Link to={`/events/${id}`} className="text-primary hover:underline">
          &larr; Back to Event
        </Link>
      </div>
      
      <EventTicket
        eventId={event.id}
        eventTitle={event.title}
        eventDate={event.date}
        eventLocation={event.location}
        userName={user.name}
      />
    </div>
  );
};

export default EventTicketPage;
