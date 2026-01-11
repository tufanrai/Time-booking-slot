import { BookingStatus } from '@/types/booking';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    pending: 'bg-warning/20 text-warning border-warning/30 hover:bg-warning/30',
    approved: 'bg-success/20 text-success border-success/30 hover:bg-success/30',
    rejected: 'bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30',
  };

  const labels = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-medium capitalize transition-colors',
        variants[status],
        className
      )}
    >
      {labels[status]}
    </Badge>
  );
}
