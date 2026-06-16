import { EventCard } from '../../data';

export const getEventWazeLink = (event: EventCard | undefined) => {
  if (!event) {
    return undefined;
  }

  if (event.wazeLink.trim()) {
    return event.wazeLink;
  }

  const query = event.address.trim() || event.venueName.trim();
  return query ? `https://waze.com/ul?q=${encodeURIComponent(query)}` : undefined;
};
