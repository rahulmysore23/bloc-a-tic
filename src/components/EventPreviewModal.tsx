'use client';

import { formatEther } from 'ethers';

interface EventPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: number;
    name: string;
    description: string;
    price: bigint;
    maxTickets: bigint;
    ticketsSold: bigint;
    eventDate: bigint;
    isActive: boolean;
    creator: string;
  };
  onBuyClick: () => void;
  isBuying: boolean;
}

export function EventPreviewModal({ isOpen, onClose, event, onBuyClick, isBuying }: EventPreviewModalProps) {
  if (!isOpen) return null;

  return (
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
            <p className="text-sm text-gray-500 mt-1">Created by: {event.creator}</p>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-600">{event.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Date & Time</h4>
              <p className="text-gray-900 mt-1">
                {event.eventDate ? new Date(Number(event.eventDate) * 1000).toLocaleString() : 'Not set'}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Price</h4>
              <p className="text-gray-900 mt-1">{event.price ? formatEther(event.price) : '0'} ETH</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Available Tickets</h4>
              <p className="text-gray-900 mt-1">{Number(event.maxTickets - event.ticketsSold)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Status</h4>
              <p className="text-gray-900 mt-1">{event.isActive ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={onBuyClick}
            disabled={isBuying || Number(event.maxTickets - event.ticketsSold) === 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isBuying ? 'Processing...' : 'Buy Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
} 