import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import * as eventApi from '../lib/api/events';
import type { Event, EventRegistration } from '../types/database';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all approved events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventApi.getApprovedEvents();
      setEvents(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch events');
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  // Fetch events by organizer
  const fetchOrganizerEvents = async (organizerId: string) => {
    try {
      setLoading(true);
      const data = await eventApi.getEventsByOrganizer(organizerId);
      setEvents(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch organizer events');
      toast.error('Failed to fetch organizer events');
    } finally {
      setLoading(false);
    }
  };

  // Create a new event
  const createEvent = async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newEvent = await eventApi.createEvent(eventData);
      setEvents(prev => [...prev, newEvent]);
      toast.success('Event created successfully');
      return newEvent;
    } catch (err) {
      toast.error('Failed to create event');
      throw err;
    }
  };

  // Update an event
  const updateEvent = async (id: string, eventData: Partial<Event>) => {
    try {
      const updatedEvent = await eventApi.updateEvent(id, eventData);
      setEvents(prev => prev.map(event => 
        event.id === id ? updatedEvent : event
      ));
      toast.success('Event updated successfully');
      return updatedEvent;
    } catch (err) {
      toast.error('Failed to update event');
      throw err;
    }
  };

  // Delete an event
  const deleteEvent = async (id: string) => {
    try {
      await eventApi.deleteEvent(id);
      setEvents(prev => prev.filter(event => event.id !== id));
      toast.success('Event deleted successfully');
    } catch (err) {
      toast.error('Failed to delete event');
      throw err;
    }
  };

  // Register for an event
  const registerForEvent = async (eventId: string, userId: string) => {
    try {
      const registration = await eventApi.registerForEvent(eventId, userId);
      toast.success('Successfully registered for the event');
      return registration;
    } catch (err) {
      toast.error('Failed to register for the event');
      throw err;
    }
  };

  // Cancel event registration
  const cancelRegistration = async (eventId: string, userId: string) => {
    try {
      await eventApi.cancelEventRegistration(eventId, userId);
      toast.success('Registration cancelled successfully');
    } catch (err) {
      toast.error('Failed to cancel registration');
      throw err;
    }
  };

  // Mark attendance
  const markAttendance = async (eventId: string, userId: string) => {
    try {
      await eventApi.markAttendance(eventId, userId);
      toast.success('Attendance marked successfully');
    } catch (err) {
      toast.error('Failed to mark attendance');
      throw err;
    }
  };

  // Get event capacity info
  const getEventCapacity = async (eventId: string) => {
    try {
      return await eventApi.getEventCapacityInfo(eventId);
    } catch (err) {
      toast.error('Failed to get event capacity information');
      throw err;
    }
  };

  return {
    events,
    loading,
    error,
    fetchEvents,
    fetchOrganizerEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    cancelRegistration,
    markAttendance,
    getEventCapacity
  };
}; 