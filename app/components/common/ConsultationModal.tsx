'use client';

import { useState, FormEvent } from 'react';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConsultationModal({ isOpen, onClose }: ConsultationModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    consultationType: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call - replace with actual API endpoint
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Reset form
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      consultationType: '',
      message: '',
    });

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Close modal after 2 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 4000);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsSubmitted(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  // Generate confetti particles
  const confettiColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe', '#00b894', '#00cec9', '#ffd700', '#ff69b4'];
  const confettiParticles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 1.5}s`,
    animationDuration: `${2.5 + Math.random() * 2.5}s`,
    backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    width: `${6 + Math.random() * 12}px`,
    height: `${6 + Math.random() * 12}px`,
    borderRadius: Math.random() > 0.4 ? '50%' : Math.random() > 0.7 ? '30%' : '0%',
    rotation: Math.random() * 720,
    randomX: Math.random() * 2 - 1,
  }));

  // Generate glitter sparkles
  const sparklePositions = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 2}s`,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      {/* Confetti Container */}
      {isSubmitted && (
        <div className="confetti-container">
          {confettiParticles.map((particle) => (
            <div
              key={particle.id}
              className="confetti-particle"
              style={{
                left: particle.left,
                backgroundColor: particle.backgroundColor,
                width: particle.width,
                height: particle.height,
                borderRadius: particle.borderRadius,
                animationDelay: particle.animationDelay,
                animationDuration: particle.animationDuration,
                transform: `rotate(${particle.rotation}deg)`,
                '--random-x': particle.randomX.toString(),
                color: particle.backgroundColor,
              } as React.CSSProperties}
            />
          ))}
          {sparklePositions.map((sparkle) => (
            <div
              key={sparkle.id}
              className="sparkle"
              style={{
                left: sparkle.left,
                top: sparkle.top,
                animationDelay: sparkle.animationDelay,
              }}
            />
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-10">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Schedule Free Consultation</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-popper">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 animate-fade-in-scale" style={{ animationDelay: '0.2s' }}>
                Thank You!
              </h3>
              <p className="text-gray-600 animate-fade-in-scale" style={{ animationDelay: '0.4s' }}>
                We've received your consultation request. Our team will reach out to you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                  placeholder="Enter your email address"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Consultation Type */}
              <div>
                <label
                  htmlFor="consultationType"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Consultation Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="consultationType"
                  name="consultationType"
                  required
                  value={formData.consultationType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition bg-white"
                >
                  <option value="">Select consultation type</option>
                  <option value="investment-planning">Investment Planning</option>
                  <option value="retirement-planning">Retirement Planning</option>
                  <option value="risk-management">Risk Management</option>
                  <option value="estate-planning">Estate Planning</option>
                  <option value="tax-optimization">Tax Optimization</option>
                  <option value="financial-advisory">Financial Advisory</option>
                  <option value="general">General Consultation</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Information (Optional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition resize-none"
                  placeholder="Tell us about your financial goals or any questions you have..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

