import { memo } from 'react';

import { initialArtifactData, useArtifact } from '@/hooks/use-artifact';
import { Button } from './ui/button';
import { CrossIcon } from './icons';

function PureArtifactCloseButton() {
  const { setArtifact } = useArtifact();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => {
        setArtifact((currentArtifact) =>
          currentArtifact.status === 'streaming'
            ? {
                ...currentArtifact,
                isVisible: false,
              }
            : { ...initialArtifactData, status: 'idle' },
        );
      }}
    >
      <CrossIcon size={18} />
    </Button>
  );
}

export const ArtifactCloseButton = memo(PureArtifactCloseButton, () => true);
