import cn from 'classnames';
import { memo } from 'react';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

import { ArrowDownCircle } from './icons';

import type { UIMessage } from 'ai';
import type { AllowedImageMimeTypes } from '@/lib/db/validations/file';

export interface MessageImagePrewiewProps {
  role: UIMessage['role'];
  url: string;
  name: string;
  contentType?: AllowedImageMimeTypes;
}

export const MessageImagePrewiew = memo(function MessageImagePrewiew({
  role,
  url,
  name,
}: MessageImagePrewiewProps) {
  return (
    <div
      className={cn('group/image relative overflow-hidden rounded-2xl', {
        'aspect-square max-w-[400px]': role === 'assistant',
        'max-w-[256px] border': role === 'user',
      })}
    >
      <div className="relative h-full">
        <Zoom>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="w-fit opacity-100 transition-opacity duration-300"
            src={url}
            alt={name}
          />
        </Zoom>
        {role === 'assistant' ? (
          <div className="invisible absolute right-2 top-2 z-10 flex gap-1 group-hover/image:visible">
            <a
              className="flex size-7 items-center justify-center rounded text-white/70 hover:bg-white/10 active:bg-white/30 active:text-white"
              download={name}
              href={`${url}?download=1`}
            >
              <ArrowDownCircle />
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
});
