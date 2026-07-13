// Per-service page content - copy preserved verbatim from the live site
// (https://www.cyberclaims.net/service/<slug>/). Keyed by the service href.

// Hero image for each service page (mirrors the homepage showcase mapping).
export const SERVICE_IMAGE: Record<string, string> = {
  '/cryptocurrency-recovery/': '/service-visual.webp',
  '/cryptocurrency-tracing/': '/sv-crypto-tracing.webp',
  '/website-forensics/': '/sv-website-forensics.webp',
  '/brand-protection/': '/sv-brand-protection.webp',
  '/website-takedown/': '/sv-website-takedown.webp',
  '/dispute-resolution-support/': '/sv-dispute.webp',
  '/consultancy-documentation-support/': '/sv-consultancy.webp',
  // due-diligence <-> social-media images are swapped to match the homepage
  '/due-diligence-investigations/': '/sv-social-media.webp',
  '/social-media-investigation/': '/sv-due-diligence.webp',
  '/business-services/': '/sv-business.webp',
};

export type ServiceBlock =
  | { type: 'p'; text: string }
  // list layout: 'row' (items on a row, default) | 'stack' (each on its own full-width row)
  // cols: explicit number of columns for a 'row' list on desktop (default 3)
  // grid: custom desktop grid-template-columns (e.g. '1.8fr 1fr') - overrides cols
  | { type: 'list'; layout?: 'row' | 'stack'; cols?: number; grid?: string; items: string[] }
  // defs layout: 'bento' (image-ready bento tiles, no icon, default) | 'cards' (icon inline with title, varied icons)
  // centerImage: when set on an all-artwork bento, a logo-only tile is placed in the centre of the grid
  | {
      type: 'defs';
      layout?: 'bento' | 'cards';
      centerImage?: string;
      cols?: number; // columns for a 'cards' masonry on desktop (default 3)
      grid?: string; // custom desktop grid-template-columns for a 3-card bento (e.g. '1.5fr 1fr')
      // `id` is the STABLE key for the bento artwork map in [service].astro.
      // It is deliberately not derived from `term`: `term` is display text and gets
      // translated, and a lookup keyed on translated text misses silently.
      items: { id?: string; term: string; text: string }[];
    };

export type ServiceSection = {
  heading?: string;
  blocks: ServiceBlock[];
};

export type ServicePage = {
  eyebrow: string; // hero subheading
  intro: string[]; // hero intro paragraphs
  sections: ServiceSection[];
};

