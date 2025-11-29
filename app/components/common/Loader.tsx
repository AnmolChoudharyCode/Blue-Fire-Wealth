'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  message?: string;
}

export default function Loader({ size = 'medium', fullScreen = false, message }: LoaderProps) {
  const [animationData, setAnimationData] = useState(null);

  // Load animation data
  useEffect(() => {
    fetch('/Lottie/paperplane-loading.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch animation');
        }
        return response.json();
      })
      .then((data) => {
        setAnimationData(data);
      })
      .catch((err) => {
        console.error('Failed to load loader animation:', err);
      });
  }, []);

  const sizeClasses = {
    small: 'w-32 h-32',
    medium: 'w-48 h-48',
    large: 'w-64 h-64',
  };

  const content = (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        {animationData ? (
          <Lottie animationData={animationData} loop={true} style={{ width: '100%', height: '100%' }} />
        ) : (
          <div className="w-16 h-16 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>
      {message && (
        <p className="mt-6 text-base text-gray-700 dark:text-gray-300 font-medium">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-white/98 dark:bg-gray-900/98 backdrop-blur-sm"></div>
        {/* Content */}
        <div className="relative z-10">
          {content}
        </div>
      </div>
    );
  }

  return <div className="flex items-center justify-center p-8">{content}</div>;
}

