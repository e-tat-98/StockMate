"use client";

import { useState } from "react";
import { useSwipeable } from "react-swipeable";

type Props = {
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  rightLabel?: string;
  leftLabel?: string;
  children: React.ReactNode;
};

export function SwipeableItem({
  onSwipeRight,
  onSwipeLeft,
  rightLabel = "削除",
  leftLabel = "買い物リスト",
  children,
}: Props) {
  const [offset, setOffset] = useState(0);
  const THRESHOLD = 80;

  const handlers = useSwipeable({
    onSwiping: (e) => setOffset(e.deltaX),
    onSwipedRight: () => {
      if (Math.abs(offset) > THRESHOLD && onSwipeRight) {
        onSwipeRight();
      }
      setOffset(0);
    },
    onSwipedLeft: () => {
      if (Math.abs(offset) > THRESHOLD && onSwipeLeft) {
        onSwipeLeft();
      }
      setOffset(0);
    },
    onSwiped: () => setOffset(0),
    trackMouse: false,
    delta: 20,
  });

  const clampedOffset = Math.max(-120, Math.min(120, offset));

  return (
    <div className="relative overflow-hidden">
      {/* 右スワイプ背景（赤・削除） */}
      <div
        className="absolute inset-0 flex items-center px-4 bg-danger-600 text-white text-sm font-medium"
        style={{ opacity: clampedOffset > 0 ? clampedOffset / 120 : 0 }}
      >
        {rightLabel}
      </div>
      {/* 左スワイプ背景（緑・買い物リスト） */}
      <div
        className="absolute inset-0 flex items-center justify-end px-4 bg-green-600 text-white text-sm font-medium"
        style={{ opacity: clampedOffset < 0 ? -clampedOffset / 120 : 0 }}
      >
        {leftLabel}
      </div>
      <div
        {...handlers}
        style={{ transform: `translateX(${clampedOffset}px)`, transition: offset === 0 ? "transform 0.2s" : "none" }}
        className="relative bg-white"
      >
        {children}
      </div>
    </div>
  );
}
