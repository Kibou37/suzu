'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

type ViewItemTrackerProps = {
  itemId: string;
  itemName: string;
  price: number;
};

export function ViewItemTracker({ itemId, itemName, price }: ViewItemTrackerProps) {
  useEffect(() => {
    trackEvent('view_item', {
      item_id: itemId,
      item_name: itemName,
      value: price > 0 ? price : undefined,
      currency: 'USD',
    });
  }, [itemId, itemName, price]);

  return null;
}
