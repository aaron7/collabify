import { Link } from 'react-router-dom';

import ThemeButton from '@/components/ThemeButton/ThemeButton';
import { Button } from '@/components/ui/button';
import routes from '@/routes';

const Landing = () => (
  <div>
    <div className="absolute right-1 top-1">
      <ThemeButton />
    </div>
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold">Collabify.it</h1>
        <p className="mt-5">A collaborative markdown editor</p>
        <Link to={routes.new.path}>
          <Button variant="outline">Start browser-only session</Button>
        </Link>
      </div>
    </div>
  </div>
);

export default Landing;
