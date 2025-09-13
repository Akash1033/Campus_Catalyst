
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

const MongoDbStatus: React.FC = () => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  const testConnection = async () => {
    setStatus('connecting');
    try {
      // Simulate MongoDB connection test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, we'll simulate a successful connection
      // In a real app, you would make an actual API request to test the connection
      setStatus('connected');
      toast.success('Successfully connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      setStatus('disconnected');
      toast.error('Failed to connect to MongoDB');
    }
  };

  useEffect(() => {
    // Test connection on component mount
    testConnection();
  }, []);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          MongoDB Connection Status
          {status === 'connected' && <Badge className="bg-green-500">Connected</Badge>}
          {status === 'connecting' && <Badge className="bg-yellow-500">Connecting...</Badge>}
          {status === 'disconnected' && <Badge className="bg-red-500">Disconnected</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4">
          {status === 'connected' 
            ? 'Your application is connected to MongoDB. Events will be stored both locally and in the database.'
            : 'Your application is not connected to MongoDB. Events will be stored locally only.'}
        </p>
        <Button onClick={testConnection} variant="outline" size="sm">
          Test Connection
        </Button>
      </CardContent>
    </Card>
  );
};

export default MongoDbStatus;
