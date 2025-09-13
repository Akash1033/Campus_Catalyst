import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import { notifyAllStudentsOfNewEvent } from '../lib/api/email';

export type Event = Database['public']['Tables']['events']['Row'];
export type EventInsert = Database['public']['Tables']['events']['Insert'];
export type EventUpdate = Database['public']['Tables']['events']['Update'];

export const getEvents = async (params?: {
  category?: string;
  tag?: string;
  organizer_id?: string;
  is_approved?: boolean;
}) => {
  let query = supabase
    .from('events')
    .select(`
      *,
      organizer:users(full_name, avatar_url),
      category:event_categories(name),
      tags:event_tag_relations(
        tag:event_tags(name)
      )
    `);

  if (params?.category) {
    query = query.eq('category', params.category);
  }

  if (params?.organizer_id) {
    query = query.eq('organizer_id', params.organizer_id);
  }

  if (params?.is_approved !== undefined) {
    query = query.eq('is_approved', params.is_approved);
  }

  const { data, error } = await query.order('start_time', { ascending: true });

  if (error) throw error;
  return data;
};

export const getEventById = async (id: string) => {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      organizer:users(full_name, avatar_url),
      category:event_categories(name),
      tags:event_tag_relations(
        tag:event_tags(name)
      ),
      registrations:event_registrations(
        user:users(full_name, avatar_url),
        status
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createEvent = async (event: EventInsert) => {
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single();

  if (error) throw error;

  // Notify all students after event creation
  if (data) {
    await notifyAllStudentsOfNewEvent({
      title: data.title,
      description: data.description,
      start_time: data.start_time,
      end_time: data.end_time,
      location: data.location,
    });
  }

  return data;
};

export const updateEvent = async (id: string, event: EventUpdate) => {
  const { data, error } = await supabase
    .from('events')
    .update(event)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteEvent = async (id: string) => {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const getEventCategories = async () => {
  const { data, error } = await supabase
    .from('event_categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
};

export const getEventTags = async () => {
  const { data, error } = await supabase
    .from('event_tags')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
};

export const addEventTags = async (eventId: string, tagIds: string[]) => {
  const { error } = await supabase
    .from('event_tag_relations')
    .insert(tagIds.map(tagId => ({ event_id: eventId, tag_id: tagId })));

  if (error) throw error;
};

export const removeEventTags = async (eventId: string, tagIds: string[]) => {
  const { error } = await supabase
    .from('event_tag_relations')
    .delete()
    .eq('event_id', eventId)
    .in('tag_id', tagIds);

  if (error) throw error;
}; 