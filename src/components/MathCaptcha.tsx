import { useState, useEffect, useCallback } from 'react';
import { Calculator, RefreshCw, CheckCircle2 } from 'lucide-react';

interface MathCaptchaProps {
  onVerified: () => void;
  onCancel: () => void;
}

const generateProblem = () => {
  const operators = ['+', '-', '×'] as const;
  const operator = operators[Math.floor(Math.random() * operators.length)];
  
  let num1: number, num2: number, answer: number;
  
  switch (operator) {
    case '+':
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
      answer = num1 + num2;
      break;
    case '-':
      num1 = Math.floor(Math.random() * 20) + 10;
      num2 = Math.floor(Math.random() * num1);
      answer = num1 - num2;
      break;
    case '×':
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      answer = num1 * num2;
      break;
    default:
      num1 = 1;
      num2 = 1;
      answer = 2;
  }
  
  return { num1, num2, operator, answer };
};

const MathCaptcha = ({ onVerified, onCancel }: MathCaptchaProps) => {
  const [problem, setProblem] = useState(generateProblem);
  const [userAnswer, setUserAnswer] = useState('');
  const [error, setError] = useState(false);
  const [verified, setVerified] = useState(false);

  const refreshProblem = useCallback(() => {
    setProblem(generateProblem());
    setUserAnswer('');
    setError(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (parseInt(userAnswer) === problem.answer) {
      setVerified(true);
      setError(false);
      setTimeout(() => {
        onVerified();
      }, 500);
    } else {
      setError(true);
      setUserAnswer('');
      // Generate new problem after wrong answer
      setTimeout(() => {
        refreshProblem();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            {verified ? (
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            ) : (
              <Calculator className="w-8 h-8 text-primary" />
            )}
          </div>
          <h3 className="text-lg font-bold mb-2">التحقق الأمني</h3>
          <p className="text-sm text-muted-foreground">
            لاحظنا عدة عمليات شراء متتالية. 
            <br />
            يرجى حل المسألة للمتابعة
          </p>
        </div>

        {verified ? (
          <div className="text-center py-4">
            <p className="text-green-500 font-medium">تم التحقق بنجاح!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-muted/50 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-4 text-3xl font-bold">
                <span>{problem.num1}</span>
                <span className="text-primary">{problem.operator}</span>
                <span>{problem.num2}</span>
                <span>=</span>
                <span className="text-primary">?</span>
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => {
                  setUserAnswer(e.target.value);
                  setError(false);
                }}
                placeholder="أدخل الإجابة"
                className={`w-full px-4 py-3 text-center text-xl font-bold border rounded-xl bg-background transition-colors ${
                  error 
                    ? 'border-destructive bg-destructive/5' 
                    : 'border-border focus:border-primary'
                }`}
                autoFocus
              />
              <button
                type="button"
                onClick={refreshProblem}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                title="مسألة جديدة"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <p className="text-destructive text-sm text-center">
                إجابة خاطئة! حاول مرة أخرى
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="py-3 px-4 border border-border rounded-xl text-muted-foreground hover:bg-muted transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={!userAnswer.trim()}
                className="py-3 px-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                تحقق
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default MathCaptcha;
