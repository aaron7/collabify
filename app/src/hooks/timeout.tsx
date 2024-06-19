import { useState } from 'react';

const DEFAULT_ACTION_TIMEOUT = 3000;

export const useActiveTimeout = (
  fn: () => void,
  timeout: number = DEFAULT_ACTION_TIMEOUT,
): [() => void, boolean] => {
  const [isActive, setIsActive] = useState(false);

  const wrappedFn = () => {
    fn();
    setIsActive(true);
    setTimeout(() => {
      setIsActive(false);
    }, timeout);
  };

  return [wrappedFn, isActive];
};
