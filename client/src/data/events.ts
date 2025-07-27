import { parseEventsCSV } from '../lib/csvParser';
import type { Event } from '../lib/types';

export async function loadEvents(): Promise<Event[]> {
  try {
  const response = await fetch('/combined_events_all_cleaned.csv');
  const csvContent = await response.text();
  return parseEventsCSV(csvContent);
  } catch (error) {
    console.error('Error loading events:', error);
    return [];
  }
}

export async function loadStartupEvents(): Promise<Event[]> {
  // Since startup_events_mapped.csv doesn't exist, return empty array
  // This prevents the CSV parsing errors
  return [];
} 