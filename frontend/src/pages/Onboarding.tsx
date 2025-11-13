/**
 * Onboarding Flow
 * 3-step wizard to collect user profile information
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Users, ChefHat, MapPin, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface ProfileData {
  household_size: number;
  location_city: string;
  language_preference: string;
  dietary_preferences: {
    vegetarian: boolean;
    vegan: boolean;
    diabetic: boolean;
    gluten_free: boolean;
  };
  region: string;
}

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>({
    household_size: 4,
    location_city: '',
    language_preference: 'en',
    dietary_preferences: {
      vegetarian: false,
      vegan: false,
      diabetic: false,
      gluten_free: false,
    },
    region: 'all',
  });

  // Mutation to save profile
  const saveProfileMutation = useMutation({
    mutationFn: async (data: ProfileData) => {
      const response = await api.post('/api/users/profile', data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Profile Created!',
        description: 'Welcome to Kleio.ai. Let\'s get started!',
      });
      navigate('/app');
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Save Profile',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Final step - save profile
      saveProfileMutation.mutate(profileData);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const progress = (step / 3) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center gradient-auth texture-overlay bg-gradient-orbs p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <img 
            src="/logo.png" 
            alt="Kleio.ai Logo" 
            className="w-16 h-16 object-contain"
          />
          <span className="text-2xl font-bold text-primary">Kleio.ai</span>
        </div>

        <Card>
          <CardHeader>
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Step {step} of 3</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Household Size */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Tell us about your household</CardTitle>
                    <CardDescription>How many people live in your home?</CardDescription>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="household-size">Household Size</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setProfileData({ ...profileData, household_size: Math.max(1, profileData.household_size - 1) })}
                    >
                      -
                    </Button>
                    <Input
                      id="household-size"
                      type="number"
                      min="1"
                      max="20"
                      className="text-center text-2xl font-bold"
                      value={profileData.household_size}
                      onChange={(e) => setProfileData({ ...profileData, household_size: parseInt(e.target.value) || 1 })}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setProfileData({ ...profileData, household_size: Math.min(20, profileData.household_size + 1) })}
                    >
                      +
                    </Button>
                  </div>

                  <div className="space-y-3 pt-4">
                    <Label>Region</Label>
                    <RadioGroup
                      value={profileData.region}
                      onValueChange={(value) => setProfileData({ ...profileData, region: value })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="north" id="north" />
                        <Label htmlFor="north" className="cursor-pointer">North India</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="south" id="south" />
                        <Label htmlFor="south" className="cursor-pointer">South India</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="east" id="east" />
                        <Label htmlFor="east" className="cursor-pointer">East India</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="west" id="west" />
                        <Label htmlFor="west" className="cursor-pointer">West India</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all" />
                        <Label htmlFor="all" className="cursor-pointer">All regions</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Dietary Preferences */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <ChefHat className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Dietary Preferences</CardTitle>
                    <CardDescription>Select any dietary restrictions (optional)</CardDescription>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'vegetarian', label: 'Vegetarian', description: 'No meat or eggs' },
                    { key: 'vegan', label: 'Vegan', description: 'No animal products' },
                    { key: 'diabetic', label: 'Diabetic-friendly', description: 'Low sugar recipes' },
                    { key: 'gluten_free', label: 'Gluten-free', description: 'No wheat products' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <Checkbox
                        id={item.key}
                        checked={profileData.dietary_preferences[item.key as keyof typeof profileData.dietary_preferences]}
                        onCheckedChange={(checked) =>
                          setProfileData({
                            ...profileData,
                            dietary_preferences: {
                              ...profileData.dietary_preferences,
                              [item.key]: checked,
                            },
                          })
                        }
                      />
                      <div className="space-y-1 flex-1">
                        <Label htmlFor={item.key} className="cursor-pointer font-medium">{item.label}</Label>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Location & Language */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Final Details</CardTitle>
                    <CardDescription>Help us personalize your experience</CardDescription>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City (Optional)</Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="e.g., Chennai, Mumbai, Delhi"
                      value={profileData.location_city}
                      onChange={(e) => setProfileData({ ...profileData, location_city: e.target.value })}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Preferred Language</Label>
                    <RadioGroup
                      value={profileData.language_preference}
                      onValueChange={(value) => setProfileData({ ...profileData, language_preference: value })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="en" id="en" />
                        <Label htmlFor="en" className="cursor-pointer">English</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hi" id="hi" />
                        <Label htmlFor="hi" className="cursor-pointer">हिंदी (Hindi)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ta" id="ta" />
                        <Label htmlFor="ta" className="cursor-pointer">தமிழ் (Tamil)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={step === 1 || saveProfileMutation.isPending}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <Button
                type="button"
                onClick={handleNext}
                disabled={saveProfileMutation.isPending}
              >
                {saveProfileMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : step === 3 ? (
                  'Complete Setup'
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;

