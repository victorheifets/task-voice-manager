'use client';

import { Button } from '@mui/material';

interface SkipLinkProps {
  targetId?: string;
  label?: string;
}

export default function SkipLink({
  targetId = 'main-content',
  label = 'Skip to main content'
}: SkipLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.tabIndex = -1;
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Button
      href={`#${targetId}`}
      onClick={handleClick}
      sx={{
        position: 'absolute',
        left: '-9999px',
        top: 'auto',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        zIndex: 9999,
        '&:focus': {
          position: 'fixed',
          top: 8,
          left: 8,
          width: 'auto',
          height: 'auto',
          overflow: 'visible',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          px: 2,
          py: 1,
          borderRadius: 1,
          boxShadow: 3,
          outline: '2px solid',
          outlineColor: 'primary.dark',
          outlineOffset: 2,
        },
      }}
    >
      {label}
    </Button>
  );
}
