import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          // Avoid calling Supabase queries directly inside the callback
          setTimeout(() => {
            checkAdminRole(session.user.id);
          }, 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkAdminRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    const { data, error } = await supabase.rpc('has_role', {
      _user_id: userId,
      _role: 'admin',
    });

    if (!error && data) {
      navigate('/admin');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin-auth`
          }
        });

        if (error) throw error;

        if (data.user) {
          toast({
            title: 'تم إنشاء الحساب',
            description: 'تم إنشاء حسابك بنجاح. يرجى الانتظار حتى يتم منحك الصلاحيات من قبل الأدمن.',
          });
          // Sign out the user since they don't have admin access yet
          await supabase.auth.signOut();
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Check if user is admin OR has any permissions
          const { data: isAdmin } = await supabase.rpc('has_role', {
            _user_id: data.user.id,
            _role: 'admin',
          });

          // If not admin, check for any permissions
          let hasAnyPermission = false;
          if (!isAdmin) {
            const { data: permissions } = await supabase
              .from('user_permissions')
              .select('*')
              .eq('user_id', data.user.id)
              .maybeSingle();

            if (permissions) {
              hasAnyPermission = 
                permissions.can_manage_orders ||
                permissions.can_manage_products ||
                permissions.can_manage_tokens ||
                permissions.can_manage_refunds ||
                permissions.can_manage_users ||
                permissions.can_manage_coupons;
            }
          }

          if (!isAdmin && !hasAnyPermission) {
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
    }
  };

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
              {isSignUp ? 'إنشاء حساب أدمن جديد' : 'تسجيل الدخول للوحة التحكم'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full pr-10"
                  placeholder="admin@example.com"
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
                  minLength={6}
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
