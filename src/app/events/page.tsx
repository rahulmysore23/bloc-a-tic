'use client';

import { Navigation } from '@/components/Navigation';
import { CreateEventModal } from '@/components/CreateEventModal';
import { BuyTicketsModal } from '@/components/BuyTicketsModal';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { useGetEvents, useBuyTicket } from '@/lib/contract';
import { formatEther } from 'ethers';
import { toast } from 'react-hot-toast';

interface Event {
  id: number;
  name: string;
  ticketCount: bigint;
  price: bigint;
  soldCount: bigint;
}

export default function Events() {
  const { isConnected } = useAccount();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
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
        setEvents(fetchedEvents);
      } catch (err) {
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
    setSelectedEvent(event);
    setIsBuyModalOpen(true);
  };

  const handleBuyTicket = async () => {
    if (!selectedEvent) return;
    
    try {
      await buyTicket(selectedEvent.id, Number(formatEther(selectedEvent.price)));
      toast.success('Ticket purchased successfully!');
      setIsBuyModalOpen(false);
      setSelectedEvent(null);
      // Refresh events after purchase
      const updatedEvents = await getEvents();
      setEvents(updatedEvents);
    } catch (error) {
      toast.error('Failed to purchase ticket. Please try again.');
      console.error('Error buying ticket:', error);
    }
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
                <div key={Number(event.id)} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <h3 className="text-lg font-medium text-gray-900">{event.name}</h3>
                    <p className="mt-2 text-sm text-gray-500">Available Tickets: {Number(event.ticketCount - event.soldCount)}</p>
                    <p className="mt-2 text-sm text-gray-500">Price: {formatEther(event.price)} ETH</p>
                    <button 
                      onClick={() => handleBuyClick(event)}
                      disabled={isBuying || Number(event.ticketCount - event.soldCount) === 0}
                      className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isBuying ? 'Processing...' : 'Buy Ticket'}
                    </button>
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
      )}
    </main>
  );
} 