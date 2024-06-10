import ComingSoon from '@/routes/ComingSoon';
import Join from '@/routes/Join';
import Landing from '@/routes/Landing';
import New from '@/routes/New';
import Session from '@/routes/Session';

const routesConfig = {
  comingSoon: {
    element: ComingSoon,
    path: '/',
  },
  join: {
    element: Join,
    path: '/join',
  },
  landing: {
    element: Landing,
    path: '/landing',
  },
  new: {
    element: New,
    path: '/new',
  },
  session: {
    element: Session,
    path: '/session',
  },
};

export default routesConfig;
