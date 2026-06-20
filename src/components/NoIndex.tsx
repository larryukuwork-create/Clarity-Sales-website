import { useEffect } from "react";

export default function NoIndex() {
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "robots");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", "noindex, nofollow");
    
    return () => {
      // Optional cleanup if navigating back to a public page,
      // though typically this forces a hard reload or we reset it on public SEOManager
      meta?.setAttribute("content", "index, follow");
    }
  }, []);
  
  return null;
}
