import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

export const Walkthrough: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);

  useEffect(() => {
    // Check if user has seen walkthrough
    const hasSeenWalkthrough = localStorage.getItem('nexus_walkthrough_seen');
    
    if (!hasSeenWalkthrough && user && location.pathname) {
      // Set steps based on current page
      const currentSteps = getStepsForRoute(location.pathname, user.role);
      if (currentSteps.length > 0) {
        setSteps(currentSteps);
        setRun(true);
      }
    }
  }, [user, location.pathname]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as STATUS)) {
      localStorage.setItem('nexus_walkthrough_seen', 'true');
      setRun(false);
    }
  };

  const getStepsForRoute = (path: string, role: string): Step[] => {
    if (path.includes('/dashboard')) {
      return [
        {
          target: 'body',
          content: `Welcome to Nexus! Let's take a quick tour of your ${role === 'entrepreneur' ? 'entrepreneur' : 'investor'} dashboard.`,
          placement: 'center',
        },
        {
          target: '[data-tour="sidebar"]',
          content: 'Use the sidebar to navigate between different sections of the platform.',
          placement: 'right',
        },
        {
          target: '[data-tour="calendar"]',
          content: 'Schedule meetings and manage your availability here.',
          placement: 'top',
        },
        {
          target: '[data-tour="payments"]',
          content: 'Manage your wallet, transactions, and funding deals.',
          placement: 'top',
        },
      ];
    }
    
    if (path.includes('/calendar')) {
      return [
        {
          target: 'body',
          content: 'This is your calendar. You can schedule meetings, set availability, and manage meeting requests.',
          placement: 'center',
        },
      ];
    }
    
    if (path.includes('/payments')) {
      return [
        {
          target: 'body',
          content: 'Manage your wallet balance, make deposits, withdrawals, and fund deals here.',
          placement: 'center',
        },
      ];
    }
    
    return [];
  };

  if (steps.length === 0) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#3B82F6',
        },
      }}
    />
  );
};

