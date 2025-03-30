'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { useCreateEvent } from '@/lib/contract';
import { toast } from 'react-hot-toast';

const eventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  ticketCount: z.number().min(1, 'Must have at least 1 ticket'),
  price: z.number().min(0.001, 'Price must be at least 0.001 ETH'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  category: z.string().min(1, 'Category is required'),
  image: z.any().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export function CreateEventModal({ isOpen, onClose, onSuccess }: CreateEventModalProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { createEvent, isLoading, isSuccess } = useCreateEvent();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const onSubmit = async (data: EventFormData) => {
    try {
      const eventDate = new Date(`${data.date}T${data.time}`);
      const timestamp = Math.floor(eventDate.getTime() / 1000);

      await createEvent(
        data.name,
        data.description,
        data.price,
        data.ticketCount,
        timestamp
      );

      toast.success('Event created successfully!');
      await onSuccess();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event. Please try again.');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Create New Event</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-base font-medium text-gray-900 mb-2">Event Name</label>
            <input
              type="text"
              {...register('name')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 text-base p-2"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-base font-medium text-gray-900 mb-2">Category</label>
            <select
              {...register('category')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 text-base p-2"
            >
              <option value="">Select a category</option>
              <option value="concert">Concert</option>
              <option value="show">Show</option>
              <option value="game">Game</option>
              <option value="sports">Sports</option>
              <option value="conference">Conference</option>
              <option value="festival">Festival</option>
              <option value="exhibition">Exhibition</option>
              <option value="workshop">Workshop</option>
              <option value="other">Other</option>
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block text-base font-medium text-gray-900 mb-2">Location</label>
            <input
              type="text"
              {...register('location')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 text-base p-2"
            />
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
          </div>

          <div>
            <label className="block text-base font-medium text-gray-900 mb-2">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 text-base p-2"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">Number of Tickets</label>
              <input
                type="number"
                {...register('ticketCount', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 text-base p-2"
              />
              {errors.ticketCount && <p className="text-red-500 text-sm mt-1">{errors.ticketCount.message}</p>}
            </div>

            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">Price (ETH)</label>
              <input
                type="number"
                step="0.001"
                {...register('price', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 text-base p-2"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">Date</label>
              <input
                type="date"
                {...register('date')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 text-base p-2"
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
            </div>

            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">Time</label>
              <input
                type="time"
                {...register('time')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 text-base p-2"
              />
              {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-base font-medium text-gray-900 mb-2">Event Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full text-gray-900 text-base"
            />
            {previewImage && (
              <div className="mt-4 relative h-48 w-full">
                <Image
                  src={previewImage}
                  alt="Event preview"
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            )}
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
              disabled={isLoading}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 