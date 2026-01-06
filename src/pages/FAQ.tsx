import Header from '@/components/Header';
import { HelpCircle, Mail } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'كيف يمكنني الشراء؟',
    answer: 'اختر المنتج المطلوب، ثم أدخل التوكن الخاص بك وأكمل عملية الشراء. سيتم خصم المبلغ من رصيد التوكن تلقائياً.'
  },
  {
    question: 'كيف أحصل على التوكن؟',
    answer: 'يمكنك الحصول على التوكن من خلال التواصل مع الدعم عبر البريد الإلكتروني أو من خلال وكلائنا المعتمدين.'
  },
  {
    question: 'متى أستلم المنتج؟',
    answer: 'المنتجات الفورية تُسلّم مباشرة بعد الدفع. المنتجات اليدوية تحتاج وقتاً للمعالجة حسب الوقت المتوقع المذكور.'
  },
  {
    question: 'ماذا لو تم رفض طلبي؟',
    answer: 'في حالة رفض الطلب، يتم إرجاع المبلغ كاملاً إلى رصيد التوكن الخاص بك تلقائياً.'
  },
  {
    question: 'هل يمكنني التواصل أثناء تنفيذ الطلب؟',
    answer: 'نعم، عندما يكون طلبك قيد التنفيذ، ستظهر لك محادثة مباشرة للتواصل مع فريق الدعم.'
  },
  {
    question: 'كيف أتحقق من رصيدي؟',
    answer: 'أدخل التوكن في الصفحة الرئيسية واضغط على "عرض الرصيد" لمعرفة رصيدك الحالي وسجل طلباتك.'
  }
];

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="card-simple p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-primary">الأسئلة الشائعة</h1>
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-sm text-right hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Support Contact */}
          <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">للمزيد من المساعدة:</span>
              <a 
                href="mailto:support@boompay.store" 
                className="text-primary font-medium hover:underline"
              >
                support@boompay.store
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FAQ;
