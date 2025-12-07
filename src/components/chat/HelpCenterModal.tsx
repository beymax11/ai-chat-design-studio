import { useState, useEffect } from 'react';
import { HelpCircle, Mail, MessageCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface HelpCenterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSection?: Section;
}

type Section = 'help' | 'contact';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: 'How do I get started?',
    answer: 'Getting started is easy! Simply sign up for a free account, and you can immediately start chatting with our AI assistant. You can create projects, save conversations, and explore all the features available in your plan.',
  },
  {
    question: 'What AI models are available?',
    answer: 'We offer access to multiple AI models including GPT-4, Claude, and other leading models. Pro and Enterprise users have access to all models, while Free users have access to basic models.',
  },
  {
    question: 'How do I upgrade my plan?',
    answer: 'You can upgrade your plan at any time by clicking on the "Upgrade Plan" option in your settings. Choose between Pro or Enterprise plans based on your needs. All upgrades are instant and you can cancel anytime.',
  },
  {
    question: 'Can I export my conversations?',
    answer: 'Yes! Pro and Enterprise users can export their conversations in various formats including JSON, CSV, and plain text. This feature is available in the conversation settings menu.',
  },
  {
    question: 'How secure is my data?',
    answer: 'We take data security seriously. All your conversations and data are encrypted both in transit and at rest. We follow industry-standard security practices and comply with GDPR and other privacy regulations.',
  },
  {
    question: 'What happens if I exceed my message limit?',
    answer: 'If you exceed your monthly message limit, you can either upgrade to a higher plan or wait until your limit resets at the beginning of the next billing cycle. We\'ll notify you when you\'re approaching your limit.',
  },
  {
    question: 'Can I use the API?',
    answer: 'Yes! Pro and Enterprise users have access to our API. You can find API documentation and keys in your account settings. Enterprise users also get custom integration support.',
  },
  {
    question: 'How do I delete my account?',
    answer: 'You can delete your account at any time by going to Settings > Account > Delete Account. Please note that this action is permanent and all your data will be deleted. We recommend exporting your data first if needed.',
  },
];

export const HelpCenterModal = ({ open, onOpenChange, initialSection = 'help' }: HelpCenterModalProps) => {
  const [activeSection, setActiveSection] = useState<Section>(initialSection);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  // Update active section when initialSection prop changes
  useEffect(() => {
    if (open && initialSection) {
      setActiveSection(initialSection);
    }
  }, [open, initialSection]);

  const sections = [
    { id: 'help' as Section, name: 'Help Center', icon: HelpCircle },
    { id: 'contact' as Section, name: 'Contact Us', icon: Mail },
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'help':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">
                Find answers to common questions about our service
              </p>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-semibold">{faq.question}</span>
                    <ChevronRight
                      className={cn(
                        'w-5 h-5 text-muted-foreground transition-transform',
                        expandedFAQ === index && 'rotate-90'
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {expandedFAQ === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 pt-0 text-muted-foreground border-t">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Contact Us</h2>
              <p className="text-muted-foreground">
                We're here to help! Get in touch with our support team
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-6 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Email Support</h3>
                    <p className="text-sm text-muted-foreground">Get help via email</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Send us an email at{' '}
                  <a href="mailto:support@example.com" className="text-primary hover:underline">
                    support@example.com
                  </a>
                  . We typically respond within 24 hours.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="border rounded-lg p-6 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Live Chat</h3>
                    <p className="text-sm text-muted-foreground">Chat with our team</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Available for Pro and Enterprise users. Look for the chat icon in the bottom right corner of your screen.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="border rounded-lg p-6 space-y-4 md:col-span-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <HelpCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Help Center</h3>
                    <p className="text-sm text-muted-foreground">Browse our knowledge base</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Check out our FAQ section above for answers to common questions. You can also search our knowledge base for detailed guides and tutorials.
                </p>
              </motion.div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[100vw] w-full h-[100vh] max-h-[100vh] m-0 p-8 rounded-none sm:rounded-none left-0 top-0 translate-x-0 translate-y-0 overflow-y-auto">
        <DialogHeader className="mb-8">
          <DialogTitle className="text-3xl font-bold flex items-center gap-2">
            <HelpCircle className="w-7 h-7 text-primary" />
            Help Center
          </DialogTitle>
          <p className="text-muted-foreground mt-2 text-lg">
            Get help and contact our support team
          </p>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="space-y-2 sticky top-8">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <motion.button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-4 rounded-lg text-left transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted/50 hover:bg-muted'
                    )}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{section.name}</span>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

