import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  logo?: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  logo,
}) => {
  return (
    <div className="flex min-h-screen">
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-8 md:px-16 lg:px-24 xl:px-32">
        <div className="mx-auto w-full max-w-md">
          <h2 className="text-3xl font-bold mb-2 text-black">{title}</h2>
          {subtitle && <p className="text-muted-foreground mb-8">{subtitle}</p>}
          {children}
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 flex-col items-center justify-center p-12">
        <div className="max-w-md text-center">
          {logo}
          <p className="text-muted-foreground">
            Streamlined regulatory compliance platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
