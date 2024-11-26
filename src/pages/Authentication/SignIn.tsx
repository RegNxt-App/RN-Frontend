import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Api from '../../utils/Api';
import AuthLayout from '@/components/AuthLayout';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const SignIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setError(null);

    try {
      const response = await Api.post('/Accounts/authenticate', {
        email: values.email,
        password: values.password,
      });

      const data = response.data;
      localStorage.setItem('email', data.email);
      localStorage.setItem('id', data.id.toString());
      localStorage.setItem('jwtToken', data.jwtToken);

      toast({
        title: 'Success',
        description: 'You have been successfully signed in.',
      });

      console.log('Authentication successful', data);
      navigate('/reports-overview');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to sign in';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    }
  };

  return (
    <AuthLayout
      title="Sign In to RegNxt"
      subtitle="Welcome back! Please enter your details"
      logo={
        <Link className="mb-8 inline-block" to="#">
          <img
            src="/white-logo.svg"
            alt="RegNxt Logo"
            className="h-26 w-auto"
          />
        </Link>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black">Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black">Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="6+ Characters, 1 Capital letter"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && <div className="text-destructive text-sm">{error}</div>}

          <div className="text-right">
            <Link
              to="/auth/signup"
              className="text-sm text-primary hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <Button
            className="w-full text-white	"
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Don't have any account? </span>
        <Link to="/auth/signup" className="text-primary hover:underline">
          Sign Up
        </Link>
      </div>
    </AuthLayout>
  );
};

export default SignIn;
