import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Loading from '@/components/Loading/Loading';
import routes from '@/routes';
import {
  getApiSettingsFromUrlFragment,
  loadInitialMarkdown,
  startSessionCallback,
} from '@/utils/api';
import { buildSessionUrlFragment, createNewSession } from '@/utils/session';

const New = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const apiSettings = getApiSettingsFromUrlFragment(location.hash.slice(1));
    const session = createNewSession({
      apiSettings: apiSettings || undefined,
    });
    const sessionUrlFragment = buildSessionUrlFragment(session);

    if (apiSettings) {
      loadInitialMarkdown(session).then((data) => {
        startSessionCallback(session);
        navigate(`${routes.session.path}#${sessionUrlFragment}`, {
          replace: true,
          state: { initialMarkdown: data },
        });
      });
    } else {
      navigate(`${routes.session.path}#${sessionUrlFragment}`, {
        replace: true,
        state: { initialMarkdown: '# ' },
      });
    }
  }, [navigate, location.hash]);

  return (
    <Loading
      ctaCopy="Stop loading"
      onCtaClick={() => navigate(routes.landing.path)}
      title="Loading your markdown"
    />
  );
};

export default New;
