'use client';
import { useEffect } from 'react';

export function PullquoteReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.pullquote, .stat-callout').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return null;
}
