
import React, { useState } from 'react';
import CreateAccount from './CreateAccount';
import AddHomeLocation from './AddHomeLocation';
import AddLocations from './AddLocations';
import InvitePartners from './InvitePartners';
import SharingHome from './SharingHome';
import OnboardingComplete from './OnboadingComplete';
import { useTranslation } from 'react-i18next';

export interface NewAccountData {
  id?: string;
  name: string;
  email: string;
  accountName: string;
  accountType: 'family' | 'individual';
  homeLocation: {
    name: string;
    address: string;
  };
  invitedPartnersEmail?: string[];
  additionalLocations?: {
    name: string;
    address: string
    type?: string;
  }[];
  sharedWithFamily?: boolean;
}

function OnboardingFlow() {
  const { t }: { t: (key: string) => string } = useTranslation();

  const [step, setStep] = useState(0);
  const [accountType, setAccountType] = useState<'family' | 'individual'>('family');
  const [formData, setFormData] = useState<NewAccountData>({
    name: '',
    email: '',
    accountName: '',
    accountType: 'family',
    homeLocation: {
      name: 'Home',
      address: ''
    },
    invitedPartnersEmail: [],
    additionalLocations: [],
    sharedWithFamily: false,
  });


  const goNext = () => {
    // דילוג על שלב spouse אם החשבון הוא אישי
    if (step === 2 && accountType === 'individual') {
      setStep(step + 2);
    } else {
      setStep(step + 1);
    }
  };

  const goBack = () => setStep(Math.max(0, step - 1));

  const steps = [
    <CreateAccount
      onNext={goNext}
      data={formData}
      setData={setFormData}
    />,
    <AddHomeLocation
      onNext={goNext}
      onBack={goBack}
      data={formData}
      setData={setFormData}
    />,
    <AddLocations
      onNext={goNext}
      onBack={goBack}
      data={formData}
      setData={setFormData} />,
    <InvitePartners
      onNext={goNext}
      onBack={goBack}
      data={formData}
      setData={setFormData} />,
    <SharingHome
      onNext={goNext}
      onBack={goBack}
      data={formData}
      setData={setFormData} />,
    <OnboardingComplete
      data={formData} />,
  ];

  return (
    <div>
      {steps[step]}

    </div>
  );
}

export default OnboardingFlow;
