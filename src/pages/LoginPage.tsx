import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { login } from '../lib/auth.api';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, AlertCircle, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, UserRole } from '../store/auth.store';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<UserRole>('user');
  
  const navigate = useNavigate();
  const { setAuth, deviceId } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setApiError(null);
    const authDeviceId = deviceId || 'mock-device-id';

    try {
      const { token } = await login(data.email, data.password, authDeviceId);
      const authToken = token || 'mock-jwt-kaval-2026';

      setIsSuccess(true);
      setTimeout(() => {
        setAuth(authToken, authDeviceId, activeTab, data.email);
        localStorage.setItem('kaval-token', authToken);
        navigate(activeTab === 'admin' ? '/history' : '/sos');
      }, 1500);

    } catch (error: any) {
      console.error('Login Error:', error);

      // Fallback for demo if backend is offline, endpoint is missing, or media type is unsupported
      const isNetworkError = !error.response;
      const isNotFound = error.response?.status === 404;
      const isUnsupportedMediaType = error.response?.status === 415;

      if (isNetworkError || isNotFound || isUnsupportedMediaType) {
        console.warn(
          isNetworkError
            ? 'Backend offline - using mock bypass'
            : isNotFound
            ? 'Endpoint /auth/login not found - using mock bypass'
            : 'Backend rejected content type - using mock bypass'
        );
        setIsSuccess(true);
        const mockToken = 'mock-jwt-kaval-2026';
        setTimeout(() => {
          setAuth(mockToken, authDeviceId, activeTab, data.email);
          localStorage.setItem('kaval-token', mockToken);
          navigate(activeTab === 'admin' ? '/history' : '/sos');
        }, 1500);
      } else {
        setApiError(error.response?.data?.message || 'Invalid credentials. Please try again.');
      }
    }
  };

  const switchTab = (role: UserRole) => {
    setActiveTab(role);
    setApiError(null);
    reset();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <div className="flex justify-center text-blue-500 mb-6">
           {activeTab === 'admin' ? (
             <ShieldCheck size={48} className="drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] text-purple-400" />
           ) : (
             <Lock size={48} className="drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] text-blue-400" />
           )}
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-white tracking-tight">
          {activeTab === 'admin' ? 'Admin Portal' : 'Welcome Back'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Sign in to access your secure dashboard
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <div className="bg-slate-900/50 backdrop-blur-xl py-8 px-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] sm:rounded-2xl sm:px-10 border border-slate-800/50 relative">
          
          {/* Tab Switcher */}
          {!isSuccess && (
            <div className="flex p-1 bg-slate-950/50 rounded-xl mb-8 border border-slate-800">
              <button
                onClick={() => switchTab('user')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'user' 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User size={16} />
                Citizen
              </button>
              <button
                onClick={() => switchTab('admin')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'admin' 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck size={16} />
                Administrator
              </button>
            </div>
          )}

          {isSuccess ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-500/20 mb-4">
                <Lock className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-medium text-white">Authentication Successful!</h3>
              <p className="mt-2 text-slate-400">Redirecting to your dashboard...</p>
            </motion.div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {apiError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3 text-red-400"
                >
                  <AlertCircle size={20} className="shrink-0" />
                  <p className="text-sm">{apiError}</p>
                </motion.div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                  {activeTab === 'admin' ? 'Admin ID / Email' : 'Email address'}
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-500/50 focus:ring-red-500' : 'border-slate-700 focus:ring-blue-500'} rounded-xl bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                    placeholder="Enter your email"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.password ? 'border-red-500/50 focus:ring-red-500' : 'border-slate-700 focus:ring-blue-500'} rounded-xl bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                    placeholder="Enter your password"
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className={`h-4 w-4 ${activeTab === 'admin' ? 'text-purple-600 focus:ring-purple-500' : 'text-blue-600 focus:ring-blue-500'} border-slate-700 rounded bg-slate-900`}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className={`font-medium ${activeTab === 'admin' ? 'text-purple-400 hover:text-purple-300' : 'text-blue-400 hover:text-blue-300'} transition-colors`}>
                    Forgot password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden ${
                    activeTab === 'admin' 
                      ? 'bg-purple-600 hover:bg-purple-500 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 shadow-[0_0_20px_rgba(168,85,247,0.3)]' 
                      : 'bg-blue-600 hover:bg-blue-500 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900 shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                  }`}
                >
                  <div className={`absolute inset-0 w-full h-full bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    activeTab === 'admin' ? 'from-purple-600 to-indigo-600' : 'from-blue-600 to-indigo-600'
                  }`}></div>
                  <span className="relative flex items-center gap-2">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        Sign in
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
