import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import ThemeButton from '@/components/ThemeButton/ThemeButton';
import routes from '@/routes';

const Landing = () => {
  useEffect(() => {
    document.title = 'Collabify';
  }, []);

  return (
    <div>
      <div className="absolute right-1 top-1">
        <ThemeButton />
      </div>
      <div className="flex min-h-screen justify-center">
        <div className="flex flex-col items-center justify-center space-y-16 px-6 py-32 sm:py-16 lg:px-0">
          <div className="flex flex-col items-center">
            <h1 className="text-primary text-6xl font-bold sm:text-8xl">
              <span>Collabify</span>
              <span className="text-3xl opacity-50">.it</span>
            </h1>
          </div>

          <p className="text-center text-lg font-light sm:text-xl">
            One-off collaboration sessions for your local Markdown
          </p>

          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
          </div>

          <div className="grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-2xl">Private</h3>
              <p className="font-light">
                End-to-end encrypted with zero analytics and no accounts. Your
                keys never touch any server.{' '}
                <a
                  className="text-blue-500"
                  href="https://github.com/aaron7/collabify"
                >
                  Learn more.
                </a>
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl">Friendly</h3>
              <p className="font-light">
                Designed with both engineers and non-engineers in mind. Inspired
                by Obsidian.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl">Integrated</h3>
              <p className="font-light">
                Launch from your favourite Markdown editor, and sync back when
                you’re done.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl">Free</h3>
              <p className="font-light">
                Free &{' '}
                <a
                  className="text-blue-500"
                  href="https://github.com/aaron7/collabify"
                >
                  open source
                </a>
                . Host your own instance on GitHub pages.
              </p>
            </div>
          </div>

          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background text-muted-foreground px-2">
                Start from...
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-5 gap-y-10 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-2">
              <span className="text-2xl">Your favourite editor</span>
              <span className="text-l flex h-full items-center justify-center italic">
                Obsidian and VSCode coming soon
              </span>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <span className="text-2xl">Web</span>
              <span className="flex h-full items-center justify-center text-xl">
                <Link to={routes.new.path}>
                  <span className="font-mono text-blue-500">
                    collabify.it/new
                  </span>
                </Link>
              </span>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <span className="text-2xl">CLI</span>
              <div className="bg-secondary flex flex-col rounded-xl px-4 py-2 font-mono">
                <span className="text-l">brew install aaron7/collabify</span>
                <span className="text-l">collabify ./my-notes.md</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
