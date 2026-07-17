// Conversion landing pages for Google Ads traffic.
//
// These recreate the old WordPress PPC pages (…/recover-your-lost-digital-funds-…) on
// the new site: a focused hero with the full lead form, the "how it works" techniques,
// an expert-recovery section, then the shared testimonials / latest-news / CTA. They
// live at their ORIGINAL root slugs so the ad campaigns keep landing on the same URLs.
//
// Content is verbatim from the live pages (structure homogenised across the English
// variants, which differed only by country wording). The forms map 1:1 to the site's
// lead pipeline (/api/lead, source 'landing').

import type { Locale } from '../i18n/config';

export interface LandingTechnique {
  title: string;
  body: string;
}
export interface LandingForm {
  heading: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  platformName: string;
  platformWebsite: string;
  firstTx: string;
  lastTx: string;
  submit: string;
  legal: string;
  successTitle: string;
  successBody: string;
}
export interface LandingConfig {
  slug: string;
  locale: Locale;
  htmlLang: string;
  title: string;
  metaDescription: string;
  eyebrow: string;
  h1: string;
  introHeading: string;
  introBody: string;
  techHeading: string;
  techniques: LandingTechnique[];
  recoveryHeading: string;
  recoveryBody: string[];
  audienceIntro: string;
  audience: string[];
  tracedHeading: string;
  traced: string[];
  form: LandingForm;
}

const FORM_EN: LandingForm = {
  heading: 'Please fill the form below to start the fund-recovery process',
  fullName: 'Full Name',
  email: 'Email',
  phone: 'Phone',
  country: 'Country of Residence',
  platformName: 'Platform Name',
  platformWebsite: 'Platform Website',
  firstTx: 'Date of First Transaction',
  lastTx: 'Date of Last Transaction',
  submit: 'Start Fund Recovery',
  legal: 'Protected by CAPTCHA. Your details are confidential and reviewed by certified experts.',
  successTitle: 'We have your details',
  successBody:
    'A certified investigator will review your case and respond within 48 hours. Everything you sent us is confidential.',
};

const TECH_EN: LandingTechnique[] = [
  {
    title: 'Cluster Analysis',
    body: 'Cluster analysis is a method that aims to deanonymize blockchain data, linking together different wallets belonging to the same user. This also enables one to determine whether any of the linked addresses have a UTXO.',
  },
  {
    title: 'Attribution Data',
    body: 'Attribution analysis supports the investigation by analyzing ownership attribution across multiple accounts, helping to deanonymize blockchain addresses and trace the connections between them.',
  },
  {
    title: 'KYC Information Requests',
    body: 'KYC Information Requests allow us to obtain information through requests made to companies that comply with Anti-Money Laundering (AML) and Know Your Customer (KYC) regulations.',
  },
  {
    title: 'Subpoena Targets',
    body: 'Through this, all cryptocurrency companies that comply with Anti-Money Laundering (AML) and Know Your Customer (KYC) regulations can be compelled to provide identifying information for the customers who own specific wallet addresses.',
  },
];

const TRACED_EN = ['Transaction mapping', 'IP Address', 'Total transaction volume'];

