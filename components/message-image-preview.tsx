import cn from 'classnames';
import { memo, useState } from 'react';

import type { UIMessage } from 'ai';
import type { ImageMimeTypes } from '@/lib/ai/tools/generate-image';

export interface MessageImagePrewiewProps {
  role: UIMessage['role'];
  url: string;
  name: string;
  contentType?: ImageMimeTypes;
}

export const MessageImagePrewiew = memo(function MessageImagePrewiew({
  role,
  url,
  name,
}: MessageImagePrewiewProps) {
  const [fetchingImage, setFetchingImage] = useState(false);

  function downloadImage() {
    setFetchingImage(true);
    fetch(`${url}?download=1`)
      .then((response) => response.blob())
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.setAttribute('style', 'display: none');
        a.download = name;
        document.body.appendChild(a);
        a.click();
        setFetchingImage(false);
      })
      .catch((err) => console.log(err));
  }

  return (
    <div
      className={cn(
        'group/image relative max-w-[400px] overflow-hidden rounded-2xl',
        {
          'aspect-square': role === 'assistant',
          border: role === 'user',
        },
      )}
    >
      <div className="relative h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-fit opacity-100 transition-opacity duration-300"
          src={url}
          alt={name}
        />
        <div className="invisible absolute right-3 top-3 z-[2] flex gap-1 group-hover/image:visible">
          <a
            className="flex size-8 items-center justify-center rounded bg-black/50 hover:opacity-70"
            download={name}
            href={`${url}?download=1`}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M7.70711 10.2929C7.31658 9.90237 6.68342 9.90237 6.29289 10.2929C5.90237 10.6834 5.90237 11.3166 6.29289 11.7071L11.2929 16.7071C11.6834 17.0976 12.3166 17.0976 12.7071 16.7071L17.7071 11.7071C18.0976 11.3166 18.0976 10.6834 17.7071 10.2929C17.3166 9.90237 16.6834 9.90237 16.2929 10.2929L13 13.5858L13 4C13 3.44771 12.5523 3 12 3C11.4477 3 11 3.44771 11 4L11 13.5858L7.70711 10.2929Z"
                fill="currentColor"
              ></path>
              <path
                d="M5 19C4.44772 19 4 19.4477 4 20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20C20 19.4477 19.5523 19 19 19L5 19Z"
                fill="currentColor"
              ></path>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
});
