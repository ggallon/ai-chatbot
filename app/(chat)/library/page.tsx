import { Images } from 'lucide-react';
import { redirect } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { LibrayHeader } from '@/components/library-header';

import { ArrowDownCircle } from '@/components/icons';
import { getUserImagesByUserId } from '@/lib/db/queries/file';

export default async function Page() {
  const [session] = await Promise.all([auth()]);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const images = await getUserImagesByUserId({ userId: session.user.id });

  return (
    <div className="flex h-dvh min-w-0 flex-col bg-background">
      <LibrayHeader />
      <div className="flex min-w-0 flex-1 flex-col gap-6 overflow-y-scroll pt-4">
        {images.length > 0 ? (
          <div className="mx-auto w-full max-w-5xl px-4">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
              {images.map((img) => (
                <li key={img.pathname} className="relative">
                  <div className="group/image relative max-w-[256px] overflow-hidden rounded-2xl bg-white">
                    <div className="relative h-full">
                      <img
                        alt={img.pathname}
                        src={img.url}
                        className="pointer-events-none w-fit opacity-100 transition-opacity duration-300"
                      />
                      <div className="invisible absolute top-2 right-2 z-10 flex gap-1 group-hover/image:visible">
                        <a
                          className="flex size-7 items-center justify-center rounded text-white/70 hover:bg-white/10 active:bg-white/30 active:text-white"
                          download="test"
                          href={img.downloadUrl}
                        >
                          <ArrowDownCircle />
                        </a>
                      </div>
                    </div>
                  </div>
                  <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">
                    {img.uploadedAt.toString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <Images size={30} />
            <p>All the images you have created with Chatbot will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
