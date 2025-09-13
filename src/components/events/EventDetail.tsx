import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../../hooks/useEvents';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

export const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getEventById, registerForEvent, getEventCapacity } = useEvents();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [capacityInfo, setCapacityInfo] = useState<{ capacity: number; registered: number } | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const eventData = await getEventById(id);
        if (!eventData) {
          setError('Event not found');
          return;
        }
        setEvent(eventData);
        
        const capacityData = await getEventCapacity(id);
        setCapacityInfo(capacityData);
      } catch (err) {
        setError('Failed to fetch event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, getEventById, getEventCapacity]);

  const handleRegister = async () => {
    if (!user || !id) return;
    try {
      await registerForEvent(id, user.id);
      navigate('/student/registered');
    } catch (err) {
      console.error('Failed to register for event:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center text-red-500 p-4">
        {error || 'Event not found'}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{event.title}</CardTitle>
          <CardDescription>
            {format(new Date(event.start_time), 'PPP p')} - {format(new Date(event.end_time), 'p')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600">{event.description}</p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Location</h3>
            <p className="text-gray-600">{event.location}</p>
          </div>

          {capacityInfo && (
            <div>
              <h3 className="font-semibold mb-2">Registration</h3>
              <p className="text-gray-600">
                {capacityInfo.registered} / {capacityInfo.capacity} registered
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${(capacityInfo.registered / capacityInfo.capacity) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/events')}
          >
            Back to Events
          </Button>
          {user && (
            <Button
              variant="default"
              onClick={handleRegister}
              disabled={capacityInfo?.registered === capacityInfo?.capacity}
            >
              Register for Event
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}; 