import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { createNewSession, encodeSessionWithoutSecret } from '../utils/session';

const New = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const session = createNewSession();
    const urlFragmentWithoutSecret = encodeSessionWithoutSecret(session);

    // Store the session in the location state for now. We'll want to store
    // isHost in local storage eventually, so hosts joining via an invite link can be
    // recognized.
    navigate(`/session#${urlFragmentWithoutSecret}`, {
      replace: true,
      state: { isHost: true, session },
    });
  }, [navigate]);

  return null;
};

export default New;
