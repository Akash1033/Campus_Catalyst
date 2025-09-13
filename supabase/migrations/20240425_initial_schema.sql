-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE user_role AS ENUM ('student', 'organizer', 'admin');
CREATE TYPE registration_status AS ENUM ('registered', 'cancelled', 'attended');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    avatar_url TEXT,
    phone_number TEXT,
    department TEXT,
    student_id TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    organizer_id UUID REFERENCES users(id) NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    category TEXT,
    image_url TEXT,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (end_time > start_time),
    CHECK (registration_deadline IS NULL OR registration_deadline <= start_time)
);

-- Create event_registrations table
CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status registration_status NOT NULL DEFAULT 'registered',
    check_in_time TIMESTAMP WITH TIME ZONE,
    UNIQUE(event_id, user_id)
);

-- Create feedback table
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Create organizer_approvals table
CREATE TABLE organizer_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    status approval_status NOT NULL DEFAULT 'pending',
    admin_id UUID REFERENCES users(id),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_categories table
CREATE TABLE event_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_tags table
CREATE TABLE event_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_tag_relations table
CREATE TABLE event_tag_relations (
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES event_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, tag_id)
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_events_organizer_id ON events(organizer_id);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_is_approved ON events(is_approved);
CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX idx_event_registrations_status ON event_registrations(status);
CREATE INDEX idx_feedback_event_id ON feedback(event_id);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_organizer_approvals_user_id ON organizer_approvals(user_id);
CREATE INDEX idx_organizer_approvals_status ON organizer_approvals(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizer_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Users policies
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- Events policies
CREATE POLICY "Anyone can view approved events" ON events
    FOR SELECT USING (is_approved = true);

CREATE POLICY "Organizers can view their own events" ON events
    FOR SELECT USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can create events" ON events
    FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their own events" ON events
    FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Admins can view all events" ON events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can update all events" ON events
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- Event registrations policies
CREATE POLICY "Users can view their own registrations" ON event_registrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can register for events" ON event_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations" ON event_registrations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Organizers can view registrations for their events" ON event_registrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM events
            WHERE events.id = event_registrations.event_id
            AND events.organizer_id = auth.uid()
        )
    );

-- Feedback policies
CREATE POLICY "Users can view their own feedback" ON feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create feedback" ON feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Organizers can view feedback for their events" ON feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM events
            WHERE events.id = feedback.event_id
            AND events.organizer_id = auth.uid()
        )
    );

-- Organizer approvals policies
CREATE POLICY "Users can view their own approval status" ON organizer_approvals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can request organizer role" ON organizer_approvals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all approvals" ON organizer_approvals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can update approvals" ON organizer_approvals
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizer_approvals_updated_at
    BEFORE UPDATE ON organizer_approvals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to check event capacity
CREATE OR REPLACE FUNCTION check_event_capacity()
RETURNS TRIGGER AS $$
DECLARE
    current_registrations INTEGER;
    event_capacity INTEGER;
BEGIN
    SELECT COUNT(*) INTO current_registrations
    FROM event_registrations
    WHERE event_id = NEW.event_id AND status = 'registered';

    SELECT capacity INTO event_capacity
    FROM events
    WHERE id = NEW.event_id;

    IF current_registrations >= event_capacity THEN
        RAISE EXCEPTION 'Event is at full capacity';
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for capacity check
CREATE TRIGGER check_capacity_before_registration
    BEFORE INSERT ON event_registrations
    FOR EACH ROW
    EXECUTE FUNCTION check_event_capacity();

-- Insert default categories
INSERT INTO event_categories (name, description) VALUES
    ('Academic', 'Events related to academic activities'),
    ('Sports', 'Sports and physical activities'),
    ('Cultural', 'Cultural and artistic events'),
    ('Social', 'Social gatherings and networking'),
    ('Workshop', 'Educational workshops and training'),
    ('Conference', 'Academic and professional conferences'),
    ('Competition', 'Competitions and contests'),
    ('Other', 'Other types of events'); 