// Copy for the "is this phone number a scam?" landing pages.
//
// These are SEO funnels, one per locale, targeting scam-heavy search markets. The copy
// lives here (prose belongs in a data file, not the flat UIKey dictionary) and is keyed
// by every site locale — en, nl, de, it, es, pt, fr. The `language` we send to ScamInfo
// mirrors the locale; note that fr is outside the partner API's documented language set,
// so a French request may come back in English until that's confirmed on their side.
//
// Deliberately, NO page states a risk verdict — the meta and on-page copy describe the
// free report, and the actual result is delivered only inside the downloaded PDF (GDPR:
// the sensitive assessment is not shown on, or stored by, the site).

export type PhoneCheckLocale = 'en' | 'nl' | 'de' | 'it' | 'es' | 'pt' | 'fr';

export const PHONE_CHECK_LOCALES: PhoneCheckLocale[] = ['en', 'nl', 'de', 'it', 'es', 'pt', 'fr'];

// Slugs of the country variants, so the sitemap and the reserved-slug guard can see them.
export const PHONE_CHECK_VARIANT_SLUGS = ['who-called-me-uk'];

export interface PhoneCheckStep {
  title: string;
  body: string;
}
export interface PhoneCheckFaq {
  q: string;
  a: string;
}
/** A free-text section on a country variant ("How to block spam calls", …). */
export interface PhoneCheckSection {
  heading: string;
  body: string;
}

export interface PhoneCheckContent {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  h1: string;
  subhead: string;
  countryLabel: string;
  numberLabel: string;
  numberPlaceholder: string;
  submit: string;
  loading: string;
  successTitle: string;
  successBody: string;
  again: string;
  errorGeneric: string;
  errorTimeout: string;
  errorInvalid: string;
  privacyNote: string;
  howTitle: string;
  steps: PhoneCheckStep[];
  trustTitle: string;
  trustItems: string[];
  faqTitle: string;
  faqs: PhoneCheckFaq[];
  disclaimer: string;

  // ── country-variant extras (optional; the generic /phone-check/ pages omit them) ──
  /** The "How can CyberClaims check phone numbers in <country>?" block, under the tool. */
  countrySection?: PhoneCheckSection;
  /** Extra prose blocks after the FAQ (blocking spam calls, what to do if scammed, …). */
  extraSections?: PhoneCheckSection[];
  /** Render the "Speak With an Investigator" case form at the foot of the page. */
  showInvestigator?: boolean;
}

/**
 * A country landing variant of the phone checker. Same page template, own URL + copy -
 * adding another country is a data entry here, not a new page.
 */
export interface PhoneCheckVariant extends PhoneCheckContent {
  /** Root slug, e.g. 'who-called-me-uk'. */
  slug: string;
  /** ISO of the country preselected in the tool's dropdown. */
  defaultIso: string;
  /** Report language sent to ScamInfo. */
  reportLocale: PhoneCheckLocale;
}

// Country dial codes for the selector. Locale-independent; names are in English to keep
// the list to one copy. Ordered by the markets these pages target, then majors.
export interface DialCountry {
  name: string;
  iso: string;
  dial: string;
}
export const DIAL_COUNTRIES: DialCountry[] = [
  { name: 'United Kingdom', iso: 'GB', dial: '44' },
  { name: 'Netherlands', iso: 'NL', dial: '31' },
  { name: 'Germany', iso: 'DE', dial: '49' },
  { name: 'Italy', iso: 'IT', dial: '39' },
  { name: 'Spain', iso: 'ES', dial: '34' },
  { name: 'Portugal', iso: 'PT', dial: '351' },
  { name: 'Ireland', iso: 'IE', dial: '353' },
  { name: 'France', iso: 'FR', dial: '33' },
  { name: 'Belgium', iso: 'BE', dial: '32' },
  { name: 'Austria', iso: 'AT', dial: '43' },
  { name: 'Switzerland', iso: 'CH', dial: '41' },
  { name: 'Luxembourg', iso: 'LU', dial: '352' },
  { name: 'Poland', iso: 'PL', dial: '48' },
  { name: 'Sweden', iso: 'SE', dial: '46' },
  { name: 'Norway', iso: 'NO', dial: '47' },
  { name: 'Denmark', iso: 'DK', dial: '45' },
  { name: 'Finland', iso: 'FI', dial: '358' },
  { name: 'United States', iso: 'US', dial: '1' },
  { name: 'Canada', iso: 'CA', dial: '1' },
  { name: 'Brazil', iso: 'BR', dial: '55' },
  { name: 'Mexico', iso: 'MX', dial: '52' },
  { name: 'Argentina', iso: 'AR', dial: '54' },
  { name: 'Colombia', iso: 'CO', dial: '57' },
  { name: 'Australia', iso: 'AU', dial: '61' },
  { name: 'United Arab Emirates', iso: 'AE', dial: '971' },
  { name: 'South Africa', iso: 'ZA', dial: '27' },
  { name: 'India', iso: 'IN', dial: '91' },
];

