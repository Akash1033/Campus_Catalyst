import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { databaseService, Event, EventInsert, EventUpdate } from '../utils/databaseService';
import { toast } from 'sonner';

export interface Feedback {
  id: string;
  eventId: string;
  userId: string;
  rating: number;
  comment: string;
  submittedAt: string;
}

interface EventContextType {
  events: Event[];
  pendingEvents: Event[];
  feedback: Feedback[];
  loading: boolean;
  pendingLoading: boolean;
  createEvent: (event: EventInsert) => Promise<void>;
  updateEvent: (id: string, event: EventUpdate) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  approveEvent: (id: string, isApproved: boolean) => Promise<void>;
  registerForEvent: (eventId: string, userId: string) => Promise<boolean>;
  unregisterFromEvent: (eventId: string, userId: string) => Promise<void>;
  submitFeedback: (feedback: Omit<Feedback, 'id' | 'submittedAt'>) => void;
  refreshEvents: () => Promise<void>;
  refreshPendingEvents: () => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingLoading, setPendingLoading] = useState<boolean>(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await databaseService.getEvents(user?.role === 'admin');
      
      if (response.success) {
        setEvents(response.data);
      } else {
        console.error('Error loading events:', response.message);
        toast.error('Failed to load events: ' + response.message);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('An error occurred while loading events');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingEvents = async () => {
    if (!user || user.role !== 'admin') return;
    
    setPendingLoading(true);
    try {
      const response = await databaseService.getPendingEvents();
      
      if (response.success) {
        setPendingEvents(response.data);
      } else {
        console.error('Error loading pending events:', response.message);
      }
    } catch (error) {
      console.error('Error fetching pending events:', error);
    } finally {
      setPendingLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    
    const storedFeedback = localStorage.getItem('feedback');
    if (storedFeedback) {
      setFeedback(JSON.parse(storedFeedback));
    }
    
    if (user?.role === 'admin') {
      fetchPendingEvents();
    }
  }, [user]);

  const createEvent = async (eventData: EventInsert) => {
    if (!user) return;
    
    try {
      const response = await databaseService.createEvent(eventData);
      
      if (response.success) {
        toast.success('Event created successfully');
        await fetchEvents();
      } else {
        toast.error('Failed to create event: ' + response.message);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('An error occurred while creating the event');
    }
  };

  const updateEvent = async (id: string, eventUpdate: EventUpdate) => {
    if (!user) return;
    
    try {
      const response = await databaseService.updateEvent(id, eventUpdate);
      
      if (response.success) {
        toast.success('Event updated successfully');
        await fetchEvents();
        if (user.role === 'admin') {
          await fetchPendingEvents();
        }
      } else {
        toast.error('Failed to update event: ' + response.message);
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('An error occurred while updating the event');
    }
  };

  const approveEvent = async (id: string, isApproved: boolean) => {
    if (!user || user.role !== 'admin') {
      toast.error('Only admins can approve or reject events');
      return;
    }
    
    try {
      const response = await databaseService.approveEvent(id, isApproved);
      
      if (response.success) {
        toast.success(isApproved ? 'Event approved successfully' : 'Event rejected successfully');
        await fetchEvents();
        await fetchPendingEvents();
      } else {
        toast.error(`Failed to ${isApproved ? 'approve' : 'reject'} event: ` + response.message);
      }
    } catch (error) {
      console.error('Error approving/rejecting event:', error);
      toast.error(`An error occurred while ${isApproved ? 'approving' : 'rejecting'} the event`);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!user) return;
    
    try {
      const response = await databaseService.deleteEvent(id);
      
      if (response.success) {
        toast.success('Event deleted successfully');
        await fetchEvents();
        if (user.role === 'admin') {
          await fetchPendingEvents();
        }
      } else {
        toast.error('Failed to delete event: ' + response.message);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('An error occurred while deleting the event');
    }
  };

  const registerForEvent = async (eventId: string, userId: string): Promise<boolean> => {
    try {
      const response = await databaseService.registerAttendee(eventId, userId);
      
      if (response.success) {
        toast.success('Successfully registered for event');
        await fetchEvents();
        return true;
      } else {
        toast.error('Registration failed: ' + response.message);
        return false;
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      toast.error('An error occurred during registration');
      return false;
    }
  };

  const unregisterFromEvent = async (eventId: string, userId: string) => {
    try {
      const response = await databaseService.unregisterAttendee(eventId, userId);
      
      if (response.success) {
        toast.success('Successfully unregistered from event');
        await fetchEvents();
      } else {
        toast.error('Failed to unregister: ' + response.message);
      }
    } catch (error) {
      console.error('Error unregistering from event:', error);
      toast.error('An error occurred while unregistering');
    }
  };

  const submitFeedback = (feedbackData: Omit<Feedback, 'id' | 'submittedAt'>) => {
    if (!user) return;
    
    const newFeedback: Feedback = {
      ...feedbackData,
      id: Math.random().toString(36).substring(2, 9),
      submittedAt: new Date().toISOString()
    };
    
    const updatedFeedback = [...feedback, newFeedback];
    setFeedback(updatedFeedback);
    localStorage.setItem('feedback', JSON.stringify(updatedFeedback));
    toast.success('Thank you for your feedback!');
  };

  const refreshEvents = async () => {
    await fetchEvents();
  };

  const refreshPendingEvents = async () => {
    if (user?.role === 'admin') {
      await fetchPendingEvents();
    }
  };

  return (
    <EventContext.Provider value={{
      events,
      pendingEvents,
      feedback,
      loading,
      pendingLoading,
      createEvent,
      updateEvent,
      deleteEvent,
      approveEvent,
      registerForEvent,
      unregisterFromEvent,
      submitFeedback,
      refreshEvents,
      refreshPendingEvents
    }}>
      {children}
    </EventContext.Provider>
  );
};
