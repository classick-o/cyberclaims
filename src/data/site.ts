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
  blurb: string; // full description (used on service cards)
  short: string; // one-line description (used in the mega-menu)
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
    short: 'Recover assets lost to scams, theft and fraud.',
    icon: 'recovery',
    accent: '#8b5bbd',
  },
  {
    title: 'Crypto Currency Tracing',
    href: '/cryptocurrency-tracing/',
    blurb:
      'Assistance to victims of scams to trace cryptocurrencies sent to fraudulent entities, to identify cashout points.',
    short: 'Trace stolen crypto to its cashout points.',
    icon: 'tracing',
    accent: '#a880d1',
  },
  {
    title: 'Website Forensics',
    href: '/website-forensics/',
    blurb:
      'Uncover scam networks, digital forensics related to fraud or brand infringements.',
    short: 'Uncover scam networks and fraud evidence.',
    icon: 'forensics',
    accent: '#7a4fb0',
  },
  {
    title: 'Brand Protection',
    href: '/brand-protection/',
    blurb:
      'We all know that cyber attacks can be frustrating, leaving your intellectual property and trade secrets exposed.',
    short: 'Shield your IP and brand from attacks.',
    icon: 'shield',
    accent: '#9c71f3',
  },
  {
    title: 'Website Takedown',
    href: '/website-takedown/',
    blurb:
      'With increased advancement in the digital space, there’s no doubt about the insurmountable benefits and risks.',
    short: 'Take down fraudulent, infringing sites.',
    icon: 'takedown',
    accent: '#6b3fa0',
  },
  {
    title: 'Dispute Resolution Support',
    href: '/dispute-resolution-support/',
    blurb:
      'Dispute resolution support includes all the processes geared towards addressing disputes.',
    short: 'Support through the full dispute process.',
    icon: 'dispute',
    accent: '#8b5bbd',
  },
  {
    title: 'Consultancy & Documentation Support',
    href: '/consultancy-documentation-support/',
    blurb:
      'Employing the services of a consultant firm without proper documentation support is a costly mistake.',
    short: 'Expert consultancy, done by the book.',
    icon: 'consultancy',
    accent: '#a880d1',
  },
  {
    title: 'Due Diligence Investigations',
    href: '/due-diligence-investigations/',
    blurb:
      'Many people prefer to acquire or partner with an already established business - verify before you commit.',
    short: 'Verify partners before you commit.',
    icon: 'diligence',
    accent: '#7a4fb0',
  },
  {
    title: 'Social Media Investigation',
    href: '/social-media-investigation/',
    blurb:
      'Track, analyse and document social-media activity tied to fraud, impersonation and brand abuse.',
    short: 'Track fraud and impersonation on social.',
    icon: 'social',
    accent: '#9c71f3',
  },
  {
    title: 'Business Services',
    href: '/business-services/',
    blurb:
      'The business industry remains one of the most competitive industries in our modern world.',
    short: 'Tailored services for competitive businesses.',
    icon: 'business',
    accent: '#6b3fa0',
  },
];

export const URL_CHECKER = { title: 'URL Checker', href: '/url-checker/', icon: 'url' };

// Sustainability metrics - preserved from the live site ("We prioritise Sustainability").
// NOTE: live site shows 0 / 0 / 0 - placeholders below await real figures from TBS.
export const SUSTAINABILITY = [
  { value: 1511, suffix: '', label: 'Trees Planted', icon: 'leaf' },
  { value: 57.45, suffix: ' kg', label: 'CO₂ Compensated', icon: 'cloud' },
  { value: 1365, suffix: '', label: 'Happy Customers', icon: 'smile' },
];

