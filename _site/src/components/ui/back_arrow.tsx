import type React from 'react';
import { Button } from '@/components/forms/button';
import { useNavigate } from 'react-router-dom';

interface BackArrowProps {
  className?: string;
}

const BackArrow: React.FC<BackArrowProps> = ({ className }) => {
  const navigate = useNavigate();

  return (
    <Button
      variant="default"
      onClick={() => navigate(-1)} // Go back in history
      className={`group flex items-center p-2 h-auto space-x-2 hover:bg-muted ${className}`}
      aria-label="Go back"
    >
      <div className="flex items-center">
        <span
          role="img"
          aria-label="arrow"
          className="mgc_arrow_left_line text-3xl text-typography"
        />
      </div>
    </Button>
  );
};

export default BackArrow;
