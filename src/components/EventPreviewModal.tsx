'use client';

import { formatEther } from 'ethers';
import { BuyTicketsModal } from './BuyTicketsModal';
import { useState } from 'react';
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

interface EventPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  onBuyTicket: (quantity: number) => Promise<void>;
  isBuying: boolean;
}

export function EventPreviewModal({ isOpen, onClose, event, onBuyTicket, isBuying }: EventPreviewModalProps) {
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

  if (!isOpen) return null;

  const isPastEvent = Number(event.eventDate) * 1000 <= Date.now();
  const availableTickets = Number(event.maxTickets - event.ticketsSold);

  const handleBuyClick = () => {
    if (!event || !event.price) {
      console.error('Invalid event data:', event);
      toast.error('Invalid event data');
      return;
    }
    setIsBuyModalOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ✕
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{event.name}</h3>
              <p className="mt-2 text-gray-600">{event.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Date & Time</p>
                <p className="mt-1 text-base text-gray-900">
                  {event.eventDate ? new Date(Number(event.eventDate) * 1000).toLocaleString() : 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Price</p>
                <p className="mt-1 text-base text-gray-900">
                  {event.price ? formatEther(event.price) : '0'} ETH
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Tickets</p>
                <p className="mt-1 text-base text-gray-900">{Number(event.maxTickets)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Tickets Sold</p>
                <p className="mt-1 text-base text-gray-900">{Number(event.ticketsSold)}</p>
              </div>
              {!isPastEvent && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Available Tickets</p>
                  <p className="mt-1 text-base text-gray-900">{availableTickets}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="mt-1 text-base text-gray-900">
                  {isPastEvent ? 'Past Event' : 'Upcoming Event'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Event Creator</p>
              <p className="mt-1 text-base text-gray-900">{event.creator}</p>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-base font-medium"
            >
              Close
            </button>
            {!isPastEvent && (
              <button
                onClick={handleBuyClick}
                disabled={isBuying || availableTickets === 0}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBuying ? 'Processing...' : 'Buy Ticket'}
              </button>
            )}
          </div>
        </div>
      </div>

      {!isPastEvent && (
        <BuyTicketsModal
          isOpen={isBuyModalOpen}
          onClose={() => setIsBuyModalOpen(false)}
          ticketPrice={Number(formatEther(event.price))}
          eventName={event.name}
          onConfirm={onBuyTicket}
          isLoading={isBuying}
        />
      )}
    </>
  );
} 