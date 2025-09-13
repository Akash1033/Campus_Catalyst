
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Star, MessageSquare } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const StudentFeedback: React.FC = () => {
  const { user } = useAuth();
  const { events, feedback } = useEvents();
  
  if (!user) return null;
  
  // Get past events the user has registered for
  const currentDate = new Date();
  const pastEvents = events.filter(
    event => event.attendees.includes(user.id) && new Date(event.date) < currentDate
  );
  
  // Separate events into those with and without feedback
  const userFeedback = feedback.filter(f => f.userId === user.id);
  const feedbackEventIds = userFeedback.map(f => f.eventId);
  
  const eventsNeedingFeedback = pastEvents.filter(
    event => !feedbackEventIds.includes(event.id)
  );
  
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
        <h1 className="text-2xl font-bold mb-2">My Feedback</h1>
        <p className="text-gray-600">Manage feedback for events you've attended</p>
      </header>
      
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Feedback ({eventsNeedingFeedback.length})
          </TabsTrigger>
          <TabsTrigger value="submitted">
            Submitted Feedback ({userFeedback.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-4">
          {eventsNeedingFeedback.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium">No pending feedback</h3>
                <p className="text-gray-500 mt-1">
                  You don't have any events that need feedback.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventsNeedingFeedback.map(event => (
                <Card key={event.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar size={14} className="mr-1" />
                      <span>Attended on {format(parseISO(event.date), 'MMM d, yyyy')}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Link to={`/events/${event.id}/feedback`}>
                      <Button>Provide Feedback</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="submitted" className="mt-4">
          {userFeedback.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium">No feedback submitted</h3>
                <p className="text-gray-500 mt-1">
                  You haven't provided feedback for any events yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {userFeedback.map(item => {
                const event = events.find(e => e.id === item.eventId);
                return (
                  <Card key={item.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{event ? event.title : 'Unknown Event'}</CardTitle>
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
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentFeedback;
