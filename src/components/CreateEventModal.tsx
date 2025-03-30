'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { useCreateEvent } from '@/lib/contract';
import { uploadEventImage } from '@/lib/pinata';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { createEvent, isLoading, isSuccess } = useCreateEvent();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const onSubmit = async (data: EventFormData) => {
    try {
      if (!selectedFile) {
        toast.error('Please select an image for the event');
        return;
      }

      if (!process.env.NEXT_PUBLIC_PINATA_JWT) {
        toast.error('Pinata JWT is not configured. Please check your environment variables.');
        return;
      }

      setIsUploading(true);
      const eventDate = new Date(`${data.date}T${data.time}`);
      const timestamp = Math.floor(eventDate.getTime() / 1000);

      // Upload image to Pinata
      const imageCID = await uploadEventImage(selectedFile, {
        name: data.name,
        description: data.description,
        location: data.location,
        category: data.category,
        eventDate: timestamp,
        price: data.price,
        maxTickets: data.ticketCount
      });

      // Create event with image CID
      await createEvent(
        data.name,
        data.description,
        data.price,
        data.ticketCount,
        timestamp,
        data.location,
        data.category,
        imageCID
      );

      toast.success('Event created successfully!');
      await onSuccess();
    } catch (error) {
      console.error('Error creating event:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create event. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
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
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Create New Event</h2>
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
            <label className="block text-base font-medium text-gray-900 mb-2">Location</label>
            <input
              type="text"
              {...register('location')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 text-base p-2"
            />
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
          </div>

          <div>
            <label className="block text-base font-medium text-gray-900 mb-2">Category</label>
            <input
              type="text"
              {...register('category')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 text-base p-2"
            />
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
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

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-base font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isUploading}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading || isUploading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 