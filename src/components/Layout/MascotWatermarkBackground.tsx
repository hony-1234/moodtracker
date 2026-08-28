import React from 'react';
import { getPublicAssetUrl } from '../../utils/assetHelper';

export default function MascotWatermarkBackground() {
  return (
    <div className="fixed inset-0 z-[-10] pointer-events-none select-none overflow-hidden">
      {/* Primary Campus Illustration Backdrop */}
      <img
        src={getPublicAssetUrl('/學校圖檔/school_backdrop.jpg')}
        alt="天主教善導小學 校園全景底圖"
        className="w-full h-full object-cover object-center filter brightness-[1.01] contrast-[1.02]"
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
      {/* Soft translucent wash overlay to ensure all text and cards maintain peak clarity */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[0.5px]" />
    </div>
  );
}

