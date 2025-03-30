'use client';

import { Navigation } from '@/components/Navigation';
import { CreateEventModal } from '@/components/CreateEventModal';
import { BuyTicketsModal } from '@/components/BuyTicketsModal';
import { EventPreviewModal } from '@/components/EventPreviewModal';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { useGetEvents, useBuyTicket } from '@/lib/contract';
import { formatEther } from 'ethers';
import { toast } from 'react-hot-toast';

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
}

export default function Events() {
  const { isConnected } = useAccount();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { getEvents } = useGetEvents();
  const { buyTicket, isLoading: isBuying } = useBuyTicket();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const fetchedEvents = await getEvents();
        console.log('Fetched events:', fetchedEvents); // Debug log
        
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
            creator: event.creator || 'Unknown'
          };
        }).filter(Boolean); // Remove any null entries

        console.log('Mapped events:', mappedEvents); // Debug log
        setEvents(mappedEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isConnected) {
      fetchEvents();
    }
  }, [isConnected, getEvents]);

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
      const updatedEvents = await getEvents();
      const mappedEvents = updatedEvents.map((event: any, index: number) => ({
        ...event,
        id: index
      })).filter(Boolean);
      
      setEvents(mappedEvents);
    } catch (error) {
      console.error('Error buying ticket:', error);
      toast.error('Failed to purchase ticket. Please try again.');
    }
  };

  const handlePreviewClick = (event: Event) => {
    setSelectedEvent(event);
    setIsPreviewModalOpen(true);
  };

  const handlePreviewBuyClick = () => {
    setIsPreviewModalOpen(false);
    setIsBuyModalOpen(true);
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">No events available yet</h3>
                <p className="mt-2 text-sm text-gray-500">Create the first event to get started!</p>
              </div>
            ) : (
              events.map((event: Event) => (
                <div key={event.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <h3 className="text-lg font-medium text-gray-900">{event.name}</h3>
                    <p className="mt-2 text-sm text-gray-500">{event.description}</p>
                    <p className="mt-2 text-sm text-gray-500">
                      Available Tickets: {Number(event.maxTickets - event.ticketsSold)}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      Price: {event.price ? formatEther(event.price) : '0'} ETH
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      Date: {event.eventDate ? new Date(Number(event.eventDate) * 1000).toLocaleString() : 'Not set'}
                    </p>
                    <div className="flex space-x-2 mt-4">
                      <button 
                        onClick={() => handlePreviewClick(event)}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
                      >
                        Preview
                      </button>
                      <button 
                        onClick={() => handleBuyClick(event)}
                        disabled={isBuying || Number(event.maxTickets - event.ticketsSold) === 0}
                        className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isBuying ? 'Processing...' : 'Buy Ticket'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <CreateEventModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
      {selectedEvent && (
        <>
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
          <EventPreviewModal
            isOpen={isPreviewModalOpen}
            onClose={() => {
              setIsPreviewModalOpen(false);
              setSelectedEvent(null);
            }}
            event={selectedEvent}
            onBuyClick={handlePreviewBuyClick}
            isBuying={isBuying}
          />
        </>
      )}
    </main>
  );
} 