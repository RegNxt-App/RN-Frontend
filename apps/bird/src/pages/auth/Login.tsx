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
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function Login() {
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
      await login(values.email, values.password);
      toast({
        title: 'Login successful',
        description: 'You have been logged in successfully.',
      });
      const from = (location.state as {from?: {pathname: string}})?.from?.pathname || '/configuration';
      navigate(from, {replace: true});
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      toast({
        title: 'Login failed',
        description: 'Invalid email or password. Please try again.',
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
      description="Intuitive user interface for visualizing, managing and extending the BIRD model"
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
