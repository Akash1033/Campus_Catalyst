import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const EventAttendees: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events } = useEvents();

  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const event = events.find(e => String(e.id) === String(id));
  const isCreator = user && event && event.organizer_id === user.id;
  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    const fetchAttendees = async () => {
      if (!id) return;
      setLoading(true);
      // Step 1: Fetch registrations
      const { data: regs, error: regError } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', id);
      if (regError) {
        console.error('Error fetching registrations:', regError.message);
        setAttendees([]);
        setLoading(false);
        return;
      }
      if (!regs || regs.length === 0) {
        setAttendees([]);
        setLoading(false);
        return;
      }
      // Step 2: Fetch profiles for registered user_ids
      const userIds = regs.map(r => r.user_id);
      const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      if (userError) {
        console.error('Error fetching users:', userError.message);
        setAttendees([]);
        setLoading(false);
        return;
      }
      // Step 3: Merge registration and user info
      const merged = regs.map(reg => {
        const user = users.find(u => u.id === reg.user_id);
        return {
          ...reg,
          user,
        };
      });
      setAttendees(merged);
      setLoading(false);
    };
    fetchAttendees();
  }, [id]);

  const markAttendance = async (registrationId: string) => {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({ status: 'attended' })
        .eq('id', registrationId);
      if (error) throw error;
      toast.success('Attendance marked!');
      // Refresh attendees
      setAttendees(prev => prev.map(a => a.id === registrationId ? { ...a, status: 'attended' } : a));
    } catch (err) {
      toast.error('Failed to mark attendance');
    }
  };

  if (!event) {
    return (
      <div className="text-center py-12">
        <div className="text-lg mb-4">Event not found</div>
        <Button onClick={() => navigate('/events')}>Back to Events</Button>
      </div>
    );
  }

  if (!isCreator && !isAdmin) {
    return (
      <div className="text-center py-12">
        <div className="text-lg mb-4">
          You don't have permission to view the attendees for this event.
        </div>
        <Button onClick={() => navigate(`/events/${id}`)}>Back to Event</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link to={`/events/${id}`} className="text-primary hover:underline">
          &larr; Back to Event
        </Link>
      </div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Event Attendees</h1>
        <p className="text-gray-600">{event.title}</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Attendees</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-gray-500 py-8">Loading attendees...</div>
          ) : attendees.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No attendees registered yet.</div>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow border border-gray-200 bg-white">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Registration Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Profile Created</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((entry, idx) => (
                    <tr
                      key={entry.id}
                      className={
                        idx % 2 === 0
                          ? 'bg-white hover:bg-gray-50 transition-colors'
                          : 'bg-gray-50 hover:bg-gray-100 transition-colors'
                      }
                    >
                      <td className="px-6 py-3 font-bold text-gray-900">{entry.user?.name || 'Unknown'}</td>
                      <td className="px-6 py-3 text-gray-700">{entry.user?.email || 'No email'}</td>
                      <td className="px-6 py-3">
                        <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-blue-50 text-blue-700 border border-blue-100">
                          {entry.user?.role || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-700 whitespace-nowrap">{entry.registration_time ? new Date(entry.registration_time).toLocaleString() : 'N/A'}</td>
                      <td className="px-6 py-3 text-gray-700 whitespace-nowrap">{entry.user?.created_at ? new Date(entry.user.created_at).toLocaleString() : 'N/A'}</td>
                      <td className="px-6 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={entry.status === 'attended'}
                          disabled={entry.status === 'attended'}
                          onChange={() => markAttendance(entry.id)}
                          className="h-4 w-4 accent-green-600 cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventAttendees;
