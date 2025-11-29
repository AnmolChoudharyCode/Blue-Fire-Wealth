'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useDarkMode } from './components/common/DarkModeProvider';
import Loader from './components/common/Loader';

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function NotFound() {
  const [animationData, setAnimationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isDarkMode } = useDarkMode();

  // Load animation data
  useEffect(() => {
    const startTime = Date.now();
    
    fetch('/Lottie/404-error-page.json')
      .then((response) => response.json())
      .then((data) => {
        const elapsed = Date.now() - startTime;
        // Only show loader if it takes more than 200ms (actual loading time)
        if (elapsed < 200) {
          setAnimationData(data);
          setIsLoading(false);
        } else {
          // If it took longer, show loader for at least a bit
          setTimeout(() => {
            setAnimationData(data);
            setIsLoading(false);
          }, 300);
        }
      })
      .catch((err) => {
        console.error('Failed to load 404 animation:', err);
        setIsLoading(false);
      });
  }, []);

  // Show loader while animation is loading
  if (isLoading || !animationData) {
    return <Loader fullScreen message="Loading..." />;
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-4 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-2xl w-full text-center">
        {/* Lottie Animation */}
        <div className="w-full max-w-md mx-auto mb-8">
          <Lottie animationData={animationData} loop={true} />
        </div>

        {/* Error Message */}
        <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Page Not Found
        </h1>
        <p className={`text-lg mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-md cursor-pointer">
              Go to Homepage
            </button>
          </Link>
          <Link href="/wealth-path">
            <button className={`px-6 py-3 border-2 ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            } rounded-lg font-semibold transition-colors cursor-pointer`}>
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

