import { useForm } from 'react-hook-form';
import { useLogin } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import type { LoginCredentials } from '../types';
import nebulaLogo from '../assets/nebula-logo.png';
import { VALIDATION, MESSAGES } from '../constants';

export function LoginPage() {
  const { mutate: login, isPending, error } = useLogin();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const onSubmit = (data: LoginCredentials) => {
    login(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src={nebulaLogo} 
              alt="Nebula Logo" 
              className="w-10 h-10 object-contain mr-3"
            />
            <h1 className="text-3xl font-bold">Nebula</h1>
          </div>
          <p className="text-foreground/60">Sign in to your account</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#1a1a1a] border border-border rounded-lg p-8 animate-fade-in">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Message from server */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-500 text-sm">{error.message}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder={MESSAGES.PLACEHOLDERS.EMAIL}
                {...register('email', {
                  required: VALIDATION.EMAIL.REQUIRED_MESSAGE,
                  pattern: {
                    value: VALIDATION.EMAIL.PATTERN,
                    message: VALIDATION.EMAIL.INVALID_MESSAGE,
                  },
                })}
                className="w-full bg-[#262626] text-foreground rounded-lg px-4 py-3 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={isPending}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder={MESSAGES.PLACEHOLDERS.PASSWORD}
                {...register('password', {
                  required: VALIDATION.PASSWORD.REQUIRED_MESSAGE,
                  minLength: {
                    value: VALIDATION.PASSWORD.MIN_LENGTH,
                    message: VALIDATION.PASSWORD.MIN_LENGTH_MESSAGE,
                  },
                })}
                className="w-full bg-[#262626] text-foreground rounded-lg px-4 py-3 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={isPending}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium px-4 py-3 rounded-lg transition-smooth disabled:opacity-50 disabled:cursor-not-allowed btn-press hover-lift"
            >
              {isPending ? MESSAGES.BUTTONS.SIGNING_IN : MESSAGES.BUTTONS.SIGN_IN}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-foreground/60">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}