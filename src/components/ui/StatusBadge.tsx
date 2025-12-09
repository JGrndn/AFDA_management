interface StatusBadgeProps {
  status: string;
  colorMap?: Record<string, string>;
}

const defaultColorMap: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cashed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
};

export function StatusBadge({ status, colorMap = defaultColorMap }: StatusBadgeProps) {
  const colors = colorMap[status] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors}`}>
      {status}
    </span>
  );
}