import { useState } from 'react';
import { Crown, Check, X, Sparkles, Zap, Shield, Infinity } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface UpgradePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PlanTier = 'free' | 'pro' | 'enterprise';

interface PlanFeature {
  name: string;
  free: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
}

const plans: Record<PlanTier, {
  name: string;
  price: string;
  period: string;
  description: string;
  icon: typeof Crown;
  popular?: boolean;
}> = {
  free: {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    icon: Sparkles,
  },
  pro: {
    name: 'Pro',
    price: '$19',
    period: 'month',
    description: 'For power users and professionals',
    icon: Zap,
    popular: true,
  },
  enterprise: {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For teams and organizations',
    icon: Shield,
  },
};

const features: PlanFeature[] = [
  { name: 'Messages per month', free: '100', pro: '10,000', enterprise: 'Unlimited' },
  { name: 'AI Models', free: 'Basic', pro: 'All Models', enterprise: 'All Models + Custom' },
  { name: 'Response Speed', free: 'Standard', pro: 'Priority', enterprise: 'Ultra Fast' },
  { name: 'Conversation History', free: '30 days', pro: '1 year', enterprise: 'Unlimited' },
  { name: 'Projects', free: '3', pro: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'File Uploads', free: false, pro: true, enterprise: true },
  { name: 'API Access', free: false, pro: true, enterprise: true },
  { name: 'Priority Support', free: false, pro: true, enterprise: true },
  { name: 'Custom Integrations', free: false, pro: false, enterprise: true },
  { name: 'Dedicated Account Manager', free: false, pro: false, enterprise: true },
  { name: 'SLA Guarantee', free: false, pro: false, enterprise: true },
];

export const UpgradePlanModal = ({ open, onOpenChange }: UpgradePlanModalProps) => {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>('pro');

  const handleUpgrade = (plan: PlanTier) => {
    if (plan === 'free') {
      toast({
        title: 'Already on Free Plan',
        description: 'You are currently on the free plan.',
      });
      return;
    }

    if (plan === 'enterprise') {
      toast({
        title: 'Contact Sales',
        description: 'Please contact our sales team for enterprise pricing.',
      });
      // In a real app, you might open a contact form or redirect
      return;
    }

    // Handle upgrade logic here
    toast({
      title: 'Upgrade Initiated',
      description: `Upgrading to ${plans[plan].name} plan...`,
    });
    
    // Simulate upgrade process
    setTimeout(() => {
      toast({
        title: 'Upgrade Successful!',
        description: `Welcome to ${plans[plan].name}! Enjoy your new features.`,
      });
      onOpenChange(false);
    }, 1500);
  };

  const getFeatureValue = (feature: PlanFeature, tier: PlanTier): string | boolean => {
    return feature[tier];
  };

  const renderFeatureValue = (value: string | boolean) => {
    if (value === true) {
      return <Check className="w-4 h-4 text-green-500" />;
    }
    if (value === false) {
      return <X className="w-4 h-4 text-muted-foreground" />;
    }
    return <span className="text-sm">{value}</span>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-w-[95vw] mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Crown className="w-6 h-6 text-primary" />
            Upgrade Your Plan
          </DialogTitle>
          <p className="text-muted-foreground mt-2">
            Choose the perfect plan for your needs. Upgrade anytime, cancel anytime.
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['free', 'pro', 'enterprise'] as PlanTier[]).map((tier) => {
              const plan = plans[tier];
              const Icon = plan.icon;
              const isPopular = plan.popular;
              const isSelected = selectedPlan === tier;

              return (
                <motion.div
                  key={tier}
                  whileHover={{ y: -4 }}
                  className={cn(
                    'relative border rounded-lg p-6 cursor-pointer transition-all',
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-lg'
                      : 'border-border hover:border-primary/50',
                    isPopular && 'ring-2 ring-primary/20'
                  )}
                  onClick={() => setSelectedPlan(tier)}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                      'w-12 h-12 rounded-lg flex items-center justify-center',
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      {plan.period && (
                        <span className="text-sm text-muted-foreground">/{plan.period}</span>
                      )}
                    </div>
                  </div>

                  <Button
                    className={cn(
                      'w-full',
                      isSelected ? 'bg-primary hover:bg-primary/90' : 'bg-secondary hover:bg-secondary/80'
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpgrade(tier);
                    }}
                  >
                    {tier === 'free' ? 'Current Plan' : tier === 'enterprise' ? 'Contact Sales' : 'Upgrade Now'}
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Features Comparison Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted/50 p-4 border-b">
              <h3 className="font-semibold">Feature Comparison</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Feature</th>
                    <th className="text-center p-4 font-semibold">Free</th>
                    <th className="text-center p-4 font-semibold">Pro</th>
                    <th className="text-center p-4 font-semibold">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, index) => (
                    <motion.tr
                      key={feature.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4 font-medium">{feature.name}</td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center">
                          {renderFeatureValue(getFeatureValue(feature, 'free'))}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center">
                          {renderFeatureValue(getFeatureValue(feature, 'pro'))}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center">
                          {renderFeatureValue(getFeatureValue(feature, 'enterprise'))}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold">Secure & Flexible</p>
                <p className="text-sm text-muted-foreground">
                  All plans include secure payment processing. Cancel anytime with no questions asked.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

