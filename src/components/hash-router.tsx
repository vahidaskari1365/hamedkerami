"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

/* ---------- lightweight hash router (preview-safe) ---------- */

export function Link({
  href,
  children,
  className,
  "aria-label": ariaLabel,
  onClick,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
  onClick?: () => void;
}) {
  return (
    <a
      href={`#${href}`}
      className={className}
      aria-label={ariaLabel}
      onClick={() => onClick?.()}
    >
      {children}
    </a>
  );
}

const RouterCtx = createContext<{
  path: string;
  navigate: (to: string) => void;
}>({ path: "/", navigate: () => {} });

function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function getHashPath(): string {
  const h = window.location.hash.replace(/^#/, "");
  return h.startsWith("/") ? h : "/";
}

function getServerHashPath(): string {
  return "/";
}

export function HashRouter({ children }: { children: ReactNode }) {
  const path = useSyncExternalStore(
    subscribeHash,
    getHashPath,
    getServerHashPath
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [path]);

  const navigate = (to: string) => {
    if (getHashPath() === to) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.location.hash = to;
  };

  return (
    <RouterCtx.Provider value={{ path, navigate }}>
      {children}
    </RouterCtx.Provider>
  );
}

export function usePathname() {
  return useContext(RouterCtx).path;
}

export function useRouter() {
  return useContext(RouterCtx);
}
