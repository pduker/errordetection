const mobileRegex = /iphone|ipad|ipod|android|blackberry|webos|windows phone|opera mini|mobile/i;

function detectMobile(): boolean {
  if (typeof navigator === "undefined" || typeof window === "undefined") return false;

  const ua = navigator.userAgent || "";
  if (mobileRegex.test(ua)) return true;

  // Touch-capability (for Chrome devtools emulation, hopefully it works)
  if ((navigator as any).maxTouchPoints && (navigator as any).maxTouchPoints > 0) return true;
  if ("ontouchstart" in window) return true;

  // Pointer/hover media queries (touch-first devices)
  try {
    if (window.matchMedia && (window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(hover: none)").matches)) {
      return true;
    }
  } catch {}
  
  if (window.innerWidth <= 768) return true;

  return false;
}

const isMobile = detectMobile();
export default isMobile;
export { detectMobile };