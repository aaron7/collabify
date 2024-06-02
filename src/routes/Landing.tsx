import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import routes from '@/routes';

const Landing = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="flex flex-col items-center">
      <h1 className="text-4xl font-bold">Collabify.it</h1>
      <p className="mt-5">A collaborative markdown editor</p>
      <Link to={routes.new.path}>
        <Button variant="outline">Start browser-only session</Button>
      </Link>
    </div>
  </div>
);

export default Landing;
