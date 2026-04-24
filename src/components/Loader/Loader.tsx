import { PageLoader } from '@senler/ui';

interface LoaderProps {
  className?: string;
  classNameDiv?: string;
  label?: string;
}

export const Loader = ({
  className,
  classNameDiv = '',
  label = 'Загрузка…',
}: LoaderProps) => {
  const rootClass = className ?? classNameDiv;
  return (
    <div
      className={`flex w-full min-h-[200px] flex-1 items-center justify-center ${rootClass}`.trim()}
    >
      <PageLoader label={label} />
    </div>
  );
};
