import ThemeButton from '@/components/ThemeButton/ThemeButton';

const ComingSoon = () => (
  <div>
    <div className="absolute right-1 top-1">
      <ThemeButton />
    </div>
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold">Collabify.it</h1>
        <p className="mt-5">Coming soon</p>
      </div>
    </div>
  </div>
);

export default ComingSoon;
