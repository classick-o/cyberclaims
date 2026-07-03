// Central site data - copy is preserved verbatim from the live site (brief §1: keep copy & URLs).

export const CONTACT = {
  email: 'contact@cyberclaims.net',
  address: 'Kalvermarkt 53, 2511 CB, The Hague, Netherlands.',
  pob: '07373',
  phones: [
    { region: 'NL', number: '+31 70 701 3424' },
    { region: 'UK', number: '+44 20 3100 4660' },
    { region: 'US', number: '+1 209 200 8086' },
    { region: 'CA', number: '+1 416 306 2074' },
    { region: 'AU', number: '+61 2 7255 8500' },
  ],
};

export type Service = {
  title: string;
  href: string;
  blurb: string;
  icon: string; // key into IconMap
  accent: string; // per-page accent (derivative of purple - no new primaries)
};

// All 10 services + URL Checker. URLs mirror the existing site structure.
export const SERVICES: Service[] = [
  {
    title: 'Cryptocurrency Recovery',
    href: '/cryptocurrency-recovery/',
    blurb:
      'Using crypto currencies for transactions doesn’t guarantee complete immunity from online scammers and fraud.',
    icon: 'recovery',
    accent: '#8b5bbd',
  },
  {
    title: 'Crypto Currency Tracing',
    href: '/cryptocurrency-tracing/',
    blurb:
      'Assistance to victims of scams to trace cryptocurrencies sent to fraudulent entities, to identify cashout points.',
    icon: 'tracing',
    accent: '#a880d1',
  },
  {
    title: 'Website Forensics',
    href: '/website-forensics/',
    blurb:
      'Uncover scam networks, digital forensics related to fraud or brand infringements.',
    icon: 'forensics',
    accent: '#7a4fb0',
  },
  {
    title: 'Brand Protection',
    href: '/brand-protection/',
    blurb:
      'We all know that cyber attacks can be frustrating, leaving your intellectual property and trade secrets exposed.',
    icon: 'shield',
    accent: '#9c71f3',
  },
  {
    title: 'Website Takedown',
    href: '/website-takedown/',
    blurb:
      'With increased advancement in the digital space, there’s no doubt about the insurmountable benefits and risks.',
    icon: 'takedown',
    accent: '#6b3fa0',
  },
  {
    title: 'Dispute Resolution Support',
    href: '/dispute-resolution-support/',
    blurb:
      'Dispute resolution support includes all the processes geared towards addressing disputes.',
    icon: 'dispute',
    accent: '#8b5bbd',
  },
  {
    title: 'Consultancy & Documentation Support',
    href: '/consultancy-documentation-support/',
    blurb:
      'Employing the services of a consultant firm without proper documentation support is a costly mistake.',
    icon: 'consultancy',
    accent: '#a880d1',
  },
  {
    title: 'Due Diligence Investigations',
    href: '/due-diligence-investigations/',
    blurb:
      'Many people prefer to acquire or partner with an already established business - verify before you commit.',
    icon: 'diligence',
    accent: '#7a4fb0',
  },
  {
    title: 'Social Media Investigation',
    href: '/social-media-investigation/',
    blurb:
      'Track, analyse and document social-media activity tied to fraud, impersonation and brand abuse.',
    icon: 'social',
    accent: '#9c71f3',
  },
  {
    title: 'Business Services',
    href: '/business-services/',
    blurb:
      'The business industry remains one of the most competitive industries in our modern world.',
    icon: 'business',
    accent: '#6b3fa0',
  },
];

export const URL_CHECKER = { title: 'URL Checker', href: '/url-checker/', icon: 'url' };

// Homepage stats - brief §4 wants animated counters (cases resolved, funds traced, countries).
// NOTE: values below are PLACEHOLDERS pending real figures from TBS/Julia.
// The live site currently shows "0" which harms credibility - do not ship these unverified.
export const STATS = [
  { value: 2400, suffix: '+', label: 'Cases Reviewed' },
  { value: 90000, prefix: '€', label: 'Recovered (single case)' },
  { value: 120, suffix: '+', label: 'Countries Served' },
  { value: 350, suffix: '+', label: 'Press Features' },
];

