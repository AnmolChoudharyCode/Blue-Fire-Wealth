'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ConsultationModal from './components/common/ConsultationModal';

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [animationData, setAnimationData] = useState(null);

  // Load animation data
  useEffect(() => {
    fetch('/Lottie/homepage-time-to-make-business.json')
      .then((response) => response.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error('Failed to load animation:', err));
  }, []);

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <ConsultationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      {/* Hero Section */}
      <section className="relative bg-white dark:bg-gray-900 text-gray-900 dark:text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2 leading-tight text-gray-900 dark:text-white">
              Secure Your Financial Future
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              Expert wealth management services tailored to your unique financial goals
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center md:gap-2 lg:gap-4">
              {/* Left side - Lottie Animation */}
              <div className="w-full max-w-md h-[400px] md:h-[500px] flex justify-center items-center md:mr-2 lg:mr-4">
                {animationData ? (
                  <Lottie animationData={animationData} loop={true} />
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>
              {/* Right side - Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center md:ml-2 lg:ml-4">
                <Link href="/wealth-path" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-gray-900 dark:bg-gray-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors shadow-lg cursor-pointer">
                    Get Started
                  </button>
                </Link>
                <button className="w-full sm:w-auto border-2 border-gray-900 dark:border-gray-700 text-gray-900 dark:text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-900 dark:hover:bg-gray-700 hover:text-white transition-colors cursor-pointer">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Our Wealth Management Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service Card 1 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                Investment Planning
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Strategic investment portfolios designed to maximize returns while managing risk according to your financial objectives.
              </p>
            </div>

            {/* Service Card 2 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                Retirement Planning
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Comprehensive retirement strategies to ensure financial security and peace of mind in your golden years.
              </p>
            </div>

            {/* Service Card 3 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                Risk Management
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Advanced risk assessment and mitigation strategies to protect your assets and achieve long-term stability.
              </p>
            </div>

            {/* Service Card 4 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                Estate Planning
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Expert guidance to preserve and transfer your wealth to future generations efficiently and tax-effectively.
              </p>
            </div>

            {/* Service Card 5 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                Tax Optimization
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Strategic tax planning to minimize liabilities and maximize after-tax returns on your investments.
              </p>
            </div>

            {/* Service Card 6 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                Financial Advisory
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Personalized financial guidance and ongoing support to help you make informed decisions at every stage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Why Choose Blue Fire Wealth
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-md">
              <h3 className="text-2xl font-bold mb-4 text-blue-900 dark:text-blue-400">
                Expert Team
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our team of certified financial advisors brings decades of combined experience in wealth management, ensuring you receive expert guidance tailored to your needs.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-md">
              <h3 className="text-2xl font-bold mb-4 text-blue-900 dark:text-blue-400">
                Personalized Approach
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We understand that every client is unique. Our customized financial strategies are designed specifically around your goals, timeline, and risk tolerance.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-md">
              <h3 className="text-2xl font-bold mb-4 text-blue-900 dark:text-blue-400">
                Proven Track Record
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                With a history of successful client outcomes and consistent performance, we have built trust through transparency and results.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-md">
              <h3 className="text-2xl font-bold mb-4 text-blue-900 dark:text-blue-400">
                Comprehensive Services
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                From investment planning to estate management, we offer a full suite of services under one roof, simplifying your financial journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Build Your Wealth?
          </h2>
          <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">
            Schedule a complimentary consultation with one of our wealth management experts today.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gray-900 dark:bg-gray-700 text-white px-10 py-5 rounded-lg font-bold text-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors shadow-xl cursor-pointer"
          >
            Schedule Free Consultation
          </button>
        </div>
      </section>
    </main>
  );
}
