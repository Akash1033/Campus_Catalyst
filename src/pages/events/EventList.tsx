import React, { useState, useEffect } from 'react';
import { useEvents } from '@/context/EventContext';
import EventCard from '@/components/EventCard';
import EventCalendar from '@/components/EventCalendar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X, List, CalendarDays, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getEventCategories } from '@/api/events';
import { EventCategory } from '@/types/database';

const EventList: React.FC = () => {
  const { events, loading, refreshEvents } = useEvents();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('date-asc'); // 'date-asc', 'date-desc', 'title-asc'
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Extract unique tags from all events
  const allTags = Array.from(
    new Set(events.flatMap(event => 
      event.tags?.map(t => t.tag.name) || []
    ))
  ).sort();
  
  // Separate events into upcoming and past
  const now = new Date();
  const upcomingEvents = events.filter(event => new Date(event.end_time) >= now);
  const pastEvents = events.filter(event => new Date(event.end_time) < now);
  
  // Filter events based on search query, selected tags, and selected category
  const filterEvents = (eventList: typeof events) => {
    return eventList.filter(event => {
      const matchesSearch = 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTags = 
        selectedTags.length === 0 || 
        selectedTags.some(tag => 
          event.tags?.some(t => t.tag.name === tag)
        );
      const matchesCategory =
        selectedCategory === 'all' ||
        (event.category && (
          (typeof event.category === 'object' && event.category.id === selectedCategory) ||
          (typeof event.category === 'string' && event.category === selectedCategory)
        ));
      return matchesSearch && matchesTags && matchesCategory;
    });
  };
  
  // Sort filtered events
  const sortEvents = (eventList: typeof events) => {
    return [...eventList].sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
        case 'date-desc':
          return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  };
  
  const filteredUpcomingEvents = sortEvents(filterEvents(upcomingEvents));
  const filteredPastEvents = sortEvents(filterEvents(pastEvents));
  
  // Handle tag selection toggle
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setSortBy('date-asc');
    setSelectedCategory('all');
  };
  
  // Manual refresh of events
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshEvents();
    setRefreshing(false);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getEventCategories();
        setCategories(cats);
      } catch (err) {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div>
      <header className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold">Campus Events</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={refreshing || loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <p className="text-gray-600">Browse and register for upcoming events from our database</p>
      </header>
      
      {/* View Toggle */}
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-md shadow-sm">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="rounded-r-none"
          >
            <List className="mr-1 h-4 w-4" />
            List
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className="rounded-l-none"
          >
            <CalendarDays className="mr-1 h-4 w-4" />
            Calendar
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>
          <div className="w-full md:w-48">
            <Select 
              value={selectedCategory} 
              onValueChange={setSelectedCategory}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-48">
            <Select 
              value={sortBy} 
              onValueChange={setSortBy}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-asc">Soonest First</SelectItem>
                <SelectItem value="date-desc">Latest First</SelectItem>
                <SelectItem value="title-asc">A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(searchQuery || selectedTags.length > 0 || selectedCategory !== 'all') && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters} 
              className="hidden md:flex"
              disabled={loading}
            >
              <X size={16} className="mr-1" />
              Clear filters
            </Button>
          )}
        </div>
        
        {/* Tags */}
        {allTags.length > 0 && (
          <div className="mt-4">
            <div className="text-sm text-gray-500 mb-2">Filter by tags:</div>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <Badge 
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer ${loading ? 'opacity-50' : ''}`}
                  onClick={() => !loading && toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Mobile clear button */}
        <div className="md:hidden mt-4">
          {(searchQuery || selectedTags.length > 0 || selectedCategory !== 'all') && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters} 
              className="w-full"
              disabled={loading}
            >
              <X size={16} className="mr-1" />
              Clear filters
            </Button>
          )}
        </div>
      </div>
      
      {/* Events Display */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <Skeleton key={n} className="h-[300px] rounded-xl" />
              ))}
            </div>
          ) : viewMode === 'list' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredUpcomingEvents.length > 0 ? (
                filteredUpcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No upcoming events found</p>
                </div>
              )}
            </div>
          ) : (
            <EventCalendar events={filteredUpcomingEvents} />
          )}
        </TabsContent>

        <TabsContent value="past">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <Skeleton key={n} className="h-[300px] rounded-xl" />
              ))}
            </div>
          ) : viewMode === 'list' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPastEvents.length > 0 ? (
                filteredPastEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No past events found</p>
                </div>
              )}
            </div>
          ) : (
            <EventCalendar events={filteredPastEvents} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventList;
