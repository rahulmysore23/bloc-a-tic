'use client';

import { Navigation } from '@/components/Navigation';
import { ViewTicketModal } from '@/components/ViewTicketModal';
import { useAccount } from 'wagmi';
import { useState } from 'react';

interface Ticket {
  id: string;
  eventName: string;
  date: string;
  location: string;
  description: string;
  quantity: number;
}

export default function OwnedTickets() {
  const { isConnected } = useAccount();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const handleViewClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsViewModalOpen(true);
  };

  if (!isConnected) {
    return (
      <main>
        <Navigation />
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Please connect your wallet to view your tickets</h2>
          </div>
        </div>
      </main>
    );
  }

  // Example tickets data
  const tickets: Ticket[] = [
    {
      id: 'TKT-001',
      eventName: 'Summer Music Festival',
      date: 'July 15, 2024',
      location: 'Central Park, New York',
      description: 'A day of amazing music featuring top artists from around the world.',
      quantity: 2,
    },
    {
      id: 'TKT-002',
      eventName: 'Tech Conference 2024',
      date: 'August 20, 2024',
      location: 'Convention Center, San Francisco',
      description: 'The biggest tech conference of the year with industry leaders.',
      quantity: 1,
    },
  ];

  return (
    <main>
      <Navigation />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Tickets</h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">{ticket.eventName}</h3>
                <p className="mt-2 text-sm text-gray-500">{ticket.date}</p>
                <p className="mt-2 text-sm text-gray-500">Quantity: {ticket.quantity}</p>
                <button 
                  onClick={() => handleViewClick(ticket)}
                  className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedTicket && (
        <ViewTicketModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedTicket(null);
          }}
          eventName={selectedTicket.eventName}
          date={selectedTicket.date}
          location={selectedTicket.location}
          description={selectedTicket.description}
          quantity={selectedTicket.quantity}
          ticketId={selectedTicket.id}
        />
      )}
    </main>
  );
} 