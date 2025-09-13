
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { CalendarDays, MapPin, User, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EventTicketProps {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  userName: string;
}

const EventTicket: React.FC<EventTicketProps> = ({
  eventId,
  eventTitle,
  eventDate,
  eventLocation,
  userName,
}) => {
  // Generate a unique ticket data for the QR code
  const ticketData = JSON.stringify({
    eventId,
    userId: useAuth().user?.id,
    timestamp: new Date().toISOString(),
  });
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className="max-w-md mx-auto shadow-lg border-2 border-gray-200 print:border-none print:shadow-none">
      <CardHeader className="border-b border-gray-200">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">Event Ticket</CardTitle>
          <div className="print:hidden">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              Print
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-6 space-y-6">
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold mb-1 text-center">{eventTitle}</h2>
          <div className="flex items-center text-gray-500 text-sm mb-4">
            <CalendarDays size={16} className="mr-1" />
            <span>{format(parseISO(eventDate), 'EEEE, MMMM d, yyyy • h:mm a')}</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin size={16} className="mr-1" />
            <span>{eventLocation}</span>
          </div>
        </div>
        
        <div className="flex justify-center">
          <div className="border-4 border-white p-2 shadow-md bg-white">
            <QRCodeSVG value={ticketData} size={200} />
          </div>
        </div>
        
        <div className="flex flex-col space-y-2 border-t border-b border-gray-200 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <User size={16} className="mr-2 text-gray-500" />
              <span className="text-sm font-medium">Attendee</span>
            </div>
            <span className="font-medium">{userName}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Ticket size={16} className="mr-2 text-gray-500" />
              <span className="text-sm font-medium">Ticket ID</span>
            </div>
            <span className="font-mono text-sm">{eventId.substring(0, 8).toUpperCase()}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 text-center text-sm text-gray-500 print:bg-transparent">
        <p>Present this QR code at the event for check-in.</p>
      </CardFooter>

      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            
            .ticket-container, .ticket-container * {
              visibility: visible;
            }
            
            .ticket-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            
            .print-hidden {
              display: none;
            }
          }
        `}
      </style>
    </Card>
  );
};

export default EventTicket;
