import React from "react";

const LogoSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="relative w-32 h-32 animate-spin">
        <svg
          width="159"
          height="156"
          viewBox="0 0 159 156"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 10H81.9764C109.591 10 131.976 32.3858 131.976 60C131.976 76.7093 123.78 91.5043 111.188 100.584L0 10ZM146 150L62.5 79H16V156L44.6232 106.65L89.5 150H146Z"
            fill="#6120EB"
          />
        </svg>
      </div>
      <div className="absolute mt-64  text-xl font-bold text-black">
        Loading...
      </div>
    </div>
  );
};

export default LogoSpinner;
