import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, ClipboardList, ArrowRight, Award } from 'lucide-react';
import EventCard from '@/components/EventCard';
import { supabase } from '@/lib/supabase';
import { getUserRegisteredEvents } from '@/lib/api/events';
import sgMail from '@sendgrid/mail';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { events } = useEvents();
  
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
  const [loadingRegistered, setLoadingRegistered] = useState(true);

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      if (!user) return;
      setLoadingRegistered(true);
      try {
        const events = await getUserRegisteredEvents(user.id);
        setRegisteredEvents(events);
      } catch (err) {
        setRegisteredEvents([]);
      } finally {
        setLoadingRegistered(false);
      }
    };
    fetchRegisteredEvents();
  }, [user]);

  const now = new Date();
  // Get upcoming events (all available events)
  const upcomingEvents = events
    .filter(event => new Date(event.end_time) >= now)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 3);
  
  // Get user's registered events
  const upcomingRegisteredEvents = registeredEvents
    .filter(event => new Date(event.end_time) > now)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 3);
  
  // Past registered events for feedback
  const pastRegisteredEvents = registeredEvents
    .filter(event => new Date(event.end_time) <= now)
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
    .slice(0, 3);

  const [certificateCount, setCertificateCount] = useState(0);

  useEffect(() => {
    const fetchCertificateCount = async () => {
      if (!user) return;
      const { count, error } = await supabase
        .from('certificates')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', user.id);
      if (!error && typeof count === 'number') setCertificateCount(count);
    };
    fetchCertificateCount();
  }, [user]);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Registrations</CardTitle>
            <CardDescription>Events you've signed up for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-bold">{registeredEvents.length}</div>
                <div className="text-sm text-gray-500">Total registrations</div>
              </div>
              <ClipboardList className="text-gray-400" />
            </div>
            <Button asChild variant="outline" className="w-full mt-2">
              <Link to="/student/registered">View All Registrations</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Find events to attend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-bold">{upcomingEvents.length}</div>
                <div className="text-sm text-gray-500">Available events</div>
              </div>
              <CalendarDays className="text-gray-400" />
            </div>
            <Button asChild variant="outline" className="w-full mt-2">
              <Link to="/events">Browse Events</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Certificates</CardTitle>
            <CardDescription>Achievements from completed events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-bold">
                  {certificateCount}
                </div>
                <div className="text-sm text-gray-500">Potential certificates</div>
              </div>
              <Award className="text-gray-400" />
            </div>
            <Button asChild variant="outline" className="w-full mt-2">
              <Link to="/student/certificates">View Certificates</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* My Upcoming Registrations */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">My Upcoming Registrations</h2>
          <Link to="/student/registered" className="text-primary flex items-center hover:underline text-sm">
            View all <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        
        {upcomingRegisteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
            {upcomingRegisteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <Card className="bg-gray-50 border border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-gray-500 mb-4">You haven't registered for any upcoming events</p>
              <Button asChild className="w-full">
                <Link to="/events">Browse Events</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
      
      {/* Past Events for Feedback */}
      {pastRegisteredEvents.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Feedback Opportunities</h2>
            <Link to="/student/feedback" className="text-primary flex items-center hover:underline text-sm">
              View all <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
            {pastRegisteredEvents.map(event => (
              <Card key={event.id} className="bg-gray-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{event.title}</CardTitle>
                  <CardDescription className="text-xs">
                    Attended on {new Date(event.end_time).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link to={`/events/${event.id}/feedback`}>
                      Provide Feedback
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default StudentDashboard;
