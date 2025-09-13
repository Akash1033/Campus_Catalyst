
import React from 'react';
import { useEvents } from '@/context/EventContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Star, MessageSquare } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const AdminFeedbackModeration: React.FC = () => {
  const { events, feedback } = useEvents();
  
  // Sort feedback by submission date (newest first)
  const sortedFeedback = [...feedback].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
  
  // Get event title from event ID
  const getEventTitle = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    return event ? event.title : 'Unknown Event';
  };
  
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            size={16}
            className={index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };
  
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Feedback Moderation</h1>
        <p className="text-gray-600">Review feedback submissions from event attendees</p>
      </header>
      
      {sortedFeedback.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">No feedback submissions yet</h3>
            <p className="text-gray-500 mt-1">
              Feedback from event attendees will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedFeedback.map(item => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-lg">{getEventTitle(item.eventId)}</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar size={14} />
                    <span>{format(parseISO(item.submittedAt), 'MMM d, yyyy')}</span>
                  </div>
                  {renderStars(item.rating)}
                </div>
              </CardHeader>
              <CardContent>
                {item.comment ? (
                  <p className="text-gray-700">{item.comment}</p>
                ) : (
                  <p className="text-gray-500 italic">No comment provided</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFeedbackModeration;
