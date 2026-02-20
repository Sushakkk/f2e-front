import { useEffect, useState } from 'react';

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);

    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onChange);

      return () => mq.removeEventListener('change', onChange);
    }

    mq.addListener(onChange);

    return () => mq.removeListener(onChange);
  }, [query]);

  return matches;
}
