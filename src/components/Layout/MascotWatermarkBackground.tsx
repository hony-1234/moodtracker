import React from 'react';

export default function MascotWatermarkBackground() {
  const images = [
    encodeURI('/學校圖檔/吉祥物/信信-01.png'),
    encodeURI('/學校圖檔/吉祥物/些些_correct.png'),
    encodeURI('/學校圖檔/吉祥物/尊重鳥圖(5).png'),
    encodeURI('/學校圖檔/吉祥物/恩恩退地-01.png'),
    encodeURI('/學校圖檔/吉祥物/堅堅_correct.png')
  ];

  return (
    <div className="fixed inset-0 z-[-10] pointer-events-none select-none overflow-hidden opacity-[0.06] sm:opacity-[0.08]">
      {/* 
        We create a slightly larger grid container, offset and rotated by -12 degrees 
        to create a high-end, school-branded watermark wallpaper effect.
      */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-x-16 gap-y-24 sm:gap-x-24 sm:gap-y-36 p-12 w-[130vw] h-[130vh] -rotate-12 -translate-x-[15vw] -translate-y-[15vh]">
        {Array.from({ length: 25 }).map((_, index) => {
          const imgUrl = images[index % images.length];
          return (
            <div key={index} className="flex items-center justify-center">
              <img 
                src={imgUrl} 
                alt="" 
                className="w-20 h-20 sm:w-28 sm:h-28 object-contain filter drop-shadow-xs" 
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
