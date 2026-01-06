import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RotateCcw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

const Refund = () => {
  const [tokenValue, setTokenValue] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!tokenValue.trim() || !orderNumber.trim()) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const orderNum = parseInt(orderNumber.trim());
    if (isNaN(orderNum)) {
      setError('رقم الطلب يجب أن يكون رقماً');
      return;
    }

    setIsLoading(true);

    // Verify token exists
    const { data: tokenData } = await supabase
      .from('tokens')
      .select('id')
      .eq('token', tokenValue.trim())
      .maybeSingle();

    if (!tokenData) {
      setError('التوكن غير صالح');
      setIsLoading(false);
      return;
    }

    // Verify order exists and belongs to this token
    const { data: orderData } = await supabase
      .from('orders')
      .select('id, status, amount')
      .eq('order_number', orderNum)
      .eq('token_id', tokenData.id)
      .maybeSingle();

    if (!orderData) {
      setError('رقم الطلب غير صحيح أو لا ينتمي لهذا التوكن');
      setIsLoading(false);
      return;
    }

    if (orderData.status === 'pending' || orderData.status === 'in_progress') {
      setError('لا يمكن طلب استرداد لطلب قيد التنفيذ');
      setIsLoading(false);
      return;
    }

    // Check if refund request already exists for this order
    const { data: existingRefund } = await supabase
      .from('refund_requests')
      .select('id')
      .eq('order_id', orderData.id)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingRefund) {
      setError('يوجد طلب استرداد قيد المراجعة لهذا الطلب');
      setIsLoading(false);
      return;
    }

    // Create refund request
    const { error: insertError } = await supabase
      .from('refund_requests')
      .insert({
        token_value: tokenValue.trim(),
        order_id: orderData.id,
        reason: reason.trim() || null
      });

    if (insertError) {
      setError('فشل في إرسال طلب الاسترداد');
      setIsLoading(false);
      return;
    }

    setSubmitted(true);
    setIsLoading(false);
    toast({ title: 'تم', description: 'تم إرسال طلب الاسترداد بنجاح' });
  };

  const handleReset = () => {
    setTokenValue('');
    setOrderNumber('');
    setReason('');
    setSubmitted(false);
    setError('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="card-simple p-6">
            <div className="flex items-center gap-2 mb-4">
              <RotateCcw className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-primary">طلب استرداد</h1>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              أدخل بيانات الطلب لتقديم طلب استرداد
            </p>

            {submitted ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-green-600">تم إرسال الطلب بنجاح</h3>
                <p className="text-sm text-muted-foreground">
                  سيتم مراجعة طلبك والرد عليه في أقرب وقت
                </p>
                <button onClick={handleReset} className="btn-primary w-full py-3 mt-4">
                  طلب استرداد آخر
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">التوكن *</label>
                  <input
                    type="text"
                    value={tokenValue}
                    onChange={(e) => setTokenValue(e.target.value)}
                    className="input-field w-full"
                    placeholder="أدخل التوكن الخاص بك"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">رقم الطلب *</label>
                  <input
                    type="number"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="input-field w-full"
                    placeholder="أدخل رقم الطلب"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">سبب الاسترداد (اختياري)</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="input-field w-full h-24"
                    placeholder="اكتب سبب طلب الاسترداد..."
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-3 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      إرسال طلب الاسترداد
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Refund;