// Sustainability metrics - preserved from the live site ("We prioritise Sustainability").
// NOTE: live site shows 0 / 0 / 0 - placeholders below await real figures from TBS.
export const SUSTAINABILITY = [
  { value: 1200, suffix: '+', label: 'Trees Planted', icon: 'tracing' },
  { value: 18500, suffix: ' kg', label: 'CO₂ Compensated', icon: 'globe' },
  { value: 900, suffix: '+', label: 'Happy Customers', icon: 'check' },
];

// Partner / "Industry Allies" logos. Placeholder slots - client to supply real logos.
export const PARTNERS = [
  'Ally One',
  'Ally Two',
  'Ally Three',
  'Ally Four',
  'Ally Five',
  'Ally Six',
];

export type Testimonial = { quote: string; name: string };

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'I recommend these guys, very easy communication and a professional approach. I want to thank the Cyber claims support team, which responded to all my questions and their answers were really quick! I appreciate their help',
    name: 'Franziska Unger',
  },
  {
    quote:
      "It's was a great experience to talk with the representative of Cyberclaims. He explains everything very clearly and inform me about the whole scenario what will happen and what will I get in response. I really appreciate the behavior and professionalism the way he talk.",
    name: 'KHURRAM',
  },
  {
    quote:
      'When our website fell victim to a cyberattack, they quickly took control of the situation. Their expertise in website forensics helped us not only recover our data but also strengthen our defence against future attacks. Their service exceeded our expectations.',
    name: 'Elizabeth Morris',
  },
  {
    quote:
      'Helpful and polite, I got a free consultation that already helped me to understand my situation. I believe my money has been held frozen due to KYC issues, but it turned out to be a scam... Now we are working together on fixing it.',
    name: 'Renna D. Greer',
  },
  {
    quote:
      'They helped us recover our lost cryptocurrencies after a fraudulent attack. Their team demonstrated a high level of knowledge and skill in investigating cryptocurrency crimes. We received detailed information and support, which was key to our successful recovery.',
    name: 'Alexander Skinner',
  },
  {
    quote:
      'I love these guys, they were helpful and nice to me throughout the process! We spend 3 month together tracing and recovering my money AND ACHIVED SUCCESS! Regulators ruled in my favour and made the bank reverse the charges! Thank you endlessly. You are the best!',
    name: 'Eve Hart',
  },
  {
    quote:
      'Had an excellent experience with Darren from Cyberclaims. Really went above and beyond to help me collect all the necessary evidence I needed for my case. They delivered the tracing report in 2 weeks. Absolute professionals from start to finish.',
    name: 'Hicham Abou Jaoude',
  },
  {
    quote:
      'They have become our partners in our fight against cybercrime. Helping in the protection of our brand from cyber-attacks and counterfeiting was impressive. We experienced a significant boost in the protection of our intellectual property.',
    name: 'Alex Dunn',
  },
];

export type BlogCard = {
  date: string;
  author: string;
  title: string;
  href: string;
  category: string;
};

export const LATEST_BLOGS: BlogCard[] = [
  {
    date: 'July 2, 2026',
    author: 'ContentTeam',
    title: 'Is Coinbase Wallet Safe? A 2026 Security Review',
    href: '/news/is-coinbase-wallet-safe-a-2026-security-review/',
    category: 'Regulation',
  },
  {
    date: 'March 23, 2026',
    author: 'ContentTeam',
    title: 'Is Profit Storm Legit or a Scam? What Users Should Know',
    href: '/news/is-profit-storm-legit-or-a-scam/',
    category: 'Crypto Scams',
  },
  {
    date: 'March 23, 2026',
    author: 'ContentTeam',
    title: 'X Bitcoin Capex Club Review: What Users Are Asking and What to Watch Out For',
    href: '/news/x-bitcoin-capex-club-review/',
    category: 'Crypto Scams',
  },
];

// A representative slice of the "over 350 news sites" press wall.
export const PRESS = [
  'The Chronicle Journal',
  'Minyanville',
  'My Mother Lode',
  'Financial Content',
  'The Punxsutawney Spirit',
  'The Pilot News',
  'The Saline Courier',
  'KTTC',
  'MarketMinute',
  'The Evening Leader',
  'SM Daily Press',
  'Big Spring Herald',
];
