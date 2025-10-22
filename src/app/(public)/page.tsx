'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAccessRequestSchema, type CreateAccessRequest } from '@/lib/validations/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FadeIn, ScaleIn } from '@/components/motion/FadeIn';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Loader2, CheckCircle, Mail, Building, User, Phone, FileText } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

export default function AccessRequestPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [applications, setApplications] = useState([
    { id: '1', name: 'VR Training Simulator' },
    { id: '2', name: 'AR Design Studio' },
    { id: '3', name: 'Metaverse Conference Room' },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateAccessRequest>({
    resolver: zodResolver(createAccessRequestSchema),
  });

  const onSubmit = async (data: CreateAccessRequest) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/access-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast.success('Access request submitted successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to submit request');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 flex items-center justify-center p-4">
        <ScaleIn>
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center animate-pulse-glow">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Request Submitted!</h2>
                  <p className="text-muted-foreground mt-2">
                    Thank you for your interest in MetaVR. We'll review your request and get back to you within 4 hours.
                  </p>
                </div>
                <Button 
                  onClick={() => setIsSubmitted(false)}
                  variant="vr-primary"
                  className="w-full"
                >
                  Submit Another Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </ScaleIn>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 dark:from-primary/10 dark:via-accent/10 dark:to-secondary/10 dark-mode-transition">
      {/* Header */}
      <header className="border-b bg-background/80 dark:bg-background/90 backdrop-blur-sm dark-mode-transition">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src="/MetaVrLogo.png"
              alt="MetaVR Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-xl font-bold text-foreground">MetaVR</h1>
              <p className="text-sm text-muted-foreground">Management Platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Badge variant="secondary" className="bg-accent/10 text-accent">
              Request Access
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center space-y-6 mb-12">
          <h2 className="text-4xl font-bold text-foreground">
            Unlock the Power of{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              VR & AR
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Request access to our cutting-edge VR and AR applications. Experience the future of immersive technology.
          </p>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-xl bg-background/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Request Access</CardTitle>
              <CardDescription>
                Fill out the form below to request access to our VR/AR applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        variant="vr-glow"
                        {...register('fullName')}
                        placeholder="John Doe"
                        className={errors.fullName ? 'border-error' : ''}
                      />
                      {errors.fullName && (
                        <p className="text-sm text-error">{errors.fullName.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        variant="vr-glow"
                        {...register('email')}
                        placeholder="john@company.com"
                        className={errors.email ? 'border-error' : ''}
                      />
                      {errors.email && (
                        <p className="text-sm text-error">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        {...register('phone')}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title *</Label>
                      <Input
                        id="jobTitle"
                        {...register('jobTitle')}
                        placeholder="Software Engineer"
                        className={errors.jobTitle ? 'border-error' : ''}
                      />
                      {errors.jobTitle && (
                        <p className="text-sm text-error">{errors.jobTitle.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Company Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Building className="w-5 h-5 text-secondary" />
                    Company Information
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name *</Label>
                    <Input
                      id="company"
                      {...register('company')}
                      placeholder="Acme Corporation"
                      className={errors.company ? 'border-error' : ''}
                    />
                    {errors.company && (
                      <p className="text-sm text-error">{errors.company.message}</p>
                    )}
                  </div>
                </div>

                {/* Application Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Mail className="w-5 h-5 text-accent" />
                    Application Interest
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="applicationId">Application of Interest *</Label>
                    <Select onValueChange={(value) => setValue('applicationId', value)}>
                      <SelectTrigger className={errors.applicationId ? 'border-error' : ''}>
                        <SelectValue placeholder="Select an application" />
                      </SelectTrigger>
                      <SelectContent>
                        {applications.map((app) => (
                          <SelectItem key={app.id} value={app.id}>
                            {app.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.applicationId && (
                      <p className="text-sm text-error">{errors.applicationId.message}</p>
                    )}
                  </div>
                </div>

                {/* Use Case */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Use Case
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="useCase">Describe your use case *</Label>
                    <Textarea
                      id="useCase"
                      {...register('useCase')}
                      placeholder="Please describe how you plan to use our VR/AR applications..."
                      rows={4}
                      className={errors.useCase ? 'border-error' : ''}
                    />
                    {errors.useCase && (
                      <p className="text-sm text-error">{errors.useCase.message}</p>
                    )}
                  </div>
                </div>

                {/* Terms Acceptance */}
                <div className="flex items-start space-x-2">
                  <Checkbox id="terms" required />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground">
                    I agree to the{' '}
                    <a href="#" className="text-primary hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </Label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="vr-primary"
                  className="w-full"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    'Submit Access Request'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2025 MetaVR. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
