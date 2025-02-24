import React from 'react';

const LoadingScreen: React.FC = () => (
  <div className="w-full h-full flex justify-center items-center fixed bg-backdropColor z-9999 opacity-100 top-0 left-0 right-0 bottom-0">
    <div className="relative h-11 w-11 border-15 border-solid border-transparent  border-t-[#68B4E5] border-l-[#68B4E5] border-r-[#AACE6A] rounded-full animate-spin before:absolute before:inset-0.9375 before:border-20 before:border-solid before:border-transparent before:border-b-innerCircleLoader before:border-l-innerCircleLoader before:border-r-innerCircleLoader before:rounded-full before:animate-spinBack"></div>
  </div>
);

export default LoadingScreen;
