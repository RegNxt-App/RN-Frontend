import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  description: string;
}

/**
 * AuthLayout component for authentication pages
 */
const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  imageSrc,
  imageAlt,
  description,
}) => {
  return (
    <div className="flex min-h-screen">
      <div className="flex w-full flex-col justify-center px-8 md:px-16 lg:w-1/2 lg:px-24 xl:px-32">
        <div className="mx-auto w-full max-w-md">
          <h2 className="mb-2 text-3xl font-bold">{title}</h2>
          <p className="mb-8 text-muted-foreground">{subtitle}</p>
          {children}
        </div>
      </div>

      <div className="hidden flex-col items-center justify-center bg-black p-12 lg:flex lg:w-1/2">
        <div className="max-w-md text-center">
          <img
            src={imageSrc}
            alt={imageAlt}
            width={400}
            height={400}
            className="mx-auto mb-8"
          />
          <h3 className="mb-4 text-2xl font-bold text-white">Banks Integrated Reporting Dictionary</h3>
          <p className="text-muted-foreground">
            {description ?? 'Streamlined regulatory compliance platform'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
