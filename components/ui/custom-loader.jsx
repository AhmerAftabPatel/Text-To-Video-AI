const CustomLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {/* Main circle */}
        <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 animate-pulse" />
        
        {/* Rotating circles */}
        <div className="absolute top-0 left-0 w-full h-full animate-spin">
          <div className="absolute top-0 left-1/2 w-3 h-3 -ml-1.5 bg-blue-500 rounded-full" />
        </div>
        
        <div className="absolute top-0 left-0 w-full h-full animate-spin" style={{ animationDuration: '2s' }}>
          <div className="absolute top-0 left-1/2 w-2 h-2 -ml-1 bg-purple-500 rounded-full" />
        </div>

        {/* Progress text */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white text-sm font-medium whitespace-nowrap">
          Processing...
        </div>

        {/* Ripple effect */}
        <div className="absolute -inset-4">
          <div className="w-24 h-24 rounded-full border border-blue-500/50 animate-[ping_1.5s_infinite]" />
        </div>
      </div>
    </div>
  );
};

export default CustomLoader; 