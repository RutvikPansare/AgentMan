// Shared color helpers for method badges and status codes.
// Hoppscotch palette: GET=green, POST=yellow, PUT=blue, PATCH=orange, DELETE=red.
// Status: 2xx green, 3xx blue, 4xx yellow, 5xx red.

export function methodColorClass(method: string): string {
  switch ((method || '').toUpperCase()) {
    case 'GET': return 'text-green-400';
    case 'POST': return 'text-yellow-400';
    case 'PUT': return 'text-blue-400';
    case 'PATCH': return 'text-orange-400';
    case 'DELETE': return 'text-red-400';
    default: return 'text-gray-400';
  }
}

export function statusColorClass(status: number): string {
  if (status >= 200 && status < 300) return 'text-green-400';
  if (status >= 300 && status < 400) return 'text-blue-400';
  if (status >= 400 && status < 500) return 'text-yellow-400';
  if (status >= 500) return 'text-red-400';
  return 'text-gray-400';
}

export function statusBadgeClass(status: number): string {
  if (status >= 200 && status < 300) return 'bg-green-900/50 text-green-400';
  if (status >= 300 && status < 400) return 'bg-blue-900/50 text-blue-400';
  if (status >= 400 && status < 500) return 'bg-yellow-900/50 text-yellow-400';
  if (status >= 500) return 'bg-red-900/50 text-red-400';
  return 'bg-gray-800 text-gray-400';
}
