import { useState, useEffect } from 'react';
import { X, Settings, Bell, Clock, Network, Database, Shield, Users, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTheme } from 'next-themes';
import { useAccentColor } from '@/contexts/AccentColorContext';
import { useTranslation, SUPPORTED_LANGUAGES } from '@/contexts/TranslationContext';
import { Play } from 'lucide-react';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SettingsSection = 'general' | 'notifications' | 'personalization' | 'apps' | 'data' | 'security' | 'parental' | 'account';

export const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const { theme, setTheme } = useTheme();
  const { accentColor, setAccentColor } = useAccentColor();
  const { targetLanguage, setTargetLanguage } = useTranslation();
  const [appearance, setAppearance] = useState(theme || 'light');
  const [language, setLanguage] = useState(targetLanguage);
  const [spokenLanguage, setSpokenLanguage] = useState('auto-detect');
  const [voice, setVoice] = useState('breeze');

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

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    setTargetLanguage(value as typeof targetLanguage);
  };

  const settingsSections = [
    { id: 'general' as SettingsSection, label: 'General', icon: Settings },
    { id: 'notifications' as SettingsSection, label: 'Notifications', icon: Bell },
    { id: 'personalization' as SettingsSection, label: 'Personalization', icon: Clock },
    { id: 'apps' as SettingsSection, label: 'Apps & Connectors', icon: Network },
    { id: 'data' as SettingsSection, label: 'Data controls', icon: Database },
    { id: 'security' as SettingsSection, label: 'Security', icon: Shield },
    { id: 'parental' as SettingsSection, label: 'Parental controls', icon: Users },
    { id: 'account' as SettingsSection, label: 'Account', icon: User },
  ];

  const handleAppearanceChange = (value: string) => {
    setAppearance(value);
    setTheme(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] max-h-[90vh] p-0 flex flex-col sm:flex-row [&>button]:hidden max-w-[95vw]">
        {/* Sidebar Navigation */}
        <div className="w-full sm:w-64 border-b sm:border-b-0 sm:border-r border-border flex flex-row sm:flex-col overflow-x-auto sm:overflow-x-visible">
          <div className="p-3 sm:p-4 border-b sm:border-b-0 sm:border-r border-border flex items-center justify-between sm:flex-col sm:justify-start min-w-0 sm:min-w-[256px]">
            <div className="flex items-center justify-between w-full sm:w-auto mb-0 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold">Settings</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 sm:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-x-auto sm:overflow-x-visible sm:overflow-y-auto p-2 flex flex-row sm:flex-col gap-1 sm:gap-0">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm
                      transition-colors mb-0 sm:mb-1 whitespace-nowrap shrink-0
                      ${
                        activeSection === section.id
                          ? 'bg-accent text-foreground'
                          : 'text-muted-foreground hover:bg-accent/50'
                      }
                    `}
                  >
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {activeSection === 'general' && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">General</h3>
                
                <div className="space-y-3 sm:space-y-4">
                  {/* Appearance */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Appearance</label>
                    <Select value={appearance} onValueChange={handleAppearanceChange}>
                      <SelectTrigger className="w-full">
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Accent color</label>
                    <Select value={accentColor} onValueChange={(value) => setAccentColor(value as typeof accentColor)}>
                      <SelectTrigger className="w-full">
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Translation Language</label>
                    <Select value={language} onValueChange={handleLanguageChange}>
                      <SelectTrigger className="w-full">
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
                      Select the target language for message translations. Use the translate button on messages to translate them.
                    </p>
                  </div>

                  {/* Spoken language */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Spoken language</label>
                    <Select value={spokenLanguage} onValueChange={setSpokenLanguage}>
                      <SelectTrigger className="w-full">
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Voice</label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10"
                        onClick={() => {
                          // Handle voice preview
                        }}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Select value={voice} onValueChange={setVoice} className="flex-1">
                        <SelectTrigger>
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
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Notifications</h3>
                <p className="text-muted-foreground text-sm sm:text-base">Notification settings coming soon...</p>
              </div>
            )}

            {activeSection === 'personalization' && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Personalization</h3>
                <p className="text-muted-foreground text-sm sm:text-base">Personalization settings coming soon...</p>
              </div>
            )}

            {activeSection === 'apps' && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Apps & Connectors</h3>
                <p className="text-muted-foreground text-sm sm:text-base">Apps & Connectors settings coming soon...</p>
              </div>
            )}

            {activeSection === 'data' && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Data controls</h3>
                <p className="text-muted-foreground text-sm sm:text-base">Data controls settings coming soon...</p>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Security</h3>
                <p className="text-muted-foreground text-sm sm:text-base">Security settings coming soon...</p>
              </div>
            )}

            {activeSection === 'parental' && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Parental controls</h3>
                <p className="text-muted-foreground text-sm sm:text-base">Parental controls settings coming soon...</p>
              </div>
            )}

            {activeSection === 'account' && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Account</h3>
                <p className="text-muted-foreground text-sm sm:text-base">Account settings coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

