'use client';

import { Navigation } from '@/components/Navigation';
import { CreateEventModal } from '@/components/CreateEventModal';
import { BuyTicketsModal } from '@/components/BuyTicketsModal';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { useGetEvents, useBuyTicket } from '@/lib/contract';
import { formatEther } from 'ethers';
import { toast } from 'react-hot-toast';
import { EventPreviewModal } from '@/components/EventPreviewModal';
import Image from 'next/image';
import { getEventImage } from '@/lib/pinata';

interface Event {
  id: number;
  name: string;
  description: string;
  price: bigint;
  maxTickets: bigint;
  ticketsSold: bigint;
  eventDate: bigint;
  isActive: boolean;
  creator: string;
  location: string;
  category: string;
  imageCID: string;
}

export default function Events() {
  const { isConnected } = useAccount();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { getEvents } = useGetEvents();
  const { buyTicket, isLoading: isBuying } = useBuyTicket();
  const [eventImages, setEventImages] = useState<{ [key: number]: string }>({});

  // Separate events into upcoming and past
  const upcomingEvents = events.filter(event => Number(event.eventDate) * 1000 > Date.now());
  const pastEvents = events.filter(event => Number(event.eventDate) * 1000 <= Date.now());

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const fetchedEvents = await getEvents();
      console.log('Fetched events:', fetchedEvents);
      
      // Map the events to include their IDs and validate data
      const mappedEvents = fetchedEvents.map((event: any, index: number) => {
        // Ensure all required fields are present and valid
        if (!event || typeof event !== 'object') {
          console.error('Invalid event data:', event);
          return null;
        }

        return {
          id: index,
          name: event.name || 'Unnamed Event',
          description: event.description || 'No description available',
          price: event.price || BigInt(0),
          maxTickets: event.maxTickets || BigInt(0),
          ticketsSold: event.ticketsSold || BigInt(0),
          eventDate: event.eventDate || BigInt(0),
          isActive: event.isActive ?? true,
          creator: event.creator || 'Unknown',
          location: event.location || 'Unknown',
          category: event.category || 'Unknown',
          imageCID: event.imageCID || ''
        };
      }).filter(Boolean); // Remove any null entries

      console.log('Mapped events:', mappedEvents);
      setEvents(mappedEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch events only when the page is first visited
  useEffect(() => {
    if (isConnected) {
      fetchEvents();
    }
  }, [isConnected]); // Only run when isConnected changes

  useEffect(() => {
    const loadEventImages = async () => {
      const imagePromises = events.map(async (event) => {
        if (event.imageCID) {
          try {
            const imageUrl = await getEventImage(event.imageCID);
            setEventImages(prev => ({ ...prev, [event.id]: imageUrl }));
          } catch (error) {
            console.error(`Error loading image for event ${event.id}:`, error);
          }
        }
      });
      await Promise.all(imagePromises);
    };

    if (events.length > 0) {
      loadEventImages();
    }
  }, [events]);

  const handlePreviewClick = (event: Event) => {
    setSelectedEvent(event);
    setIsPreviewModalOpen(true);
  };

  const handleBuyClick = (event: Event) => {
    if (!event || !event.price) {
      console.error('Invalid event data:', event);
      toast.error('Invalid event data');
      return;
    }
    setSelectedEvent(event);
    setIsBuyModalOpen(true);
  };

  const handleBuyTicket = async (quantity: number) => {
    if (!selectedEvent || !selectedEvent.price) {
      console.error('Invalid selected event:', selectedEvent);
      toast.error('Invalid event data');
      return;
    }
    
    try {
      const totalPrice = Number(formatEther(selectedEvent.price)) * quantity;
      console.log("Buying ticket:", {
        eventId: selectedEvent.id,
        totalPrice,
        quantity,
        eventData: selectedEvent
      });
      
      await buyTicket(selectedEvent.id, totalPrice, quantity);
      toast.success('Ticket purchased successfully!');
      setIsBuyModalOpen(false);
      setSelectedEvent(null);
      
      // Refresh events after purchase
      await fetchEvents();
    } catch (error) {
      console.error('Error buying ticket:', error);
      toast.error('Failed to purchase ticket. Please try again.');
    }
  };

  const handleCreateEventSuccess = async () => {
    setIsCreateModalOpen(false);
    await fetchEvents(); // Refresh events after creating a new one
  };

  if (!isConnected) {
    return (
      <main>
        <Navigation />
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Please connect your wallet to view events</h2>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Navigation />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Events</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Create Event
          </button>
        </div>

        {isLoading ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Loading events...</h2>
          </div>
        ) : error ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-900">Error loading events : {error.message}</h2>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Upcoming Events Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900">No upcoming events</h3>
                    <p className="mt-2 text-sm text-gray-500">Create a new event to get started!</p>
                  </div>
                ) : (
                  upcomingEvents.map((event: Event) => (
                    <div key={event.id} className="bg-white overflow-hidden shadow rounded-lg">
                      {eventImages[event.id] && (
                        <div className="relative h-48 w-full">
                          <Image
                            src={eventImages[event.id]}
                            alt={event.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="text-lg font-medium text-gray-900">{event.name}</h3>
                        <p className="mt-2 text-sm text-gray-500">{event.description}</p>
                        <p className="mt-2 text-sm text-gray-500">
                          Category: {event.category}
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                          Location: {event.location}
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                          Available Tickets: {Number(event.maxTickets - event.ticketsSold)}
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                          Price: {event.price ? formatEther(event.price) : '0'} ETH
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                          Date: {event.eventDate ? new Date(Number(event.eventDate) * 1000).toLocaleString() : 'Not set'}
                        </p>
                        <div className="mt-4 space-y-2">
                          <button 
                            onClick={() => handlePreviewClick(event)}
                            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
                          >
                            Preview Event
                          </button>
                          <button 
                            onClick={() => handleBuyClick(event)}
                            disabled={isBuying || Number(event.maxTickets - event.ticketsSold) === 0}
                            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isBuying ? 'Processing...' : 'Buy Ticket'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Past Events Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Past Events</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pastEvents.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900">No past events</h3>
                  </div>
                ) : (
                  pastEvents.map((event: Event) => (
                    <div key={event.id} className="bg-white overflow-hidden shadow rounded-lg">
                      {eventImages[event.id] && (
                        <div className="relative h-48 w-full">
                          <Image
                            src={eventImages[event.id]}
                            alt={event.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="text-lg font-medium text-gray-900">{event.name}</h3>
                        <p className="mt-2 text-sm text-gray-500">{event.description}</p>
                        <p className="mt-2 text-sm text-gray-500">
                          Category: {event.category}
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                          Location: {event.location}
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                          Total Tickets: {Number(event.maxTickets)}
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                          Price: {event.price ? formatEther(event.price) : '0'} ETH
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                          Date: {event.eventDate ? new Date(Number(event.eventDate) * 1000).toLocaleString() : 'Not set'}
                        </p>
                        <button 
                          onClick={() => handlePreviewClick(event)}
                          className="mt-4 w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
                        >
                          View Event Details
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <CreateEventModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateEventSuccess}
      />
      {selectedEvent && (
        <>
          <EventPreviewModal
            isOpen={isPreviewModalOpen}
            onClose={() => {
              setIsPreviewModalOpen(false);
              setSelectedEvent(null);
            }}
            event={selectedEvent}
            onBuyTicket={handleBuyTicket}
            isBuying={isBuying}
          />
          <BuyTicketsModal
            isOpen={isBuyModalOpen}
            onClose={() => {
              setIsBuyModalOpen(false);
              setSelectedEvent(null);
            }}
            ticketPrice={Number(formatEther(selectedEvent.price))}
            eventName={selectedEvent.name}
            onConfirm={handleBuyTicket}
            isLoading={isBuying}
          />
        </>
      )}
    </main>
  );
} 