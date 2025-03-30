'use client';

import { Navigation } from '@/components/Navigation';
import { CreateEventModal } from '@/components/CreateEventModal';
import { BuyTicketsModal } from '@/components/BuyTicketsModal';
import { useAccount } from 'wagmi';
import { useState } from 'react';

interface Event {
  id: number;
  name: string;
  date: string;
  price: number;
}

export default function Events() {
  const { isConnected } = useAccount();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const handleBuyClick = (event: Event) => {
    setSelectedEvent(event);
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

  // Example events data
  const events: Event[] = [
    { id: 1, name: 'Summer Music Festival', date: 'July 15, 2024', price: 0.1 },
    { id: 2, name: 'Tech Conference 2024', date: 'August 20, 2024', price: 0.2 },
  ];

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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div key={event.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">{event.name}</h3>
                <p className="mt-2 text-sm text-gray-500">{event.date}</p>
                <p className="mt-2 text-sm text-gray-500">Price: {event.price} ETH</p>
                <button 
                  onClick={() => handleBuyClick(event)}
                  className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                >
                  Buy Ticket
                </button>
              </div>
            </div>
          ))}
        </div>
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
          ticketPrice={selectedEvent.price}
          eventName={selectedEvent.name}
        />
      )}
    </main>
  );
} 