// Italian UI strings.
//
// Typed as Record<UIKey, string>, so a key missing here is a COMPILE ERROR. Machine-
// translated first pass, for native/professional review before launch. Placeholders
// ({minutes}, {platform}, {pob}) and proper names (Cyberclaims, CAPTCHA, the legal
// entity "Transparent Business Solutions B.V.") are kept verbatim.
import type { UIKey } from './en';

export const it: Record<UIKey, string> = {
  // Navigation
  'nav.home': 'Home',
  'nav.about': 'Chi siamo',
  'nav.services': 'Servizi',
  'nav.news': 'Notizie',
  'nav.contact': 'Contatti',
  'nav.urlChecker': 'Verifica URL',
  'nav.phoneCheck': 'Verifica telefono',
  'nav.startProcess': 'Avvia la procedura',
  'nav.menu': 'Menu',
  'nav.close': 'Chiudi',
  'nav.allServices': 'Tutti i servizi',

  // Buttons & shared actions
  'cta.startProcess': 'Avvia la procedura',
  'cta.contactUs': 'Contattaci',
  'cta.learnMore': 'Scopri di più',
  'cta.readMore': 'Leggi di più',
  'cta.backHome': 'Torna alla home',
  'cta.freeReview': 'Valutazione gratuita del caso · risposta entro 48 ore',

  // Lead forms
  'form.fullName': 'Nome completo',
  'form.email': 'E-mail',
  'form.phone': 'Numero di telefono',
  'form.country': 'Paese di residenza',
  'form.amountLost': 'Importo perso',
  'form.message': 'Messaggio',
  'form.platformName': 'Nome della piattaforma',
  'form.platformWebsite': 'Sito web della piattaforma',
  'form.firstTransaction': 'Data della prima transazione',
  'form.lastTransaction': 'Data dell’ultima transazione',
  'form.submit': 'Invia',
  'form.sending': 'Invio in corso...',
  'form.back': 'Indietro',
  'form.next': 'Avanti',
  'form.legal':
    'Protetto da CAPTCHA. I tuoi dati sono riservati ed esaminati da esperti certificati.',
  'form.successTitle': 'Abbiamo ricevuto i tuoi dati',
  'form.successBody':
    'Un investigatore certificato esaminerà il tuo caso e ti risponderà entro 48 ore. Tutto ciò che ci invii è riservato.',
  'form.errorGeneric':
    'Si è verificato un errore dalla nostra parte. Riprova o scrivi a contact@cyberclaims.net.',
  'form.errorNetwork':
    'Impossibile raggiungere il server. Controlla la connessione e riprova.',

  // News / blog
  'news.title': 'Notizie',
  'news.intro':
    'Guide, analisi di truffe e ricerca sulla sicurezza dal nostro team investigativo - così puoi riconoscere le frodi in anticipo e restare un passo avanti.',
  'news.imageAlt': 'Tessere fluttuanti con un giornale, una lente, una bandiera di allerta e uno scudo',
  'news.allCategories': 'Tutti',
  'news.readingTime': '{minutes} min di lettura',
  'news.empty': 'Ancora nessun articolo. Torna presto.',
  'news.related': 'Da leggere anche',
  'news.seeAll': 'Vedi tutti',
  'news.by': 'Di',
  'news.backToNews': 'Tutti gli articoli',
  'news.loadMore': 'Carica altri',
  'news.loading': 'Caricamento…',

  // Article sidebar
  'aside.services': 'I nostri servizi',
  'share.title': 'Condividi questo articolo',
  'share.on': 'Condividi su {platform}',
  'news.draftBanner': 'Stai visualizzando un’anteprima di una bozza. Non è visibile a nessun altro.',

  // Q&A block
  'faq.eyebrow': 'Domande frequenti',
  'faq.titleLead': 'Hai delle',
  'faq.titleAccent': 'domande?',
  'faq.body':
    'Non trovi la risposta che cerchi? Contatta il nostro team e ti risponderemo entro 24 ore.',

  // Trust / footer
  'trust.moj': 'MOJ olandese · POB {pob}',
  'trust.press': 'Citati da oltre 350 testate',
  'footer.rights': 'Tutti i diritti riservati.',
  'footer.company': 'Transparent Business Solutions B.V.',

  // 404
  'notFound.title': 'Pagina non trovata',
  'notFound.body':
    'Questa pagina non esiste o è stata spostata. Se qualcuno che afferma di rappresentarci ti ha indirizzato qui, fai attenzione - vedi l’avviso qui sotto.',

  // Homepage
  'home.heroTitle': 'Sei stato vittima di {accent}',
  'home.heroTitleA': 'truffe crypto?',
  'home.heroSub':
    'Possiamo aiutarti a <strong>TRACCIARE &amp; CONGELARE</strong> i tuoi beni. Cyberclaims, supportata da intelligence sulle criptovalute e analisi blockchain di livello mondiale, offre servizi esperti di tracciamento crypto e indagini per aiutare i consumatori a gestire i casi complessi di frode &amp; truffe legate alle criptovalute.',
  'home.heroFormTitle': 'Avvia il tuo recupero',

  'home.aboutTitle': 'Ciao, siamo {accent}',
  'home.aboutTitleA': 'Cyberclaims',
  'home.aboutLead':
    'In Cyberclaims puoi contare sul nostro team di esperti dedicati e certificati per progettare e implementare le migliori soluzioni per le sfide che ostacolano la crescita della tua azienda.',
  'home.aboutBody':
    'Se sei vittima di frode informatica o hai perso beni digitali a causa di un furto informatico, contattarci è il primo passo per recuperare i tuoi beni e ottenere il supporto di cui hai bisogno.',
  'home.aboutPoint1': 'Esperti certificati in analisi forense crypto & blockchain',
  'home.aboutPoint2': 'Portata globale - lavoriamo con te ovunque tu sia',
  'home.aboutPoint3': 'Valutazione gratuita del caso con risposta entro 48 ore',
  'home.aboutImageAlt':
    'Tracciamento in tempo reale dei flussi di fondi sulla blockchain: nodi di wallet, exchange e mixer collegati a un punto di prelievo segnalato',

  'home.recTitle': 'Avvia ora il tuo {accent}',
  'home.recTitleA': 'recupero',
  'home.recSub':
    'Parla con un esperto certificato del tuo caso. Senza impegno - solo un quadro chiaro delle tue opzioni e dei prossimi passi.',

  'home.servicesTitle': 'Cosa {accent}',
  'home.servicesTitleA': 'indaghiamo',
  'home.servicesExplore': 'Esplora il servizio',

  'home.tracingTitle': 'Tracciamento di {accent}',
  'home.tracingTitleA': 'criptovaluta',
  'home.tracingBody':
    'Sfruttando l’intelligence sulle criptovalute e l’analisi blockchain più avanzate al mondo, offriamo informazioni approfondite sul tracciamento delle criptovalute, sui rischi di riciclaggio di denaro associati ai prestatori di servizi per le attività virtuali e altro ancora. Il nostro software avanzato ci consente di identificare i rischi legati ai wallet crypto, tracciare i punti di prelievo e determinare con precisione dove i fondi sono stati inviati e prelevati.',
  'home.tracingViewMore': 'Vedi di più',
  'home.tracingChip1': 'On-chain',
  'home.tracingChip2': 'Rischio VASP',
  'home.tracingChip3': 'Prelievo',
  'home.tracingFoot': 'Fondi tracciati su 5 passaggi · 2 punti di prelievo segnalati',

  'home.trace.victim': 'Wallet vittima',
  'home.trace.mixer': 'Mixer',
  'home.trace.contract': 'Contratto token',
  'home.trace.bridge': 'Bridge',
  'home.trace.exchangeA': 'Exchange A',
  'home.trace.exchangeB': 'Exchange B',
  'home.trace.cashout': 'Prelievo',
  'home.trace.hop': 'passaggio {n}',
  'home.trace.alt':
    'Grafo di transazioni illustrativo: i fondi che lasciano il wallet di una vittima vengono seguiti attraverso un mixer, un contratto token, un bridge e due exchange fino a un punto di prelievo finale.',

  'home.susTitle': 'Diamo priorità alla {accent}',
  'home.susTitleA': 'sostenibilità',
  'home.susLead':
    'Combattere il crimine digitale non dovrebbe costare al pianeta. Una parte di ogni caso che risolviamo viene reinvestita per compensare la nostra impronta.',

  'home.testiTitle': 'La fiducia di chi abbiamo {accent}',
  'home.testiTitleA': 'aiutato a recuperare',

  'home.partnersTitle': 'Alleati del {accent}',
  'home.partnersTitleA': 'settore',
  'home.partnersLead':
    'Collaboriamo con fornitori di intelligence di primo piano, studi legali e reti di conformità per dare a ogni caso la portata di cui ha bisogno.',

  'home.pressBadge': 'Visti su - e oltre 350 siti di notizie',
  'home.pressStory': 'La società internazionale di criminalità informatica {accent} in un caso di frode con criptovalute',
  'home.pressStoryA': 'CyberClaims recupera 90.000 €',
  'home.pressVerified': 'Verificato da BrandPush.co',

  'home.blogsTitle': 'Ultimi {accent}',
  'home.blogsTitleA': 'articoli',
  'home.blogsAll': 'Tutte le notizie',

  // Shared CTA strip
  'cta.stripTitle': 'Sei stato vittima di {accent}',
  'cta.stripTitleA': 'truffe crypto?',
  'cta.stripSub': 'Possiamo aiutarti a tracciare e congelare i tuoi beni. Agisci ora.',

  // Legal page titles
  'legal.privacyTitle': 'Informativa sulla privacy',
  'legal.cookieTitle': 'Informativa sui cookie',
  'legal.termsTitle': 'Termini e condizioni',
  'legal.dpaTitle': 'Addendum sulla protezione dei dati',

  // Footer
  'footer.tag': 'Proteggiamo il tuo mondo digitale, un reclamo alla volta',
  'footer.badgeRegistered': 'TBS B.V. registrata',
  'footer.badgeGdpr': 'Conforme al GDPR',
  'footer.colCompany': 'Azienda',
  'footer.colResources': 'Risorse',
  'footer.colContact': 'Contatti',
  'footer.legal':
    'Transparent Business Solutions B.V. (operante come Cyberclaims) offre consulenze gratuite. Altri servizi comportano anticipi, spese o commissioni applicabili. Transparent Business Solutions B.V. è un’agenzia investigativa privata autorizzata con numero POB {pob} del Ministero della Giustizia e della Sicurezza dei Paesi Bassi.',
  'footer.copyright': '© {year} Copyright Cyberclaims. Tutti i diritti riservati.',

  // Impersonator warning band
  'impersonator.title': 'Attenzione agli impostori!',
  'impersonator.body1':
    'Siamo stati avvisati che alcune persone si spacciano per rappresentanti di CyberClaims per ingannare le vittime. I truffatori possono chiamare fingendo di essere noi e indirizzarti al nostro sito.',
  'impersonator.body2':
    'Tutte le e-mail, i contratti e le richieste di pagamento proverranno esclusivamente da @cyberclaims.net.',
  'impersonator.body3': 'In caso di dubbio, verifica con noi a {email}. Resta vigile e al sicuro.',

  // Services rail
  'servicesRail.exploreOur': 'Esplora i nostri',
  'servicesRail.exploreOther': 'Esplora altri',
  'servicesRail.services': 'servizi',

  // About page
  'about.metaTitle': 'Chi siamo - Cyberclaims',
  'about.metaDesc':
    'Scopri chi siamo e come ti aiutiamo a recuperare i tuoi fondi e le tue criptovalute perse con analisi forense crypto & blockchain certificata.',
  'about.heroTitle': 'Scopri chi siamo e come ti aiutiamo a recuperare i tuoi fondi persi',
  'about.heroImageAlt':
    'Cinque tessere collegate che salgono da sinistra a destra: una moneta incrinata, una lente d’ingrandimento, una rete di wallet tracciati, un fascicolo e un wallet recuperato',
  'about.s1Title': 'Rendere possibile l’impossibile: recuperare fondi persi e {accent}',
  'about.s1TitleA': 'criptovaluta',
  'about.s1Body':
    'In Cyberclaims siamo specializzati in intelligence sulle criptovalute e analisi blockchain all’avanguardia per proteggere i tuoi beni digitali e recuperare i fondi persi. Che tu abbia a che fare con truffe crypto, frodi o minacce alla sicurezza, le nostre soluzioni esperte offrono chiarezza e supporto a ogni passo. Affidati a noi per orientarti nelle complessità del recupero delle criptovalute e riprendere il controllo del tuo futuro finanziario con fiducia.',
  'about.s1ImageAlt': 'Un anello fratturato che si ricompone, a simboleggiare i beni recuperati',
  'about.s2Body1':
    'Siamo specializzati nel tracciamento avanzato delle criptovalute per aiutare le vittime di frode informatica a recuperare i beni digitali persi. I nostri esperti certificati utilizzano analisi blockchain all’avanguardia per tracciare il movimento dei fondi rubati e identificare gli autori del furto di crypto.',
  'about.s2Body2':
    'Che i tuoi beni siano stati trasferiti su wallet non tracciabili o spostati su più piattaforme, il nostro team è attrezzato per seguire le tracce e assisterti nelle complessità del recupero crypto. Grazie a una portata globale, i nostri servizi sono accessibili da qualsiasi parte del mondo e ti offrono il supporto necessario per recuperare i tuoi fondi in modo sicuro ed efficiente.',
  'about.s2Body3':
    'Affidati a Cyberclaims come guida attraverso la blockchain, per assicurarti di compiere i passi giusti verso il recupero dei tuoi beni.',
  'about.s3Title': 'I nostri {accent}',
  'about.s3TitleA': 'valori',
  'about.s3Body':
    'In Cyberclaims creiamo un ambiente che attrae i migliori talenti del settore del recupero crypto e blockchain. Il nostro team utilizza analisi blockchain avanzate per aiutare le vittime di frode informatica a recuperare i beni digitali rubati. Con una presenza globale e competenza nel tracciamento crypto, offriamo soluzioni efficaci e orientate ai risultati a clienti in tutto il mondo. Unisciti a noi e lascia il segno nella lotta contro il crimine crypto.',
  'about.s3ImageAlt': 'Orbite interconnesse attorno a un nucleo luminoso, a simboleggiare i nostri valori',

  // Thank-you page
  'thankYou.metaTitle': 'Grazie - Cyberclaims',
  'thankYou.metaDesc':
    'Abbiamo ricevuto i dettagli del tuo caso. Un investigatore certificato ti risponderà entro 48 ore.',
  'thankYou.body':
    'Un investigatore certificato esaminerà il tuo caso e ti risponderà entro <strong>48 ore</strong>. Tutto ciò che ci invii è riservato.',
  'thankYou.warn':
    '<strong>Attenzione agli impostori.</strong> Non ti chiederemo mai di inviare criptovaluta né di pagare in anticipo una “commissione di sblocco” per recuperare i tuoi fondi. Chiunque lo faccia non siamo noi.',
  'thankYou.urgent': 'Se il tuo caso è urgente, contattaci a {email}.',

  // URL checker page
  'urlChecker.metaTitle': 'Verifica URL - Cyberclaims',
  'urlChecker.metaDesc':
    'Verifica se l’URL di un sito web è segnalato come non sicuro. Il nostro controllo truffe URL ti protegge da phishing, malware e siti dannosi.',
  'urlChecker.title': 'Controllo truffe URL',
  'urlChecker.lead':
    'Inserisci qui sotto l’URL di un sito web per verificare se è segnalato come non sicuro. Questo strumento ti protegge da phishing, malware e siti dannosi che potrebbero danneggiare il tuo dispositivo o rubare i tuoi dati.',
  'urlChecker.inputLabel': 'URL del sito web',
  'urlChecker.placeholder': 'es. https://example.com',
  'urlChecker.submit': 'Verifica URL',
  'urlChecker.legal': 'I risultati sono solo indicativi. Per un’indagine completa, apri un caso con il nostro team.',

  // 404 page
  'notFound.metaTitle': 'Pagina non trovata - Cyberclaims',
  'notFound.help': 'Hai bisogno di aiuto per un caso? {start}, oppure scrivi a {email}.',
  'notFound.helpStart': 'Inizia qui',

  // Contact page
  'contact.metaTitle': 'Contatti - Cyberclaims',
  'contact.metaDesc':
    'Sei stato vittima di truffe crypto? Contatta Cyberclaims - possiamo aiutarti a tracciare e congelare i tuoi beni.',
  'contact.heroIntro':
    'Sei stato vittima di truffe crypto? Possiamo aiutarti a tracciare e congelare i tuoi beni. Agisci ora.',
  'contact.heroImageAlt':
    'Tessere fluttuanti con una busta, un fumetto, una chiocciola e un segnaposto sulla mappa',
  'contact.callUs': 'Chiamaci',
  'contact.office': 'Ufficio',
  'contact.formTitle': 'Inviaci un messaggio',

  // Start Process wizard
  'startProcess.metaTitle': 'Avvia la procedura - Cyberclaims',
  'startProcess.metaDesc':
    'Presenta un reclamo a Cyberclaims. Rispondi nel modo più dettagliato possibile e ricevi una risposta entro 24-72 ore lavorative.',
  'startProcess.heroIntro':
    'Compila il modulo qui sotto per presentare un reclamo. Ti preghiamo di rispondere nel modo più dettagliato possibile.',
  'startProcess.heroImageAlt':
    'Una tessera con lista di controllo collegata alle fasi di documento, revisione e verifica',
  'startProcess.step1': 'Contatto',
  'startProcess.step2': 'Importo',
  'startProcess.step3': 'Incidente',
  'startProcess.step4': 'Conferma',
  'startProcess.s1Title': 'Dati di contatto',
  'startProcess.s2Title': 'Importo perso',
  'startProcess.s3Title': 'Informazioni sull’incidente',
  'startProcess.s4Title': 'Conferma',
  'startProcess.confirm':
    'Ci siamo quasi! Controlla tutte le informazioni e clicca su “Invia” per inoltrare il tuo reclamo e ricevere una risposta da noi entro 24-72 ore lavorative.',
  'startProcess.successTitle': 'Il tuo reclamo è stato inviato',
  'startProcess.successBody':
    'Grazie - il nostro team esaminerà i dettagli forniti e risponderà entro 24-72 ore lavorative.',

  // Services index page
  'services.metaTitle': 'I nostri servizi - Cyberclaims',
  'services.metaDesc':
    'Dal tracciamento delle crypto rubate alla rimozione dei siti web, i nostri esperti certificati coprono l’intero spettro delle indagini sulle frodi informatiche e del recupero dei beni.',
  'services.heroTitle': 'I nostri servizi',
  'services.heroIntro':
    'Dal tracciamento delle crypto rubate alla rimozione dei siti web fraudolenti, i nostri esperti certificati coprono l’intero spettro delle indagini sulle frodi informatiche e del recupero dei beni.',
  'services.heroImageAlt':
    'Tessere fluttuanti con un bitcoin, uno scudo, una lente, una bilancia, un documento e un sito bloccato',
  'services.urlCheckerBlurb':
    'Verifica se un sito web è segnalato come non sicuro prima di affidargli i tuoi dati.',
  'services.openChecker': 'Apri il controllo',

  // Service names / descriptions
  'svc.cryptocurrency-recovery.title': 'Recupero di criptovaluta',
  'svc.cryptocurrency-recovery.blurb':
    'Usare le criptovalute per le transazioni non garantisce la completa immunità da truffatori e frodi online.',
  'svc.cryptocurrency-recovery.short': 'Recupera i beni persi a causa di truffe, furti e frodi.',
  'svc.cryptocurrency-tracing.title': 'Tracciamento di criptovaluta',
  'svc.cryptocurrency-tracing.blurb':
    'Assistenza alle vittime di truffe per tracciare le criptovalute inviate a entità fraudolente e identificare i punti di prelievo.',
  'svc.cryptocurrency-tracing.short': 'Traccia le crypto rubate fino ai punti di prelievo.',
  'svc.website-forensics.title': 'Analisi forense di siti web',
  'svc.website-forensics.blurb':
    'Scopri le reti di truffa e l’analisi forense digitale legata a frodi o violazioni del marchio.',
  'svc.website-forensics.short': 'Scopri le reti di truffa e le prove di frode.',
  'svc.brand-protection.title': 'Protezione del marchio',
  'svc.brand-protection.blurb':
    'Sappiamo tutti che gli attacchi informatici possono essere frustranti e lasciare esposti la tua proprietà intellettuale e i tuoi segreti commerciali.',
  'svc.brand-protection.short': 'Proteggi la tua proprietà intellettuale e il tuo marchio dagli attacchi.',
  'svc.website-takedown.title': 'Rimozione di siti web',
  'svc.website-takedown.blurb':
    'Con il crescente progresso nello spazio digitale, non c’è dubbio sugli enormi vantaggi e rischi.',
  'svc.website-takedown.short': 'Fai rimuovere i siti fraudolenti e in violazione.',
  'svc.dispute-resolution-support.title': 'Supporto alla risoluzione delle controversie',
  'svc.dispute-resolution-support.blurb':
    'Il supporto alla risoluzione delle controversie comprende tutti i processi volti ad affrontare le controversie.',
  'svc.dispute-resolution-support.short': 'Supporto durante l’intero processo di controversia.',
  'svc.consultancy-documentation-support.title': 'Consulenza & supporto documentale',
  'svc.consultancy-documentation-support.blurb':
    'Affidarsi a una società di consulenza senza un adeguato supporto documentale è un errore costoso.',
  'svc.consultancy-documentation-support.short': 'Consulenza esperta, fatta a regola d’arte.',
  'svc.due-diligence-investigations.title': 'Indagini di due diligence',
  'svc.due-diligence-investigations.blurb':
    'Molti preferiscono acquisire o collaborare con un’azienda già avviata - verifica prima di impegnarti.',
  'svc.due-diligence-investigations.short': 'Verifica i partner prima di impegnarti.',
  'svc.social-media-investigation.title': 'Indagine sui social media',
  'svc.social-media-investigation.blurb':
    'Traccia, analizza e documenta l’attività sui social media legata a frodi, furti d’identità e abuso del marchio.',
  'svc.social-media-investigation.short': 'Traccia frodi e furti d’identità sui social.',
  'svc.business-services.title': 'Servizi alle imprese',
  'svc.business-services.blurb':
    'Il settore imprenditoriale rimane uno dei più competitivi del nostro mondo moderno.',
  'svc.business-services.short': 'Servizi su misura per aziende competitive.',

  // Sustainability + address
  'sus.treesPlanted': 'Alberi piantati',
  'sus.co2': 'CO₂ compensata',
  'sus.happyCustomers': 'Clienti soddisfatti',
  'contact.address': 'Kalvermarkt 53, 2511 CB, L’Aia, Paesi Bassi.',
};
