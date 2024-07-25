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
        <div className="flex flex-col items-center justify-center space-y-12 px-6 py-8 md:px-0 md:py-0">
          <div className="flex flex-col items-center">
            <h1 className="text-5xl font-bold">Collabify.it</h1>
            <span className="mt-5 italic">Simple collaborative markdown</span>
          </div>

          <div className="grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-2xl">Unsurprising & fast editing</h3>
              <p className="font-light">
                Inspired by{' '}
                <a className="text-blue-500" href="https://typora.io/">
                  Typora
                </a>{' '}
                and{' '}
                <a className="text-blue-500" href="https://obsidian.md/">
                  Obsidian
                </a>
                , the web markdown editor won’t surprise you or get in your way.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl">Private & secure</h3>
              <p className="font-light">
                Sessions are end-to-end encrypted with zero analytics. The
                secret key is shared in the URL fragment which browsers don’t
                send to servers.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl">Integrated with your tooling</h3>
              <p className="font-light">
                Launch live sessions from your favourite Markdown editor, and
                get back quickly when you’re done.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl">Free & open source</h3>
              <p className="font-light">
                Check out the{' '}
                <a
                  className="text-blue-500"
                  href="https://github.com/aaron7/collabify"
                >
                  GitHub repo
                </a>
                . You can host your own instance for free on GitHub pages.
              </p>
            </div>
          </div>

          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background text-muted-foreground px-2">
                Ready to go?
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-5 gap-y-10 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-2">
              <span className="text-2xl">CLI</span>
              <div className="bg-secondary flex flex-col rounded-xl px-4 py-2 font-mono">
                <span className="text-l">brew install aaron7/collabify</span>
                <span className="text-l">collabify notes.md</span>
              </div>
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
              <span className="text-2xl">Your favourite editor</span>
              <span className="text-l flex h-full items-center justify-center italic">
                Obsidian and VSCode coming soon
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
