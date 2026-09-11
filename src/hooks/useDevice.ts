import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type ScreenOrientation = 'portrait' | 'landscape';
export type ScreenCategory = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface DeviceInfo {
  deviceType: DeviceType;
  orientation: ScreenOrientation;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  isTouch: boolean;
  width: number;
  height: number;
  aspectRatio: number;
  screenCategory: ScreenCategory;
  /** Scale multiplier suitable for adjusting sizes proportionally (e.g. 0.85 for small phones, 1.0 for desktop) */
  uiScale: number;
}

function getScreenCategory(w: number): ScreenCategory {
  if (w < 480) return 'xs';
  if (w < 640) return 'sm';
  if (w < 768) return 'md';
  if (w < 1024) return 'lg';
  if (w < 1280) return 'xl';
  return '2xl';
}

function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      deviceType: 'desktop',
      orientation: 'landscape',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isPortrait: false,
      isLandscape: true,
      isTouch: false,
      width: 1440,
      height: 900,
      aspectRatio: 1.6,
      screenCategory: 'xl',
      uiScale: 1
    };
  }

  const w = window.innerWidth;
  const h = window.innerHeight;
  const aspectRatio = w / (h || 1);
  const isPortrait = h > w;
  const orientation: ScreenOrientation = isPortrait ? 'portrait' : 'landscape';

  const isTouch = (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    Boolean((navigator as any).msMaxTouchPoints)
  );

  const ua = navigator.userAgent.toLowerCase();
  const isIPad = /ipad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroidTablet = /android/.test(ua) && !/mobile/.test(ua);
  const isMobileUA = /iphone|ipod|android.*mobile|blackberry|windows phone|opera mini|mobile/.test(ua);

  let deviceType: DeviceType = 'desktop';

  if (isIPad || isAndroidTablet || (isTouch && w >= 640 && w <= 1024)) {
    deviceType = 'tablet';
  } else if (isMobileUA || w < 640 || (isTouch && w < 768 && isPortrait)) {
    deviceType = 'mobile';
  } else if (w <= 1024) {
    deviceType = 'tablet';
  } else {
    deviceType = 'desktop';
  }

  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';

  // Calculate a proportional UI scale
  let uiScale = 1;
  if (w < 380) {
    uiScale = 0.82;
  } else if (w < 480) {
    uiScale = 0.88;
  } else if (w < 640) {
    uiScale = 0.94;
  } else if (w >= 1920) {
    uiScale = 1.15;
  }

  return {
    deviceType,
    orientation,
    isMobile,
    isTablet,
    isDesktop,
    isPortrait,
    isLandscape: !isPortrait,
    isTouch,
    width: w,
    height: h,
    aspectRatio,
    screenCategory: getScreenCategory(w),
    uiScale
  };
}

export function useDevice(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(getDeviceInfo);

  useEffect(() => {
    let timeoutId: any = null;

    const handleResize = () => {
      // Debounce slightly to smooth out fast resize or virtual keyboard transitions
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDeviceInfo(getDeviceInfo());
      }, 60);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    // Initial check
    setDeviceInfo(getDeviceInfo());

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return deviceInfo;
}
