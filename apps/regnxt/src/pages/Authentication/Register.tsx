import React, {useState} from 'react';

import AuthLayout from '@/components/AuthLayout';

import {Button} from '@rn/ui/components/ui/button';
import {Input} from '@rn/ui/components/ui/input';
import {Label} from '@rn/ui/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';

export default function Register() {
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
      title="Create an account"
      subtitle="Sign up for BIRD"
      imageSrc="/logo.svg"
      imageAlt="BIRD"
      description="Intuitive user interface for visualizing, managing and extending the BIRD model"
    >
      <form
        onSubmit={onSubmit}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Select>
            <SelectTrigger id="title">
              <SelectValue placeholder="Select a title" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mr">Mr.</SelectItem>
              <SelectItem value="mrs">Mrs.</SelectItem>
              <SelectItem value="ms">Ms.</SelectItem>
              <SelectItem value="dr">Dr.</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            required
            type="text"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            required
            type="text"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="abdullah@example.com"
            required
            type="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            required
            type="password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            required
            type="password"
          />
        </div>
        <Button
          className="w-full"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <a
          className="font-semibold underline underline-offset-4 hover:text-primary"
          href="/auth/login"
        >
          Sign in
        </a>
      </div>
    </AuthLayout>
  );
}
