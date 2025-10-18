import { useForm } from 'react-hook-form';
import { useRegister } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import type { RegisterCredentials } from '../types';
import betterDevLogo from '../assets/dev-logo-light.png';
import { VALIDATION, MESSAGES } from '../constants';

export function RegisterPage() {
  const { mutate: register, isPending, error } = useRegister();
  
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterCredentials>();

  const onSubmit = (data: RegisterCredentials) => {
    register(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src={betterDevLogo} 
              alt="better DEV Logo" 
              className="w-10 h-10 object-contain mr-3"
            />
            <h1 className="text-3xl font-brand">better DEV</h1>
          </div>
          <p className="text-foreground/60">Create your account</p>
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
                {...formRegister('email', {
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
                {...formRegister('password', {
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
              <p className="text-xs text-foreground/50 mt-1">
                Must be at least {VALIDATION.PASSWORD.MIN_LENGTH} characters
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium px-4 py-3 rounded-lg transition-smooth disabled:opacity-50 disabled:cursor-not-allowed btn-press hover-lift"
            >
              {isPending ? MESSAGES.BUTTONS.CREATING_ACCOUNT : MESSAGES.BUTTONS.CREATE_ACCOUNT}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-foreground/60">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}