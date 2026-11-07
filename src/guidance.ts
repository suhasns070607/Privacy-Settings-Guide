import type { GuidanceItem } from './types';

export const guidanceItems: GuidanceItem[] = [
  {
    id: 'google-privacy-checkup',
    label: 'Run Google Privacy Checkup',
    service: 'Google',
    category: 'Accounts',
    href: 'https://myaccount.google.com/privacycheckup',
  },
  {
    id: 'microsoft-privacy-dashboard',
    label: 'Review the Microsoft privacy dashboard',
    service: 'Microsoft',
    category: 'Accounts',
    href: 'https://account.microsoft.com/privacy',
  },
  {
    id: 'apple-data-privacy',
    label: 'Review Apple Data & Privacy',
    service: 'Apple',
    category: 'Accounts',
    href: 'https://privacy.apple.com',
  },
  {
    id: 'facebook-privacy-checkup',
    label: 'Run Facebook Privacy Checkup',
    service: 'Facebook',
    category: 'Social media',
    href: 'https://www.facebook.com/privacy/checkup',
  },
  {
    id: 'linkedin-data-privacy',
    label: 'Review LinkedIn data privacy settings',
    service: 'LinkedIn',
    category: 'Social media',
    href: 'https://www.linkedin.com/psettings/data-privacy',
  },
  {
    id: 'firefox-enhanced-tracking',
    label: 'Check Enhanced Tracking Protection',
    service: 'Firefox',
    category: 'Browsers',
    href: 'https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop',
  },
  {
    id: 'chrome-privacy-settings',
    label: 'Review Chrome Privacy & Security settings',
    service: 'Chrome',
    category: 'Browsers',
    href: 'https://myaccount.google.com/data-and-privacy',
  },
  {
    id: 'twitter-data-settings',
    label: 'Review X (Twitter) data settings',
    service: 'X / Twitter',
    category: 'Social media',
    href: 'https://twitter.com/settings/account/personalization',
  },
  {
    id: 'instagram-data-download',
    label: 'Request Instagram data download',
    service: 'Instagram',
    category: 'Social media',
    href: 'https://www.instagram.com/download/request/',
  },
  {
    id: 'amazon-privacy',
    label: 'Review Amazon privacy & browsing history',
    service: 'Amazon',
    category: 'Shopping',
    href: 'https://www.amazon.com/privacy',
  },
];
