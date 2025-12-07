import { useState, useEffect } from 'react';
import { FileText, Shield, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface TermsAndPoliciesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSection?: 'terms' | 'privacy';
}

type Section = 'terms' | 'privacy';

const termsContent = `
TERMS OF SERVICE

Last Updated: ${new Date().toLocaleDateString()}

1. ACCEPTANCE OF TERMS
By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement.

2. USE LICENSE
Permission is granted to temporarily use this service for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
- Modify or copy the materials
- Use the materials for any commercial purpose or for any public display
- Attempt to reverse engineer any software contained in the service
- Remove any copyright or other proprietary notations from the materials

3. USER ACCOUNTS
You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.

4. PROHIBITED USES
You may not use our service:
- In any way that violates any applicable national or international law or regulation
- To transmit, or procure the sending of, any advertising or promotional material
- To impersonate or attempt to impersonate the company, employees, or other users
- In any way that infringes upon the rights of others

5. SUBSCRIPTION AND PAYMENT
- Subscription fees are billed in advance on a monthly or annual basis
- All fees are non-refundable except as required by law
- We reserve the right to change our pricing with 30 days notice
- You may cancel your subscription at any time

6. INTELLECTUAL PROPERTY
The service and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.

7. LIMITATION OF LIABILITY
In no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.

8. TERMINATION
We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.

9. GOVERNING LAW
These Terms shall be interpreted and governed by the laws of the jurisdiction in which we operate, without regard to its conflict of law provisions.

10. CHANGES TO TERMS
We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
`;

const privacyContent = `
PRIVACY POLICY

Last Updated: ${new Date().toLocaleDateString()}

1. INFORMATION WE COLLECT
We collect information that you provide directly to us, including:
- Name and contact information (email address, phone number)
- Account credentials (username, password)
- Payment information (processed securely through third-party providers)
- Content you create (conversations, projects, files)
- Usage data and analytics

2. HOW WE USE YOUR INFORMATION
We use the information we collect to:
- Provide, maintain, and improve our services
- Process transactions and send related information
- Send technical notices, updates, and support messages
- Respond to your comments and questions
- Monitor and analyze trends and usage
- Detect, prevent, and address technical issues

3. INFORMATION SHARING
We do not sell your personal information. We may share your information only:
- With your consent
- To comply with legal obligations
- To protect our rights and safety
- With service providers who assist us in operating our service

4. DATA SECURITY
We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

5. DATA RETENTION
We retain your personal information for as long as necessary to provide our services and fulfill the purposes described in this policy, unless a longer retention period is required by law.

6. YOUR RIGHTS
You have the right to:
- Access your personal information
- Correct inaccurate data
- Request deletion of your data
- Object to processing of your data
- Data portability
- Withdraw consent

7. COOKIES AND TRACKING
We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.

8. THIRD-PARTY SERVICES
Our service may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties.

9. CHILDREN'S PRIVACY
Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.

10. CHANGES TO THIS POLICY
We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
`;

export const TermsAndPoliciesModal = ({ open, onOpenChange, initialSection = 'terms' }: TermsAndPoliciesModalProps) => {
  const [activeSection, setActiveSection] = useState<Section>(initialSection);

  // Update active section when initialSection prop changes
  useEffect(() => {
    if (open && initialSection) {
      setActiveSection(initialSection);
    }
  }, [open, initialSection]);

  const sections = [
    { id: 'terms' as Section, name: 'Terms of Service', icon: FileText },
    { id: 'privacy' as Section, name: 'Privacy Policy', icon: Shield },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'terms':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Terms of Service</h2>
              <p className="text-muted-foreground">
                Please read these terms carefully before using our service
              </p>
            </div>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-muted/30 p-6 rounded-lg overflow-x-auto">
                {termsContent}
              </pre>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Privacy Policy</h2>
              <p className="text-muted-foreground">
                Learn how we collect, use, and protect your information
              </p>
            </div>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-muted/30 p-6 rounded-lg overflow-x-auto">
                {privacyContent}
              </pre>
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
            <FileText className="w-7 h-7 text-primary" />
            Terms & Policies
          </DialogTitle>
          <p className="text-muted-foreground mt-2 text-lg">
            Read our terms of service and privacy policy
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

