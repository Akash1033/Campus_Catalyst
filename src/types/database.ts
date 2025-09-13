export type UserRole = 'student' | 'organizer' | 'admin';
export type RegistrationStatus = 'registered' | 'cancelled' | 'attended';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  phone_number?: string;
  department?: string;
  student_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  capacity: number;
  organizer_id: string;
  is_approved: boolean;
  category?: string;
  image_url?: string;
  registration_deadline?: string;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  registration_date: string;
  status: RegistrationStatus;
  check_in_time?: string;
}

export interface Feedback {
  id: string;
  event_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface OrganizerApproval {
  id: string;
  user_id: string;
  status: ApprovalStatus;
  admin_id?: string;
  reason?: string;
  created_at: string;
  updated_at: string;
}

export interface EventCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface EventTag {
  id: string;
  name: string;
  created_at: string;
}

export interface EventTagRelation {
  event_id: string;
  tag_id: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Database types for Supabase
export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at'>>;
      };
      event_registrations: {
        Row: EventRegistration;
        Insert: Omit<EventRegistration, 'id'>;
        Update: Partial<Omit<EventRegistration, 'id'>>;
      };
      feedback: {
        Row: Feedback;
        Insert: Omit<Feedback, 'id' | 'created_at'>;
        Update: Partial<Omit<Feedback, 'id' | 'created_at'>>;
      };
      organizer_approvals: {
        Row: OrganizerApproval;
        Insert: Omit<OrganizerApproval, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<OrganizerApproval, 'id' | 'created_at' | 'updated_at'>>;
      };
      event_categories: {
        Row: EventCategory;
        Insert: Omit<EventCategory, 'id' | 'created_at'>;
        Update: Partial<Omit<EventCategory, 'id' | 'created_at'>>;
      };
      event_tags: {
        Row: EventTag;
        Insert: Omit<EventTag, 'id' | 'created_at'>;
        Update: Partial<Omit<EventTag, 'id' | 'created_at'>>;
      };
      event_tag_relations: {
        Row: EventTagRelation;
        Insert: EventTagRelation;
        Update: Partial<EventTagRelation>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>;
      };
    };
  };
}; 