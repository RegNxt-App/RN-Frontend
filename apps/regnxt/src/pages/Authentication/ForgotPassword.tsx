import React, {useState} from 'react';

import AuthLayout from '@/components/AuthLayout';

import {Button} from '@rn/ui/components/ui/button';
import {Input} from '@rn/ui/components/ui/input';
import {Label} from '@rn/ui/components/ui/label';

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Reset your BIRD account password"
      imageSrc="/logo.svg"
      imageAlt="BIRD"
      description="Intuitive user interface for visualizing, managing and extending the BIRD model"
    >
      <form
        onSubmit={onSubmit}
        className="space-y-6"
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="abdullah@example.com"
            required
            type="email"
          />
        </div>
        <Button
          className="w-full"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Remember your password? </span>
        <a
          className="font-semibold underline underline-offset-4 hover:text-primary"
          href="/auth/login"
        >
          Sign in
        </a>
      </div>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Don&apos;t have an account? </span>
        <a
          className="font-semibold underline underline-offset-4 hover:text-primary"
          href="/register"
        >
          Sign up
        </a>
      </div>
    </AuthLayout>
  );
}
