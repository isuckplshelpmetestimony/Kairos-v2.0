import { parseEventsCSV } from '../lib/csvParser';
import type { Event } from '../lib/types';

export async function loadEvents(): Promise<Event[]> {
  const response = await fetch('/combined_events_all_cleaned.csv');
  const csvContent = await response.text();
  return parseEventsCSV(csvContent);
}

export async function loadStartupEvents(): Promise<Event[]> {
  const response = await fetch('/startup_events_mapped.csv');
  const csvContent = await response.text();
  return parseEventsCSV(csvContent);
} 