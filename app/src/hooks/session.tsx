import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { getSessionFromUrlFragment } from '@/utils/session';

export const useSession = () => {
  const location = useLocation();
  return useMemo(
    () => getSessionFromUrlFragment(location.hash.slice(1)),
    [location.hash],
  );
};
