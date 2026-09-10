"use client";

import { ReactNode } from "react";

interface ScreenShellProps {
  phaseLabel: string;
  progress: number; // 0-100
  onBack?: () => void;
  onExit?: () => void;
  nav?: ReactNode;
  children: ReactNode;
}

export function ScreenShell({ phaseLabel, progress, onBack, onExit, nav, children }: ScreenShellProps) {
  return (
    <div className="page">
      <div className="top-bar">
        <div className="container">
          <div className="top-bar-row">
            <span>
              {onBack ? (
                <button type="button" className="btn-ghost" style={{ padding: 0 }} onClick={onBack}>
                  ← 戻る
                </button>
              ) : (
                <span>&nbsp;</span>
              )}
            </span>
            <span>{phaseLabel}</span>
            <span>
              {onExit && (
                <button type="button" className="btn-ghost" style={{ padding: 0 }} onClick={onExit}>
                  今日はここまで
                </button>
              )}
            </span>
          </div>
          <div className="progress-track">
            <span className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
      <div className={`container screen${nav ? "" : " screen--no-nav"}`}>{children}</div>
      {nav && <div className="bottom-nav">{nav}</div>}
    </div>
  );
}
