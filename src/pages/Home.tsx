import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, CalendarDays, Users, User, ScrollText, PenLine } from 'lucide-react';
import EventCard from '@/components/EventCard';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const Home: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { events } = useEvents();
  const navigate = useNavigate();

  // Get upcoming events (limit to 3 for the homepage)
  const upcomingEvents = events
    .filter(event => new Date(event.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // Updated event images with better sports and campus activities images
  const eventImages = [
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80", // Campus event
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80", // Tech workshop
    "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80", // Cultural event
    "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"  // Sports event
  ];

  const eventTitles = [
    "Campus Sports Tournaments",
    "Cultural Festivals & Performances",
    "Interactive Workshops",
    "Academic Seminars & Conferences"
  ];

  const eventDescriptions = [
    "Join exciting sports competitions throughout the year, from basketball tournaments to intramural leagues.",
    "Experience the rich diversity of campus life through cultural celebrations, performances and festivals.",
    "Build skills and connections through hands-on workshops led by industry experts and talented peers.",
    "Expand your knowledge with thought-provoking seminars and academic conferences featuring renowned speakers."
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section with Auto-sliding Carousel */}
      <section className="relative mb-16 flex justify-center items-center">
        <Carousel className="w-full max-w-6xl" autoPlay={true} delayMs={5000}>
          <CarouselContent>
            {eventImages.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative h-[70vh] w-full overflow-hidden rounded-2xl flex justify-center items-center">
                  <div 
                    className="absolute inset-0 bg-cover bg-center" 
                    style={{ backgroundImage: `url(${image})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent"></div>
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-center items-center p-8 md:p-16 text-white z-10 max-w-3xl mx-auto text-center">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 text-center max-w-2xl">
                      {eventTitles[index]}
                    </h1>
                    <p className="text-lg md:text-xl opacity-90 mb-8 text-center max-w-2xl">
                      {eventDescriptions[index]}
                    </p>
                    <div className="flex justify-center gap-4">
                      {isAuthenticated ? (
                        <Button 
                          variant="secondary" 
                          size="lg" 
                          className="bg-white text-primary hover:bg-gray-100"
                          onClick={() => {
                            if (user) {
                              switch (user.role) {
                                case 'student':
                                  navigate('/student');
                                  break;
                                case 'organizer':
                                  navigate('/organizer');
                                  break;
                                case 'admin':
                                  navigate('/admin');
                                  break;
                                default:
                                  navigate('/');
                              }
                            }
                          }}
                        >
                          Go to Dashboard
                        </Button>
                      ) : (
                        <>
                          <Button 
                            variant="secondary" 
                            size="lg" 
                            className="bg-white text-primary hover:bg-gray-100"
                            onClick={() => navigate('/register')}
                          >
                            Sign Up
                          </Button>
                          <Button 
                            variant="outline" 
                            size="lg" 
                            className="border-white text-white hover:bg-white/10"
                            onClick={() => navigate('/login')}
                          >
                            Log In
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute bottom-4 right-4 z-20 flex gap-2">
            <CarouselPrevious className="relative left-0 translate-y-0 bg-white/30 hover:bg-white/50" />
            <CarouselNext className="relative right-0 translate-y-0 bg-white/30 hover:bg-white/50" />
          </div>
        </Carousel>
      </section>
      
      {/* Quick Navigation Buttons */}
      <section className="mb-16 mx-auto text-center">
        <h2 className="text-2xl font-bold mb-8">Ignite Your Campus Life with Events That Matter!</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-all transform hover:-translate-y-1">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <CalendarDays size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">View Upcoming Events</h3>
            <p className="text-gray-600 mb-4 text-center">Discover the latest events happening around campus</p>
            <Button 
              variant="outline"
              className="mt-auto"
              onClick={() => navigate('/events')}
            >
              Browse Events
            </Button>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-all transform hover:-translate-y-1">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <ScrollText size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Register for Event</h3>
            <p className="text-gray-600 mb-4 text-center">Quick access to registration for upcoming campus events</p>
            <Button 
              variant="outline"
              className="mt-auto"
              onClick={() => isAuthenticated ? navigate('/student/registered') : navigate('/login')}
            >
              Register Now
            </Button>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-all transform hover:-translate-y-1">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <PenLine size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Organize an Event</h3>
            <p className="text-gray-600 mb-4 text-center">Create and manage your own events on campus</p>
            <Button 
              variant="outline"
              className="mt-auto"
              onClick={() => isAuthenticated ? navigate('/organizer/events/create') : navigate('/login')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </section>
      
      {/* Featured Events */}
      <section className="mb-16 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Upcoming Events</h2>
          <Link to="/events" className="text-primary flex items-center hover:underline">
            View all events <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        
        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <CalendarDays size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No upcoming events available</p>
          </div>
        )}
      </section>

      {/* Features with Images - Updated with better campus themed images */}
      <section className="mb-12 mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Explore Campus Activities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:translate-y-[-5px]">
            <div 
              className="h-48 bg-cover bg-center" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1580237072617-771c3ecc4a24?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')" }}
            ></div>
            <div className="p-6">
              <CalendarDays size={32} className="text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Athletic Events</h3>
              <p className="text-gray-600">
                From competitive tournaments to casual intramurals, find sports events for all skill levels.
              </p>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:translate-y-[-5px]">
            <div 
              className="h-48 bg-cover bg-center" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')" }}
            ></div>
            <div className="p-6">
              <User size={32} className="text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Workshops & Training</h3>
              <p className="text-gray-600">
                Enhance your skills with hands-on workshops and professional development sessions.
              </p>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:translate-y-[-5px]">
            <div 
              className="h-48 bg-cover bg-center" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')" }}
            ></div>
            <div className="p-6">
              <Users size={32} className="text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Cultural Celebrations</h3>
              <p className="text-gray-600">
                Experience diverse cultural performances, art exhibitions, and campus-wide festivals.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 bg-primary/5 rounded-3xl px-8 mb-8 mx-auto">
        <h2 className="text-2xl font-bold mb-10 text-center">What Students Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">JD</div>
              <div className="ml-4">
                <h4 className="font-semibold">Jane Doe</h4>
                <p className="text-sm text-gray-500">Computer Science</p>
              </div>
            </div>
            <p className="text-gray-600 italic">"This platform has completely changed how I discover campus events. I've made so many new friends!"</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">MS</div>
              <div className="ml-4">
                <h4 className="font-semibold">Mike Smith</h4>
                <p className="text-sm text-gray-500">Business Administration</p>
              </div>
            </div>
            <p className="text-gray-600 italic">"As an event organizer, I can now reach more students and manage my events efficiently."</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">AT</div>
              <div className="ml-4">
                <h4 className="font-semibold">Aisha Thomas</h4>
                <p className="text-sm text-gray-500">Engineering</p>
              </div>
            </div>
            <p className="text-gray-600 italic">"The feedback system has helped us improve our events based on what students really want."</p>
          </div>
        </div>
      </section>
      
      {/* CTA Section - Updated with a better campus event image */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-campus-500 to-campus-700 text-white mx-auto">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80')" }}
        ></div>
        <div className="relative z-10 px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join the Campus Community?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Sign up today and start exploring events that match your interests or create your own!
          </p>
          <div className="flex justify-center gap-4">
            {!isAuthenticated && (
              <Button 
                variant="secondary" 
                size="lg" 
                className="bg-white text-primary hover:bg-gray-100"
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
            )}
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white/10"
              onClick={() => navigate('/events')}
            >
              Browse Events
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
