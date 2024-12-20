import {useForm} from 'react-hook-form';
import {useLocation, useNavigate} from 'react-router-dom';

import AuthLayout from '@/components/AuthLayout';
import {useAuth} from '@/contexts/AuthContext';
import {useToast} from '@/hooks/use-toast';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';

import {Button} from '@rn/ui/components/ui/button';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@rn/ui/components/ui/form';
import {Input} from '@rn/ui/components/ui/input';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const {toast} = useToast();
  const {login} = useAuth();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const userResponse = await login(values.email, values.password);
      console.log('userResponse: ', userResponse);

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token not stored after login');
        throw new Error('Authentication failed - token storage error');
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      toast({
        title: 'Login successful',
        description: 'You have been logged in successfully.',
      });
      const from =
        (location.state as {from?: {pathname: string}})?.from?.pathname || '/reporting/reports-overview';
      navigate(from, {replace: true});
    } catch (error) {
      console.error('Login error:', error);
      localStorage.removeItem('token');

      toast({
        title: 'Login failed',
        description: 'Authentication failed. Please try again.',
        variant: 'destructive',
      });
    }
  }
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue using the BIRD"
      imageSrc="/white-logo.svg"
      imageAlt="BIRD"
      description="Streamlined regulatory compliance platform"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="email"
            render={({field}) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="m@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({field}) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="*******"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className="w-full"
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center text-sm">
        <a
          className="text-muted-foreground underline underline-offset-4 hover:text-primary"
          href="/auth/forgot-password"
        >
          Forgot password?
        </a>
      </div>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Don&apos;t have an account? </span>
        <a
          className="font-semibold underline underline-offset-4 hover:text-primary"
          href="/auth/register"
        >
          Sign up
        </a>
      </div>
    </AuthLayout>
  );
}
