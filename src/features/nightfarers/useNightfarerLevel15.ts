import { useEffect, useState } from 'react';
import type { NightfarerLevel15, NightfarerName } from '../../types';
import { loadNightfarerLevels } from './levels';

export const useNightfarerLevel15 = (enabled = true) => {
  const [snapshots, setSnapshots] = useState<ReadonlyMap<NightfarerName, NightfarerLevel15>>();

  useEffect(() => {
    if (!enabled) return;
    let disposed = false;
    void loadNightfarerLevels().then(({ level15 }) => {
      if (!disposed) setSnapshots(level15);
    });
    return () => {
      disposed = true;
    };
  }, [enabled]);

  return snapshots;
};
