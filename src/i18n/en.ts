// English UI strings - the source of truth.
//
// What lives here: the site's CHROME. Navigation, buttons, form labels, section
// headings, status messages - text that repeats across pages and is short.
//
// What does NOT live here (yet): the long-form marketing and legal copy, which stays
// in src/data/*.ts and src/content/legal/. Extracting ~10,000 lines of prose into
// flat keys before anyone has decided which languages we serve would be speculative
// work, and prose belongs in prose files, not in a key-value map. Those files are
// already keyed by locale (see SERVICE_CONTENT), so a second language slots in
// without restructuring anything.
//
// Adding a language: create src/i18n/nl.ts as
//
//     import type { UIKey } from './en';
//     export const nl: Record<UIKey, string> = { ... };
//
// A missing key is then a COMPILE ERROR, not an empty string that ships to
// production and is noticed by a customer.

export const en = {
  // Navigation
  'nav.home': 'Home',
  'nav.about': 'About Us',
  'nav.services': 'Services',
  'nav.news': 'News',
  'nav.contact': 'Contact Us',
  'nav.urlChecker': 'URL Checker',
  'nav.startProcess': 'Start Process',
  'nav.menu': 'Menu',
  'nav.close': 'Close',
  'nav.allServices': 'All services',

  // Buttons & shared actions
  'cta.startProcess': 'Start Process',
  'cta.contactUs': 'Contact Us',
  'cta.learnMore': 'Learn more',
  'cta.readMore': 'Read more',
  'cta.backHome': 'Back to homepage',
  'cta.freeReview': 'Free case review · 48-hour response',

  // Lead forms
  'form.fullName': 'Full Name',
  'form.email': 'Email',
  'form.phone': 'Phone Number',
  'form.country': 'Country of Residence',
  'form.amountLost': 'Amount Lost',
  'form.message': 'Message',
  'form.platformName': 'Platform Name',
  'form.platformWebsite': 'Platform Website',
  'form.firstTransaction': 'Date of First Transaction',
  'form.lastTransaction': 'Date of Last Transaction',
  'form.submit': 'Submit',
  'form.sending': 'Sending...',
  'form.back': 'Back',
  'form.next': 'Next',
  'form.legal':
    'Protected by CAPTCHA. Your details are confidential and reviewed by certified experts.',
  'form.successTitle': 'We have your details',
  'form.successBody':
    'A certified investigator will review your case and respond within 48 hours. Everything you sent us is confidential.',
  'form.errorGeneric':
    'Something went wrong on our side. Please try again, or email contact@cyberclaims.net.',
  'form.errorNetwork':
    'Could not reach the server. Please check your connection and try again.',

  // News / blog
  'news.title': 'News',
  'news.intro':
    'Guides, scam reviews and security research from our investigation team - so you can spot fraud early and stay a step ahead.',
  'news.imageAlt': 'Floating tiles showing a newspaper, magnifier, warning flag and shield',
  'news.allCategories': 'All',
  'news.readingTime': '{minutes} min read',
  'news.empty': 'No articles yet. Check back soon.',
  'news.related': 'Related reading',
  'news.seeAll': 'See all',
  'news.by': 'By',
  'news.backToNews': 'All articles',
  'news.loadMore': 'Load more',
  'news.loading': 'Loading…',

  // Article sidebar
  'aside.services': 'Our services',
  'share.title': 'Share this article',
  'share.on': 'Share on {platform}',
  'news.draftBanner': 'You are previewing a draft. It is not visible to anyone else.',

  // Q&A block
  // Rendered above the accordion whenever an article contains one. Injected
  // server-side rather than baked into the editor's output, so the copy stays in one
  // place, is translatable, and isn't duplicated into every article's stored HTML.
  'faq.eyebrow': 'Frequently asked questions',
  'faq.titleLead': 'Have any',
  'faq.titleAccent': 'questions?',
  'faq.body':
    "Can't find the answer you're looking for? Reach out to our team and we'll get back to you within 24 hours.",

  // Trust / footer
  'trust.moj': 'Dutch MOJ · POB {pob}',
  'trust.press': 'Featured in 350+ news outlets',
  'footer.rights': 'All rights reserved.',
  'footer.company': 'Transparent Business Solutions B.V.',

  // 404
  'notFound.title': 'Page not found',
  'notFound.body':
    "That page doesn't exist, or has moved. If you were sent here by someone claiming to represent us, be careful - see the warning below.",

  // Homepage
  // Headings with an {accent} placeholder are rendered with set:html so the accent word
  // can move to wherever it belongs in each language's word order. {accent}A is that
  // word (a brand name where it is one, and then identical across languages).
  'home.heroTitle': 'Have you been a victim of {accent}',
  'home.heroTitleA': 'crypto scams?',
  'home.heroSub':
    'We can help you <strong>TRACE &amp; FREEZE</strong> your assets. Cyberclaims, supported by world-leading cryptocurrency intelligence and blockchain analytics, provides expert crypto tracing and investigation services to help consumers navigate complex crypto-related fraud &amp; crypto scams cases.',
  'home.heroFormTitle': 'Start your recovery',

  'home.aboutTitle': 'Hello, we are {accent}',
  'home.aboutTitleA': 'Cyberclaims',
  'home.aboutLead':
    'At Cyberclaims, you can rely on our team of dedicated and certified experts to provide and implement the best solutions for the challenges hindering your business’s growth.',
  'home.aboutBody':
    'If you are a victim of cyber fraud or have lost digital assets due to cyber theft, reaching out to us is the first step toward recovering your assets and getting the support you need.',
  'home.aboutPoint1': 'Certified experts in crypto & blockchain forensics',
  'home.aboutPoint2': 'Global reach - work with you from anywhere',
  'home.aboutPoint3': 'Free case review with a 48-hour response',
  'home.aboutImageAlt':
    'Live blockchain funds-flow trace: wallet, exchange and mixer nodes linked to a flagged cashout point',

  'home.recTitle': 'Start your {accent} now',
  'home.recTitleA': 'recovery',
  'home.recSub':
    'Talk to a certified expert about your case. No obligation - just a clear picture of your options and next steps.',

  'home.servicesTitle': 'What we {accent}',
  'home.servicesTitleA': 'investigate',
  'home.servicesExplore': 'Explore service',

  'home.tracingTitle': 'Crypto currency {accent}',
  'home.tracingTitleA': 'tracing',
  'home.tracingBody':
    'Leveraging the world’s leading cryptocurrency intelligence and blockchain analytics, we provide in-depth insights into cryptocurrency tracing, the risks of money laundering associated with virtual asset service providers, and more. Our advanced software enables us to identify risks related to crypto wallets, track cashout points, and precisely determine where funds were sent and cashed out.',
  'home.tracingViewMore': 'View More',
  'home.tracingChip1': 'On-chain',
  'home.tracingChip2': 'VASP risk',
  'home.tracingChip3': 'Cashout',
  'home.tracingFoot': 'Funds mapped across 5 hops · 2 cashout points flagged',

  'home.susTitle': 'We prioritise {accent}',
  'home.susTitleA': 'sustainability',
  'home.susLead':
    'Fighting digital crime shouldn’t cost the planet. A part of every case we resolve goes back into offsetting our footprint.',

  'home.testiTitle': 'Trusted by people we’ve {accent}',
  'home.testiTitleA': 'helped recover',

  'home.partnersTitle': 'Industry {accent}',
  'home.partnersTitleA': 'allies',
  'home.partnersLead':
    'We work alongside leading intelligence providers, law firms and compliance networks to give every case the reach it needs.',

  'home.pressBadge': 'As seen on - and over 350 news sites',
  'home.pressStory': 'International cybercrime firm {accent} from a cryptocurrency fraud case',
  'home.pressStoryA': 'CyberClaims recovers €90,000',
  'home.pressVerified': 'Verified by BrandPush.co',

  'home.blogsTitle': 'Latest {accent}',
  'home.blogsTitleA': 'blogs',
  'home.blogsAll': 'All news',

  // Shared CTA strip (homepage + several pages)
  'cta.stripTitle': 'Have you been a victim of {accent}',
  'cta.stripTitleA': 'crypto scams?',
  'cta.stripSub': 'We can help you trace & freeze your assets. Act now.',

  // Legal page titles (footer links, nav, page headings)
  'legal.privacyTitle': 'Privacy Policy',
  'legal.cookieTitle': 'Cookie Policy',
  'legal.termsTitle': 'Terms and Conditions',
  'legal.dpaTitle': 'Data Protection Addendum',

  // Footer
  'footer.tag': 'Securing Your Digital World, One Claim at a Time',
  'footer.badgeRegistered': 'TBS B.V. registered',
  'footer.badgeGdpr': 'GDPR compliant',
  'footer.colCompany': 'Company',
  'footer.colResources': 'Resources',
  'footer.colContact': 'Contact',
  'footer.legal':
    'Transparent Business Solutions B.V. (dba Cyberclaims), offers free consultations. Other services involve applicable retainers, fees, or commissions. Transparent Business Solutions B.V. is an authorized private investigation agency under POB number {pob} from the Dutch Ministry of Justice and Security.',
  'footer.copyright': '© {year} Copyright Cyberclaims. All rights reserved.',

  // Impersonator warning band (shown site-wide except the homepage)
  'impersonator.title': 'Beware of Impersonators!',
  'impersonator.body1':
    'We have been alerted that individuals are impersonating CyberClaims representatives to deceive victims. Scammers may call, pretending to be us, and direct you to our site.',
  'impersonator.body2':
    'All emails, contracts, and payment requests will come strictly from @cyberclaims.net.',
  'impersonator.body3': 'If you’re unsure, verify with us at {email}. Stay vigilant and stay safe.',

  // Services rail (shared: about page + service detail pages)
  'servicesRail.exploreOur': 'Explore our',
  'servicesRail.exploreOther': 'Explore other',
  'servicesRail.services': 'services',

  // About page
  'about.metaTitle': 'About Us - Cyberclaims',
  'about.metaDesc':
    'Discover who we are and how we help recover your lost funds and cryptocurrency with certified crypto & blockchain forensics.',
  'about.heroTitle': 'Discover who we are and how we help recover your lost funds',
  'about.heroImageAlt':
    'Five linked tiles climbing left to right: a cracked coin, a magnifying glass, a network of traced wallets, a case file, and a recovered wallet',
  'about.s1Title': 'Turning the Impossible into Reality: Recovering Lost Funds and {accent}',
  'about.s1TitleA': 'Cryptocurrency',
  'about.s1Body':
    'At Cyberclaims, we specialize in cutting-edge cryptocurrency intelligence and blockchain analytics to protect your digital assets and recover lost funds. Whether you’re dealing with crypto scams, fraud, or security threats, our expert solutions provide clarity and support at every step. Trust us to navigate the complexities of cryptocurrency recovery, empowering you to regain control of your financial future with confidence.',
  'about.s1ImageAlt': 'A fractured ring reassembling, symbolising recovered assets',
  'about.s2Body1':
    'We specialize in advanced cryptocurrency tracing to help victims of cyber fraud recover lost digital assets. Our certified experts use cutting-edge blockchain analytics to track the movement of stolen funds and identify the perpetrators behind crypto theft.',
  'about.s2Body2':
    'Whether your assets were transferred to untraceable wallets or moved across multiple platforms, our team is equipped to follow the trail and assist you in navigating the complexities of crypto recovery. With a global reach, our services are accessible from anywhere in the world, providing you with the support you need to recover your funds securely and efficiently.',
  'about.s2Body3':
    'Trust Cyberclaims to be your guide through the blockchain, ensuring you take the right steps toward asset recovery.',
  'about.s3Title': 'Our {accent}',
  'about.s3TitleA': 'values',
  'about.s3Body':
    'At Cyberclaims, we create an environment that attracts top talent in the crypto and blockchain recovery industry. Our team uses advanced blockchain analytics to help victims of cyber fraud recover stolen digital assets. With a global presence and expertise in crypto tracing, we deliver effective, results-driven solutions to clients worldwide. Join us and make an impact in the fight against crypto crime.',
  'about.s3ImageAlt': 'Interlocking orbits around a glowing core, symbolising our values',

  // Thank-you page
  'thankYou.metaTitle': 'Thank you - Cyberclaims',
  'thankYou.metaDesc':
    'We have received your case details. A certified investigator will respond within 48 hours.',
  'thankYou.body':
    'A certified investigator will review your case and get back to you within <strong>48 hours</strong>. Everything you sent us is confidential.',
  'thankYou.warn':
    '<strong>Beware of impersonators.</strong> We will never ask you to send cryptocurrency or pay an upfront “release fee” to recover your funds. Anyone who does is not us.',
  'thankYou.urgent': 'If your matter is urgent, reach us at {email}.',

  // URL checker page
  'urlChecker.metaTitle': 'URL Checker - Cyberclaims',
  'urlChecker.metaDesc':
    'Check whether a website URL is flagged as unsafe. Our URL scam checker protects you from phishing, malware and malicious sites.',
  'urlChecker.title': 'URL Scam Checker',
  'urlChecker.lead':
    'Enter a website URL below to check if it’s flagged as unsafe. This tool protects you from phishing, malware, and malicious sites that could harm your device or steal your data.',
  'urlChecker.inputLabel': 'Website URL',
  'urlChecker.placeholder': 'e.g., https://example.com',
  'urlChecker.submit': 'Check URL',
  'urlChecker.legal': 'Results are indicative only. For a full investigation, start a case with our team.',

  // 404 page (extra keys; notFound.title/body are above)
  'notFound.metaTitle': 'Page not found - Cyberclaims',
  'notFound.help': 'Looking for help with a case? {start}, or email {email}.',
  'notFound.helpStart': 'Start here',

  // Contact page
  'contact.metaTitle': 'Contact Us - Cyberclaims',
  'contact.metaDesc':
    'Have you been a victim of crypto scams? Contact Cyberclaims - we can help you trace & freeze your assets.',
  'contact.heroIntro':
    'Have you been a victim of crypto scams? We can help you trace & freeze your assets. Act now.',
  'contact.heroImageAlt': 'Floating tiles showing an envelope, chat bubble, at-sign and map pin',
  'contact.callUs': 'Call us',
  'contact.office': 'Office',
  'contact.formTitle': 'Send us a message',

  // Start Process wizard
  'startProcess.metaTitle': 'Start Process - Cyberclaims',
  'startProcess.metaDesc':
    'File a complaint with Cyberclaims. Answer as detailed as possible and receive a response within 24-72 business hours.',
  'startProcess.heroIntro':
    'Please fill the form below to file a complaint. Please answer as detailed as possible.',
  'startProcess.heroImageAlt': 'A checklist tile linked to document, review and verification steps',
  'startProcess.step1': 'Contact',
  'startProcess.step2': 'Amount',
  'startProcess.step3': 'Incident',
  'startProcess.step4': 'Confirm',
  'startProcess.s1Title': 'Contact details',
  'startProcess.s2Title': 'Amount lost',
  'startProcess.s3Title': 'Incident information',
  'startProcess.s4Title': 'Confirmation',
  'startProcess.confirm':
    'Almost there! Please review all the information and click “Submit” to send off your complaint and receive a response from us within 24-72 business hours.',
  'startProcess.successTitle': 'Your complaint has been submitted',
  'startProcess.successBody':
    'Thank you - our team will review the details you provided and respond within 24-72 business hours.',

  // Services index page
  'services.metaTitle': 'Our Services - Cyberclaims',
  'services.metaDesc':
    'From tracing stolen crypto to website takedowns, our certified experts cover the full spectrum of cyber-fraud investigation and asset recovery.',
  'services.heroTitle': 'Our Services',
  'services.heroIntro':
    'From tracing stolen crypto to taking down fraudulent websites, our certified experts cover the full spectrum of cyber-fraud investigation and asset recovery.',
  'services.heroImageAlt':
    'Floating tiles showing bitcoin, a shield, a magnifier, scales, a document and a blocked site',
  'services.urlCheckerBlurb':
    'Check whether a website is flagged as unsafe before you trust it with your data.',
  'services.openChecker': 'Open checker',

  // Service names / descriptions (structured data from site.ts)
  // Keyed by the service's URL slug. `title` is the card/nav name, `blurb` the full
  // card description, `short` the one-line mega-menu description.
  'svc.cryptocurrency-recovery.title': 'Cryptocurrency Recovery',
  'svc.cryptocurrency-recovery.blurb':
    'Using crypto currencies for transactions doesn’t guarantee complete immunity from online scammers and fraud.',
  'svc.cryptocurrency-recovery.short': 'Recover assets lost to scams, theft and fraud.',
  'svc.cryptocurrency-tracing.title': 'Crypto Currency Tracing',
  'svc.cryptocurrency-tracing.blurb':
    'Assistance to victims of scams to trace cryptocurrencies sent to fraudulent entities, to identify cashout points.',
  'svc.cryptocurrency-tracing.short': 'Trace stolen crypto to its cashout points.',
  'svc.website-forensics.title': 'Website Forensics',
  'svc.website-forensics.blurb':
    'Uncover scam networks, digital forensics related to fraud or brand infringements.',
  'svc.website-forensics.short': 'Uncover scam networks and fraud evidence.',
  'svc.brand-protection.title': 'Brand Protection',
  'svc.brand-protection.blurb':
    'We all know that cyber attacks can be frustrating, leaving your intellectual property and trade secrets exposed.',
  'svc.brand-protection.short': 'Shield your IP and brand from attacks.',
  'svc.website-takedown.title': 'Website Takedown',
  'svc.website-takedown.blurb':
    'With increased advancement in the digital space, there’s no doubt about the insurmountable benefits and risks.',
  'svc.website-takedown.short': 'Take down fraudulent, infringing sites.',
  'svc.dispute-resolution-support.title': 'Dispute Resolution Support',
  'svc.dispute-resolution-support.blurb':
    'Dispute resolution support includes all the processes geared towards addressing disputes.',
  'svc.dispute-resolution-support.short': 'Support through the full dispute process.',
  'svc.consultancy-documentation-support.title': 'Consultancy & Documentation Support',
  'svc.consultancy-documentation-support.blurb':
    'Employing the services of a consultant firm without proper documentation support is a costly mistake.',
  'svc.consultancy-documentation-support.short': 'Expert consultancy, done by the book.',
  'svc.due-diligence-investigations.title': 'Due Diligence Investigations',
  'svc.due-diligence-investigations.blurb':
    'Many people prefer to acquire or partner with an already established business - verify before you commit.',
  'svc.due-diligence-investigations.short': 'Verify partners before you commit.',
  'svc.social-media-investigation.title': 'Social Media Investigation',
  'svc.social-media-investigation.blurb':
    'Track, analyse and document social-media activity tied to fraud, impersonation and brand abuse.',
  'svc.social-media-investigation.short': 'Track fraud and impersonation on social.',
  'svc.business-services.title': 'Business Services',
  'svc.business-services.blurb':
    'The business industry remains one of the most competitive industries in our modern world.',
  'svc.business-services.short': 'Tailored services for competitive businesses.',

  // Sustainability stat labels + contact address
  'sus.treesPlanted': 'Trees Planted',
  'sus.co2': 'CO₂ Compensated',
  'sus.happyCustomers': 'Happy Customers',
  'contact.address': 'Kalvermarkt 53, 2511 CB, The Hague, Netherlands.',
} as const;

export type UIKey = keyof typeof en;
