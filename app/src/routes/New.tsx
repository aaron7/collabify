import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import routes from '@/routes';
import { buildSessionUrlFragment, createNewSession } from '@/utils/session';

const New = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const session = createNewSession({});
    const sessionUrlFragment = buildSessionUrlFragment(session);

    // Store the session in the location state for now. We'll want to store
    // isHost in local storage eventually, so hosts joining via an invite link can be
    // recognized.
    navigate(`${routes.session.path}#${sessionUrlFragment}`, {
      replace: true,
    });
  }, [navigate]);

  return null;
};

export default New;