// Builds an English landing config. `place` is "" for the country-agnostic page.
function enLanding(o: {
  slug: string;
  title: string;
  metaDescription: string;
  place: string; // "in Australia" / ""
  placeName: string; // "Australia" / ""
  demonym: string; // "Australians" / "victims"
  lawAdj: string; // "Australian" / "international"
  audience: string[];
}): LandingConfig {
  const inPlace = o.place ? ` ${o.place}` : '';
  return {
    slug: o.slug,
    locale: 'en',
    htmlLang: 'en',
    title: o.title,
    metaDescription: o.metaDescription,
    eyebrow: 'Free case review · 48-hour response',
    h1: `Recover Lost Digital Funds${inPlace}`,
    introHeading: `Scam recovery service${inPlace}`,
    introBody: `Falling victim to a scam can be devastating, but you're not alone. At CyberClaims, we provide trusted scam recovery services${
      o.placeName ? ` across ${o.placeName}` : ''
    }, helping ${o.demonym} recover lost digital funds with expert care and proven strategies. Our team guides you through the recovery process step by step, ensuring the best possible outcome. Act fast for the best chance of recovery — time is critical when it comes to reclaiming lost assets. Reclaim your peace of mind and let us help you recover what's rightfully yours.`,
    techHeading: 'How is this even possible? What techniques are applied?',
    techniques: TECH_EN,
    recoveryHeading: 'Get Back Your Funds: Expert Recovery Services',
    recoveryBody: [
      `Our professional cryptocurrency recovery service is dedicated to helping ${o.demonym} recover assets lost to online hacking, theft, fraud, and other cyber-extortion schemes. We meticulously trace transactions on the blockchain to bring you peace of mind.`,
      'Using advanced technology powered by QLUE — a leading cryptocurrency intelligence and blockchain analytics platform — we provide detailed insights into cryptocurrency tracking while evaluating money-laundering risks across virtual asset services.',
    ],
    audienceIntro: `With a team of certified investigators familiar with ${o.lawAdj} laws and regulations, we deliver top-tier cryptocurrency recovery services tailored to:`,
    audience: o.audience,
    tracedHeading:
      'Other types of information traced by CyberClaims that can help hasten the investigation include:',
    traced: TRACED_EN,
    form: FORM_EN,
  };
}