// Partner / "Industry Allies" logos (sourced from the live site).
export const PARTNERS = [
  { src: '/partners/scam-help.png', alt: 'Scam Help' },
  { src: '/partners/guide-post.png', alt: 'GuidePost' },
  { src: '/partners/scam-detector.png', alt: 'Scam Detector' },
  { src: '/partners/amcham.png', alt: 'AmCham' },
  { src: '/partners/qlue.png', alt: 'QLUE' },
  { src: '/partners/tbs.png', alt: 'Transparent Business Solutions' },
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
      'As a victim of fraud, I was looking for a company to assist me and I do not regret choosing Transparent Business Solutions. They very attentive to my problem and I left satisfied with their services. They were also able to refer me to a law firm I am working on civil proceedings with now. Top notch!',
    name: 'Dianna Mills',
  },
  {
    quote:
      'I dealt with them regarding 2 cases of fraud - they ran the investigation perfectly. Unfortunately, when it came to a dispute, it turned out to be way more complicated than I expected. We pushed the case through, but it caused some hustle for me too. I expected them to cover the services 100%, but it turned out case required my involvement as well.',
    name: 'Clifford R. Forrest',
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

// A representative slice of the "over 350 news sites" press wall.
export const PRESS = [
  { name: 'The Chronicle Journal', url: 'https://markets.chroniclejournal.com/chroniclejournal/news/article/marketersmedia-2025-7-7-international-cybercrime-firm-cyberclaims-recovers-90000-from-cryptocurrency-fraud-case' },
  { name: 'Minyanville', url: 'https://finance.minyanville.com/minyanville/news/article/marketersmedia-2025-7-7-international-cybercrime-firm-cyberclaims-recovers-90000-from-cryptocurrency-fraud-case' },
  { name: 'My Mother Lode', url: 'https://money.mymotherlode.com/clarkebroadcasting.mymotherlode/news/article/marketersmedia-2025-7-7-international-cybercrime-firm-cyberclaims-recovers-90000-from-cryptocurrency-fraud-case' },
  { name: 'Financial Content', url: 'https://markets.financialcontent.com/franklincredit/news/article/marketersmedia-2025-7-7-international-cybercrime-firm-cyberclaims-recovers-90000-from-cryptocurrency-fraud-case' },
  { name: 'The Punxsutawney Spirit', url: 'https://business.punxsutawneyspirit.com/punxsutawneyspirit/news/article/marketersmedia-2025-7-7-international-cybercrime-firm-cyberclaims-recovers-90000-from-cryptocurrency-fraud-case' },
  { name: 'The Pilot News', url: 'https://business.thepilotnews.com/thepilotnews/news/article/marketersmedia-2025-7-7-international-cybercrime-firm-cyberclaims-recovers-90000-from-cryptocurrency-fraud-case' },
  { name: 'The Saline Courier', url: 'https://business.bentoncourier.com/bentoncourier/news/article/marketersmedia-2025-7-7-international-cybercrime-firm-cyberclaims-recovers-90000-from-cryptocurrency-fraud-case' },
  { name: 'KTTC', url: 'https://kttc.marketminute.com/article/marketersmedia-2025-7-7-international-cybercrime-firm-cyberclaims-recovers-90000-from-cryptocurrency-fraud-case' },
  { name: 'MarketMinute', url: 'https://fwnbc.marketminute.com/article/marketersmedia-2025-7-7-international-cybercrime-firm-cyberclaims-recovers-90000-from-cryptocurrency-fraud-case' },
  { name: 'The Evening Leader', url: 'https://business.theeveningleader.com/theeveningleader/news/article/marketersmedia-2025-7-7-international-cybercrime-firm-cyberclaims-recovers-90000-from-cryptocurrency-fraud-case' },
  { name: 'SM Daily Press', url: 'https://business.smdailypress.com/smdailypress/news/article/marketersmedia-2025-7-7-international-cybercrime-firm-cyberclaims-recovers-90000-from-cryptocurrency-fraud-case' },
  { name: 'Big Spring Herald', url: 'https://business.bigspringherald.com/bigspringherald/news/article/marketersmedia-2025-7-7-international-cybercrime-firm-cyberclaims-recovers-90000-from-cryptocurrency-fraud-case' },
];