// ── Country variants ────────────────────────────────────────────────────────
// Same page template as /phone-check/, own URL + country-specific SEO copy. To add
// another country, copy this object, swap the copy, and add its slug above.
export const PHONE_CHECK_VARIANTS: PhoneCheckVariant[] = [
  {
    slug: 'who-called-me-uk',
    defaultIso: 'GB',
    reportLocale: 'en',
    metaTitle: 'Who called me UK | Phone number lookup | Cyberclaims',
    metaDescription:
      'Received a call you don’t recognise? Look up any UK phone number and download a full safety report as a PDF. Free, and nothing is stored.',
    eyebrow: 'Free UK phone number lookup',
    h1: 'Who called me - check any phone number directly',
    subhead:
      'Received a call from a phone number you do not recognize? Check any phone number and get a full safety report to find out who called you. Download the report as a pdf, no information will be stored.',
    countryLabel: 'Country',
    numberLabel: 'Phone number',
    numberPlaceholder: 'e.g. 20 7946 0958',
    submit: 'Get free safety report',
    loading: 'Generating your report… this can take up to a minute.',
    successTitle: 'Your report is ready',
    successBody: 'Your PDF has downloaded. Check your downloads folder if you don’t see it.',
    again: 'Check another number',
    errorGeneric: 'Something went wrong generating your report. Please try again in a moment.',
    errorTimeout: 'The report is taking longer than expected. Please try again.',
    errorInvalid: 'That doesn’t look like a valid phone number. Please check it and try again.',
    privacyNote:
      'We don’t store the number you check. The report is generated on demand and delivered only to you.',
    countrySection: {
      heading: 'How can Cyberclaims check phone numbers in the United Kingdom?',
      body: 'Every year 4.6 million people are affected by cyber crime and fraud in the United Kingdom, many of which are firstly contacted by phone. Our phone number lookup analyses the phone number pattern to identify the caller location, carrier details and device type. To lookup the caller’s identity we check the phone number against leak databases, fraud databases and we check social media and communication platforms such as Whatsapp and Telegram. Your results will be available for download as a pdf and will not be stored by us.',
    },
    howTitle: 'How it works',
    steps: [
      { title: 'Enter the number', body: 'Pick the country and type the phone number that contacted you.' },
      { title: 'We analyse it', body: 'We run live checks across fraud, reputation and exposure signals — usually in under a minute.' },
      { title: 'Download your PDF', body: 'You get a detailed, branded safety report to download and keep. Nothing is stored on our side.' },
    ],
    trustTitle: 'Why people trust CyberClaims',
    trustItems: [
      'Cybercrime victim support & recovery specialists',
      'Featured in 350+ news outlets',
      'Confidential — no account, no data kept',
      'Authorised private investigation agency (Dutch Ministry of Justice)',
    ],
    faqTitle: 'Frequently asked questions',
    faqs: [
      {
        q: 'What is a phone number lookup?',
        a: 'A phone number lookup tool combines public and private sources to identify phone number meta data, carrier details and associated services the phone number may have been used for in order to find the identity of the caller and provide a safety assessment.',
      },
      {
        q: 'Why should I check unknown phone numbers in the UK?',
        a: 'According to the BBC, 48% of landline users in the United Kingdom reported receiving a suspicious call in the previous three months. These calls can be anything from spam calls to calls with the intention to scam or defraud people. If you have received a phone call from an unknown number, it is a good idea to find out who is behind the call and to report the number.',
      },
      {
        q: 'If the caller knows information about me, does that mean that they are legitimate?',
        a: 'No! Scammers have various methods to obtain personal information of their victims in order to convince them that they represent legitimate companies. Do not fall for this. If you are in doubt it is always best to just hang up the call and call the company that the unknown caller was claiming to be from via its official number. You can also use our phone number lookup to double check the phone number.',
      },
      {
        q: 'How do I know if a phone call is a potential scam?',
        a: 'Scam callers often use disposable phone numbers via Voice over internet protocol (VOIP) services. Our phone number checker detects when phone numbers are VOIP calls which is a strong indication that the caller could be calling with malicious intent. Furthermore, we also check fraud and spam databases to see if the number has previously been reported.',
      },
      {
        q: 'How to check if a number is spam in the UK?',
        a: 'In 2024, the ICO received 44,404 complaints about nuisance calls in the United Kingdom. We check phone numbers for common markers of spam calling such as checking the carrier and device type and spam databases. It is important to check unknown numbers and to report them if the calls are unwanted.',
      },
      {
        q: 'How does Cyberclaims know who called me?',
        a: 'We check leak databases to see if the number and identity of the owner have ever been leaked. We also check social media and communication platforms such as Whatsapp and Telegram. These kinds of checks are your best bet in finding out the identity of the caller.',
      },
      {
        q: 'Where should I report suspicious phone numbers and scam calls in the UK?',
        a: 'A number of reporting guidelines are outlined by gov.uk. It is important to report scam calls immediately so that authorities have the best chance of investigating cases and protecting the public.',
      },
      {
        q: 'What do I do if a caller claims to be from my bank in the UK?',
        a: 'Call 159 if you are in the UK and you received a call claiming to be from your bank. 159 will connect you to a service representative of your bank.',
      },
      {
        q: 'How to get fewer spam calls in the United Kingdom?',
        a: 'You can register with the TPS to make sure that legitimate companies will no longer call you with sales inquiries.',
      },
    ],
    extraSections: [
      {
        heading: 'How to block spam calls',
        body: 'In the UK, you can block spam calls by registering your phone number with the TPS. This will make sure that legitimate companies will no longer call you with sales inquiries. If you are already registered with the TPS and still receive spam calls you can report the number with the TPS and they will forward your complaint to the ICO, who do have enforcement powers.',
      },
      {
        heading: 'What should I do if I am victim of a scam',
        body: 'If you are in the UK, we recommend you start with following the reporting guidelines from the UK government. If you have reported the scam with official bodies and you want extra guidance, you can always file a contact request with Cyberclaims and we will review your case in 48 hours.',
      },
    ],
    showInvestigator: true,
    disclaimer:
      'This report is provided for information only and is not a legal determination. If you believe you’ve been targeted or have lost money, contact our team.',
  },
];

