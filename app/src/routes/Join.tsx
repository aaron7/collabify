import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import routes from '@/routes';
import {
  buildSessionUrlFragment,
  getSessionFromJoinUrlFragment,
} from '@/utils/session';

const Join = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const session = getSessionFromJoinUrlFragment(location.hash.slice(1));
      const sessionUrlFragment = buildSessionUrlFragment(session);

      navigate(`${routes.session.path}#${sessionUrlFragment}`, {
        replace: true,
      });
    } else {
      navigate('/error', { replace: true }); // TODO: handle errors
    }
  }, [navigate, location.hash]);

  return null;
};

export default Join;
