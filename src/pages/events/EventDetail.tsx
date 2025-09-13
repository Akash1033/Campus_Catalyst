import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarIcon, Clock, MapPin, Users, Tag, AlertTriangle, Ticket } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { getEventById } from '@/lib/api/events';
import { getEventCapacityInfo } from '@/lib/api/events';

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events, registerForEvent, unregisterFromEvent, deleteEvent, loading } = useEvents();
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [fetchedEvent, setFetchedEvent] = useState<any>(null);
  const [fetching, setFetching] = useState(false);
  const [capacityInfo, setCapacityInfo] = useState<{ capacity: number; registered: number } | null>(null);
  
  const eventToShow = events.find(e => e.id === id) || fetchedEvent;
  
  useEffect(() => {
    const fetchEventAndCapacity = async () => {
      if (!eventToShow && id) {
        setFetching(true);
        try {
          const backendEvent = await getEventById(id);
          setFetchedEvent(backendEvent);
        } catch (err) {
          setFetchedEvent(null);
        } finally {
          setFetching(false);
        }
      }
      // Always fetch capacity info
      if (id) {
        try {
          const cap = await getEventCapacityInfo(id);
          setCapacityInfo(cap);
        } catch (err) {
          setCapacityInfo(null);
        }
      }
    };
    fetchEventAndCapacity();
  }, [eventToShow, id]);
  
  if (loading || fetching) {
    return <EventDetailSkeleton />;
  }
  
  if (!eventToShow) {
    return (
      <div className="text-center py-12">
        <div className="text-lg mb-4">Event not found</div>
        <Button onClick={() => navigate('/events')}>Back to Events</Button>
      </div>
    );
  }
  
  const isRegistered = user && Array.isArray(eventToShow.attendees) && eventToShow.attendees.includes(user.id);
  const isCreator = user && eventToShow.createdBy === user.id;
  const isAdmin = user && user.role === 'admin';
  const canManageEvent = isCreator || isAdmin;
  
  const eventDate = parseISO(eventToShow.date);
  const isPastEvent = eventDate < new Date();
  const availableSpots = eventToShow.maxCapacity - eventToShow.attendees.length;
  
  const registrationCount = typeof eventToShow.registration_count === 'number'
    ? eventToShow.registration_count
    : Array.isArray(eventToShow.attendees)
      ? eventToShow.attendees.length
      : 0;
  
  const handleRegistration = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsRegistering(true);
    try {
      if (isRegistered) {
        await unregisterFromEvent(eventToShow.id, user.id);
      } else {
        await registerForEvent(eventToShow.id, user.id);
      }
      // Refetch event and capacity info after registration change
      const updatedEvent = await getEventById(eventToShow.id);
      setFetchedEvent(updatedEvent);
      const cap = await getEventCapacityInfo(eventToShow.id);
      setCapacityInfo(cap);
    } catch (error) {
      toast.error('Failed to update registration.');
    } finally {
      setIsRegistering(false);
    }
  };
  
  const handleDelete = async () => {
    await deleteEvent(eventToShow.id);
    setShowDeleteDialog(false);
    navigate('/events');
  };

  return (
    <div>
      <div className="mb-6">
        <Button asChild variant="link" className="p-0 h-auto min-h-0 text-primary">
          <Link to="/events">&larr; Back to Events</Link>
        </Button>
      </div>
      
      <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
        {/* Event Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">{eventToShow.title}</h1>
              <div className="flex flex-wrap gap-1 mb-2">
                {eventToShow.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    <Tag size={14} className="mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            {isPastEvent && (
              <Badge variant="outline" className="bg-gray-100">Past Event</Badge>
            )}
          </div>
        </div>
        
        {/* Event Details */}
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-lg font-medium mb-3">About This Event</h2>
              <p className="text-gray-700 whitespace-pre-line mb-6">
                {eventToShow.description}
              </p>
              
              {canManageEvent && (
                <div className="flex gap-3 mb-6">
                  <Button asChild variant="outline">
                    <Link to={`/events/${eventToShow.id}/edit`}>Edit Event</Link>
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    Delete Event
                  </Button>
                </div>
              )}
            </div>
            
            <div>
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Date</div>
                      <div className="font-medium">
                        {format(eventDate, 'EEEE, MMMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Time</div>
                      <div className="font-medium">
                        {format(eventDate, 'h:mm a')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Location</div>
                      <div className="font-medium">
                        {eventToShow.location}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Attendance</div>
                      <div className="font-medium">
                        {capacityInfo ? `${capacityInfo.registered} / ${capacityInfo.capacity}` : `0 / ${eventToShow.maxCapacity}`} registered
                        {availableSpots <= 5 && availableSpots > 0 && (
                          <div className="text-sm text-amber-600">
                            Only {availableSpots} spot{availableSpots !== 1 ? 's' : ''} left!
                          </div>
                        )}
                        {availableSpots === 0 && (
                          <div className="text-sm text-red-600">
                            This event is full
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {!canManageEvent && !isPastEvent && (
                      <Button 
                        className="w-full" 
                        variant={isRegistered ? "outline" : "default"}
                        onClick={handleRegistration}
                        disabled={(!isRegistered && availableSpots === 0) || isRegistering}
                      >
                        {isRegistering ? "Processing..." : isRegistered ? "Cancel Registration" : "Register for Event"}
                      </Button>
                    )}
                    
                    {isRegistered && !isPastEvent && (
                      <Button asChild className="w-full flex items-center justify-center gap-2" variant="secondary">
                        <Link to={`/events/${eventToShow.id}/ticket`}><Ticket className="h-4 w-4" />View Ticket</Link>
                      </Button>
                    )}
                    
                    {isRegistered && isPastEvent && (
                      <Button asChild className="w-full" variant="outline">
                        <Link to={`/events/${eventToShow.id}/feedback`}>Provide Feedback</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Skeleton loading state
const EventDetailSkeleton = () => {
  return (
    <div>
      <div className="mb-6">
        <div className="w-24 h-6"><Skeleton className="h-6 w-24" /></div>
      </div>
      
      <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="w-full">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <div className="flex flex-wrap gap-1 mb-2">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-6 w-16 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Skeleton className="h-6 w-40 mb-3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            
            <div>
              <Card>
                <CardContent className="p-4 space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex gap-3">
                      <div className="flex-shrink-0">
                        <Skeleton className="h-9 w-9 rounded-md" />
                      </div>
                      <div className="w-full">
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-4 pt-2">
                    <Skeleton className="h-9 w-full rounded-md" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
