import { useState, useEffect } from 'react';
import { X, Settings, Bell, Shield, User, Eye, EyeOff, LogOut, Mail, UserCircle, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from 'next-themes';
import { useAccentColor } from '@/contexts/AccentColorContext';
import { useTranslation, SUPPORTED_LANGUAGES, type LanguageCode } from '@/contexts/TranslationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SettingsSection = 'general' | 'notifications' | 'security' | 'account';

export const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const { theme, setTheme } = useTheme();
  const { accentColor, setAccentColor } = useAccentColor();
  const { targetLanguage, setTargetLanguage } = useTranslation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [appearance, setAppearance] = useState(theme || 'light');
  const [language, setLanguage] = useState<LanguageCode>(targetLanguage);
  const [spokenLanguage, setSpokenLanguage] = useState('auto-detect');
  const [voice, setVoice] = useState('breeze');

  // Account section state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Notification settings state
  const [browserNotifications, setBrowserNotifications] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('notifications-browser') === 'true';
    }
    return false;
  });
  const [soundNotifications, setSoundNotifications] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('notifications-sound') !== 'false';
    }
    return true;
  });
  const [emailNotifications, setEmailNotifications] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('notifications-email') === 'true';
    }
    return false;
  });
  const [doNotDisturb, setDoNotDisturb] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('notifications-dnd') === 'true';
    }
    return false;
  });
  const [notificationFrequency, setNotificationFrequency] = useState<'realtime' | 'digest' | 'off'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('notifications-frequency') as 'realtime' | 'digest' | 'off') || 'realtime';
    }
    return 'realtime';
  });

  // Sync appearance with theme
  useEffect(() => {
    if (theme) {
      setAppearance(theme);
    }
  }, [theme]);

  // Sync language with translation context
  useEffect(() => {
    setLanguage(targetLanguage);
  }, [targetLanguage]);

  // Load user profile data
  useEffect(() => {
    if (user && activeSection === 'account') {
      loadProfile();
    }
  }, [user, activeSection]);

  const loadProfile = async () => {
    if (!user) return;
    
    setLoadingProfile(true);
    try {
      // Get user email from auth
      setEmail(user.email || '');

      // Get profile data from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      setFullName(data?.full_name || user.user_metadata?.full_name || '');
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Error loading profile',
        description: error.message || 'Failed to load profile data',
        variant: 'destructive',
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setUpdatingProfile(true);
    try {
      // Update profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          email: user.email,
        }, {
          onConflict: 'id'
        });

      if (profileError) throw profileError;

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
        },
      });

      if (metadataError) throw metadataError;

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error updating profile',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both password fields match.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully.',
      });

      // Clear password fields
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: 'Error changing password',
        description: error.message || 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error signing out',
        description: error.message || 'Failed to sign out',
        variant: 'destructive',
      });
    }
  };

  const handleLanguageChange = (value: string) => {
    const langCode = value as LanguageCode;
    setLanguage(langCode);
    setTargetLanguage(langCode);
  };

  const settingsSections = [
    { id: 'general' as SettingsSection, label: 'General', icon: Settings },
    { id: 'notifications' as SettingsSection, label: 'Notifications', icon: Bell },
    { id: 'security' as SettingsSection, label: 'Security', icon: Shield },
    { id: 'account' as SettingsSection, label: 'Account', icon: User },
  ];

  const handleAppearanceChange = (value: string) => {
    setAppearance(value);
    setTheme(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] max-h-[90vh] p-0 flex flex-col sm:flex-row [&>button]:hidden max-w-[95vw] overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-full sm:w-72 border-b sm:border-b-0 sm:border-r border-border bg-muted/30 flex flex-row sm:flex-col overflow-x-auto sm:overflow-x-visible">
          <div className="p-4 sm:p-6 flex items-center justify-between sm:flex-col sm:justify-start min-w-0 sm:min-w-[288px] sm:h-full">
            <div className="flex items-center justify-between w-full sm:w-auto mb-0 sm:mb-6">
              <DialogHeader className="p-0">
                <DialogTitle className="text-xl sm:text-2xl font-semibold">Settings</DialogTitle>
              </DialogHeader>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 sm:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="flex-1 overflow-x-auto sm:overflow-x-visible sm:overflow-y-auto w-full flex flex-row sm:flex-col gap-1 sm:gap-2">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <motion.button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium",
                      "transition-all duration-200 whitespace-nowrap shrink-0",
                      "w-full sm:w-full justify-start",
                      isActive
                        ? "bg-accent text-accent-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span>{section.label}</span>
                  </motion.button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeSection === 'general' && (
                <motion.div
                  key="general"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 sm:p-8"
                >
                  <div className="max-w-2xl space-y-8">
                    <div>
                      <h3 className="text-2xl font-semibold mb-2">General</h3>
                      <p className="text-sm text-muted-foreground">
                        Customize your app appearance and language preferences
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-6">
                      {/* Appearance */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-semibold">Appearance</label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Choose how the app looks to you
                          </p>
                        </div>
                        <Select value={appearance} onValueChange={handleAppearanceChange}>
                          <SelectTrigger className="w-full h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Accent color */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-semibold">Accent Color</label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Choose your preferred accent color theme
                          </p>
                        </div>
                        <Select value={accentColor} onValueChange={(value) => setAccentColor(value as typeof accentColor)}>
                          <SelectTrigger className="w-full h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="blue">Blue</SelectItem>
                            <SelectItem value="green">Green</SelectItem>
                            <SelectItem value="purple">Purple</SelectItem>
                            <SelectItem value="red">Red</SelectItem>
                            <SelectItem value="orange">Orange</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Language */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-semibold">Translation Language</label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Select the target language for message translations
                          </p>
                        </div>
                        <Select value={language} onValueChange={handleLanguageChange}>
                          <SelectTrigger className="w-full h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SUPPORTED_LANGUAGES.map((lang) => (
                              <SelectItem key={lang.code} value={lang.code}>
                                {lang.nativeName} {lang.code !== 'auto-detect' && `(${lang.name})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Use the translate button on messages to translate them to this language.
                        </p>
                      </div>

                      {/* Spoken language */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-semibold">Spoken Language</label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Select the language you mainly speak for better voice recognition
                          </p>
                        </div>
                        <Select value={spokenLanguage} onValueChange={setSpokenLanguage}>
                          <SelectTrigger className="w-full h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto-detect">Auto-detect</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                            <SelectItem value="it">Italian</SelectItem>
                            <SelectItem value="pt">Portuguese</SelectItem>
                            <SelectItem value="zh">Chinese</SelectItem>
                            <SelectItem value="ja">Japanese</SelectItem>
                            <SelectItem value="ko">Korean</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          For best results, select the language you mainly speak. If it's not listed, it may still be supported via auto-detection.
                        </p>
                      </div>

                      {/* Voice */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-semibold">Voice</label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Choose your preferred voice for text-to-speech
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-11 w-11 shrink-0"
                            onClick={() => {
                              // Handle voice preview
                            }}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <div className="flex-1">
                            <Select value={voice} onValueChange={setVoice}>
                              <SelectTrigger className="w-full h-11">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="breeze">Breeze</SelectItem>
                                <SelectItem value="nova">Nova</SelectItem>
                                <SelectItem value="shimmer">Shimmer</SelectItem>
                                <SelectItem value="echo">Echo</SelectItem>
                                <SelectItem value="fable">Fable</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 sm:p-8"
                >
                  <div className="max-w-2xl space-y-8">
                    <div>
                      <h3 className="text-2xl font-semibold mb-2">Notifications</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage your notification preferences and how you receive updates
                      </p>
                    </div>
                    <Separator />

                    <div className="space-y-6">
                      {/* Browser/Desktop Notifications */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Bell className="h-4 w-4 text-muted-foreground" />
                              <Label htmlFor="browser-notifications" className="text-sm font-semibold cursor-pointer">
                                Browser Notifications
                              </Label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Receive desktop notifications when you receive new messages
                            </p>
                          </div>
                          <Switch
                            id="browser-notifications"
                            checked={browserNotifications}
                            onCheckedChange={(checked) => {
                              setBrowserNotifications(checked);
                              localStorage.setItem('notifications-browser', String(checked));
                              if (checked && 'Notification' in window) {
                                Notification.requestPermission().then((permission) => {
                                  if (permission === 'granted') {
                                    toast({
                                      title: 'Notifications enabled',
                                      description: 'You will receive browser notifications for new messages.',
                                    });
                                  } else {
                                    toast({
                                      title: 'Permission denied',
                                      description: 'Please enable notifications in your browser settings.',
                                      variant: 'destructive',
                                    });
                                    setBrowserNotifications(false);
                                    localStorage.setItem('notifications-browser', 'false');
                                  }
                                });
                              }
                            }}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Sound Notifications */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              {soundNotifications ? (
                                <Volume2 className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <VolumeX className="h-4 w-4 text-muted-foreground" />
                              )}
                              <Label htmlFor="sound-notifications" className="text-sm font-semibold cursor-pointer">
                                Sound Notifications
                              </Label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Play a sound when new messages arrive
                            </p>
                          </div>
                          <Switch
                            id="sound-notifications"
                            checked={soundNotifications}
                            onCheckedChange={(checked) => {
                              setSoundNotifications(checked);
                              localStorage.setItem('notifications-sound', String(checked));
                            }}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Email Notifications */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <Label htmlFor="email-notifications" className="text-sm font-semibold cursor-pointer">
                                Email Notifications
                              </Label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Receive email notifications for important updates (requires account)
                            </p>
                          </div>
                          <Switch
                            id="email-notifications"
                            checked={emailNotifications}
                            disabled={!user}
                            onCheckedChange={(checked) => {
                              setEmailNotifications(checked);
                              localStorage.setItem('notifications-email', String(checked));
                              if (checked && !user) {
                                toast({
                                  title: 'Sign in required',
                                  description: 'Please sign in to enable email notifications.',
                                  variant: 'destructive',
                                });
                              }
                            }}
                          />
                        </div>
                        {!user && (
                          <p className="text-xs text-muted-foreground italic">
                            Sign in to enable email notifications
                          </p>
                        )}
                      </div>

                      <Separator />

                      {/* Notification Frequency */}
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-semibold">Notification Frequency</Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Choose how often you want to receive notifications
                          </p>
                        </div>
                        <Select value={notificationFrequency} onValueChange={(value: 'realtime' | 'digest' | 'off') => {
                          setNotificationFrequency(value);
                          localStorage.setItem('notifications-frequency', value);
                        }}>
                          <SelectTrigger className="w-full h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="realtime">Real-time - Notify immediately</SelectItem>
                            <SelectItem value="digest">Digest - Summary every hour</SelectItem>
                            <SelectItem value="off">Off - No notifications</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      {/* Do Not Disturb */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-muted-foreground" />
                              <Label htmlFor="dnd" className="text-sm font-semibold cursor-pointer">
                                Do Not Disturb
                              </Label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Temporarily disable all notifications
                            </p>
                          </div>
                          <Switch
                            id="dnd"
                            checked={doNotDisturb}
                            onCheckedChange={(checked) => {
                              setDoNotDisturb(checked);
                              localStorage.setItem('notifications-dnd', String(checked));
                              if (checked) {
                                toast({
                                  title: 'Do Not Disturb enabled',
                                  description: 'All notifications are now disabled.',
                                });
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 sm:p-8"
                >
                  <div className="max-w-2xl space-y-8">
                    <div>
                      <h3 className="text-2xl font-semibold mb-2">Security</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage your security and privacy settings
                      </p>
                    </div>
                    <Separator />

                    {!user ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Shield className="h-16 w-16 text-muted-foreground" />
                        <div className="text-center">
                          <p className="text-sm font-medium mb-1">Not signed in</p>
                          <p className="text-xs text-muted-foreground">
                            Please sign in to manage your security settings
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Change Password */}
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-lg font-semibold mb-1">Change Password</h4>
                            <p className="text-xs text-muted-foreground">
                              Update your password to keep your account secure
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="new-password" className="text-sm font-medium">
                                New Password
                              </Label>
                              <div className="relative">
                                <Input
                                  id="new-password"
                                  type={showNewPassword ? 'text' : 'password'}
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  placeholder="Enter new password"
                                  disabled={changingPassword}
                                  className="h-11 pr-10"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  disabled={changingPassword}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                  tabIndex={-1}
                                >
                                  {showNewPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="confirm-password" className="text-sm font-medium">
                                Confirm New Password
                              </Label>
                              <div className="relative">
                                <Input
                                  id="confirm-password"
                                  type={showConfirmPassword ? 'text' : 'password'}
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  placeholder="Confirm new password"
                                  disabled={changingPassword}
                                  className="h-11 pr-10"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  disabled={changingPassword}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                  tabIndex={-1}
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </div>

                            <Button
                              onClick={handleChangePassword}
                              disabled={changingPassword || !newPassword || !confirmPassword}
                              variant="outline"
                              className="w-full sm:w-auto"
                            >
                              {changingPassword ? (
                                <span className="flex items-center gap-2">
                                  <motion.div
                                    className="h-4 w-4 border-2 border-foreground/30 border-t-foreground rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                  />
                                  Changing...
                                </span>
                              ) : (
                                'Change Password'
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeSection === 'account' && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 sm:p-8"
                >
                  <div className="max-w-2xl space-y-8">
                    <div>
                      <h3 className="text-2xl font-semibold mb-2">Account</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage your account information and preferences
                      </p>
                    </div>

                    <Separator />

                    {!user ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <UserCircle className="h-16 w-16 text-muted-foreground" />
                        <div className="text-center">
                          <p className="text-sm font-medium mb-1">Not signed in</p>
                          <p className="text-xs text-muted-foreground">
                            Please sign in to manage your account settings
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {/* Profile Information */}
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-lg font-semibold mb-1">Profile Information</h4>
                            <p className="text-xs text-muted-foreground">
                              Update your personal information
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="full-name" className="text-sm font-medium">
                                Full Name
                              </Label>
                              <Input
                                id="full-name"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter your full name"
                                disabled={loadingProfile || updatingProfile}
                                className="h-11"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="email" className="text-sm font-medium">
                                Email Address
                              </Label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="email"
                                  type="email"
                                  value={email}
                                  disabled
                                  className="h-11 pl-10 bg-muted/50 cursor-not-allowed"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Email cannot be changed from here. Contact support if you need to change your email.
                              </p>
                            </div>

                            <Button
                              onClick={handleUpdateProfile}
                              disabled={loadingProfile || updatingProfile || !fullName.trim()}
                              className="w-full sm:w-auto"
                            >
                              {updatingProfile ? (
                                <span className="flex items-center gap-2">
                                  <motion.div
                                    className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                  />
                                  Updating...
                                </span>
                              ) : (
                                'Update Profile'
                              )}
                            </Button>
                          </div>
                        </div>

                        <Separator />

                        {/* Sign Out */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-lg font-semibold mb-1">Sign Out</h4>
                            <p className="text-xs text-muted-foreground">
                              Sign out of your account on this device
                            </p>
                          </div>

                          <Button
                            onClick={handleSignOut}
                            variant="destructive"
                            className="w-full sm:w-auto"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

