import React, { useState, useEffect } from 'react';
import { CartoonSceneLanding } from './CartoonSceneLanding';
import { LandingClassic } from './LandingClassic';

interface LandingProps {
  setViewState: (view: 'LANDING' | 'STUDENT_LOGIN' | 'STUDENT_DASHBOARD' | 'TEACHER_LOGIN' | 'TEACHER_DASHBOARD' | 'TEACHER_P1_3_BATCH') => void;
  setPrivacyModalVisible: (visible: boolean) => void;
}

export default function Landing({ setViewState, setPrivacyModalVisible }: LandingProps) {
  const [landingMode, setLandingMode] = useState<'cartoon' | 'classic'>(() => {
    try {
      const saved = localStorage.getItem('gccps_landing_mode');
      return saved === 'classic' ? 'classic' : 'cartoon';
    } catch {
      return 'cartoon';
    }
  });

  const handleSwitchToClassic = () => {
    setLandingMode('classic');
    try {
      localStorage.setItem('gccps_landing_mode', 'classic');
    } catch {}
  };

  const handleSwitchToCartoon = () => {
    setLandingMode('cartoon');
    try {
      localStorage.setItem('gccps_landing_mode', 'cartoon');
    } catch {}
  };

  if (landingMode === 'classic') {
    return (
      <LandingClassic
        setViewState={setViewState}
        setPrivacyModalVisible={setPrivacyModalVisible}
        onSwitchToCartoon={handleSwitchToCartoon}
      />
    );
  }

  return (
    <CartoonSceneLanding
      setViewState={setViewState}
      setPrivacyModalVisible={setPrivacyModalVisible}
      onSwitchToClassic={handleSwitchToClassic}
    />
  );
}
