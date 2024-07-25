import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import routes from '@/routes';

type ErrorProps = {
  error: Error;
  resetErrorBoundary: () => void;
};

const Error = ({ error, resetErrorBoundary }: ErrorProps) => {
  const navigate = useNavigate();

  const goBack = () => {
    resetErrorBoundary();
    navigate(routes.landing.path);
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center space-y-8 max-sm:px-4">
      <p className="max-w-lg font-light">{error.message}</p>
      <Button onClick={goBack} variant="outline">
        Go to collabify.it
      </Button>
    </div>
  );
};

export default Error;
