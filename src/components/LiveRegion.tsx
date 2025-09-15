import React, { useEffect, useState } from 'react';

export default function LiveRegion({ message }: { message: string }) {
  const [text, setText] = useState('');

  useEffect(() => {
    setText(message);
  }, [message]);

  return (
    <div role="status" aria-live="polite" className="sr-only">
      {text}
    </div>
  );
}
