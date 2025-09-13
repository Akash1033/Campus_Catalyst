import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type Event = Database['public']['Tables']['events']['Row'];
export type EventInsert = Database['public']['Tables']['events']['Insert'];
export type EventUpdate = Database['public']['Tables']['events']['Update'];
export type EventRegistration = Database['public']['Tables']['event_registrations']['Row'];
export type EventRegistrationInsert = Database['public']['Tables']['event_registrations']['Insert'];

export interface EventData {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  organizer_id: string;
  max_capacity: number;
  category: string;
  image_url?: string;
  registration_deadline?: string;
  is_approved?: boolean;
}

export interface EventWithId extends EventData {
  id: string;
}

export interface DatabaseResponse {
  success: boolean;
  data?: any;
  message?: string;
}

// Helper function to make Supabase errors consistent with our DatabaseResponse interface
const handleSupabaseError = (error: Error | null): DatabaseResponse => {
  if (error) {
    console.error('Supabase error:', error);
    return { 
      success: false, 
      message: error.message || 'An error occurred with the database operation'
    };
  }
  return { success: true };
};

export const databaseService = {
  // Fetch all events
  getEvents: async (includeUnapproved: boolean = false): Promise<DatabaseResponse> => {
    try {
      const query = supabase
        .from('events')
        .select(`
          *,
          event_categories!events_category_id_fkey (
            id,
            name
          ),
          event_tag_relations!event_tag_relations_event_id_fkey (
            tags!event_tag_relations_tag_id_fkey (
              id,
              name
            )
          )
        `)
        .order('start_time', { ascending: true });

      // Only fetch approved events unless specifically requested
      if (!includeUnapproved) {
        query.eq('is_approved', true);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Database error:', error);
        return {
          success: false,
          message: error.message
        };
      }
      
      return { 
        success: true, 
        data: data || [],
        message: 'Events fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching events:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error fetching events from database'
      };
    }
  },
  
  // Get events pending approval
  getPendingEvents: async (): Promise<DatabaseResponse> => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_categories!events_category_id_fkey (
            id,
            name
          )
        `)
        .is('is_approved', false)
        .order('start_time', { ascending: true });
      
      if (error) {
        console.error('Database error:', error);
        return {
          success: false,
          message: error.message
        };
      }
      
      return { 
        success: true, 
        data: data || [],
        message: 'Pending events fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching pending events:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error fetching pending events from database'
      };
    }
  },
  
  // Get a single event by ID
  getEvent: async (id: string): Promise<DatabaseResponse> => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_categories!events_category_id_fkey (
            id,
            name
          ),
          event_tag_relations!event_tag_relations_event_id_fkey (
            tags!event_tag_relations_tag_id_fkey (
              id,
              name
            )
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Database error:', error);
        return {
          success: false,
          message: error.message
        };
      }
      
      if (!data) {
        return {
          success: false,
          message: 'Event not found'
        };
      }
      
      return { 
        success: true, 
        data: data,
        message: 'Event fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching event:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error fetching event from database'
      };
    }
  },
  
  // Create a new event
  createEvent: async (eventData: EventInsert): Promise<DatabaseResponse> => {
    try {
      // Get current authenticated user
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.error('Auth error:', authError);
        return {
          success: false,
          message: 'Authentication error'
        };
      }
      
      if (!session) {
        return {
          success: false,
          message: 'User must be authenticated to create an event'
        };
      }
      
      // Validate required fields
      if (!eventData.title || !eventData.description || !eventData.start_time || 
          !eventData.end_time || !eventData.location || !eventData.category_id) {
        return {
          success: false,
          message: 'Missing required fields'
        };
      }

      // Validate registration deadline is before event start time
      if (eventData.registration_deadline) {
        const registrationDeadline = new Date(eventData.registration_deadline);
        const startTime = new Date(eventData.start_time);
        
        if (registrationDeadline >= startTime) {
          return {
            success: false,
            message: 'Registration deadline must be before the event start time'
          };
        }
      } else {
        // If no registration deadline is provided, set it to 1 hour before the event
        const startTime = new Date(eventData.start_time);
        const defaultDeadline = new Date(startTime.getTime() - (60 * 60 * 1000)); // 1 hour before
        eventData.registration_deadline = defaultDeadline.toISOString();
      }
      
      // Create the event
      const { data, error } = await supabase
        .from('events')
        .insert([{
          ...eventData,
          organizer_id: session.user.id,
          is_approved: false
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Database error:', error);
        return {
          success: false,
          message: error.message
        };
      }
      
      return { 
        success: true, 
        data,
        message: 'Event created successfully! Waiting for admin approval.'
      };
    } catch (error) {
      console.error('Error creating event:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error creating event in database'
      };
    }
  },
  
  // Update an existing event
  updateEvent: async (id: string, eventData: EventUpdate): Promise<DatabaseResponse> => {
    try {
      // Get current authenticated user
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        return {
          success: false,
          message: 'User must be authenticated to update an event'
        };
      }
      
      const { data, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Database error:', error);
        return {
          success: false,
          message: error.message
        };
      }
      
      return { 
        success: true, 
        data,
        message: 'Event updated successfully'
      };
    } catch (error) {
      console.error('Error updating event:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error updating event in database'
      };
    }
  },
  
  // Approve or reject an event
  approveEvent: async (id: string, isApproved: boolean): Promise<DatabaseResponse> => {
    try {
      const { data, error } = await supabase
        .from('events')
        .update({ is_approved: isApproved })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Database error:', error);
        return {
          success: false,
          message: error.message
        };
      }
      
      return { 
        success: true, 
        data,
        message: `Event ${isApproved ? 'approved' : 'rejected'} successfully`
      };
    } catch (error) {
      console.error('Error approving event:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error approving event in database'
      };
    }
  },
  
  // Delete an event
  deleteEvent: async (id: string): Promise<DatabaseResponse> => {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        return {
          success: false,
          message: 'User must be authenticated to delete an event'
        };
      }
      
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Database error:', error);
        return {
          success: false,
          message: error.message
        };
      }
      
      return { 
        success: true, 
        message: 'Event deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting event:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error deleting event from database'
      };
    }
  },
  
  // Register a user for an event
  registerAttendee: async (eventId: string, userId: string): Promise<DatabaseResponse> => {
    try {
      // First check if the user is already registered
      const { data: existingRegistration, error: checkError } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
        throw checkError;
      }

      if (existingRegistration) {
        return {
          success: false,
          message: 'User already registered for this event'
        };
      }

      // Check event capacity
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('max_capacity, registration_deadline')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      if (!event) {
        return {
          success: false,
          message: 'Event not found'
        };
      }

      // Check registration deadline
      if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
        return {
          success: false,
          message: 'Registration deadline has passed'
        };
      }

      // Check current registration count
      const { count, error: countError } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact' })
        .eq('event_id', eventId)
        .eq('status', 'registered');

      if (countError) throw countError;

      if (count && count >= event.max_capacity) {
        return {
          success: false,
          message: 'Event is at maximum capacity'
        };
      }

      // Create the registration
      const { data, error } = await supabase
        .from('event_registrations')
        .insert([{
          event_id: eventId,
          user_id: userId,
          status: 'registered'
        }])
        .select()
        .single();

      if (error) throw error;

      return { 
        success: true, 
        data,
        message: 'Registration successful'
      };
    } catch (error) {
      console.error('Error registering for event:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error registering for event'
      };
    }
  },
  
  // Unregister a user from an event
  unregisterAttendee: async (eventId: string, userId: string): Promise<DatabaseResponse> => {
    try {
      // Check if the registration exists
      const { data: existingRegistration, error: checkError } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      if (checkError) throw checkError;

      if (!existingRegistration) {
        return {
          success: false,
          message: 'User not registered for this event'
        };
      }

      // Update the registration status to cancelled
      const { data, error } = await supabase
        .from('event_registrations')
        .update({ status: 'cancelled' })
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { 
        success: true, 
        data,
        message: 'Unregistration successful'
      };
    } catch (error) {
      console.error('Error unregistering from event:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error unregistering from event'
      };
    }
  }
};
