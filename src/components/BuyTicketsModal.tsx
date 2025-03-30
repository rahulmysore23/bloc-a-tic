'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const buyTicketsSchema = z.object({
  quantity: z.number().min(1, 'Must buy at least 1 ticket'),
});

type BuyTicketsFormData = z.infer<typeof buyTicketsSchema>;

interface BuyTicketsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketPrice: number;
  eventName: string;
}

export function BuyTicketsModal({ isOpen, onClose, ticketPrice, eventName }: BuyTicketsModalProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const { register, handleSubmit, formState: { errors } } = useForm<BuyTicketsFormData>({
    resolver: zodResolver(buyTicketsSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  const totalPrice = quantity * ticketPrice;

  const onSubmit = (data: BuyTicketsFormData) => {
    console.log('Buying tickets:', data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Buy Tickets</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ✕
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900">{eventName}</h3>
          <p className="text-gray-600 mt-1">Price per ticket: {ticketPrice} ETH</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-base font-medium text-gray-900 mb-2">Number of Tickets</label>
            <input
              type="number"
              min="1"
              {...register('quantity', { 
                valueAsNumber: true,
                onChange: (e) => setQuantity(Number(e.target.value))
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 text-base p-2"
            />
            {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>}
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-gray-900">Total Price:</span>
              <span className="text-xl font-bold text-indigo-600">{totalPrice.toFixed(3)} ETH</span>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-md text-gray-900 hover:bg-gray-50 text-base font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-base font-medium"
            >
              Buy Tickets
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 