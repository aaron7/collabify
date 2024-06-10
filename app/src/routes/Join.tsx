import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import routes from '@/routes';
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

      navigate(`${routes.session.path}#${urlFragmentWithoutSecret}`, {
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