export const SERVICE_CONTENT: Record<string, ServicePage> = {
  '/cryptocurrency-tracing/': {
    eyebrow: 'Crypto currency Tracing Certified Examiner',
    intro: [
      'Making payments with cryptocurrencies doesn’t mean your transactions are completely immune to online fraud. Did you know that there are ways through which the identities of individuals behind specific cryptocurrency wallets can be uncovered? Have you fallen victim to cyber fraud and can’t stop blaming yourself? Don’t be too hard on yourself - understanding cryptocurrency tracing and its role in recovery is key, and we’re here to guide you through it.',
    ],
    sections: [
      {
        heading: 'About Crypto currency Tracing',
        blocks: [
          {
            type: 'p',
            text: 'Cryptocurrency tracing is a crucial part of the investigative process aimed at recovering digital assets obtained through online hacking, fraud, theft, and other illicit schemes. By tracing these activities on the blockchain, we can uncover the movement of stolen funds.',
          },
          {
            type: 'p',
            text: 'At Cyberclaims, we leverage advanced technology powered by QLUE, the leading cryptocurrency intelligence and blockchain analytics platform, to provide in-depth insights into cryptocurrency tracing. We also assess money laundering risks associated with virtual asset service providers.',
          },
          {
            type: 'p',
            text: 'With a team of certified examiners, Cyberclaims offers top-tier cryptocurrency tracing services for:',
          },
          {
            type: 'list',
            items: [
              'Cryptocurrencies exchangers',
              'Digital assets investors',
              'Victims of online fraud',
            ],
          },
        ],
      },
      {
        heading:
          'Who Is A Cryptocurrency Tracing Certified Examiner, And What Do They Do?',
        blocks: [
          {
            type: 'p',
            text: 'A cryptocurrency tracing certified examiner is an expert with deep knowledge of blockchain technology. They use a risk-based approach, employing advanced forensic tools to trace the origin of blockchain funds and de-anonymize cryptocurrency transactions.',
          },
          {
            type: 'p',
            text: 'Services offered by a certified cryptocurrency examiner include:',
          },
          {
            type: 'list',
            layout: 'stack',
            items: [
              'Tracing the origin of blockchain funds and de-anonymizing transactions on major networks like Bitcoin and Ethereum using blockchain forensic tools.',
              'Quickly assessing the risks associated with cryptocurrency and digital asset transactions.',
              'Enhancing the efficiency and effectiveness of blockchain forensic investigations.',
            ],
          },
        ],
      },
      {
        heading:
          'When Does One Need the Services of A Certified Cryptocurrency Tracing Examiner?',
        blocks: [
          {
            type: 'p',
            text: 'If you have fallen victim to fraud, or suspect unauthorized access to your crypto wallets and digital assets, the services of a certified cryptocurrency tracing examiner are crucial.',
          },
          {
            type: 'p',
            text: 'Receiving unexpected transaction notifications or noticing unfamiliar activity in your account may indicate fraudulent actions. Our expert team can help trace the origin of these transactions, identify where your funds have gone, and assist in recovering your assets. Taking immediate action with our tracing services can help mitigate the impact and protect your digital assets.',
          },
        ],
      },
      {
        heading: 'How Is This Even Possible? What Techniques Are Applied?',
        blocks: [
          {
            type: 'p',
            text: 'In order to execute these tasks, Cyberclaims specialize in tracing the following types of information that would be of great help to the investigating unit:',
          },
          {
            type: 'defs',
            items: [
              {
                id: 'cluster-analysis',
                term: 'Cluster Analysis',
                text: 'Cluster analysis helps identify relationships between blockchain wallets by grouping them based on shared transaction history. This method allows us to link wallets that share unspent transaction outputs (UTXOs) and track asset movements across the blockchain, shedding light on potentially fraudulent or suspicious activity.',
              },
              {
                id: 'attribution-data',
                term: 'Attribution Data',
                text: 'Attribution analysis focuses on identifying the owners behind blockchain addresses by mapping ownership across multiple accounts. This process aids in revealing the connections between these accounts and helps to de-anonymize blockchain transactions, providing deeper insight into the flow of funds.',
              },
              {
                id: 'kyc-information',
                term: 'KYC Information Requests',
                text: 'KYC Information Requests are formal inquiries made to entities that adhere to Anti-Money Laundering (AML) and Know Your Customer (KYC) regulations. These requests allow us to gather critical information to support investigations, aiding in the identification of individuals behind suspicious transactions and potential fraud.',
              },
              {
                id: 'subpoena',
                term: 'Subpoena Targets',
                text: 'Through this, all cryptocurrency companies that comply with Anti-Money Laundering (AML) and Know Your Customer (KYC) regulations can get identifying information for their customers who own wallet addresses.',
              },
            ],
          },
          {
            type: 'p',
            text: 'Other types of information traced by Cyberclaims that can help hasten the investigation processes include:',
          },
          {
            type: 'list',
            items: ['Transaction mapping', 'IP Address', 'Total transaction'],
          },
        ],
      },
      {
        heading: 'Why Choose Cyberclaims for Your Cryptocurrency Tracing Services',
        blocks: [
          {
            type: 'p',
            text: 'Cyberclaims specializes in cryptocurrency tracing and has extensive experience handling crypto theft, fraud, and scams. Our approach is tailored based on the complexity of the fraud and the methods used by cybercriminals.',
          },
          {
            type: 'p',
            text: 'We use advanced forensic tools to analyze blockchain transactions, identify risks associated with crypto wallets, and pinpoint cashout points. This allows us to trace the flow of funds from victims’ wallets to fraudulent entities, and potentially recover lost assets.',
          },
          {
            type: 'p',
            text: 'Our team is dedicated to uncovering the truth behind the fraud and working to recover your digital assets in the most efficient way possible. Contact Cyberclaims today, and let us help you reclaim your cryptocurrencies.',
          },
        ],
      },
    ],
  },

  '/cryptocurrency-recovery/': {
    eyebrow: 'Secure Your Assets: Professional Crypto currency Recovery',
    intro: [
      'Did you know that although crypto transactions are designed to be secure, fraudsters still find ways to breach wallets and steal funds? Have you fallen victim to a crypto scam and can’t stop blaming yourself? Don’t be too hard on yourself - understanding the complexities of cryptocurrency recovery is crucial, and we’re here to guide you every step of the way.',
    ],
    sections: [
      {
        heading: 'Get Back Your Cryptocurrency: Expert Recovery Services',
        blocks: [
          {
            type: 'p',
            text: 'Our professional cryptocurrency recovery service specializes in investigating and recovering assets lost to online hacking, theft, fraud, and other cyber-extortion schemes. We achieve this by meticulously tracing transactions on the blockchain. Leveraging advanced technology powered by QLUE - a leading cryptocurrency intelligence and blockchain analytics platform - we offer in-depth insights into cryptocurrency tracking, while also assessing money laundering risks across virtual asset services. With a team of certified investigators, we provide top-tier cryptocurrency recovery services to:',
          },
          {
            type: 'list',
            items: ['Law Firms', 'Digital Asset Investors', 'Victims of Cyber Fraud'],
          },
        ],
      },
      {
        heading: 'How Is This Even Possible? What Techniques Are Applied?',
        blocks: [
          {
            type: 'p',
            text: 'To effectively carry out these tasks, Cyberclaims specializes in tracing key data that is essential for investigative units, this includes:',
          },
          {
            type: 'defs',
            items: [
              {
                id: 'cluster-analysis',
                term: 'Cluster Analysis',
                text: 'Cluster analysis links related blockchain wallets to deanonymize transactions, revealing whether these addresses share unspent transaction outputs (UTXOs). This technique helps identify connections between wallets and trace asset flows across the blockchain.',
              },
              {
                id: 'attribution-data',
                term: 'Attribution Data',
                text: 'Attribution analysis will support the investigation by analyzing ownership attribution across multiple accounts, helping to deanonymize blockchain addresses and trace connections between them.',
              },
              {
                id: 'kyc-information',
                term: 'KYC Information Requests',
                text: 'KYC Information Requests allow us to obtain information through requests made by companies that comply with Anti-Money Laundering (AML) and Know Your Customer (KYC) regulations.',
              },
              {
                id: 'subpoena',
                term: 'Subpoena Targets',
                text: 'Through this, all cryptocurrency companies that comply with Anti-Money Laundering (AML) and Know Your Customer (KYC) regulations can get identifying information for their customers who own wallet addresses.',
              },
            ],
          },
          {
            type: 'p',
            text: 'Other types of information traced by Cyberclaims that can help hasten the investigation processes include:',
          },
          {
            type: 'list',
            items: ['Transaction mapping', 'IP Address', 'Total transaction'],
          },
        ],
      },
      {
        heading:
          'Why Cyberclaims is the Right Choice For Your Cryptocurrency Recovery Services',
        blocks: [
          {
            type: 'p',
            text: 'Cyberclaims has extensive expertise in handling cryptocurrency theft and fraud cases. Our approach to tackling cryptocurrency-related scams is tailored based on the sophistication of the fraudster’s methods and the measures they take to hide their identity.',
          },
          {
            type: 'p',
            text: 'Utilizing cutting-edge technology, we can assess risks associated with crypto wallets, pinpoint cashout locations, and trace the flow of funds - identifying where the stolen cryptocurrency was sent and cashed out.',
          },
          {
            type: 'p',
            text: 'We work closely with scam victims to trace cryptocurrencies sent to fraudulent entities, track the movement of funds, and connect the dots to help recover lost digital assets.',
          },
          {
            type: 'p',
            text: 'Contact Cyberclaims now, and let us help you restore your forfeited cryptocurrencies and digital assets with the utmost efficiency and precision.',
          },
        ],
      },
    ],
  },

  '/brand-protection/': {
    eyebrow: 'Safeguard Your Digital Assets from Cyber Threats',
    intro: [
      'We all know that cyber attacks can be frustrating, leaving your intellectual property and trade secrets exposed. Brand protection keeps your reputation, market position and assets secure in an increasingly digital world.',
    ],
    sections: [
      {
        heading: 'Why Brand Protection Matters',
        blocks: [
          {
            type: 'p',
            text: 'Without brand protection, your organization faces major risks such as intellectual property theft, fraud, and reputation damage. Failing to secure your brand could result in:',
          },
          {
            type: 'defs',
            layout: 'cards',
            grid: '2.2fr 1fr',
            items: [
              {
                term: 'Brand Abuse',
                text: 'Cybercriminals misusing your brand’s identity for scams, fraud, and phishing, undermining consumer trust.',
              },
              {
                term: 'Intellectual Property Theft',
                text: 'Unauthorized use of your trademarks, logos, and proprietary data, weakening your competitive position.',
              },
              {
                term: 'Reputation Damage',
                text: 'Malicious actors tarnishing your reputation, leading to long-term harm to customer loyalty and trust.',
              },
            ],
          },
        ],
      },
      {
        heading: 'What is Brand Protection?',
        blocks: [
          {
            type: 'p',
            text: 'Brand protection involves safeguarding a company’s intellectual property and digital assets from various online threats, including ransomware, counterfeiting, copyright infringement, and other cyber hazards. It is a crucial aspect of ensuring that a company’s reputation, market position, and assets are secure in an increasingly digital world.',
          },
          {
            type: 'p',
            text: 'The importance of brand protection cannot be overstated. Not only does it prevent the loss of valuable assets, but it also shields a company’s reputation from malicious activities. By securing your brand, you protect your trademarks, logos, and proprietary information from misuse, which helps to maintain consumer trust and long-term business success.',
          },
        ],
      },
      {
        heading: 'Different Types Of Brand Abuse',
        blocks: [
          {
            type: 'p',
            text: 'Brand abuse can take several forms, each involving a third party exploiting a brand’s intellectual property or assets for personal gain. These activities not only undermine the brand’s value but also pose significant risks to its reputation and security. Common types of brand abuse include:',
          },
          {
            type: 'defs',
            layout: 'cards',
            items: [
              {
                term: 'Counterfeiting',
                text: 'The unauthorized production of goods that mimic a brand’s products, leading to revenue loss and potential harm to brand reputation.',
              },
              {
                term: 'Malicious Websites',
                text: 'Fraudulent sites that mimic legitimate businesses to deceive consumers, often leading to identity theft or phishing attacks.',
              },
              {
                term: 'Intellectual Property Theft',
                text: 'The illegal use or reproduction of a brand’s patents, trademarks, and copyrighted content, weakening the brand’s unique identity and market position.',
              },
              {
                term: 'Impersonation',
                text: 'When individuals or entities falsely present themselves as representatives of a brand, potentially misleading consumers or partners.',
              },
              {
                term: 'Copyright Piracy',
                text: 'The illegal distribution or use of copyrighted works without permission, including content theft, file-sharing, or unauthorized streaming.',
              },
            ],
          },
        ],
      },
      {
        heading: 'The Risks of not Protecting your Brands',
        blocks: [
          {
            type: 'p',
            text: 'Failing to implement proper brand protection measures exposes your business to numerous risks that can have long-term consequences. Just as with any valuable asset, neglecting to secure your intellectual and digital properties can lead to:',
          },
          {
            type: 'defs',
            layout: 'cards',
            items: [
              {
                term: 'Wasted Time and Resources',
                text: 'Dealing with counterfeit sellers and fraud can quickly become a full-time job, taking valuable time away from activities that could be used to grow and promote your brand.',
              },
              {
                term: 'Damage to Reputation',
                text: 'Counterfeit products and malicious actions can lead to negative reviews and consumer dissatisfaction, severely impacting your brand’s reputation. Consumers may begin associating your brand with low quality or even fraud, which can be difficult to recover from.',
              },
              {
                term: 'Lost Business Partnerships',
                text: 'Companies are less likely to collaborate with a brand that lacks strong protection, as they may fear damage to their own reputation or legal entanglements with counterfeiters and fraudsters.',
              },
              {
                term: 'Loss of Trusted Customers',
                text: 'Customers who have built trust with your brand could be easily misled by counterfeit products or malicious impersonators, causing them to turn to competitors and abandon your brand altogether.',
              },
            ],
          },
        ],
      },
      {
        heading: 'How Is This Even Possible? What Techniques Are Applied?',
        blocks: [
          {
            type: 'p',
            text: 'These methods are designed to monitor, detect, and combat malicious actions that can harm your brand’s reputation and assets.',
          },
          {
            type: 'defs',
            layout: 'cards',
            grid: '2.2fr 1fr',
            items: [
              {
                term: 'Brand Impersonation Detection',
                text: 'Brand impersonation - where cybercriminals mimic your brand to deceive customers - is another significant threat. Using sophisticated algorithms, we detect fake social media accounts, fraudulent websites, and email scams that mislead your customers, ensuring that your brand remains trusted.',
              },
              {
                term: 'Digital Threat Monitoring',
                text: 'Through advanced monitoring tools, we track any online activity related to your brand, including fake websites, counterfeit product listings, and unauthorized use of logos or trademarks. This proactive approach helps identify potential risks before they escalate.',
              },
              {
                term: 'Intellectual Property Enforcement',
                text: 'We employ technological means to safeguard your intellectual property (IP). This includes filing takedown notices, issuing cease-and-desist orders, and, where necessary, pursuing legal action to protect your assets from infringement.',
              },
            ],
          },
        ],
      },
      {
        heading: 'Methods And Tools',
        blocks: [
          {
            type: 'p',
            text: 'At Cyberclaims, our team of expert brand protectors employs keyword monitoring, image recognition, machine learning and a smart user experience to ensure our customers enjoy brand protection at its peak.',
          },
          {
            type: 'p',
            text: 'Keyword monitoring uses bots to search for malicious websites and access potentially dangerous links, looking for listings with the aid of keywords peculiar to your brand. Image recognition analyzes images and objects online and detects images that may threaten your brand’s reputation. Machine learning is another tool employed at Cyberclaims to identify resemblances in information and data.',
          },
        ],
      },
      {
        heading: 'Why Cyberclaims?',
        blocks: [
          {
            type: 'p',
            text: 'At Cyberclaims, we offer advanced solutions to protect your brand from online threats. Our proactive approach prevents attacks before they happen and helps minimize the damage from attacks that have already occurred.',
          },
          {
            type: 'p',
            text: 'With the rise of brand impersonation and phishing, cybercriminals may be stealing your sensitive information. Cyberclaims uses sophisticated technology and an experienced team to secure your data and protect your brand’s digital presence.',
          },
          {
            type: 'p',
            text: 'We understand how hard it is to build a trusted brand, and we’re committed to offering the best protection available. We help you eliminate cybersquatters, identify look-alike websites, and monitor for brand infringements to keep your intellectual property safe.',
          },
          {
            type: 'p',
            text: 'Partner with Cyberclaims today to ensure your brand’s security. Our expert team delivers effective solutions with a focus on customer satisfaction. Protect your brand and reputation with Cyberclaims - your trusted brand security partner.',
          },
        ],
      },
    ],
  },

  '/website-takedown/': {
    eyebrow: 'Remove malicious & infringing websites',
    intro: [
      'The internet offers vast opportunities, but its increasing complexity also brings new risks. Malicious websites, phishing scams, and counterfeit operations are now commonplace, often outweighing the benefits of online engagement.',
    ],
    sections: [
      {
        heading: 'What is Website Takedown?',
        blocks: [
          {
            type: 'p',
            text: 'Website takedown involves identifying and removing malicious or infringing websites, such as phishing sites, counterfeit domains, and fraudulent platforms that harm your brand or steal intellectual property.',
          },
          {
            type: 'p',
            text: 'This process can be time-consuming and complex, as cybercriminals use various methods to evade detection. Cyberclaims simplifies this with advanced technology that automatically detects and disengages harmful websites, enabling quick action to neutralize threats.',
          },
          {
            type: 'p',
            text: 'These fraudulent sites often divert traffic, sell counterfeit products, or create phishing scams to steal personal data, damaging your reputation and eroding customer trust. Cyberclaims helps protect your brand by swiftly identifying and removing these sites, safeguarding your digital assets and maintaining your brand’s integrity.',
          },
        ],
      },
      {
        heading: 'How Our Takedown Solution Protects Your Business',
        blocks: [
          {
            type: 'p',
            text: 'Cybercriminals are constantly launching phishing, counterfeit, and fraudulent websites that target your brand. Cyberclaims offers an effective website takedown solution that identifies and removes these harmful sites swiftly, protecting your digital assets and reputation. Our advanced technology helps neutralize threats by targeting malicious websites before they can damage your brand or steal sensitive customer data. With Cyberclaims, you can focus on your business while we ensure your online presence remains secure.',
          },
        ],
      },
      {
        heading: 'Reporting and Enabling Domain Takedown',
        blocks: [
          {
            type: 'p',
            text: 'Prevent repeat infringement by uncovering the identities of malicious actors and using this data to take legal action, safeguarding your intellectual property and its value.',
          },
          {
            type: 'p',
            text: 'At Cyberclaims, we can detect and track harmful websites in real-time. We provide up-to-date infringement data and identify and validate brand impersonation. Once an infringement is detected, immediate action can be taken to prevent further damage to your brand.',
          },
        ],
      },
      {
        heading: 'How Is This Even Possible? What Techniques Are Applied?',
        blocks: [
          {
            type: 'p',
            text: 'We employ a combination of sophisticated techniques to effectively detect and take down malicious websites, protecting your brand from impersonation and counterfeit operations:',
          },
          {
            type: 'list',
            items: [
              'Legal Framework Activation',
              'Domain Identification & Reporting',
              'Risk Assessment & Incident Response',
              'Cluster Analysis',
              'Attribution Data',
              'Subpoena Targets',
            ],
          },
        ],
      },
      {
        heading: 'What a Phishing Website Can Do to Your Business',
        blocks: [
          {
            type: 'p',
            text: 'Phishing websites are deceptive replicas of legitimate sites, designed to trick customers into believing they’re on the official website of a trusted brand. These fake sites capture sensitive information such as login credentials, credit card details, and personal data, putting your customers at risk. In some cases, scammers use these fraudulent sites to sell counterfeit products, tarnishing your brand’s reputation. Worse yet, these phishing sites can be crafted in ways that make them difficult to detect.',
          },
          {
            type: 'p',
            text: 'At Cyberclaims, we actively monitor your brand to identify and take down any suspicious domains that may be impersonating your business. Our proven methods and technologies ensure that your brand remains secure, preventing financial loss and damage to your reputation.',
          },
          {
            type: 'p',
            text: 'Partner with Cyberclaims to safeguard your brand from phishing attacks and other online threats. With our reliable protection, you can trust that your brand’s integrity and customers’ safety are in good hands.',
          },
        ],
      },
    ],
  },

  '/website-forensics/': {
    eyebrow: 'Your Guide to Online Investigations',
    intro: [
      'Uncover scam networks and gather the digital forensics behind fraud or brand infringements - the evidence you need to trace attacks and reclaim your assets.',
    ],
    sections: [
      {
        heading: 'What is Website Forensics?',
        blocks: [
          {
            type: 'p',
            text: 'Website forensics is a crucial part of digital investigations, focusing on tracing cybercrime activities, recovering stolen websites, and identifying sources of unauthorized access. It involves comprehensive analysis of server logs, browsing histories, email headers, and network transmissions to gather evidence and trace the origins of cyber-attacks.',
          },
          {
            type: 'p',
            text: 'Our forensic process identifies the methods used in cyber-attacks and aims to recover lost or stolen funds. By analyzing transactional paths and identifying the digital fingerprints left by attackers, we can help victims build a strong case for fund recovery.',
          },
          {
            type: 'p',
            text: 'With the growing threat of cybercrime, proactive website forensics and professional recovery services are essential to protecting your business and reclaiming your assets.',
          },
        ],
      },
      {
        heading:
          'We specialize in website forensics for financial recovery, fraud detection, and cryptocurrency tracing',
        blocks: [
          {
            type: 'defs',
            centerImage: '/bento/logo-bento.webp',
            items: [
              {
                id: 'network-forensics',
                term: 'Network Forensics',
                text: 'Our network forensics examines digital trails across networks to detect suspicious transactions, unauthorized access, and hidden data exchanges. By analyzing traffic patterns, we help trace fraudulent activities, which is often critical in asset recovery efforts.',
              },
              {
                id: 'crypto-forensics',
                term: 'Cryptocurrency Forensics',
                text: 'As crypto transactions are often decentralized and anonymous, tracing funds can be complex. We deploy cutting-edge blockchain analysis tools to track and map crypto flows, identify wallet activity, and trace assets across blockchain networks to recover funds lost to scams or fraud.',
              },
              {
                id: 'fraudulent-pattern',
                term: 'Fraudulent Pattern Analysis',
                text: 'Our advanced algorithms and forensic tools assess patterns in financial transactions to detect unusual activity linked to money laundering, fraud, and other financial crimes. We provide detailed AML reports and assist in compliance with regulatory standards, fortifying your financial integrity.',
              },
              {
                id: 'email-forensics',
                term: 'Email Forensics',
                text: 'We analyze email headers, metadata, and recovered communication to identify phishing attempts, fraudulent schemes, or other cyber threats. This branch also includes uncovering deleted emails or conversations that may contain critical evidence.',
              },
              {
                id: 'mobile-forensics',
                term: 'Mobile Phone Forensics',
                text: 'By examining digital devices for relevant files, logs, and traces, our disk forensics uncovers critical data, even from deleted files, essential for reconstructing fraudulent transactions or recovering funds. We employ advanced forensic software and methodologies, ensuring all findings are admissible in court.',
              },
            ],
          },
        ],
      },
      {
        heading: 'How Does Cyberclaims Make This Possible?',
        blocks: [
          {
            type: 'p',
            text: 'To support our investigations, Cyberclaims applies advanced methods to trace crucial data that assists law enforcement and investigative units in tracking financial crime:',
          },
          {
            type: 'defs',
            items: [
              {
                id: 'cluster-analysis',
                term: 'Cluster Analysis',
                text: 'Through cluster analysis, we identify connections between blockchain wallets by grouping them based on common transaction patterns. By linking wallets with shared unspent transaction outputs (UTXOs), we reveal asset flows and identify suspicious activities across the blockchain.',
              },
              {
                id: 'attribution-data',
                term: 'Attribution Data',
                text: 'Using attribution data, we map ownership across blockchain addresses, helping to uncover connections between accounts. This de-anonymization process provides valuable insights into the origins and destinations of funds, shedding light on potential fraud.',
              },
              {
                id: 'kyc-information',
                term: 'KYC Requests',
                text: 'KYC information requests are formal submissions to institutions adhering to Anti-Money Laundering (AML) and Know Your Customer (KYC) standards. These requests grant access to essential information, helping investigators identify the individuals behind suspicious or fraudulent transactions.',
              },
              {
                id: 'subpoena',
                term: 'Subpoena Targets',
                text: 'Through this, all cryptocurrency companies that comply with Anti-Money Laundering (AML) and Know Your Customer (KYC) regulations can get identifying information for their customers who own wallet addresses.',
              },
            ],
          },
          {
            type: 'p',
            text: 'Other types of information traced by Cyberclaims that can help hasten the investigation processes include:',
          },
          {
            type: 'list',
            items: ['Transaction mapping', 'IP Address', 'Total transaction'],
          },
        ],
      },
      {
        heading: 'What We Do Differently at Cyberclaims',
        blocks: [
          {
            type: 'p',
            text: 'We provide exceptional service in digital forensics investigations for electronic devices to solve cybercrime. With our advanced forensic equipment, we ensure your website is adequately secured and fully protected. We can scrutinize and retrieve digital information from any known digital device.',
          },
          {
            type: 'p',
            text: 'Our team of experts has considered how delicate digital information can be and has come up with full-proof methods of capturing both persistent and volatile data and preserving their integrity. As the world continues to evolve, cyber-attacks become more complex with many intricacies. At Cyberclaims, we do not slack in swiftly adapting to any changes - we have the capacity and skills to uncover all kinds of digital evidence to identify cyber threats and potentially harmful software.',
          },
        ],
      },
    ],
  },

  '/dispute-resolution-support/': {
    eyebrow: 'Online Dispute Resolution Support',
    intro: [
      'Dispute resolution support includes all the processes geared towards addressing disputes - from negotiation to reconciliation - so conflicts are settled before they damage your business.',
    ],
    sections: [
      {
        heading: 'Online Dispute Resolution Support',
        blocks: [
          {
            type: 'p',
            text: 'Fallouts are not uncommon among business associates or partners, but how these conflicts are managed and resolved is essential in maintaining a healthy and functional balance in the workplace. Unresolved disputes could inadvertently bring about a lot of chaos and internal unrest, eventually leading to a decline in work output and a mentally unstable environment. Inter-organizational conflict can also break out, involving disputes between two or more organizations - very possible as companies in the same industry are always competing against one another. Once these competitions start becoming bitter, they will likely result in a conflict.',
          },
        ],
      },
      {
        heading: 'Some causes of conflict amongst business enterprises include:',
        blocks: [
          {
            type: 'list',
            layout: 'stack',
            items: [
              'Competition for customers is one of the common causes of inter-organization conflict. While this competition can be healthy and professional, it can lead to conflict, especially when companies start spreading negative rumors to lure customers away from rival companies.',
              'When many organizations work together on specific projects, conflicts will likely break out.',
              'Business negotiation between two rival companies can lead to conflict, especially when it is difficult to reach an agreement.',
              'Competition for employees between rival companies can also result in inter-organizational conflict.',
            ],
          },
          {
            type: 'p',
            text: 'It is therefore essential that disputes are resolved as soon as they occur.',
          },
        ],
      },
      {
        heading: 'A Better Understanding Of Financial Dispute Resolution',
        blocks: [
          {
            type: 'p',
            text: 'Financial dispute resolution refers to all processes geared toward addressing disputes. It includes all dispute resolution methods and approaches, from negotiation to reconciliation. Left unresolved, a dispute could be damaging to any brand. Investment dispute resolution could take place in many forms, namely:',
          },
          {
            type: 'list',
            layout: 'stack',
            items: [
              'The parties involved in the dispute could resolve it themselves. This has often proved ineffective as both parties are keen on protecting their interests and never seem to arrive at a mutual agreement.',
              'Agreeing to involve a third party to serve as a mediator, which could be a government mediation service, tribunal, or ombudsman.',
              'A private body that provides adequate financial services for dispute resolution could also be invited.',
            ],
          },
        ],
      },
      {
        heading: 'How Is This Even Possible? What Techniques Are Applied?',
        blocks: [
          {
            type: 'p',
            text: 'In order to execute these tasks, Cyberclaims specialize in tracing the following types of information that would be of great help to the investigating unit:',
          },
          {
            type: 'defs',
            items: [
              {
                id: 'cluster-analysis',
                term: 'Cluster Analysis',
                text: 'Cluster analysis is a method that aims to deanonymize blockchain data, linking together different wallets belonging to the same user. This also enables one to determine whether any of the linked addresses have a UTXO.',
              },
              {
                id: 'attribution-data',
                term: 'Attribution Data',
                text: 'This will aid the investigation processes by analyzing ownership attribution information for numerous accounts, also with the aim of deanonymizing blockchain addresses.',
              },
              {
                id: 'subpoena',
                term: 'Subpoena Targets',
                text: 'Through this, all cryptocurrency companies that comply with Anti-Money Laundering (AML) and Know Your Customer (KYC) regulations can get identifying information for their customers who own wallet addresses.',
              },
            ],
          },
        ],
      },
      {
        heading: 'Why Is Financial Dispute Resolution Important?',
        blocks: [
          {
            type: 'p',
            text: 'Unresolved disputes and substandard resolution of disputes are socially and financially costly. The adverse effects of disputes on individuals, communities, organizations, and the economy are considerably overwhelming - the direct cost of employment disputes alone has been estimated at $440 million per annum. With Cyberclaims financial dispute resolution service, you can effectively manage and resolve your disputes without incurring additional costs.',
          },
        ],
      },
      {
        heading: 'Why You Should Choose Cyberclaims',
        blocks: [
          {
            type: 'p',
            text: 'Cyberclaims’ ways of dealing with disputes constantly evolve in response to various industry changes. Instead of the usual traditional court-based resolution, we offer quicker and more effective alternatives that shield your brand from the numerous damages of an unresolved dispute. Our more intensive approaches provide a more flexible and less formal process, and your brand is assured of privacy and confidentiality which the court does not guarantee. Our areas of expertise are as widespread as:',
          },
          {
            type: 'list',
            cols: 2,
            items: [
              'Consumer protection',
              'Property and building (management and maintenance)',
              'Occupation regulation',
              'Human rights, and more',
            ],
          },
          {
            type: 'p',
            text: 'It is essential that your brand or enterprise is backed up by efficient financial dispute resolution support like that provided by Cyberclaims. This would curb expenses on unsolicited lawsuits and potential damages to your brand’s reputation.',
          },
        ],
      },
    ],
  },

  '/consultancy-documentation-support/': {
    eyebrow: 'Consultancy and Documentation Support',
    intro: [
      'Employing the services of a consultant firm without proper documentation support is a costly mistake. We pair expert consultancy with the paperwork that makes every decision easy to implement and defend.',
    ],
    sections: [
      {
        heading: 'An Introduction to Consultation Services',
        blocks: [
          {
            type: 'p',
            text: 'Consultancy is a process whereby a company invites a third party to provide expert labor in exchange for a fee. Some of the specialized services provided by our consulting team include:',
          },
          {
            type: 'list',
            items: [
              'Chargeback Consultation',
              'Technical Translation',
              'Evaluation and Initial Consulting Services',
              'Application Processing',
              'Financial Ombudsman Application',
              'Compilation and Case Preparation',
            ],
          },
        ],
      },
      {
        heading: 'How Is This Even Possible? What Techniques Are Applied?',
        blocks: [
          {
            type: 'p',
            text: 'In order to execute these tasks, Cyberclaims specialize in tracing the following types of information that would be of great help to the investigating unit:',
          },
          {
            type: 'defs',
            items: [
              {
                id: 'cluster-analysis',
                term: 'Cluster Analysis',
                text: 'Cluster analysis is a method that aims to deanonymize blockchain data, linking together different wallets belonging to the same user. This also enables one to determine whether any of the linked addresses have a UTXO.',
              },
              {
                id: 'attribution-data',
                term: 'Attribution Data',
                text: 'This will aid the investigation processes by analyzing ownership attribution information for numerous accounts, also with the aim of deanonymizing blockchain addresses.',
              },
              {
                id: 'subpoena',
                term: 'Subpoena Targets',
                text: 'Through this, all cryptocurrency companies that comply with Anti-Money Laundering (AML) and Know Your Customer (KYC) regulations can get identifying information for their customers who own wallet addresses.',
              },
            ],
          },
        ],
      },
      {
        heading: 'Documentation Support and Consulting Services',
        blocks: [
          {
            type: 'p',
            text: 'Documentation involves the paperwork that a consulting firm must leave behind once they are done rendering their services, such as:',
          },
          {
            type: 'list',
            items: [
              'Contractor Agreement',
              'Privacy Policy',
              'Employment Agreement',
              'Services Agreement',
              'Shareholders’ agreement',
            ],
          },
          {
            type: 'p',
            text: 'Some benefits of hiring a firm with good documentation support:',
          },
          {
            type: 'list',
            items: [
              'Guarantees easy implementation of decisions taken during and after consultation',
              'Captures all decisions taken during consultation in an easily accessible form',
              'New members and workers can quickly adapt with a suitable documentation format',
            ],
          },
        ],
      },
      {
        heading:
          'Why Cyberclaims is the best for your Consulting Services and Documentation Support',
        blocks: [
          {
            type: 'p',
            text: 'Our team of highly-trained staff is always committed to identifying our customers’ problems, conducting deep research, and finally coming up with the best solutions. At Cyberclaims, our customers enjoy:',
          },
          {
            type: 'list',
            items: [
              'Expert service delivery from our team of experienced experts',
              'Solutions that are easy to implement within a short time frame',
              'A relationship built on trust and honesty with our numerous customers',
            ],
          },
        ],
      },
    ],
  },

  '/due-diligence-investigations/': {
    eyebrow: 'Verify before you commit',
    intro: [
      'Many people prefer to acquire or partner with an already established business enterprise because they think it is cost-effective. A proper due diligence investigation protects you from venturing into the wrong deal.',
    ],
    sections: [
      {
        heading: 'What are these due diligence investigations?',
        blocks: [
          {
            type: 'p',
            text: 'These are investigations carried out to examine every potential financial and legal risk about a company’s assets. This is done to ensure that any form of investment is beneficial to the investors. A proper due diligence investigation procedure can protect you from venturing into the wrong business venture - which is why you need to hire the best due diligence investigators for your procedure. Areas we cover include:',
          },
          {
            type: 'list',
            items: [
              'Information Technology capabilities',
              'Business sustainability',
              'Environmental considerations',
              'Financial information',
              'Legal reviews',
              'Company’s existing customers and partnership relations',
            ],
          },
        ],
      },
      {
        heading: 'How Is This Even Possible? What Techniques Are Applied?',
        blocks: [
          {
            type: 'p',
            text: 'In order to execute these tasks, Cyberclaims specialize in tracing the following types of information that would be of great help to the investigating unit:',
          },
          {
            type: 'defs',
            items: [
              {
                id: 'cluster-analysis',
                term: 'Cluster Analysis',
                text: 'Cluster analysis is a method that aims to deanonymize blockchain data, linking together different wallets belonging to the same user. This also enables one to determine whether any of the linked addresses have a UTXO.',
              },
              {
                id: 'attribution-data',
                term: 'Attribution Data',
                text: 'This will aid the investigation processes by analyzing ownership attribution information for numerous accounts, also with the aim of deanonymizing blockchain addresses.',
              },
              {
                id: 'subpoena',
                term: 'Subpoena Targets',
                text: 'Through this, all cryptocurrency companies that comply with Anti-Money Laundering (AML) and Know Your Customer (KYC) regulations can get identifying information for their customers who own wallet addresses.',
              },
            ],
          },
        ],
      },
      {
        heading: '6 vital pieces of information from due diligence investigations',
        blocks: [
          {
            type: 'defs',
            items: [
              {
                term: 'Company’s Information',
                text: 'Important company information that helps you make an informed decision about purchasing - company owners, shareholders, employee benefits, bylaws and more.',
              },
              {
                term: 'Product and Services',
                text: 'Information about the company’s current and future products and services and how they compare to the company’s competitors.',
              },
              {
                term: 'Customers’ Information',
                text: 'Very important, as it helps you know the capability of the company’s customer base.',
              },
              {
                term: 'Physical, Technology & IP Assets',
                text: 'You get to know if the company owns any of these assets and how they would be utilized to your advantage.',
              },
              {
                term: 'Legal Issues',
                text: 'Laws and regulations that apply to the company and its industry, insurance policies, litigation history, license of operation, and more.',
              },
              {
                term: 'Finances',
                text: 'Financial standings of the company such as gross profit margin, debt, future capital expenditure, and so on.',
              },
            ],
          },
        ],
      },
      {
        heading: 'Why is due diligence necessary for entrepreneurs?',
        blocks: [
          {
            type: 'p',
            text: 'From a seller’s perspective, due diligence investigations help the seller know more about their company’s financial information, so they can decipher the actual market value of the company that is about to be sold and make maximum profit from the sale.',
          },
          {
            type: 'p',
            text: 'From the buyer’s perspective, due diligence investigations help them understand what they stand to gain or lose after a potential purchase. It gives them full confidence that they are moving in the right direction and have all the information needed to make the best purchasing decisions.',
          },
        ],
      },
      {
        heading:
          'Why we are the best fit for your due diligence investigation procedures',
        blocks: [
          {
            type: 'p',
            text: 'When conducting due diligence investigations on a target business, our primary aim has always been to assess its affairs before making any final decision. At Cyberclaims, we go the extra mile to ensure that you make the best decisions when you consider acquiring or partnering with an already established company. How we operate to achieve the desired result involves:',
          },
          {
            type: 'list',
            items: [
              'Gathering and organizing an easily accessible data structure.',
              'Reviewing the target company’s business practices and structures.',
              'Sizing up the target company’s major competitors.',
              'Analyzing the management and shareowners of the target company.',
              'Informing our customers of what they should expect from such an acquisition.',
              'Examining long and short-term risks.',
            ],
          },
        ],
      },
    ],
  },

  '/social-media-investigation/': {
    eyebrow: 'Defend Your Reputation: Expert Social Media Investigation',
    intro: [
      'Track, analyse and document social-media activity tied to fraud, impersonation and brand abuse - so you can uncover the truth and hold offenders accountable.',
    ],
    sections: [
      {
        heading:
          'Social media has become a breeding ground for cyberbullying, harassment and defamation',
        blocks: [
          {
            type: 'p',
            text: 'Social media platforms have become a breeding ground for cyberbullying, harassment, and defamation. While these platforms can connect us with others, they also leave individuals vulnerable to harmful content and online attacks. If you’re facing online harassment or defamation, we can help you uncover the truth and hold offenders accountable.',
          },
        ],
      },
      {
        heading: 'Protect Your Reputation: Social Media Investigation Services',
        blocks: [
          {
            type: 'p',
            text: 'Cyberclaims offers professional social media investigation services aimed at helping individuals, organizations, and legal teams deal with online harassment, defamation, and cyberbullying. We use state-of-the-art tools and techniques to trace malicious activities and provide critical evidence for legal actions - from identifying the source of defamatory posts to tracking down online harassers.',
          },
          {
            type: 'defs',
            layout: 'cards',
            cols: 2,
            items: [
              {
                term: 'Individuals',
                text: 'Protect your personal brand and well-being.',
              },
              {
                term: 'Law Firms',
                text: 'Provide critical digital evidence for cases.',
              },
              {
                term: 'Organizations',
                text: 'Safeguard your corporate image from online attacks.',
              },
            ],
          },
        ],
      },
      {
        heading: 'How Is This Even Possible? What Techniques Are Applied?',
        blocks: [
          {
            type: 'p',
            text: 'To effectively uncover the perpetrators behind online defamation and harassment, we employ advanced investigative techniques such as:',
          },
          {
            type: 'list',
            items: [
              'Profile Attribution',
              'Linguistic Analysis',
              'Digital Footprint Tracking',
              'Cluster Analysis',
              'Attribution Data',
              'Subpoena Targets',
            ],
          },
        ],
      },
    ],
  },

  '/business-services/': {
    eyebrow: 'Business Services Organization',
    intro: [
      'The business industry remains one of the most competitive industries in our modern world. We help enterprises run smarter - introducing them to blockchain technology and boosting their earning potential.',
    ],
    sections: [
      {
        heading: 'What are these business services, and what do they aim to achieve?',
        blocks: [
          {
            type: 'p',
            text: 'These are activities or various tasks that help assist and improve the running of a business enterprise without supplying any tangible or physical product. These services are characterized by being:',
          },
          {
            type: 'list',
            grid: '1.9fr 1fr',
            items: [
              'Customer-involved',
              'Intangible - the services cannot be stocked just like everyday goods',
              'Inconsistent - they don’t have any schedule and are delivered on-demand',
              'Inseparable - production and consumption occur simultaneously',
            ],
          },
          {
            type: 'p',
            text: 'Different types of business services include:',
          },
          {
            type: 'list',
            items: [
              'Consultancy services',
              'Financial services',
              'Travel services',
              'Marketing services',
              'Software services',
              'Training services, and more',
            ],
          },
        ],
      },
      {
        heading: 'Significance of Business Services',
        blocks: [
          {
            type: 'p',
            text: 'A good business service provider serves the following purposes:',
          },
          {
            type: 'list',
            layout: 'stack',
            items: [
              'Promoting and spreading your business products and services to more extensive areas.',
              'Increasing your potential to earn.',
              'Keeping you ahead of your major competitors in the business industry.',
              'Helping you achieve more with little effort and stress.',
              'Discharging their duties effectively from anywhere - no physical space required in your enterprise.',
              'Helping your enterprise efficiently attend to a vast customer base within the shortest possible period.',
            ],
          },
        ],
      },
      {
        heading: 'How Is This Even Possible? What Techniques Are Applied?',
        blocks: [
          {
            type: 'p',
            text: 'In order to execute these tasks, Cyberclaims specialize in tracing the following types of information that would be of great help to the investigating unit:',
          },
          {
            type: 'defs',
            items: [
              {
                id: 'cluster-analysis',
                term: 'Cluster Analysis',
                text: 'Cluster analysis is a method that aims to deanonymize blockchain data, linking together different wallets belonging to the same user. This also enables one to determine whether any of the linked addresses have a UTXO.',
              },
              {
                id: 'attribution-data',
                term: 'Attribution Data',
                text: 'This will aid the investigation processes by analyzing ownership attribution information for numerous accounts, also with the aim of deanonymizing blockchain addresses.',
              },
              {
                id: 'subpoena',
                term: 'Subpoena Targets',
                text: 'Through this, all cryptocurrency companies that comply with Anti-Money Laundering (AML) and Know Your Customer (KYC) regulations can get identifying information for their customers who own wallet addresses.',
              },
            ],
          },
        ],
      },
      {
        heading: 'Cyberclaims Business Services',
        blocks: [
          {
            type: 'p',
            text: 'At Cyberclaims, our team of experienced workers properly guides and monitors businesses to be introduced to blockchain technology, increasing earning potential and solving complex blockchain problems. Understanding our customers’ plight is never a problem - our customers always enjoy the best business services with proven positive results, at a highly affordable fee and a quick implementation time.',
          },
          {
            type: 'p',
            text: 'One of the critical factors in the business industry is trust. Our team of experts is dedicated to building a high level of trust with our customers. We go all out to ensure you benefit from modern tools and business strategies that will help propel your business to a higher level.',
          },
          {
            type: 'p',
            text: 'Cyberclaims have come to stay, and we are always readily available to propel your business to the next level. Contact us at Cyberclaims today and watch your business boom more than ever before.',
          },
        ],
      },
    ],
  },
};
