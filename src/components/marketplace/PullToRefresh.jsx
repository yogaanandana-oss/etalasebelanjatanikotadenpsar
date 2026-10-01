import React, { useState, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

const THRESHOLD = 70;

export default function PullToRefresh({ onRefresh, children }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);

  const isInput = (el) => !!(el && el.tagName && /INPUT|TEXTAREA|SELECT/.test(el.tagName));

  const onTouchStart = (e) => {
    if (refreshing) return;
    if (window.scrollY > 0) return;
    if (isInput(e.target)) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  };

  const onTouchMove = (e) => {
    if (!pulling.current || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      setPull(Math.min(delta * 0.5, 100));
    }
  };

  const onTouchEnd = async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pull >= THRESHOLD) {
      setRefreshing(true);
      setPull(THRESHOLD);
      try {
        await onRefresh?.();
      } finally {
        setRefreshing(false);
        setPull(0);
      }
    } else {
      setPull(0);
    }
  };

  const showIndicator = pull > 0 || refreshing;
  const reached = pull >= THRESHOLD || refreshing;

  return (
    <div className="relative">
      {showIndicator ? (
        <div
          className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center text-primary"
          style={{ top: pull > 0 ? `${pull - 28}px` : '8px' }}
        >
          <RefreshCw className={`w-5 h-5 ${reached ? 'animate-spin' : ''}`} />
        </div>
      ) : null}
      <div
        style={{
          transform: pull > 0 ? `translateY(${pull}px)` : 'none',
          transition: pulling.current ? 'none' : 'transform 0.2s ease',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}