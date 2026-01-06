import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminAuth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const isHandlingAuth = useRef(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Convert username to a fake email for Supabase Auth
  const usernameToEmail = (user: string) => `${user.toLowerCase().trim()}@admin.local`;

  useEffect(() => {
    // Check existing session on mount
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const hasAccess = await checkUserAccess(session.user.id);
        if (hasAccess) {
          navigate('/admin');
          return;
        }
      }
      setIsCheckingAuth(false);
    };

    checkExistingSession();
  }, []);

  const checkUserAccess = async (userId: string): Promise<boolean> => {
    // Check if admin
    const { data: isAdmin } = await supabase.rpc('has_role', {
      _user_id: userId,
      _role: 'admin',
    });

    if (isAdmin) {
      return true;
    }

    // Check for any permissions
    const { data: permissions } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (permissions) {
      const hasAnyPermission = 
        permissions.can_manage_orders ||
        permissions.can_manage_products ||
        permissions.can_manage_tokens ||
        permissions.can_manage_refunds ||
        permissions.can_manage_users ||
        permissions.can_manage_coupons;

      return hasAnyPermission;
    }

    return false;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isHandlingAuth.current) return;
    
    if (!username.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسم المستخدم',
        variant: 'destructive',
      });
      return;
    }

    if (!password) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال كلمة المرور',
        variant: 'destructive',
      });
      return;
    }

    isHandlingAuth.current = true;
    setIsLoading(true);

    const fakeEmail = usernameToEmail(username);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: fakeEmail,
          password,
          options: {
            data: {
              username: username.trim(),
            }
          }
        });

        if (error) {
          if (error.message.includes('already registered')) {
            throw new Error('اسم المستخدم مستخدم بالفعل');
          }
          throw error;
        }

        if (data.user) {
          toast({
            title: 'تم إنشاء الحساب',
            description: 'تم إنشاء حسابك بنجاح. يرجى الانتظار حتى يتم منحك الصلاحيات من قبل الأدمن.',
          });
          await supabase.auth.signOut();
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: fakeEmail,
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
          }
          throw error;
        }

        if (data.user) {
          const hasAccess = await checkUserAccess(data.user.id);

          if (!hasAccess) {
            await supabase.auth.signOut();
            toast({
              title: 'غير مصرح',
              description: 'هذا الحساب ليس لديه صلاحيات للوصول للوحة التحكم',
              variant: 'destructive',
            });
            return;
          }

          toast({
            title: 'تم تسجيل الدخول',
            description: 'مرحباً بك في لوحة التحكم',
          });
          navigate('/admin');
        }
      }
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء تسجيل الدخول',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      isHandlingAuth.current = false;
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card-simple p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">لوحة التحكم</h1>
            <p className="text-muted-foreground mt-2">
              {isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول للوحة التحكم'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">اسم المستخدم</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field w-full pr-10"
                  placeholder="boom"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field w-full pr-10 pl-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 disabled:opacity-50"
            >
              {isLoading ? 'جاري التحميل...' : isSignUp ? 'إنشاء الحساب' : 'تسجيل الدخول'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:underline text-sm"
            >
              {isSignUp ? 'لديك حساب؟ سجل دخولك' : 'ليس لديك حساب؟ أنشئ حساب جديد'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
