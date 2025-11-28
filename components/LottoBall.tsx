import React from 'react';

interface LottoBallProps {
  number: number;
  index: number;
}

const getBallColor = (num: number) => {
  if (num <= 10) return 'bg-yellow-400 border-yellow-500 text-yellow-900'; // 1-10
  if (num <= 20) return 'bg-blue-500 border-blue-600 text-white'; // 11-20
  if (num <= 30) return 'bg-red-500 border-red-600 text-white'; // 21-30
  if (num <= 40) return 'bg-slate-500 border-slate-600 text-white'; // 31-40
  return 'bg-green-500 border-green-600 text-white'; // 41-45
};

const LottoBall: React.FC<LottoBallProps> = ({ number, index }) => {
  const colorClass = getBallColor(number);
  const animationDelay = `${index * 150}ms`;

  return (
    <div 
      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-xl font-bold shadow-lg border-b-4 ball-animate ${colorClass}`}
      style={{ animationDelay }}
    >
      {number}
    </div>
  );
};

export default LottoBall;