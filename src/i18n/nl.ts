// Dutch UI strings.
//
// Typed as Record<UIKey, string>, so a key that exists in en.ts but is missing here is
// a COMPILE ERROR - not an empty string that ships and a customer notices.
//
// Machine-translated first pass, to be reviewed by a native/professional before launch.
// Placeholders ({minutes}, {platform}, {pob}) and proper names (Cyberclaims, CAPTCHA,
// the legal entity "Transparent Business Solutions B.V.") are kept verbatim on purpose.
import type { UIKey } from './en';

export const nl: Record<UIKey, string> = {
  // Navigation
  'nav.home': 'Home',
  'nav.about': 'Over ons',
  'nav.services': 'Diensten',
  'nav.news': 'Nieuws',
  'nav.contact': 'Contact',
  'nav.urlChecker': 'URL-checker',
  'nav.phoneCheck': 'Telefooncheck',
  'nav.startProcess': 'Start proces',
  'nav.menu': 'Menu',
  'nav.close': 'Sluiten',
  'nav.allServices': 'Alle diensten',

  // Buttons & shared actions
  'cta.startProcess': 'Start proces',
  'cta.contactUs': 'Neem contact op',
  'cta.learnMore': 'Meer informatie',
  'cta.readMore': 'Lees meer',
  'cta.backHome': 'Terug naar de homepage',
  'cta.freeReview': 'Gratis dossierbeoordeling · reactie binnen 48 uur',

  // Lead forms
  'form.fullName': 'Volledige naam',
  'form.email': 'E-mail',
  'form.phone': 'Telefoonnummer',
  'form.country': 'Land van verblijf',
  'form.amountLost': 'Verloren bedrag',
  'form.message': 'Bericht',
  'form.platformName': 'Naam platform',
  'form.platformWebsite': 'Website platform',
  'form.firstTransaction': 'Datum van eerste transactie',
  'form.lastTransaction': 'Datum van laatste transactie',
  'form.submit': 'Versturen',
  'form.sending': 'Versturen...',
  'form.back': 'Terug',
  'form.next': 'Volgende',
  'form.legal':
    'Beveiligd met CAPTCHA. Uw gegevens zijn vertrouwelijk en worden beoordeeld door gecertificeerde experts.',
  'form.successTitle': 'We hebben uw gegevens ontvangen',
  'form.successBody':
    'Een gecertificeerde onderzoeker beoordeelt uw dossier en reageert binnen 48 uur. Alles wat u ons stuurt is vertrouwelijk.',
  'form.errorGeneric':
    'Er is iets misgegaan aan onze kant. Probeer het opnieuw of mail naar contact@cyberclaims.net.',
  'form.errorNetwork':
    'Kon de server niet bereiken. Controleer uw verbinding en probeer het opnieuw.',

  // News / blog
  'news.title': 'Nieuws',
  'news.intro':
    'Gidsen, oplichtingsanalyses en beveiligingsonderzoek van ons onderzoeksteam - zodat u fraude vroeg herkent en een stap voor blijft.',
  'news.imageAlt': 'Zwevende tegels met een krant, vergrootglas, waarschuwingsvlag en schild',
  'news.allCategories': 'Alle',
  'news.readingTime': '{minutes} min leestijd',
  'news.empty': 'Nog geen artikelen. Kom binnenkort terug.',
  'news.related': 'Gerelateerde artikelen',
  'news.seeAll': 'Alles bekijken',
  'news.by': 'Door',
  'news.backToNews': 'Alle artikelen',
  'news.loadMore': 'Meer laden',
  'news.loading': 'Laden…',

  // Article sidebar
  'aside.services': 'Onze diensten',
  'share.title': 'Deel dit artikel',
  'share.on': 'Delen op {platform}',
  'news.draftBanner': 'U bekijkt een concept. Het is voor niemand anders zichtbaar.',

  // Q&A block
  'faq.eyebrow': 'Veelgestelde vragen',
  'faq.titleLead': 'Heeft u',
  'faq.titleAccent': 'vragen?',
  'faq.body':
    'Kunt u het antwoord niet vinden dat u zoekt? Neem contact op met ons team en we reageren binnen 24 uur.',

  // Trust / footer
  'trust.moj': 'Nederlands MOJ · POB {pob}',
  'trust.press': 'Te zien in 350+ nieuwsmedia',
  'footer.rights': 'Alle rechten voorbehouden.',
  'footer.company': 'Transparent Business Solutions B.V.',

  // 404
  'notFound.title': 'Pagina niet gevonden',
  'notFound.body':
    'Die pagina bestaat niet of is verplaatst. Als iemand die beweert ons te vertegenwoordigen u hierheen heeft gestuurd, wees voorzichtig - zie de waarschuwing hieronder.',

  // Homepage
  'home.heroTitle': 'Bent u slachtoffer geworden van {accent}',
  'home.heroTitleA': 'crypto-oplichting?',
  'home.heroSub':
    'Wij helpen u uw vermogen te <strong>TRACEREN &amp; BEVRIEZEN</strong>. Cyberclaims biedt, ondersteund door toonaangevende cryptovaluta-intelligence en blockchain-analyse, deskundige diensten voor crypto-tracing en onderzoek om consumenten te helpen bij complexe zaken rond cryptogerelateerde fraude &amp; crypto-oplichting.',
  'home.heroFormTitle': 'Start uw herstel',

  'home.aboutTitle': 'Hallo, wij zijn {accent}',
  'home.aboutTitleA': 'Cyberclaims',
  'home.aboutLead':
    'Bij Cyberclaims kunt u rekenen op ons team van toegewijde en gecertificeerde experts om de beste oplossingen te bieden en te implementeren voor de uitdagingen die de groei van uw bedrijf belemmeren.',
  'home.aboutBody':
    'Als u slachtoffer bent van cyberfraude of digitale activa hebt verloren door cyberdiefstal, is contact met ons opnemen de eerste stap naar het terugkrijgen van uw activa en de ondersteuning die u nodig hebt.',
  'home.aboutPoint1': 'Gecertificeerde experts in crypto- & blockchain-forensiek',
  'home.aboutPoint2': 'Wereldwijd bereik - wij werken overal met u samen',
  'home.aboutPoint3': 'Gratis dossierbeoordeling met reactie binnen 48 uur',
  'home.aboutImageAlt':
    'Live blockchain-geldstroomanalyse: wallet-, exchange- en mixer-knooppunten gekoppeld aan een gemarkeerd uitbetalingspunt',

  'home.recTitle': 'Start nu uw {accent}',
  'home.recTitleA': 'herstel',
  'home.recSub':
    'Praat met een gecertificeerde expert over uw zaak. Vrijblijvend - gewoon een helder beeld van uw opties en volgende stappen.',

  'home.servicesTitle': 'Wat wij {accent}',
  'home.servicesTitleA': 'onderzoeken',
  'home.servicesExplore': 'Bekijk dienst',

  'home.tracingTitle': 'Cryptovaluta {accent}',
  'home.tracingTitleA': 'traceren',
  'home.tracingBody':
    'Met behulp van de meest toonaangevende cryptovaluta-intelligence en blockchain-analyse ter wereld bieden wij diepgaand inzicht in het traceren van cryptovaluta, de witwasrisico’s die samenhangen met aanbieders van virtuele-activadiensten, en meer. Onze geavanceerde software stelt ons in staat risico’s rond cryptowallets te identificeren, uitbetalingspunten te volgen en precies te bepalen waar geld naartoe is gestuurd en is uitbetaald.',
  'home.tracingViewMore': 'Meer bekijken',
  'home.tracingChip1': 'On-chain',
  'home.tracingChip2': 'VASP-risico',
  'home.tracingChip3': 'Uitbetaling',
  'home.tracingFoot': 'Geld in kaart gebracht over 5 hops · 2 uitbetalingspunten gemarkeerd',

  'home.trace.victim': 'Wallet slachtoffer',
  'home.trace.mixer': 'Mixer',
  'home.trace.contract': 'Tokencontract',
  'home.trace.bridge': 'Bridge',
  'home.trace.exchangeA': 'Exchange A',
  'home.trace.exchangeB': 'Exchange B',
  'home.trace.cashout': 'Uitbetaling',
  'home.trace.hop': 'hop {n}',
  'home.trace.alt':
    'Illustratieve transactiegrafiek: geld dat een wallet van een slachtoffer verlaat, wordt gevolgd via een mixer, een tokencontract, een bridge en twee exchanges naar een uiteindelijk uitbetalingspunt.',

  'home.susTitle': 'Wij geven prioriteit aan {accent}',
  'home.susTitleA': 'duurzaamheid',
  'home.susLead':
    'De strijd tegen digitale criminaliteit mag de planeet niet belasten. Een deel van elke zaak die wij oplossen, gaat terug naar het compenseren van onze voetafdruk.',

  'home.testiTitle': 'Vertrouwd door mensen die wij hebben {accent}',
  'home.testiTitleA': 'geholpen bij herstel',

  'home.partnersTitle': 'Bondgenoten in de {accent}',
  'home.partnersTitleA': 'sector',
  'home.partnersLead':
    'Wij werken samen met toonaangevende intelligence-aanbieders, advocatenkantoren en compliance-netwerken om elke zaak het bereik te geven dat zij nodig heeft.',

  'home.pressBadge': 'Te zien op - en meer dan 350 nieuwssites',
  'home.pressStory': 'Internationaal cybercrime-bureau {accent} in een cryptofraudezaak',
  'home.pressStoryA': 'CyberClaims haalt €90.000 terug',
  'home.pressVerified': 'Geverifieerd door BrandPush.co',

  'home.blogsTitle': 'Nieuwste {accent}',
  'home.blogsTitleA': 'blogs',
  'home.blogsAll': 'Al het nieuws',

  // Shared CTA strip
  'cta.stripTitle': 'Bent u slachtoffer geworden van {accent}',
  'cta.stripTitleA': 'crypto-oplichting?',
  'cta.stripSub': 'Wij kunnen u helpen uw vermogen te traceren en bevriezen. Kom nu in actie.',

  // Legal page titles
  'legal.privacyTitle': 'Privacybeleid',
  'legal.cookieTitle': 'Cookiebeleid',
  'legal.termsTitle': 'Algemene voorwaarden',
  'legal.dpaTitle': 'Verwerkersovereenkomst',

  // Footer
  'footer.tag': 'Uw digitale wereld beveiligen, claim voor claim',
  'footer.badgeRegistered': 'TBS B.V. geregistreerd',
  'footer.badgeGdpr': 'AVG-conform',
  'footer.colCompany': 'Bedrijf',
  'footer.colResources': 'Bronnen',
  'footer.colContact': 'Contact',
  'footer.legal':
    'Transparent Business Solutions B.V. (handelend als Cyberclaims) biedt gratis consultaties. Andere diensten brengen toepasselijke voorschotten, kosten of commissies met zich mee. Transparent Business Solutions B.V. is een erkend particulier recherchebureau onder POB-nummer {pob} van het Nederlandse Ministerie van Justitie en Veiligheid.',
  'footer.copyright': '© {year} Copyright Cyberclaims. Alle rechten voorbehouden.',

  // Impersonator warning band
  'impersonator.title': 'Pas op voor imitators!',
  'impersonator.body1':
    'Wij zijn gewaarschuwd dat personen zich voordoen als vertegenwoordigers van CyberClaims om slachtoffers te misleiden. Oplichters kunnen bellen en zich voordoen als ons, en u naar onze site verwijzen.',
  'impersonator.body2':
    'Alle e-mails, contracten en betalingsverzoeken komen uitsluitend van @cyberclaims.net.',
  'impersonator.body3': 'Twijfelt u? Verifieer het bij ons via {email}. Blijf waakzaam en blijf veilig.',

  // Services rail
  'servicesRail.exploreOur': 'Ontdek onze',
  'servicesRail.exploreOther': 'Ontdek andere',
  'servicesRail.services': 'diensten',

  // About page
  'about.metaTitle': 'Over ons - Cyberclaims',
  'about.metaDesc':
    'Ontdek wie wij zijn en hoe wij u helpen uw verloren geld en cryptovaluta terug te krijgen met gecertificeerde crypto- & blockchain-forensiek.',
  'about.heroTitle': 'Ontdek wie wij zijn en hoe wij u helpen uw verloren geld terug te krijgen',
  'about.heroImageAlt':
    'Vijf gekoppelde tegels die van links naar rechts oplopen: een gebarsten munt, een vergrootglas, een netwerk van getraceerde wallets, een dossier en een teruggehaalde wallet',
  'about.s1Title': 'Het onmogelijke werkelijkheid maken: verloren geld en {accent} terughalen',
  'about.s1TitleA': 'cryptovaluta',
  'about.s1Body':
    'Bij Cyberclaims zijn wij gespecialiseerd in geavanceerde cryptovaluta-intelligence en blockchain-analyse om uw digitale activa te beschermen en verloren geld terug te halen. Of u nu te maken hebt met crypto-oplichting, fraude of beveiligingsdreigingen, onze deskundige oplossingen bieden bij elke stap duidelijkheid en ondersteuning. Vertrouw op ons om u door de complexiteit van cryptoherstel te loodsen, zodat u met vertrouwen weer grip krijgt op uw financiële toekomst.',
  'about.s1ImageAlt': 'Een gebroken ring die zich weer samenvoegt, symbool voor teruggehaalde activa',
  'about.s2Body1':
    'Wij zijn gespecialiseerd in geavanceerd cryptovaluta-tracing om slachtoffers van cyberfraude te helpen verloren digitale activa terug te halen. Onze gecertificeerde experts gebruiken geavanceerde blockchain-analyse om de beweging van gestolen geld te volgen en de daders achter cryptodiefstal te identificeren.',
  'about.s2Body2':
    'Of uw activa nu naar niet-traceerbare wallets zijn overgemaakt of over meerdere platforms zijn verplaatst, ons team is uitgerust om het spoor te volgen en u te helpen bij de complexiteit van cryptoherstel. Met een wereldwijd bereik zijn onze diensten overal ter wereld toegankelijk en bieden zij u de ondersteuning die u nodig hebt om uw geld veilig en efficiënt terug te halen.',
  'about.s2Body3':
    'Vertrouw op Cyberclaims als uw gids door de blockchain, zodat u de juiste stappen zet richting het terughalen van uw activa.',
  'about.s3Title': 'Onze {accent}',
  'about.s3TitleA': 'waarden',
  'about.s3Body':
    'Bij Cyberclaims creëren wij een omgeving die het beste talent in de crypto- en blockchain-herstelbranche aantrekt. Ons team gebruikt geavanceerde blockchain-analyse om slachtoffers van cyberfraude te helpen gestolen digitale activa terug te halen. Met een wereldwijde aanwezigheid en expertise in crypto-tracing leveren wij effectieve, resultaatgerichte oplossingen aan klanten wereldwijd. Sluit u bij ons aan en maak impact in de strijd tegen cryptocriminaliteit.',
  'about.s3ImageAlt': 'In elkaar grijpende banen rond een gloeiende kern, symbool voor onze waarden',

  // Thank-you page
  'thankYou.metaTitle': 'Bedankt - Cyberclaims',
  'thankYou.metaDesc':
    'Wij hebben uw dossiergegevens ontvangen. Een gecertificeerde onderzoeker reageert binnen 48 uur.',
  'thankYou.body':
    'Een gecertificeerde onderzoeker beoordeelt uw dossier en neemt binnen <strong>48 uur</strong> contact met u op. Alles wat u ons stuurt is vertrouwelijk.',
  'thankYou.warn':
    '<strong>Pas op voor imitators.</strong> Wij vragen u nooit om cryptovaluta te sturen of vooraf “vrijgavekosten” te betalen om uw geld terug te krijgen. Wie dat wel doet, zijn wij niet.',
  'thankYou.urgent': 'Is uw zaak dringend? Bereik ons via {email}.',

  // URL checker page
  'urlChecker.metaTitle': 'URL-checker - Cyberclaims',
  'urlChecker.metaDesc':
    'Controleer of een website-URL als onveilig is gemarkeerd. Onze URL-oplichtingscontrole beschermt u tegen phishing, malware en kwaadaardige sites.',
  'urlChecker.title': 'URL-oplichtingscontrole',
  'urlChecker.lead':
    'Voer hieronder een website-URL in om te controleren of deze als onveilig is gemarkeerd. Deze tool beschermt u tegen phishing, malware en kwaadaardige sites die uw apparaat kunnen schaden of uw gegevens kunnen stelen.',
  'urlChecker.inputLabel': 'Website-URL',
  'urlChecker.placeholder': 'bijv. https://example.com',
  'urlChecker.submit': 'URL controleren',
  'urlChecker.legal': 'Resultaten zijn slechts indicatief. Voor een volledig onderzoek start u een zaak met ons team.',

  // 404 page
  'notFound.metaTitle': 'Pagina niet gevonden - Cyberclaims',
  'notFound.help': 'Hulp nodig bij een zaak? {start}, of mail naar {email}.',
  'notFound.helpStart': 'Begin hier',

  // Contact page
  'contact.metaTitle': 'Contact - Cyberclaims',
  'contact.metaDesc':
    'Bent u slachtoffer geworden van crypto-oplichting? Neem contact op met Cyberclaims - wij kunnen u helpen uw vermogen te traceren en bevriezen.',
  'contact.heroIntro':
    'Bent u slachtoffer geworden van crypto-oplichting? Wij kunnen u helpen uw vermogen te traceren en bevriezen. Kom nu in actie.',
  'contact.heroImageAlt': 'Zwevende tegels met een envelop, chatbel, apenstaartje en kaartspeld',
  'contact.callUs': 'Bel ons',
  'contact.office': 'Kantoor',
  'contact.formTitle': 'Stuur ons een bericht',

  // Start Process wizard
  'startProcess.metaTitle': 'Start proces - Cyberclaims',
  'startProcess.metaDesc':
    'Dien een klacht in bij Cyberclaims. Antwoord zo gedetailleerd mogelijk en ontvang binnen 24-72 werkuren een reactie.',
  'startProcess.heroIntro':
    'Vul het onderstaande formulier in om een klacht in te dienen. Antwoord alstublieft zo gedetailleerd mogelijk.',
  'startProcess.heroImageAlt': 'Een checklist-tegel gekoppeld aan document-, beoordelings- en verificatiestappen',
  'startProcess.step1': 'Contact',
  'startProcess.step2': 'Bedrag',
  'startProcess.step3': 'Incident',
  'startProcess.step4': 'Bevestigen',
  'startProcess.s1Title': 'Contactgegevens',
  'startProcess.s2Title': 'Verloren bedrag',
  'startProcess.s3Title': 'Incidentinformatie',
  'startProcess.s4Title': 'Bevestiging',
  'startProcess.confirm':
    'Bijna klaar! Controleer alle informatie en klik op “Versturen” om uw klacht te verzenden en binnen 24-72 werkuren een reactie van ons te ontvangen.',
  'startProcess.successTitle': 'Uw klacht is ingediend',
  'startProcess.successBody':
    'Bedankt - ons team beoordeelt de door u verstrekte gegevens en reageert binnen 24-72 werkuren.',

  // Services index page
  'services.metaTitle': 'Onze diensten - Cyberclaims',
  'services.metaDesc':
    'Van het traceren van gestolen crypto tot het offline halen van websites - onze gecertificeerde experts dekken het volledige spectrum van cyberfraude-onderzoek en activaherstel.',
  'services.heroTitle': 'Onze diensten',
  'services.heroIntro':
    'Van het traceren van gestolen crypto tot het offline halen van frauduleuze websites - onze gecertificeerde experts dekken het volledige spectrum van cyberfraude-onderzoek en activaherstel.',
  'services.heroImageAlt':
    'Zwevende tegels met bitcoin, een schild, een vergrootglas, een weegschaal, een document en een geblokkeerde site',
  'services.urlCheckerBlurb':
    'Controleer of een website als onveilig is gemarkeerd voordat u uw gegevens toevertrouwt.',
  'services.openChecker': 'Checker openen',

  // Service names / descriptions
  'svc.cryptocurrency-recovery.title': 'Cryptovaluta terughalen',
  'svc.cryptocurrency-recovery.blurb':
    'Cryptovaluta gebruiken voor transacties garandeert geen volledige immuniteit tegen online oplichters en fraude.',
  'svc.cryptocurrency-recovery.short': 'Haal activa terug die verloren zijn door oplichting, diefstal en fraude.',
  'svc.cryptocurrency-tracing.title': 'Cryptovaluta traceren',
  'svc.cryptocurrency-tracing.blurb':
    'Ondersteuning voor slachtoffers van oplichting om cryptovaluta die naar frauduleuze entiteiten is gestuurd te traceren en uitbetalingspunten te identificeren.',
  'svc.cryptocurrency-tracing.short': 'Traceer gestolen crypto tot aan de uitbetalingspunten.',
  'svc.website-forensics.title': 'Website-forensiek',
  'svc.website-forensics.blurb':
    'Breng oplichtingsnetwerken en digitaal forensisch bewijs rond fraude of merkinbreuk aan het licht.',
  'svc.website-forensics.short': 'Breng oplichtingsnetwerken en fraudebewijs aan het licht.',
  'svc.brand-protection.title': 'Merkbescherming',
  'svc.brand-protection.blurb':
    'We weten allemaal dat cyberaanvallen frustrerend kunnen zijn en uw intellectuele eigendom en bedrijfsgeheimen blootleggen.',
  'svc.brand-protection.short': 'Bescherm uw IE en merk tegen aanvallen.',
  'svc.website-takedown.title': 'Website offline halen',
  'svc.website-takedown.blurb':
    'Met de toenemende vooruitgang in de digitale wereld staan de enorme voordelen en risico’s buiten kijf.',
  'svc.website-takedown.short': 'Haal frauduleuze, inbreukmakende sites offline.',
  'svc.dispute-resolution-support.title': 'Ondersteuning bij geschillen',
  'svc.dispute-resolution-support.blurb':
    'Ondersteuning bij geschillenbeslechting omvat alle processen gericht op het oplossen van geschillen.',
  'svc.dispute-resolution-support.short': 'Ondersteuning gedurende het hele geschilproces.',
  'svc.consultancy-documentation-support.title': 'Advies & documentatieondersteuning',
  'svc.consultancy-documentation-support.blurb':
    'Een adviesbureau inhuren zonder goede documentatieondersteuning is een kostbare fout.',
  'svc.consultancy-documentation-support.short': 'Deskundig advies, volgens de regels.',
  'svc.due-diligence-investigations.title': 'Due diligence-onderzoek',
  'svc.due-diligence-investigations.blurb':
    'Veel mensen kopen liever een al gevestigd bedrijf of gaan er een samenwerking mee aan - verifieer voordat u zich vastlegt.',
  'svc.due-diligence-investigations.short': 'Verifieer partners voordat u zich vastlegt.',
  'svc.social-media-investigation.title': 'Onderzoek naar sociale media',
  'svc.social-media-investigation.blurb':
    'Volg, analyseer en documenteer sociale-media-activiteit die samenhangt met fraude, imitatie en merkmisbruik.',
  'svc.social-media-investigation.short': 'Volg fraude en imitatie op sociale media.',
  'svc.business-services.title': 'Zakelijke diensten',
  'svc.business-services.blurb':
    'De zakenwereld blijft een van de meest competitieve sectoren in onze moderne wereld.',
  'svc.business-services.short': 'Diensten op maat voor competitieve bedrijven.',

  // Sustainability + address
  'sus.treesPlanted': 'Bomen geplant',
  'sus.co2': 'CO₂ gecompenseerd',
  'sus.happyCustomers': 'Tevreden klanten',
  'contact.address': 'Kalvermarkt 53, 2511 CB, Den Haag, Nederland.',
};
