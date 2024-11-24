export const AuthHeader = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
      <h3 className="text-xl font-semibold dark:text-zinc-50">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-zinc-400">{description}</p>
    </div>
  );
};
