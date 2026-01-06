import { useState } from 'react';
import { RotateCcw, HelpCircle, Users, Coins, Settings, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-xl md:text-3xl font-bold">
              <span className="text-primary">API</span>{' '}
              <span className="text-foreground">Hub</span>
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
              إدارة طلبات API وعرض سجل المعاملات
            </p>
          </Link>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 flex-wrap justify-end">
            <Link to="/refund" className="nav-btn bg-secondary text-secondary-foreground hover:bg-muted flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              طلب استرداد
            </Link>
            <Link to="/faq" className="nav-btn bg-secondary text-secondary-foreground hover:bg-muted flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              الأسئلة
            </Link>
            <button className="nav-btn bg-accent text-accent-foreground hover:opacity-90 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Reseller HUB
            </button>
            <button className="nav-btn bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-2">
              <Coins className="w-4 h-4" />
              شراء رصيد
            </button>
            <button className="nav-btn bg-success text-success-foreground hover:opacity-90 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              الخدمات
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-border space-y-2">
            <Link 
              to="/refund" 
              onClick={() => setIsMenuOpen(false)}
              className="w-full nav-btn bg-secondary text-secondary-foreground hover:bg-muted flex items-center gap-2 justify-center py-3"
            >
              <RotateCcw className="w-4 h-4" />
              طلب استرداد
            </Link>
            <Link 
              to="/faq" 
              onClick={() => setIsMenuOpen(false)}
              className="w-full nav-btn bg-secondary text-secondary-foreground hover:bg-muted flex items-center gap-2 justify-center py-3"
            >
              <HelpCircle className="w-4 h-4" />
              الأسئلة
            </Link>
            <button className="w-full nav-btn bg-accent text-accent-foreground hover:opacity-90 flex items-center gap-2 justify-center py-3">
              <Users className="w-4 h-4" />
              Reseller HUB
            </button>
            <button className="w-full nav-btn bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-2 justify-center py-3">
              <Coins className="w-4 h-4" />
              شراء رصيد
            </button>
            <button className="w-full nav-btn bg-success text-success-foreground hover:opacity-90 flex items-center gap-2 justify-center py-3">
              <Settings className="w-4 h-4" />
              الخدمات
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
