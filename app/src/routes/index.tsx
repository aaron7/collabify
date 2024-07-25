import Join from '@/routes/Join';
import Landing from '@/routes/Landing';
import New from '@/routes/New';
import Session from '@/routes/Session';

const routesConfig = {
  join: {
    element: Join,
    path: '/join',
  },
  landing: {
    element: Landing,
    path: '/',
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
