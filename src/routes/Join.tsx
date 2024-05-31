import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  decodeJoinUrlFragment,
  encodeSessionWithoutSecret,
} from '@/utils/session';

const Join = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const session = decodeJoinUrlFragment(location.hash);
      const urlFragmentWithoutSecret = encodeSessionWithoutSecret(session);

      navigate(`/session#${urlFragmentWithoutSecret}`, {
        replace: true,
        state: { joining: true, session },
      });
    } else {
      navigate('/error', { replace: true }); // TODO: handle errors
    }
  }, [navigate, location.hash]);

  return null;
};

export default Join;
