import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-xs text-charcoal-500 font-medium">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{percentage}% Complete</span>
      </div>
      <div className="w-full h-1.5 bg-cream-300 rounded-full overflow-hidden">
        <div
          className="h-full bg-burgundy-800 transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
