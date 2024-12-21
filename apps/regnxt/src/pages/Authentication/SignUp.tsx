import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {Link} from 'react-router-dom';

import AuthLayout from '@/components/AuthLayout';
import {Button} from '@/components/ui/button';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {zodResolver} from '@hookform/resolvers/zod';
import {Lock, Mail, User} from 'lucide-react';
import * as z from 'zod';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      console.log(values);
      // Form submission logic here
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign Up to RegNxt"
      subtitle="Create your account"
      imgSrc={
        <Link
          className="mb-8 inline-block"
          to="#"
        >
          <img
            src="/white-logo.svg"
            alt="RegNxt Logo"
            className="h-26 w-auto"
          />
        </Link>
      }
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="name"
            render={({field}) => (
              <FormItem>
                <FormLabel className="text-black">Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Enter your full name"
                      {...field}
                      className="pl-6 pr-10 py-4"
                    />
                    <span className="absolute right-4 top-3 text-muted-foreground">
                      <User
                        size={20}
                        strokeWidth={1.75}
                      />
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({field}) => (
              <FormItem>
                <FormLabel className="text-black">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      {...field}
                      className="pl-6 pr-10 py-4"
                    />
                    <span className="absolute right-4 top-3 text-muted-foreground">
                      <Mail
                        size={20}
                        strokeWidth={1.75}
                      />
                    </span>
                  </div>
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
                <FormLabel className="text-black">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Enter your password"
                      type="password"
                      {...field}
                      className="pl-6 pr-10 py-4"
                    />
                    <span className="absolute right-4 top-3 text-muted-foreground">
                      <Lock
                        size={20}
                        strokeWidth={1.75}
                      />
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            className="w-full py-4 text-white"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>

          <Button
            variant="outline"
            className="w-full bg-black text-white py-4 flex items-center justify-center gap-3.5"
            type="button"
          >
            <img
              src="/icons8-google.svg"
              alt="RegNxt Logo"
              className="h-6 w-auto"
            />
            Sign up with Google
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link
          to="/auth/signin"
          className="font-semibold hover:text-primary underline underline-offset-4"
        >
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
