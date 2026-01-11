import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Music, ArrowRight, Calendar, Shield, Zap } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const features = [
    { 
      icon: Calendar, 
      title: 'Easy Scheduling', 
      description: 'Book your studio time with just a few clicks' 
    },
    { 
      icon: Shield, 
      title: 'Secure Booking', 
      description: 'Admin approval ensures quality sessions' 
    },
    { 
      icon: Zap, 
      title: 'Real-time Updates', 
      description: 'Instant notifications on booking status' 
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 relative overflow-hidden">
        {/* Background Effects */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{ background: 'var(--gradient-glow)' }}
        />
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow animate-pulse-glow">
                <Music className="w-7 h-7 text-primary-foreground" />
              </div>
              <span className="font-display text-3xl font-bold">
                Studio<span className="text-gradient">Booker</span>
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Your Creative Space
              <span className="text-gradient block">Awaits</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
              Professional studio booking made effortless. Reserve your perfect session 
              in seconds and focus on what matters most – your art.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button
                size="lg"
                onClick={() => navigate('/auth')}
                className="bg-gradient-primary hover:opacity-90 transition-opacity h-12 px-8 text-base group"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/auth')}
                className="h-12 px-8 text-base border-border hover:bg-secondary"
              >
                Sign In
              </Button>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              {features.map(({ icon: Icon, title, description }, index) => (
                <div 
                  key={title}
                  className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6 text-left animate-slide-up hover:border-primary/50 transition-colors"
                  style={{ animationDelay: `${300 + index * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-6 bg-card/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 StudioBooker. Built for creators.
        </div>
      </footer>
    </div>
  );
}
