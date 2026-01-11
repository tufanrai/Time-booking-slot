import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserRole } from '@/types/booking';
import { toast } from '@/hooks/use-toast';
import { Music, Mail, Lock, User, Shield, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Auth() {
  const navigate = useNavigate();
  const { login, register, isAuthenticated, user } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated && user) {
    navigate(user.role === 'admin' ? '/admin' : '/dashboard');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const success = login(email, password);
        if (success) {
          toast({ title: "Welcome back!", description: "You've been logged in successfully" });
        } else {
          toast({ 
            title: "Login failed", 
            description: "Invalid credentials. Try 'demo' as password for testing.",
            variant: "destructive" 
          });
        }
      } else {
        const success = register(email, password, name, role);
        if (success) {
          toast({ title: "Account created!", description: "Welcome to StudioBooker" });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Branding */}
      <div className="lg:w-1/2 bg-gradient-card p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30"
          style={{ background: 'var(--gradient-glow)' }}
        />
        
        <div className="relative z-10 max-w-md mx-auto lg:mx-0">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow animate-pulse-glow">
              <Music className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold">
              Studio<span className="text-gradient">Booker</span>
            </span>
          </div>

          <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            Book Your Perfect
            <span className="text-gradient block">Studio Session</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            Professional studio booking made simple. Reserve your creative space in seconds.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Mic, label: 'Recording Studios' },
              { icon: Music, label: 'Practice Rooms' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-muted-foreground">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="lg:w-1/2 p-8 lg:p-12 flex items-center justify-center bg-background">
        <div className="w-full max-w-md animate-slide-up">
          {/* Toggle */}
          <div className="flex bg-secondary rounded-lg p-1 mb-8">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={cn(
                "flex-1 py-2.5 text-sm font-medium rounded-md transition-all",
                isLogin 
                  ? "bg-card text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={cn(
                "flex-1 py-2.5 text-sm font-medium rounded-md transition-all",
                !isLogin 
                  ? "bg-card text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-secondary border-border"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                  required
                />
              </div>
              {isLogin && (
                <p className="text-xs text-muted-foreground">
                  Use "demo" as password for testing
                </p>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label>Account Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('user')}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                      role === 'user'
                        ? "border-primary bg-primary/10 shadow-glow"
                        : "border-border bg-secondary hover:border-muted-foreground"
                    )}
                  >
                    <User className={cn(
                      "w-6 h-6",
                      role === 'user' ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-sm font-medium",
                      role === 'user' ? "text-foreground" : "text-muted-foreground"
                    )}>User</span>
                    <span className="text-xs text-muted-foreground">Book sessions</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                      role === 'admin'
                        ? "border-primary bg-primary/10 shadow-glow"
                        : "border-border bg-secondary hover:border-muted-foreground"
                    )}
                  >
                    <Shield className={cn(
                      "w-6 h-6",
                      role === 'admin' ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-sm font-medium",
                      role === 'admin' ? "text-foreground" : "text-muted-foreground"
                    )}>Admin</span>
                    <span className="text-xs text-muted-foreground">Manage bookings</span>
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity h-11"
              disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