export const PHONE_CHECK: Record<PhoneCheckLocale, PhoneCheckContent> = {
  en: {
    metaTitle: 'Free Phone Number Safety Report | CyberClaims',
    metaDescription:
      'Enter any phone number and get a free, detailed safety report as a downloadable PDF. Independent analysis from CyberClaims, cybercrime victim support & recovery specialists.',
    eyebrow: 'Free phone number check',
    h1: 'Is this phone number a scam? Get a free safety report',
    subhead:
      'Received a call or text you weren’t expecting? Enter the number below and we’ll generate a free, in-depth safety report you can download as a PDF — no account, nothing stored.',
    countryLabel: 'Country',
    numberLabel: 'Phone number',
    numberPlaceholder: 'e.g. 20 7946 0958',
    submit: 'Get free safety report',
    loading: 'Generating your report… this can take up to a minute.',
    successTitle: 'Your report is ready',
    successBody: 'Your PDF has downloaded. Check your downloads folder if you don’t see it.',
    again: 'Check another number',
    errorGeneric: 'Something went wrong generating your report. Please try again in a moment.',
    errorTimeout: 'The report is taking longer than expected. Please try again.',
    errorInvalid: 'That doesn’t look like a valid phone number. Please check it and try again.',
    privacyNote:
      'We don’t store the number you check. The report is generated on demand and delivered only to you.',
    howTitle: 'How it works',
    steps: [
      { title: 'Enter the number', body: 'Pick the country and type the phone number that contacted you.' },
      { title: 'We analyse it', body: 'We run live checks across fraud, reputation and exposure signals — usually in under a minute.' },
      { title: 'Download your PDF', body: 'You get a detailed, branded safety report to download and keep. Nothing is stored on our side.' },
    ],
    trustTitle: 'Why people trust CyberClaims',
    trustItems: [
      'Cybercrime victim support & recovery specialists',
      'Featured in 350+ news outlets',
      'Confidential — no account, no data kept',
      'Authorised private investigation agency (Dutch Ministry of Justice)',
    ],
    faqTitle: 'Frequently asked questions',
    faqs: [
      { q: 'Is the report really free?', a: 'Yes. The safety report is completely free and there’s no account to create.' },
      { q: 'What’s in the report?', a: 'A structured PDF summarising what’s publicly and technically known about the number, so you can decide how to respond.' },
      { q: 'Do you store the number I check?', a: 'No. The analysis is generated on demand and the number isn’t saved to our systems.' },
      { q: 'The number called me claiming to be my bank — what should I do?', a: 'Never share codes or move money because of an unexpected call. Run the report, and if you’ve already lost money, start a case with our recovery team.' },
    ],
    disclaimer:
      'This report is provided for information only and is not a legal determination. If you believe you’ve been targeted or have lost money, contact our team.',
  },

  nl: {
    metaTitle: 'Gratis veiligheidsrapport voor telefoonnummers | CyberClaims',
    metaDescription:
      'Voer een telefoonnummer in en ontvang een gratis, uitgebreid veiligheidsrapport als downloadbare PDF. Onafhankelijke analyse van CyberClaims, specialisten in slachtofferhulp en herstel bij cybercrime.',
    eyebrow: 'Gratis telefooncontrole',
    h1: 'Is dit telefoonnummer oplichting? Vraag een gratis veiligheidsrapport aan',
    subhead:
      'Een onverwacht telefoontje of sms’je gehad? Voer het nummer hieronder in en wij maken een gratis, uitgebreid veiligheidsrapport dat u als PDF kunt downloaden — geen account, niets opgeslagen.',
    countryLabel: 'Land',
    numberLabel: 'Telefoonnummer',
    numberPlaceholder: 'bijv. 6 12345678',
    submit: 'Gratis veiligheidsrapport',
    loading: 'Uw rapport wordt gemaakt… dit kan tot een minuut duren.',
    successTitle: 'Uw rapport is klaar',
    successBody: 'Uw PDF is gedownload. Kijk in uw downloadmap als u het niet ziet.',
    again: 'Ander nummer controleren',
    errorGeneric: 'Er ging iets mis bij het maken van uw rapport. Probeer het zo opnieuw.',
    errorTimeout: 'Het rapport duurt langer dan verwacht. Probeer het opnieuw.',
    errorInvalid: 'Dit lijkt geen geldig telefoonnummer. Controleer het en probeer het opnieuw.',
    privacyNote:
      'We slaan het gecontroleerde nummer niet op. Het rapport wordt op aanvraag gemaakt en alleen aan u geleverd.',
    howTitle: 'Hoe het werkt',
    steps: [
      { title: 'Voer het nummer in', body: 'Kies het land en typ het telefoonnummer dat contact met u opnam.' },
      { title: 'Wij analyseren het', body: 'We voeren live controles uit op fraude-, reputatie- en blootstellingssignalen — meestal binnen een minuut.' },
      { title: 'Download uw PDF', body: 'U ontvangt een gedetailleerd veiligheidsrapport om te downloaden en te bewaren. Wij bewaren niets.' },
    ],
    trustTitle: 'Waarom mensen CyberClaims vertrouwen',
    trustItems: [
      'Specialisten in slachtofferhulp en herstel bij cybercrime',
      'Te zien in 350+ nieuwsmedia',
      'Vertrouwelijk — geen account, geen gegevens bewaard',
      'Erkend particulier recherchebureau (Nederlands Ministerie van Justitie)',
    ],
    faqTitle: 'Veelgestelde vragen',
    faqs: [
      { q: 'Is het rapport echt gratis?', a: 'Ja. Het veiligheidsrapport is volledig gratis en u hoeft geen account aan te maken.' },
      { q: 'Wat staat er in het rapport?', a: 'Een overzichtelijke PDF met wat er publiek en technisch bekend is over het nummer, zodat u kunt beslissen hoe te reageren.' },
      { q: 'Slaan jullie het gecontroleerde nummer op?', a: 'Nee. De analyse wordt op aanvraag gemaakt en het nummer wordt niet in onze systemen bewaard.' },
      { q: 'Het nummer belde en beweerde mijn bank te zijn — wat moet ik doen?', a: 'Deel nooit codes en verplaats geen geld naar aanleiding van een onverwacht telefoontje. Maak het rapport, en als u al geld kwijt bent, start dan een dossier bij ons herstelteam.' },
    ],
    disclaimer:
      'Dit rapport is uitsluitend ter informatie en is geen juridisch oordeel. Denkt u dat u doelwit bent of hebt u geld verloren, neem dan contact op met ons team.',
  },

  de: {
    metaTitle: 'Kostenloser Sicherheitsbericht für Telefonnummern | CyberClaims',
    metaDescription:
      'Geben Sie eine Telefonnummer ein und erhalten Sie einen kostenlosen, ausführlichen Sicherheitsbericht als PDF zum Download. Unabhängige Analyse von CyberClaims, Spezialisten für Opferhilfe und Rückgewinnung bei Cyberkriminalität.',
    eyebrow: 'Kostenlose Telefonnummer-Prüfung',
    h1: 'Ist diese Telefonnummer Betrug? Kostenlosen Sicherheitsbericht anfordern',
    subhead:
      'Einen unerwarteten Anruf oder eine SMS erhalten? Geben Sie die Nummer unten ein, und wir erstellen einen kostenlosen, ausführlichen Sicherheitsbericht, den Sie als PDF herunterladen können — kein Konto, nichts gespeichert.',
    countryLabel: 'Land',
    numberLabel: 'Telefonnummer',
    numberPlaceholder: 'z. B. 151 23456789',
    submit: 'Kostenlosen Bericht erhalten',
    loading: 'Ihr Bericht wird erstellt… das kann bis zu einer Minute dauern.',
    successTitle: 'Ihr Bericht ist fertig',
    successBody: 'Ihr PDF wurde heruntergeladen. Sehen Sie im Download-Ordner nach, falls es nicht erscheint.',
    again: 'Weitere Nummer prüfen',
    errorGeneric: 'Beim Erstellen Ihres Berichts ist etwas schiefgelaufen. Bitte versuchen Sie es gleich erneut.',
    errorTimeout: 'Der Bericht dauert länger als erwartet. Bitte versuchen Sie es erneut.',
    errorInvalid: 'Das sieht nicht nach einer gültigen Telefonnummer aus. Bitte prüfen Sie sie und versuchen Sie es erneut.',
    privacyNote:
      'Wir speichern die geprüfte Nummer nicht. Der Bericht wird auf Anfrage erstellt und nur an Sie ausgeliefert.',
    howTitle: 'So funktioniert es',
    steps: [
      { title: 'Nummer eingeben', body: 'Wählen Sie das Land und geben Sie die Telefonnummer ein, die Sie kontaktiert hat.' },
      { title: 'Wir analysieren sie', body: 'Wir führen Live-Prüfungen zu Betrugs-, Reputations- und Exposure-Signalen durch — meist in unter einer Minute.' },
      { title: 'PDF herunterladen', body: 'Sie erhalten einen ausführlichen Sicherheitsbericht zum Herunterladen und Behalten. Bei uns wird nichts gespeichert.' },
    ],
    trustTitle: 'Warum Menschen CyberClaims vertrauen',
    trustItems: [
      'Spezialisten für Opferhilfe und Rückgewinnung bei Cyberkriminalität',
      'In über 350 Nachrichtenportalen vorgestellt',
      'Vertraulich — kein Konto, keine gespeicherten Daten',
      'Zugelassene Detektei (niederländisches Justizministerium)',
    ],
    faqTitle: 'Häufig gestellte Fragen',
    faqs: [
      { q: 'Ist der Bericht wirklich kostenlos?', a: 'Ja. Der Sicherheitsbericht ist völlig kostenlos, und es muss kein Konto erstellt werden.' },
      { q: 'Was steht im Bericht?', a: 'Ein strukturiertes PDF, das zusammenfasst, was öffentlich und technisch über die Nummer bekannt ist, damit Sie entscheiden können, wie Sie reagieren.' },
      { q: 'Speichern Sie die geprüfte Nummer?', a: 'Nein. Die Analyse wird auf Anfrage erstellt, und die Nummer wird nicht in unseren Systemen gespeichert.' },
      { q: 'Die Nummer rief an und gab sich als meine Bank aus — was soll ich tun?', a: 'Geben Sie wegen eines unerwarteten Anrufs niemals Codes weiter und überweisen Sie kein Geld. Erstellen Sie den Bericht, und falls Sie bereits Geld verloren haben, eröffnen Sie einen Fall bei unserem Rückgewinnungsteam.' },
    ],
    disclaimer:
      'Dieser Bericht dient nur zur Information und ist keine rechtliche Feststellung. Wenn Sie glauben, Ziel eines Betrugs zu sein oder Geld verloren zu haben, wenden Sie sich an unser Team.',
  },

  it: {
    metaTitle: 'Report di sicurezza gratuito per numeri di telefono | CyberClaims',
    metaDescription:
      'Inserisci un numero di telefono e ricevi un report di sicurezza gratuito e dettagliato in PDF scaricabile. Analisi indipendente di CyberClaims, specialisti in supporto alle vittime e recupero da crimini informatici.',
    eyebrow: 'Verifica gratuita del numero',
    h1: 'Questo numero di telefono è una truffa? Ricevi un report di sicurezza gratuito',
    subhead:
      'Hai ricevuto una chiamata o un SMS inaspettato? Inserisci il numero qui sotto e genereremo un report di sicurezza gratuito e approfondito da scaricare in PDF — nessun account, niente memorizzato.',
    countryLabel: 'Paese',
    numberLabel: 'Numero di telefono',
    numberPlaceholder: 'es. 320 1234567',
    submit: 'Ricevi il report gratuito',
    loading: 'Stiamo generando il tuo report… può richiedere fino a un minuto.',
    successTitle: 'Il tuo report è pronto',
    successBody: 'Il PDF è stato scaricato. Controlla la cartella dei download se non lo vedi.',
    again: 'Verifica un altro numero',
    errorGeneric: 'Qualcosa è andato storto nella generazione del report. Riprova tra un momento.',
    errorTimeout: 'Il report sta richiedendo più tempo del previsto. Riprova.',
    errorInvalid: 'Questo non sembra un numero di telefono valido. Controllalo e riprova.',
    privacyNote:
      'Non memorizziamo il numero che verifichi. Il report è generato su richiesta e consegnato solo a te.',
    howTitle: 'Come funziona',
    steps: [
      { title: 'Inserisci il numero', body: 'Scegli il paese e digita il numero di telefono che ti ha contattato.' },
      { title: 'Lo analizziamo', body: 'Eseguiamo controlli in tempo reale su segnali di frode, reputazione ed esposizione — di solito in meno di un minuto.' },
      { title: 'Scarica il PDF', body: 'Ricevi un report di sicurezza dettagliato da scaricare e conservare. Da parte nostra non viene memorizzato nulla.' },
    ],
    trustTitle: 'Perché le persone si fidano di CyberClaims',
    trustItems: [
      'Specialisti in supporto alle vittime e recupero da crimini informatici',
      'Presenti in oltre 350 testate giornalistiche',
      'Riservato — nessun account, nessun dato conservato',
      'Agenzia investigativa autorizzata (Ministero della Giustizia olandese)',
    ],
    faqTitle: 'Domande frequenti',
    faqs: [
      { q: 'Il report è davvero gratuito?', a: 'Sì. Il report di sicurezza è completamente gratuito e non è necessario creare un account.' },
      { q: 'Cosa contiene il report?', a: 'Un PDF strutturato che riassume ciò che è pubblicamente e tecnicamente noto sul numero, così puoi decidere come reagire.' },
      { q: 'Memorizzate il numero che verifico?', a: 'No. L’analisi è generata su richiesta e il numero non viene salvato nei nostri sistemi.' },
      { q: 'Il numero mi ha chiamato spacciandosi per la mia banca — cosa devo fare?', a: 'Non condividere mai codici né spostare denaro a causa di una chiamata inaspettata. Genera il report e, se hai già perso denaro, apri un caso con il nostro team di recupero.' },
    ],
    disclaimer:
      'Questo report è fornito a solo scopo informativo e non costituisce una determinazione legale. Se ritieni di essere stato preso di mira o di aver perso denaro, contatta il nostro team.',
  },

  es: {
    metaTitle: 'Informe de seguridad gratuito de números de teléfono | CyberClaims',
    metaDescription:
      'Introduce un número de teléfono y obtén un informe de seguridad gratuito y detallado en PDF descargable. Análisis independiente de CyberClaims, especialistas en apoyo a víctimas y recuperación ante el cibercrimen.',
    eyebrow: 'Verificación gratuita del número',
    h1: '¿Es una estafa este número de teléfono? Obtén un informe de seguridad gratuito',
    subhead:
      '¿Has recibido una llamada o un SMS inesperado? Introduce el número abajo y generaremos un informe de seguridad gratuito y detallado que podrás descargar en PDF — sin cuenta, nada almacenado.',
    countryLabel: 'País',
    numberLabel: 'Número de teléfono',
    numberPlaceholder: 'p. ej. 612 345 678',
    submit: 'Obtener informe gratuito',
    loading: 'Generando tu informe… esto puede tardar hasta un minuto.',
    successTitle: 'Tu informe está listo',
    successBody: 'Tu PDF se ha descargado. Revisa la carpeta de descargas si no lo ves.',
    again: 'Verificar otro número',
    errorGeneric: 'Algo salió mal al generar tu informe. Inténtalo de nuevo en un momento.',
    errorTimeout: 'El informe está tardando más de lo esperado. Inténtalo de nuevo.',
    errorInvalid: 'Esto no parece un número de teléfono válido. Compruébalo e inténtalo de nuevo.',
    privacyNote:
      'No almacenamos el número que verificas. El informe se genera bajo demanda y se entrega solo a ti.',
    howTitle: 'Cómo funciona',
    steps: [
      { title: 'Introduce el número', body: 'Elige el país y escribe el número de teléfono que te contactó.' },
      { title: 'Lo analizamos', body: 'Ejecutamos comprobaciones en tiempo real sobre señales de fraude, reputación y exposición — normalmente en menos de un minuto.' },
      { title: 'Descarga tu PDF', body: 'Recibes un informe de seguridad detallado para descargar y conservar. Por nuestra parte no se almacena nada.' },
    ],
    trustTitle: 'Por qué la gente confía en CyberClaims',
    trustItems: [
      'Especialistas en apoyo a víctimas y recuperación ante el cibercrimen',
      'Presentes en más de 350 medios de comunicación',
      'Confidencial — sin cuenta, sin datos guardados',
      'Agencia de investigación privada autorizada (Ministerio de Justicia neerlandés)',
    ],
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      { q: '¿El informe es realmente gratuito?', a: 'Sí. El informe de seguridad es totalmente gratuito y no hay que crear ninguna cuenta.' },
      { q: '¿Qué incluye el informe?', a: 'Un PDF estructurado que resume lo que se conoce pública y técnicamente sobre el número, para que decidas cómo reaccionar.' },
      { q: '¿Almacenáis el número que verifico?', a: 'No. El análisis se genera bajo demanda y el número no se guarda en nuestros sistemas.' },
      { q: 'El número me llamó diciendo ser mi banco — ¿qué hago?', a: 'Nunca compartas códigos ni muevas dinero por una llamada inesperada. Genera el informe y, si ya has perdido dinero, abre un caso con nuestro equipo de recuperación.' },
    ],
    disclaimer:
      'Este informe se ofrece solo con fines informativos y no constituye una determinación legal. Si crees que has sido objetivo de una estafa o has perdido dinero, contacta con nuestro equipo.',
  },

  pt: {
    metaTitle: 'Relatório de segurança gratuito de números de telefone | CyberClaims',
    metaDescription:
      'Introduza um número de telefone e obtenha um relatório de segurança gratuito e detalhado em PDF para download. Análise independente da CyberClaims, especialistas em apoio a vítimas e recuperação face ao cibercrime.',
    eyebrow: 'Verificação gratuita do número',
    h1: 'Este número de telefone é uma burla? Obtenha um relatório de segurança gratuito',
    subhead:
      'Recebeu uma chamada ou SMS inesperado? Introduza o número abaixo e geraremos um relatório de segurança gratuito e detalhado que pode descarregar em PDF — sem conta, nada armazenado.',
    countryLabel: 'País',
    numberLabel: 'Número de telefone',
    numberPlaceholder: 'ex. 912 345 678',
    submit: 'Obter relatório gratuito',
    loading: 'A gerar o seu relatório… pode demorar até um minuto.',
    successTitle: 'O seu relatório está pronto',
    successBody: 'O seu PDF foi descarregado. Verifique a pasta de transferências se não o vir.',
    again: 'Verificar outro número',
    errorGeneric: 'Algo correu mal ao gerar o seu relatório. Tente novamente daqui a pouco.',
    errorTimeout: 'O relatório está a demorar mais do que o esperado. Tente novamente.',
    errorInvalid: 'Isto não parece um número de telefone válido. Verifique-o e tente novamente.',
    privacyNote:
      'Não armazenamos o número que verifica. O relatório é gerado a pedido e entregue apenas a si.',
    howTitle: 'Como funciona',
    steps: [
      { title: 'Introduza o número', body: 'Escolha o país e escreva o número de telefone que o contactou.' },
      { title: 'Analisamo-lo', body: 'Executamos verificações em tempo real sobre sinais de fraude, reputação e exposição — normalmente em menos de um minuto.' },
      { title: 'Descarregue o PDF', body: 'Recebe um relatório de segurança detalhado para descarregar e guardar. Do nosso lado nada é armazenado.' },
    ],
    trustTitle: 'Porque as pessoas confiam na CyberClaims',
    trustItems: [
      'Especialistas em apoio a vítimas e recuperação face ao cibercrime',
      'Presentes em mais de 350 meios de comunicação',
      'Confidencial — sem conta, sem dados guardados',
      'Agência de investigação privada autorizada (Ministério da Justiça neerlandês)',
    ],
    faqTitle: 'Perguntas frequentes',
    faqs: [
      { q: 'O relatório é mesmo gratuito?', a: 'Sim. O relatório de segurança é totalmente gratuito e não é preciso criar conta.' },
      { q: 'O que inclui o relatório?', a: 'Um PDF estruturado que resume o que é pública e tecnicamente conhecido sobre o número, para que decida como reagir.' },
      { q: 'Armazenam o número que verifico?', a: 'Não. A análise é gerada a pedido e o número não é guardado nos nossos sistemas.' },
      { q: 'O número ligou dizendo ser o meu banco — o que devo fazer?', a: 'Nunca partilhe códigos nem transfira dinheiro por causa de uma chamada inesperada. Gere o relatório e, se já perdeu dinheiro, abra um caso com a nossa equipa de recuperação.' },
    ],
    disclaimer:
      'Este relatório é fornecido apenas para fins informativos e não constitui uma determinação legal. Se acredita que foi alvo de uma burla ou perdeu dinheiro, contacte a nossa equipa.',
  },

  fr: {
    metaTitle: 'Rapport de sécurité gratuit pour numéros de téléphone | CyberClaims',
    metaDescription:
      'Saisissez un numéro de téléphone et obtenez un rapport de sécurité gratuit et détaillé au format PDF téléchargeable. Analyse indépendante de CyberClaims, spécialistes de l’aide aux victimes et de la récupération face à la cybercriminalité.',
    eyebrow: 'Vérification gratuite du numéro',
    h1: 'Ce numéro de téléphone est-il une arnaque ? Obtenez un rapport de sécurité gratuit',
    subhead:
      'Vous avez reçu un appel ou un SMS inattendu ? Saisissez le numéro ci-dessous et nous générerons un rapport de sécurité gratuit et détaillé à télécharger au format PDF — sans compte, rien n’est conservé.',
    countryLabel: 'Pays',
    numberLabel: 'Numéro de téléphone',
    numberPlaceholder: 'ex. 6 12 34 56 78',
    submit: 'Obtenir le rapport gratuit',
    loading: 'Génération de votre rapport… cela peut prendre jusqu’à une minute.',
    successTitle: 'Votre rapport est prêt',
    successBody: 'Votre PDF a été téléchargé. Vérifiez votre dossier de téléchargements s’il n’apparaît pas.',
    again: 'Vérifier un autre numéro',
    errorGeneric: 'Une erreur s’est produite lors de la génération de votre rapport. Veuillez réessayer dans un instant.',
    errorTimeout: 'Le rapport prend plus de temps que prévu. Veuillez réessayer.',
    errorInvalid: 'Cela ne ressemble pas à un numéro de téléphone valide. Vérifiez-le et réessayez.',
    privacyNote:
      'Nous ne conservons pas le numéro que vous vérifiez. Le rapport est généré à la demande et vous est remis à vous seul.',
    howTitle: 'Comment ça marche',
    steps: [
      { title: 'Saisissez le numéro', body: 'Choisissez le pays et saisissez le numéro de téléphone qui vous a contacté.' },
      { title: 'Nous l’analysons', body: 'Nous effectuons des vérifications en temps réel sur les signaux de fraude, de réputation et d’exposition — généralement en moins d’une minute.' },
      { title: 'Téléchargez votre PDF', body: 'Vous recevez un rapport de sécurité détaillé à télécharger et à conserver. Rien n’est conservé de notre côté.' },
    ],
    trustTitle: 'Pourquoi les gens font confiance à CyberClaims',
    trustItems: [
      'Spécialistes de l’aide aux victimes et de la récupération face à la cybercriminalité',
      'Présents dans plus de 350 médias',
      'Confidentiel — sans compte, aucune donnée conservée',
      'Agence d’enquête privée agréée (ministère néerlandais de la Justice)',
    ],
    faqTitle: 'Questions fréquentes',
    faqs: [
      { q: 'Le rapport est-il vraiment gratuit ?', a: 'Oui. Le rapport de sécurité est entièrement gratuit et aucun compte n’est nécessaire.' },
      { q: 'Que contient le rapport ?', a: 'Un PDF structuré qui résume ce qui est publiquement et techniquement connu sur le numéro, afin que vous décidiez comment réagir.' },
      { q: 'Conservez-vous le numéro que je vérifie ?', a: 'Non. L’analyse est générée à la demande et le numéro n’est pas enregistré dans nos systèmes.' },
      { q: 'Le numéro m’a appelé en se faisant passer pour ma banque — que dois-je faire ?', a: 'Ne partagez jamais de codes et ne transférez pas d’argent à la suite d’un appel inattendu. Générez le rapport et, si vous avez déjà perdu de l’argent, ouvrez un dossier auprès de notre équipe de récupération.' },
    ],
    disclaimer:
      'Ce rapport est fourni à titre informatif uniquement et ne constitue pas une décision juridique. Si vous pensez être ciblé ou avoir perdu de l’argent, contactez notre équipe.',
  },
};