export const LANDING_PAGES: LandingConfig[] = [
  enLanding({
    slug: 'recover-your-lost-digital-funds-scam-recovery-services',
    title: 'Recover Your Lost Digital Funds | Scam Recovery Services - Cyberclaims',
    metaDescription:
      'CyberClaims helps recover lost digital funds. Submit your claim today and let our experts assist you in reclaiming what’s yours.',
    place: '',
    placeName: '',
    demonym: 'victims',
    lawAdj: 'international',
    audience: ['Law Firms', 'Digital Asset Investors', 'Victims of Cyber Fraud'],
  }),
  enLanding({
    slug: 'recover-your-lost-digital-funds-in-australia-scam-recovery-services',
    title: 'Recover Your Lost Digital Funds in Australia | Scam Recovery Services - Cyberclaims',
    metaDescription:
      'CyberClaims helps recover lost digital funds in Australia. Submit your claim today and let our experts assist you in reclaiming what’s yours.',
    place: 'in Australia',
    placeName: 'Australia',
    demonym: 'Australians',
    lawAdj: 'Australian',
    audience: ['Australian Law Firms', 'Digital Asset Investors in Australia', 'Victims of Cyber Fraud in Australia'],
  }),
  enLanding({
    slug: 'recover-your-lost-digital-funds-in-canada-scam-recovery-services',
    title: 'Best Scam Recovery Services in Canada | Recover Funds - Cyberclaims',
    metaDescription:
      'CyberClaims helps recover lost digital funds in Canada. Submit your claim today and let our certified experts help you reclaim what’s yours.',
    place: 'in Canada',
    placeName: 'Canada',
    demonym: 'individuals and organizations in Canada',
    lawAdj: 'Canadian',
    audience: ['Canadian Law Firms', 'Digital Asset Investors in Canada', 'Victims of Cyber Fraud in Canada'],
  }),
  enLanding({
    slug: 'recover-your-lost-digital-funds-in-the-usa-scam-recovery-services',
    title: 'Recover Your Lost Digital Funds in the USA | Scam Recovery Services - Cyberclaims',
    metaDescription:
      'CyberClaims helps recover lost digital funds in the United States. Submit your claim today and let our experts assist you in reclaiming what’s yours.',
    place: 'in the USA',
    placeName: 'the United States',
    demonym: 'Americans',
    lawAdj: 'U.S.',
    audience: ['U.S. Law Firms', 'Digital Asset Investors in the United States', 'Victims of Cyber Fraud in the United States'],
  }),
  // Italian PPC page, at its original root slug /truffa-recupero/.
  {
    slug: 'truffa-recupero',
    locale: 'it',
    htmlLang: 'it',
    title: 'Recupera i Tuoi Fondi Digitali Persi in Italia | Recupero Truffe - Cyberclaims',
    metaDescription:
      'CyberClaims aiuta a recuperare fondi digitali persi in Italia. Invia la tua richiesta oggi e lascia che i nostri esperti ti aiutino a riavere ciò che ti spetta.',
    eyebrow: 'Analisi del caso gratuita · risposta in 48 ore',
    h1: 'Recupera Fondi Digitali Persi in Italia',
    introHeading: 'Servizio di recupero truffe in Italia',
    introBody:
      "Cadere vittima di una truffa può essere devastante, ma non sei solo. Presso CyberClaims offriamo servizi di recupero truffe affidabili in tutta Italia, aiutando le persone a recuperare i fondi digitali persi con attenzione esperta e strategie comprovate. Il nostro team ti guida passo dopo passo nel processo di recupero, garantendo il miglior risultato possibile. Agisci rapidamente per avere le migliori possibilità di recupero: il tempo è fondamentale quando si tratta di recuperare beni persi. Riconquista la tua tranquillità e lascia che ti aiutiamo a recuperare ciò che ti spetta di diritto.",
    techHeading: 'Come è possibile tutto questo? Quali tecniche vengono applicate?',
    techniques: [
      {
        title: 'Analisi dei Cluster',
        body: "L'analisi dei cluster è un metodo che mira a de-anonimizzare i dati della blockchain, collegando tra loro diversi wallet appartenenti allo stesso utente. Permette inoltre di determinare se uno degli indirizzi collegati possiede un UTXO.",
      },
      {
        title: 'Dati di Attribuzione',
        body: "L'analisi dell'attribuzione supporta l'indagine analizzando l'attribuzione della proprietà tra più account, aiutando a de-anonimizzare gli indirizzi blockchain e a tracciare le connessioni tra di essi.",
      },
      {
        title: 'Richieste di Informazioni KYC',
        body: 'Le richieste di informazioni KYC ci consentono di ottenere dati tramite richieste fatte alle aziende che rispettano le normative Antiriciclaggio (AML) e "Conosci il Tuo Cliente" (KYC).',
      },
      {
        title: 'Destinatari di Citazioni',
        body: "Attraverso questo, tutte le società di criptovalute che rispettano le normative AML e KYC possono essere obbligate a fornire le informazioni identificative dei clienti che possiedono determinati indirizzi wallet.",
      },
    ],
    recoveryHeading: 'Recupera i Tuoi Fondi: Servizi di Recupero Esperti',
    recoveryBody: [
      "Il nostro servizio professionale di recupero criptovalute è dedicato ad aiutare i clienti italiani a recuperare i beni persi a causa di hacking, furti, frodi e altre truffe informatiche. Tracciamo meticolosamente le transazioni sulla blockchain per offrirti tranquillità.",
      "Utilizzando una tecnologia avanzata basata su QLUE — una delle principali piattaforme di intelligence sulle criptovalute e analisi della blockchain — forniamo approfondimenti dettagliati sul tracciamento delle criptovalute, valutando al contempo i rischi di riciclaggio attraverso i servizi di asset virtuali.",
    ],
    audienceIntro:
      'Con un team di investigatori certificati che conoscono le leggi e le normative italiane, offriamo servizi di recupero criptovalute di altissimo livello, pensati per:',
    audience: ['Studi legali italiani', 'Investitori in asset digitali in Italia', 'Vittime di frodi informatiche in Italia'],
    tracedHeading:
      'Altri tipi di informazioni tracciate da CyberClaims che possono accelerare le indagini includono:',
    traced: ['Mappatura delle transazioni', 'Indirizzo IP', 'Volume totale delle transazioni'],
    form: {
      heading: 'Compila il modulo qui sotto per avviare il processo di recupero fondi',
      fullName: 'Nome completo',
      email: 'Email',
      phone: 'Telefono',
      country: 'Paese di residenza',
      platformName: 'Nome della piattaforma',
      platformWebsite: 'Sito della piattaforma',
      firstTx: 'Data della prima transazione',
      lastTx: "Data dell'ultima transazione",
      submit: 'Avvia il recupero fondi',
      legal: 'Protetto da CAPTCHA. I tuoi dati sono riservati e revisionati da esperti certificati.',
      successTitle: 'Abbiamo ricevuto i tuoi dati',
      successBody:
        'Un investigatore certificato esaminerà il tuo caso e risponderà entro 48 ore. Tutto ciò che ci invii è riservato.',
    },
  },
];

export const LANDING_SLUGS = LANDING_PAGES.map((p) => p.slug);
