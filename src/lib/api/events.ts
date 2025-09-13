import { supabase } from '../supabase';
import type { Event, EventRegistration } from '../../types/database';

// Get all approved events
export const getApprovedEvents = async (): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_approved', true)
    .order('start_time', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Get event by ID
export const getEventById = async (id: string): Promise<Event | null> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// Get events by organizer
export const getEventsByOrganizer = async (organizerId: string): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', organizerId)
    .order('start_time', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Create a new event
export const createEvent = async (event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> => {
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update an event
export const updateEvent = async (id: string, event: Partial<Event>): Promise<Event> => {
  const { data, error } = await supabase
    .from('events')
    .update(event)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete an event
export const deleteEvent = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Get event registrations
export const getEventRegistrations = async (eventId: string): Promise<EventRegistration[]> => {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', eventId);

  if (error) throw error;
  return data || [];
};

// Register for an event
export const registerForEvent = async (eventId: string, userId: string): Promise<EventRegistration> => {
  const { data, error } = await supabase
    .from('event_registrations')
    .insert({
      event_id: eventId,
      user_id: userId,
      status: 'registered'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Cancel event registration
export const cancelEventRegistration = async (eventId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('event_registrations')
    .update({ status: 'cancelled' })
    .eq('event_id', eventId)
    .eq('user_id', userId);

  if (error) throw error;
};

// Mark attendance for an event
export const markAttendance = async (eventId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('event_registrations')
    .update({ status: 'attended' })
    .eq('event_id', eventId)
    .eq('user_id', userId);

  if (error) throw error;
};

// Get user's registered events
export const getUserRegisteredEvents = async (userId: string): Promise<Event[]> => {
  // Step 1: Get all event_registrations for the user
  const { data: registrations, error } = await supabase
    .from('event_registrations')
    .select('event_id')
    .eq('user_id', userId)
    .eq('status', 'registered');

  if (error) throw error;

  const eventIds = (registrations || []).map(r => r.event_id);

  let events: Event[] = [];
  if (eventIds.length > 0) {
    // Step 2: Fetch all events with those IDs
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds);

    if (eventsError) throw eventsError;
    events = eventsData || [];
  }

  return events;
};

// Get event capacity and current registrations
export const getEventCapacityInfo = async (eventId: string): Promise<{ capacity: number; registered: number }> => {
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('capacity')
    .eq('id', eventId)
    .single();

  if (eventError) throw eventError;

  const { count, error: countError } = await supabase
    .from('event_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('status', 'registered');

  if (countError) throw countError;

  return {
    capacity: event.capacity,
    registered: count || 0
  };
}; 