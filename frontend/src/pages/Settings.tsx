import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, User, Bot, LogOut, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('telegram');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-subtle texture-overlay">
      <header className="border-b border-border/40 sticky top-0 bg-background/95 backdrop-blur-md z-10 shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/app')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-[250px_1fr] gap-8">
          <nav className="flex flex-col gap-2">
            <Button
              variant={activeSection === 'profile' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveSection('profile')}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button
              variant={activeSection === 'telegram' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveSection('telegram')}
            >
              <Bot className="w-4 h-4 mr-2" />
              Telegram
            </Button>
            <Button
              variant={activeSection === 'account' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveSection('account')}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Account
            </Button>
          </nav>

          <div>
            {activeSection === 'profile' && <ProfileSection />}
            {activeSection === 'telegram' && <TelegramSection />}
            {activeSection === 'account' && <AccountSection />}
          </div>
        </div>
      </main>
    </div>
  );
};

const ProfileSection = () => {
  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await api.get('/api/users/profile');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>This information helps personalize your experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return <Card><CardHeader><CardTitle>Error</CardTitle></CardHeader><CardContent><p>Could not load profile: {error.message}</p></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <CardDescription>This information helps personalize your experience.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Household Size</span>
          <span className="font-medium">{user?.household_size} people</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Language</span>
          <span className="font-medium">{user?.language_preference}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Region</span>
          <span className="font-medium">{user?.region}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Dietary Preferences</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {user?.dietary_preferences && Object.keys(user.dietary_preferences).length > 0 ? (
              Object.entries(user.dietary_preferences).map(([pref, enabled]) => (
                enabled && <Badge key={pref} variant="secondary">{pref.replace(/_/g, ' ')}</Badge>
              ))
            ) : (
              <p className="text-sm">No preferences set.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TelegramSection = () => {
  const [code, setCode] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading: isLoadingProfile, isError, error } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await api.get('/api/users/profile');
      return response.data;
    },
  });

  const handleConnect = async () => {
    if (code.length !== 6) {
      toast({ title: 'Invalid Code', description: 'Please enter the 6-character code.', variant: 'destructive' });
      return;
    }
    setIsConnecting(true);
    try {
      await api.post('/api/users/verify-telegram', { verification_code: code });
      toast({ title: 'Account Connected!', description: 'Your Telegram account has been successfully linked.' });
      setCode('');
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    } catch (error: any) {
      toast({ title: 'Connection Failed', description: error.response?.data?.detail || 'Please try again.', variant: 'destructive' });
    }
    setIsConnecting(false);
  };

  if (isLoadingProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bot /> Connect to Telegram</CardTitle>
          <CardDescription>Checking connection status...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return <Card><CardHeader><CardTitle>Error</CardTitle></CardHeader><CardContent><p>Could not check Telegram status: {error.message}</p></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Bot /> Connect to Telegram</CardTitle>
        <CardDescription>Link your account to manage your inventory via the Kleio.ai Telegram bot.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {user?.telegram_id ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-lg text-center">
              <h3 className="font-semibold text-green-800 dark:text-green-200">Account Connected</h3>
              <p className="text-sm text-green-700 dark:text-green-300">Your account is linked to Telegram ID: {user.telegram_id}</p>
            </div>
            <Button variant="outline" disabled>Disconnect (Coming Soon)</Button>
          </div>
        ) : (
          <>
            <div>
              <h4 className="font-semibold mb-2">How to Connect:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Open Telegram and search for the <span className="font-semibold text-primary">@KleioAI_bot</span>.</li>
                <li>Send the <code>/start</code> command to the bot.</li>
                <li>The bot will reply with a unique 6-character verification code.</li>
                <li>Enter the code below and click connect.</li>
              </ol>
            </div>
            <div className="space-y-2">
              <Input
                placeholder="XXXXXX"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-lg tracking-[.2em] font-mono"
              />
              <Button onClick={handleConnect} disabled={isConnecting} className="w-full">
                {isConnecting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...</> : 'Connect Account'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const AccountSection = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
      navigate('/');
    } catch (error) {
      toast({ title: 'Sign Out Failed', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Actions</CardTitle>
        <CardDescription>Manage your account and session.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" onClick={handleSignOut}>Sign Out</Button>
      </CardContent>
    </Card>
  );
};

export default SettingsPage;