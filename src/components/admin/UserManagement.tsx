import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Shield, Trash2, Loader2, Settings, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
  email?: string;
}

interface UserPermission {
  id: string;
  user_id: string;
  can_manage_orders: boolean;
  can_manage_products: boolean;
  can_manage_tokens: boolean;
  can_manage_refunds: boolean;
  can_manage_users: boolean;
  can_manage_coupons: boolean;
}

const permissionLabels = {
  can_manage_orders: 'إدارة الطلبات',
  can_manage_products: 'إدارة المنتجات',
  can_manage_tokens: 'إدارة التوكنات',
  can_manage_refunds: 'إدارة طلبات الاسترداد',
  can_manage_users: 'إدارة المستخدمين',
  can_manage_coupons: 'إدارة الكوبونات',
};

const UserManagement = () => {
  const [users, setUsers] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<Record<string, UserPermission>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [savingPermissions, setSavingPermissions] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    
    // Fetch users
    const { data: usersData, error: usersError } = await supabase
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) {
      toast({ title: 'خطأ', description: usersError.message, variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    // Fetch permissions
    const { data: permissionsData, error: permissionsError } = await supabase
      .from('user_permissions')
      .select('*');

    if (permissionsError) {
      console.error('Error fetching permissions:', permissionsError);
    }

    setUsers(usersData || []);
    
    // Map permissions by user_id
    const permissionsMap: Record<string, UserPermission> = {};
    (permissionsData || []).forEach((p: UserPermission) => {
      permissionsMap[p.user_id] = p;
    });
    setPermissions(permissionsMap);
    
    setIsLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', userId);

    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'تم', description: 'تم تحديث الصلاحية بنجاح' });
      fetchUsers();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

    // Delete permissions first
    await supabase
      .from('user_permissions')
      .delete()
      .eq('user_id', userId);

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'تم', description: 'تم حذف المستخدم بنجاح' });
      fetchUsers();
    }
  };

  const handlePermissionChange = async (
    userId: string, 
    permission: keyof Omit<UserPermission, 'id' | 'user_id'>, 
    value: boolean
  ) => {
    setSavingPermissions(userId);
    
    const existingPermission = permissions[userId];
    
    if (existingPermission) {
      // Update existing permission
      const { error } = await supabase
        .from('user_permissions')
        .update({ [permission]: value })
        .eq('user_id', userId);

      if (error) {
        toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
      } else {
        setPermissions(prev => ({
          ...prev,
          [userId]: { ...prev[userId], [permission]: value }
        }));
        toast({ title: 'تم', description: 'تم تحديث الصلاحية' });
      }
    } else {
      // Create new permission record
      const newPermission = {
        user_id: userId,
        can_manage_orders: false,
        can_manage_products: false,
        can_manage_tokens: false,
        can_manage_refunds: false,
        can_manage_users: false,
        can_manage_coupons: false,
        [permission]: value
      };

      const { data, error } = await supabase
        .from('user_permissions')
        .insert(newPermission)
        .select()
        .single();

      if (error) {
        toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
      } else {
        setPermissions(prev => ({
          ...prev,
          [userId]: data
        }));
        toast({ title: 'تم', description: 'تم تحديث الصلاحية' });
      }
    }
    
    setSavingPermissions(null);
  };

  const toggleAllPermissions = async (userId: string, enable: boolean) => {
    setSavingPermissions(userId);
    
    const allPermissions = {
      can_manage_orders: enable,
      can_manage_products: enable,
      can_manage_tokens: enable,
      can_manage_refunds: enable,
      can_manage_users: enable,
      can_manage_coupons: enable,
    };

    const existingPermission = permissions[userId];
    
    if (existingPermission) {
      const { error } = await supabase
        .from('user_permissions')
        .update(allPermissions)
        .eq('user_id', userId);

      if (error) {
        toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
      } else {
        setPermissions(prev => ({
          ...prev,
          [userId]: { ...prev[userId], ...allPermissions }
        }));
        toast({ title: 'تم', description: enable ? 'تم تفعيل كل الصلاحيات' : 'تم إلغاء كل الصلاحيات' });
      }
    } else {
      const { data, error } = await supabase
        .from('user_permissions')
        .insert({ user_id: userId, ...allPermissions })
        .select()
        .single();

      if (error) {
        toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
      } else {
        setPermissions(prev => ({
          ...prev,
          [userId]: data
        }));
        toast({ title: 'تم', description: enable ? 'تم تفعيل كل الصلاحيات' : 'تم إلغاء كل الصلاحيات' });
      }
    }
    
    setSavingPermissions(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Users className="w-5 h-5" />
          إدارة المستخدمين ({users.length})
        </h2>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          لا يوجد مستخدمين مسجلين
        </div>
      ) : (
        <div className="grid gap-3">
          {users.map((user) => {
            const userPermissions = permissions[user.user_id];
            const isExpanded = expandedUser === user.user_id;
            const isAdmin = user.role === 'admin';
            
            return (
              <div
                key={user.id}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isAdmin ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <Shield className={`w-5 h-5 ${
                          isAdmin ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.user_id.slice(0, 8)}...</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.user_id, e.target.value as 'admin' | 'user')}
                        className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background"
                      >
                        <option value="admin">أدمن</option>
                        <option value="user">مستخدم</option>
                      </select>

                      <button
                        onClick={() => setExpandedUser(isExpanded ? null : user.user_id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isExpanded ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                        }`}
                        title="إدارة الصلاحيات"
                      >
                        <Settings className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteUser(user.user_id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Permissions Section */}
                {isExpanded && (
                  <div className="border-t border-border bg-muted/30 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold">الصلاحيات التفصيلية</h3>
                      {savingPermissions === user.user_id && (
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleAllPermissions(user.user_id, true)}
                          disabled={savingPermissions === user.user_id}
                          className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          تفعيل الكل
                        </button>
                        <button
                          onClick={() => toggleAllPermissions(user.user_id, false)}
                          disabled={savingPermissions === user.user_id}
                          className="text-xs px-3 py-1.5 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          إلغاء الكل
                        </button>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="mb-4 p-3 bg-primary/10 rounded-lg text-sm text-primary">
                        <Shield className="w-4 h-4 inline-block ml-2" />
                        الأدمن لديه كل الصلاحيات تلقائياً
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(Object.keys(permissionLabels) as Array<keyof typeof permissionLabels>).map((permKey) => {
                        const isEnabled = userPermissions?.[permKey] ?? false;
                        
                        return (
                          <div 
                            key={permKey}
                            className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                          >
                            <Label 
                              htmlFor={`${user.user_id}-${permKey}`}
                              className="text-sm cursor-pointer"
                            >
                              {permissionLabels[permKey]}
                            </Label>
                            <Switch
                              id={`${user.user_id}-${permKey}`}
                              checked={isAdmin || isEnabled}
                              disabled={isAdmin || savingPermissions === user.user_id}
                              onCheckedChange={(value) => 
                                handlePermissionChange(user.user_id, permKey, value)
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
