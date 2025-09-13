
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const EventFeedbackForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events, submitFeedback, feedback } = useEvents();
  
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  
  const event = events.find(e => e.id === id);
  
  // Check if user is registered for this event
  const isRegistered = user && event && event.attendees.includes(user.id);
  
  // Check if user has already submitted feedback
  const hasSubmittedFeedback = user && feedback.some(
    f => f.eventId === id && f.userId === user.id
  );
  
  // Redirect if event not found or user not registered
  if (!event) {
    return (
      <div className="text-center py-12">
        <div className="text-lg mb-4">Event not found</div>
        <Button onClick={() => navigate('/events')}>Back to Events</Button>
      </div>
    );
  }
  
  if (!user || !isRegistered) {
    return (
      <div className="text-center py-12">
        <div className="text-lg mb-4">
          You must be registered for this event to provide feedback.
        </div>
        <Button onClick={() => navigate(`/events/${id}`)}>Back to Event</Button>
      </div>
    );
  }
  
  if (hasSubmittedFeedback) {
    return (
      <div className="text-center py-12">
        <div className="text-lg mb-4">
          You have already provided feedback for this event.
        </div>
        <Button onClick={() => navigate(`/events/${id}`)}>Back to Event</Button>
      </div>
    );
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    submitFeedback({
      eventId: id!,
      userId: user.id,
      rating,
      comment
    });
    
    toast.success('Thank you for your feedback!');
    navigate(`/events/${id}`);
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Provide Feedback</h1>
      <h2 className="text-lg font-medium mb-6">Event: {event.title}</h2>
      
      <Card className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Your Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium leading-none">
                How would you rate this event? *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={rating === value ? "default" : "outline"}
                    className="w-12 h-12"
                    onClick={() => setRating(value)}
                  >
                    {value}
                  </Button>
                ))}
              </div>
              <div className="text-xs text-gray-500 flex justify-between">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="comment" className="text-sm font-medium leading-none">
                Comments (optional)
              </label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts on the event..."
                className="min-h-32"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(`/events/${id}`)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Submit Feedback
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default EventFeedbackForm;
