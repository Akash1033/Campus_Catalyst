import React, { useEffect } from 'react';
import { useEvents } from '@/context/EventContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CalendarCheck,
  CalendarX,
  CheckCircle,
  Clock,
  Eye,
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const AdminEventApprovals: React.FC = () => {
  const {
    pendingEvents,
    refreshPendingEvents,
    approveEvent,
    pendingLoading,
  } = useEvents();

  useEffect(() => {
    refreshPendingEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = async (eventId: string) => {
    console.log('Approving event:', eventId);
    try {
      await approveEvent(eventId, true);
      console.log('Event approved successfully');
      toast.success('Event approved successfully');
      refreshPendingEvents();
    } catch (error) {
      console.error('Error in handleApprove:', error);
      toast.error('Error approving event');
    }
  };

  const handleReject = async (eventId: string) => {
    try {
      await approveEvent(eventId, false);
      toast.success('Event rejected');
      refreshPendingEvents();
    } catch (error) {
      toast.error('Error rejecting event');
      console.error(error);
    }
  };

  // 🐞 Log pendingEvents to debug missing dates
  console.log('Pending events:', pendingEvents);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Event Approval Requests</h1>
        <p className="text-gray-600">Review and approve event submissions</p>
      </header>

      {pendingLoading ? (
        <Card>
          <CardContent className="flex justify-center p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 animate-spin" />
              <p>Loading pending events...</p>
            </div>
          </CardContent>
        </Card>
      ) : pendingEvents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium">No pending approval requests</h3>
            <p className="text-gray-500 mt-1">
              All event submissions have been processed.
            </p>
            <Button
              onClick={() => refreshPendingEvents()}
              variant="outline"
              className="mt-4"
            >
              <Clock size={14} className="mr-1" />
              Refresh List
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>
                      {event.created_at && !isNaN(Date.parse(event.created_at))
                        ? format(new Date(event.created_at), 'MMM d, yyyy, h:mm a')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{event.location || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700 border-amber-200"
                      >
                        <Clock size={14} className="mr-1" />
                        Pending Review
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link to={`/events/${event.id}`}>
                        <Button variant="outline" size="sm" className="mr-2">
                          <Eye size={14} className="mr-1" />
                          View
                        </Button>
                      </Link>
                      <Button
                        onClick={() => handleReject(event.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-200 hover:bg-red-50 hover:text-red-600 mr-2"
                      >
                        <CalendarX size={14} className="mr-1" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleApprove(event.id)}
                        variant="outline"
                        size="sm"
                        className="border-green-200 hover:bg-green-50 hover:text-green-600"
                      >
                        <CalendarCheck size={14} className="mr-1" />
                        Approve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminEventApprovals;
