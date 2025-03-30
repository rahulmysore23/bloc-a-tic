'use client';

import { Navigation } from '@/components/Navigation';
import { useAccount } from 'wagmi';

export default function OwnedTickets() {
  const { isConnected } = useAccount();

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

  return (
    <main>
      <Navigation />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Tickets</h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Example ticket cards - replace with actual data from blockchain */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900">Summer Music Festival</h3>
              <p className="mt-2 text-sm text-gray-500">July 15, 2024</p>
              <p className="mt-2 text-sm text-gray-500">Ticket ID: #1234</p>
              <div className="mt-4 flex justify-between">
                <button className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
                  View QR Code
                </button>
                <button className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
                  Transfer
                </button>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900">Tech Conference 2024</h3>
              <p className="mt-2 text-sm text-gray-500">August 20, 2024</p>
              <p className="mt-2 text-sm text-gray-500">Ticket ID: #5678</p>
              <div className="mt-4 flex justify-between">
                <button className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
                  View QR Code
                </button>
                <button className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
                  Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 