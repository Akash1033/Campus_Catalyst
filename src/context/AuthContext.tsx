import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'sonner';

type UserRole = 'student' | 'organizer' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isApproved: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  refreshUserData: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUserData = async () => {
    try {
      console.log('Refreshing user data from Supabase...');
      
      // Clear any existing cache by forcing a new session fetch
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No active session found');
        setUser(null);
        setIsAuthenticated(false);
        return null;
      }
      
      // Force non-cached query for profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }
      
      if (profile) {
        console.log('Profile data received:', profile);
        const userData: User = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role as UserRole,
          isApproved: profile.is_approved,
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error details:', error);
        
        if (error.message.includes('Email not confirmed')) {
          try {
            const { error: resendError } = await supabase.auth.resend({
              type: 'signup',
              email,
              options: {
                emailRedirectTo: `${window.location.origin}/login`,
              }
            });
            
            if (resendError) {
              console.error('Error resending confirmation email:', resendError);
              
              if (resendError.message.includes('security purposes') || resendError.message.includes('rate limit')) {
                toast.error('Please wait a few minutes before requesting another confirmation email.');
              } else {
                toast.error('Could not resend confirmation email. Please try again later.');
              }
            } else {
              toast.info('Please check your email to confirm your account. Confirmation email resent.');
            }
          } catch (resendCatchError) {
            console.error('Error in resend catch block:', resendCatchError);
            toast.error('Could not resend confirmation email. Please try again later.');
          }
          return false;
        }
        
        throw error;
      }
      
      console.log('Login successful, session data:', data);
      toast.success('Login successful! Welcome back.');
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid email or password');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      
      if (error) {
        console.error('Registration error details:', error);
        throw error;
      }
      
      if (data?.user) {
        console.log('Registration successful:', data);
        
        if (!data.session) {
          toast.success('Registration successful! Please check your email to confirm your account.');
          return true;
        }
        
        if (role === 'organizer') {
          toast.success('Registration successful! Your organizer account is pending approval.');
        } else {
          toast.success('Registration successful! Welcome to Campus Catalyst.');
        }
        
        return true;
      } else {
        throw new Error('Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setIsAuthenticated(false);
      toast.info('You have been logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An error occurred during logout');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const { hash } = window.location;
      if (hash && hash.includes('access_token')) {
        window.location.hash = '';
        toast.success('Email confirmed successfully! You can now log in.');
      }
    };
    
    handleEmailConfirmation();
    
    const getSession = async () => {
      try {
        const userData = await refreshUserData();
        if (!userData) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    getSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        if (session && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
          await refreshUserData();
        }
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );
    
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      register, 
      logout, 
      isLoading, 
      refreshUserData 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
