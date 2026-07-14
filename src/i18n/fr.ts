// French UI strings.
//
// Typed as Record<UIKey, string>, so a key missing here is a COMPILE ERROR. Machine-
// translated first pass, for native/professional review before launch. Placeholders
// ({minutes}, {platform}, {pob}) and proper names (Cyberclaims, CAPTCHA, the legal
// entity "Transparent Business Solutions B.V.") are kept verbatim.
import type { UIKey } from './en';

export const fr: Record<UIKey, string> = {
  // Navigation
  'nav.home': 'Accueil',
  'nav.about': 'À propos',
  'nav.services': 'Services',
  'nav.news': 'Actualités',
  'nav.contact': 'Contact',
  'nav.urlChecker': 'Vérificateur d’URL',
  'nav.startProcess': 'Démarrer la procédure',
  'nav.menu': 'Menu',
  'nav.close': 'Fermer',
  'nav.allServices': 'Tous les services',

  // Buttons & shared actions
  'cta.startProcess': 'Démarrer la procédure',
  'cta.contactUs': 'Nous contacter',
  'cta.learnMore': 'En savoir plus',
  'cta.readMore': 'Lire la suite',
  'cta.backHome': 'Retour à l’accueil',
  'cta.freeReview': 'Évaluation gratuite du dossier · réponse sous 48 heures',

  // Lead forms
  'form.fullName': 'Nom complet',
  'form.email': 'E-mail',
  'form.phone': 'Numéro de téléphone',
  'form.country': 'Pays de résidence',
  'form.amountLost': 'Montant perdu',
  'form.message': 'Message',
  'form.platformName': 'Nom de la plateforme',
  'form.platformWebsite': 'Site web de la plateforme',
  'form.firstTransaction': 'Date de la première transaction',
  'form.lastTransaction': 'Date de la dernière transaction',
  'form.submit': 'Envoyer',
  'form.sending': 'Envoi...',
  'form.back': 'Retour',
  'form.next': 'Suivant',
  'form.legal':
    'Protégé par CAPTCHA. Vos informations sont confidentielles et examinées par des experts certifiés.',
  'form.successTitle': 'Nous avons bien reçu vos informations',
  'form.successBody':
    'Un enquêteur certifié examinera votre dossier et vous répondra sous 48 heures. Tout ce que vous nous avez transmis reste confidentiel.',
  'form.errorGeneric':
    'Une erreur est survenue de notre côté. Veuillez réessayer ou écrire à contact@cyberclaims.net.',
  'form.errorNetwork':
    'Impossible de joindre le serveur. Veuillez vérifier votre connexion et réessayer.',

  // News / blog
  'news.title': 'Actualités',
  'news.intro':
    'Guides, analyses d’arnaques et recherches en sécurité de notre équipe d’enquête - pour repérer la fraude tôt et garder une longueur d’avance.',
  'news.imageAlt': 'Tuiles flottantes représentant un journal, une loupe, un drapeau d’alerte et un bouclier',
  'news.allCategories': 'Tous',
  'news.readingTime': '{minutes} min de lecture',
  'news.empty': 'Aucun article pour le moment. Revenez bientôt.',
  'news.related': 'À lire également',
  'news.seeAll': 'Voir tout',
  'news.by': 'Par',
  'news.backToNews': 'Tous les articles',
  'news.loadMore': 'Charger plus',
  'news.loading': 'Chargement…',

  // Article sidebar
  'aside.services': 'Nos services',
  'share.title': 'Partager cet article',
  'share.on': 'Partager sur {platform}',
  'news.draftBanner': 'Vous prévisualisez un brouillon. Il n’est visible par personne d’autre.',

  // Q&A block
  'faq.eyebrow': 'Questions fréquentes',
  'faq.titleLead': 'Vous avez des',
  'faq.titleAccent': 'questions ?',
  'faq.body':
    'Vous ne trouvez pas la réponse que vous cherchez ? Contactez notre équipe et nous vous répondrons sous 24 heures.',

  // Trust / footer
  'trust.moj': 'MOJ néerlandais · POB {pob}',
  'trust.press': 'Cité par plus de 350 médias',
  'footer.rights': 'Tous droits réservés.',
  'footer.company': 'Transparent Business Solutions B.V.',

  // 404
  'notFound.title': 'Page introuvable',
  'notFound.body':
    'Cette page n’existe pas ou a été déplacée. Si quelqu’un prétendant nous représenter vous a envoyé ici, soyez prudent - voir l’avertissement ci-dessous.',

  // Homepage
  'home.heroTitle': 'Avez-vous été victime de {accent}',
  'home.heroTitleA': 'crypto-arnaques ?',
  'home.heroSub':
    'Nous pouvons vous aider à <strong>TRACER &amp; GELER</strong> vos actifs. Cyberclaims, soutenue par une intelligence des cryptomonnaies et une analyse blockchain de premier plan, fournit des services experts de traçage crypto et d’enquête pour aider les particuliers à gérer les affaires complexes de fraude &amp; d’arnaques liées aux cryptomonnaies.',
  'home.heroFormTitle': 'Démarrez votre récupération',

  'home.aboutTitle': 'Bonjour, nous sommes {accent}',
  'home.aboutTitleA': 'Cyberclaims',
  'home.aboutLead':
    'Chez Cyberclaims, vous pouvez compter sur notre équipe d’experts dévoués et certifiés pour concevoir et mettre en œuvre les meilleures solutions face aux défis qui freinent la croissance de votre entreprise.',
  'home.aboutBody':
    'Si vous êtes victime de cyberfraude ou avez perdu des actifs numériques à cause d’un cybervol, nous contacter est la première étape pour récupérer vos actifs et obtenir l’aide dont vous avez besoin.',
  'home.aboutPoint1': 'Experts certifiés en criminalistique crypto & blockchain',
  'home.aboutPoint2': 'Portée mondiale - nous travaillons avec vous où que vous soyez',
  'home.aboutPoint3': 'Évaluation gratuite du dossier avec réponse sous 48 heures',
  'home.aboutImageAlt':
    'Traçage en direct des flux de fonds sur la blockchain : nœuds de portefeuille, plateforme d’échange et mixeur reliés à un point de retrait signalé',

  'home.recTitle': 'Démarrez votre {accent} maintenant',
  'home.recTitleA': 'récupération',
  'home.recSub':
    'Parlez à un expert certifié de votre affaire. Sans engagement - juste une vision claire de vos options et des prochaines étapes.',

  'home.servicesTitle': 'Nos domaines d’{accent}',
  'home.servicesTitleA': 'investigation',
  'home.servicesExplore': 'Découvrir le service',

  'home.tracingTitle': 'Traçage de {accent}',
  'home.tracingTitleA': 'cryptomonnaie',
  'home.tracingBody':
    'En nous appuyant sur l’intelligence des cryptomonnaies et l’analyse blockchain les plus avancées au monde, nous offrons des informations approfondies sur le traçage des cryptomonnaies, les risques de blanchiment d’argent liés aux prestataires de services sur actifs virtuels, et bien plus. Nos logiciels avancés nous permettent d’identifier les risques liés aux portefeuilles crypto, de suivre les points de retrait et de déterminer précisément où les fonds ont été envoyés et retirés.',
  'home.tracingViewMore': 'Voir plus',
  'home.tracingChip1': 'On-chain',
  'home.tracingChip2': 'Risque VASP',
  'home.tracingChip3': 'Retrait',
  'home.tracingFoot': 'Fonds retracés sur 5 sauts · 2 points de retrait signalés',

  'home.trace.victim': 'Portefeuille victime',
  'home.trace.mixer': 'Mixeur',
  'home.trace.contract': 'Contrat de jeton',
  'home.trace.bridge': 'Pont',
  'home.trace.exchangeA': 'Plateforme A',
  'home.trace.exchangeB': 'Plateforme B',
  'home.trace.cashout': 'Retrait',
  'home.trace.hop': 'saut {n}',
  'home.trace.alt':
    'Graphique de transactions illustratif : les fonds quittant le portefeuille d’une victime sont suivis à travers un mixeur, un contrat de jeton, un pont et deux plateformes d’échange jusqu’à un point de retrait final.',

  'home.susTitle': 'Nous privilégions la {accent}',
  'home.susTitleA': 'durabilité',
  'home.susLead':
    'Lutter contre la criminalité numérique ne devrait pas coûter à la planète. Une partie de chaque affaire que nous résolvons sert à compenser notre empreinte.',

  'home.testiTitle': 'La confiance de ceux que nous avons {accent}',
  'home.testiTitleA': 'aidés à récupérer',

  'home.partnersTitle': 'Alliés du {accent}',
  'home.partnersTitleA': 'secteur',
  'home.partnersLead':
    'Nous collaborons avec des fournisseurs de renseignement de premier plan, des cabinets d’avocats et des réseaux de conformité pour donner à chaque affaire la portée dont elle a besoin.',

  'home.pressBadge': 'Vu sur - et plus de 350 sites d’actualité',
  'home.pressStory': 'La société internationale de cybercriminalité {accent} dans une affaire de fraude aux cryptomonnaies',
  'home.pressStoryA': 'CyberClaims récupère 90 000 €',
  'home.pressVerified': 'Vérifié par BrandPush.co',

  'home.blogsTitle': 'Derniers {accent}',
  'home.blogsTitleA': 'articles',
  'home.blogsAll': 'Toute l’actualité',

  // Shared CTA strip
  'cta.stripTitle': 'Avez-vous été victime de {accent}',
  'cta.stripTitleA': 'crypto-arnaques ?',
  'cta.stripSub': 'Nous pouvons vous aider à tracer et geler vos actifs. Agissez maintenant.',

  // Legal page titles
  'legal.privacyTitle': 'Politique de confidentialité',
  'legal.cookieTitle': 'Politique relative aux cookies',
  'legal.termsTitle': 'Conditions générales',
  'legal.dpaTitle': 'Avenant relatif à la protection des données',

  // Footer
  'footer.tag': 'Protéger votre monde numérique, une réclamation à la fois',
  'footer.badgeRegistered': 'TBS B.V. enregistrée',
  'footer.badgeGdpr': 'Conforme au RGPD',
  'footer.colCompany': 'Entreprise',
  'footer.colResources': 'Ressources',
  'footer.colContact': 'Contact',
  'footer.legal':
    'Transparent Business Solutions B.V. (exerçant sous le nom de Cyberclaims) propose des consultations gratuites. D’autres services impliquent des honoraires, frais ou commissions applicables. Transparent Business Solutions B.V. est une agence de recherches privées agréée sous le numéro POB {pob} du ministère néerlandais de la Justice et de la Sécurité.',
  'footer.copyright': '© {year} Copyright Cyberclaims. Tous droits réservés.',

  // Impersonator warning band
  'impersonator.title': 'Méfiez-vous des usurpateurs !',
  'impersonator.body1':
    'Nous avons été alertés que des individus se font passer pour des représentants de CyberClaims afin de tromper les victimes. Des escrocs peuvent appeler en prétendant être nous et vous orienter vers notre site.',
  'impersonator.body2':
    'Tous les e-mails, contrats et demandes de paiement proviendront strictement de @cyberclaims.net.',
  'impersonator.body3': 'En cas de doute, vérifiez auprès de nous à {email}. Restez vigilant et prudent.',

  // Services rail
  'servicesRail.exploreOur': 'Explorez nos',
  'servicesRail.exploreOther': 'Explorez d’autres',
  'servicesRail.services': 'services',

  // About page
  'about.metaTitle': 'À propos - Cyberclaims',
  'about.metaDesc':
    'Découvrez qui nous sommes et comment nous vous aidons à récupérer vos fonds et cryptomonnaies perdus grâce à une criminalistique crypto & blockchain certifiée.',
  'about.heroTitle': 'Découvrez qui nous sommes et comment nous vous aidons à récupérer vos fonds perdus',
  'about.heroImageAlt':
    'Cinq tuiles reliées montant de gauche à droite : une pièce fissurée, une loupe, un réseau de portefeuilles tracés, un dossier et un portefeuille récupéré',
  'about.s1Title': 'Transformer l’impossible en réalité : récupérer les fonds perdus et la {accent}',
  'about.s1TitleA': 'cryptomonnaie',
  'about.s1Body':
    'Chez Cyberclaims, nous sommes spécialisés dans l’intelligence des cryptomonnaies et l’analyse blockchain de pointe pour protéger vos actifs numériques et récupérer les fonds perdus. Que vous soyez confronté à des arnaques crypto, à la fraude ou à des menaces de sécurité, nos solutions expertes apportent clarté et soutien à chaque étape. Faites-nous confiance pour naviguer dans les complexités de la récupération de cryptomonnaies et reprendre le contrôle de votre avenir financier en toute confiance.',
  'about.s1ImageAlt': 'Un anneau fracturé qui se reforme, symbolisant les actifs récupérés',
  'about.s2Body1':
    'Nous sommes spécialisés dans le traçage avancé des cryptomonnaies pour aider les victimes de cyberfraude à récupérer leurs actifs numériques perdus. Nos experts certifiés utilisent une analyse blockchain de pointe pour suivre le mouvement des fonds volés et identifier les auteurs du vol de crypto.',
  'about.s2Body2':
    'Que vos actifs aient été transférés vers des portefeuilles introuvables ou déplacés sur plusieurs plateformes, notre équipe est équipée pour suivre la piste et vous accompagner dans les complexités de la récupération crypto. Grâce à une portée mondiale, nos services sont accessibles partout dans le monde et vous offrent le soutien dont vous avez besoin pour récupérer vos fonds en toute sécurité et efficacité.',
  'about.s2Body3':
    'Faites confiance à Cyberclaims pour vous guider à travers la blockchain et vous assurer de prendre les bonnes mesures vers la récupération de vos actifs.',
  'about.s3Title': 'Nos {accent}',
  'about.s3TitleA': 'valeurs',
  'about.s3Body':
    'Chez Cyberclaims, nous créons un environnement qui attire les meilleurs talents du secteur de la récupération crypto et blockchain. Notre équipe utilise une analyse blockchain avancée pour aider les victimes de cyberfraude à récupérer leurs actifs numériques volés. Avec une présence mondiale et une expertise en traçage crypto, nous fournissons des solutions efficaces et axées sur les résultats à des clients du monde entier. Rejoignez-nous et ayez un impact dans la lutte contre la criminalité crypto.',
  'about.s3ImageAlt': 'Des orbites imbriquées autour d’un noyau lumineux, symbolisant nos valeurs',

  // Thank-you page
  'thankYou.metaTitle': 'Merci - Cyberclaims',
  'thankYou.metaDesc':
    'Nous avons bien reçu les détails de votre dossier. Un enquêteur certifié vous répondra sous 48 heures.',
  'thankYou.body':
    'Un enquêteur certifié examinera votre dossier et vous répondra sous <strong>48 heures</strong>. Tout ce que vous nous avez transmis reste confidentiel.',
  'thankYou.warn':
    '<strong>Méfiez-vous des usurpateurs.</strong> Nous ne vous demanderons jamais d’envoyer des cryptomonnaies ni de payer à l’avance des « frais de déblocage » pour récupérer vos fonds. Quiconque le fait n’est pas nous.',
  'thankYou.urgent': 'Si votre affaire est urgente, contactez-nous à {email}.',

  // URL checker page
  'urlChecker.metaTitle': 'Vérificateur d’URL - Cyberclaims',
  'urlChecker.metaDesc':
    'Vérifiez si l’URL d’un site web est signalée comme dangereuse. Notre vérificateur d’arnaques d’URL vous protège du phishing, des logiciels malveillants et des sites malveillants.',
  'urlChecker.title': 'Vérificateur d’arnaques d’URL',
  'urlChecker.lead':
    'Saisissez ci-dessous l’URL d’un site web pour vérifier si elle est signalée comme dangereuse. Cet outil vous protège du phishing, des logiciels malveillants et des sites malveillants susceptibles d’endommager votre appareil ou de voler vos données.',
  'urlChecker.inputLabel': 'URL du site web',
  'urlChecker.placeholder': 'ex. https://example.com',
  'urlChecker.submit': 'Vérifier l’URL',
  'urlChecker.legal': 'Les résultats sont indicatifs uniquement. Pour une enquête complète, ouvrez un dossier avec notre équipe.',

  // 404 page
  'notFound.metaTitle': 'Page introuvable - Cyberclaims',
  'notFound.help': 'Besoin d’aide pour un dossier ? {start}, ou écrivez à {email}.',
  'notFound.helpStart': 'Commencez ici',

  // Contact page
  'contact.metaTitle': 'Contact - Cyberclaims',
  'contact.metaDesc':
    'Avez-vous été victime d’arnaques crypto ? Contactez Cyberclaims - nous pouvons vous aider à tracer et geler vos actifs.',
  'contact.heroIntro':
    'Avez-vous été victime d’arnaques crypto ? Nous pouvons vous aider à tracer et geler vos actifs. Agissez maintenant.',
  'contact.heroImageAlt':
    'Tuiles flottantes représentant une enveloppe, une bulle de discussion, une arobase et un repère de carte',
  'contact.callUs': 'Appelez-nous',
  'contact.office': 'Bureau',
  'contact.formTitle': 'Envoyez-nous un message',

  // Start Process wizard
  'startProcess.metaTitle': 'Démarrer la procédure - Cyberclaims',
  'startProcess.metaDesc':
    'Déposez une plainte auprès de Cyberclaims. Répondez aussi précisément que possible et recevez une réponse sous 24 à 72 heures ouvrées.',
  'startProcess.heroIntro':
    'Veuillez remplir le formulaire ci-dessous pour déposer une plainte. Répondez aussi précisément que possible.',
  'startProcess.heroImageAlt':
    'Une tuile de liste de contrôle reliée aux étapes de document, d’examen et de vérification',
  'startProcess.step1': 'Contact',
  'startProcess.step2': 'Montant',
  'startProcess.step3': 'Incident',
  'startProcess.step4': 'Confirmer',
  'startProcess.s1Title': 'Coordonnées',
  'startProcess.s2Title': 'Montant perdu',
  'startProcess.s3Title': 'Informations sur l’incident',
  'startProcess.s4Title': 'Confirmation',
  'startProcess.confirm':
    'Presque terminé ! Veuillez vérifier toutes les informations et cliquer sur « Envoyer » pour transmettre votre plainte et recevoir une réponse de notre part sous 24 à 72 heures ouvrées.',
  'startProcess.successTitle': 'Votre plainte a été soumise',
  'startProcess.successBody':
    'Merci - notre équipe examinera les détails que vous avez fournis et vous répondra sous 24 à 72 heures ouvrées.',

  // Services index page
  'services.metaTitle': 'Nos services - Cyberclaims',
  'services.metaDesc':
    'Du traçage de cryptos volées au retrait de sites web, nos experts certifiés couvrent tout le spectre de l’enquête sur la cyberfraude et de la récupération d’actifs.',
  'services.heroTitle': 'Nos services',
  'services.heroIntro':
    'Du traçage de cryptos volées au retrait de sites web frauduleux, nos experts certifiés couvrent tout le spectre de l’enquête sur la cyberfraude et de la récupération d’actifs.',
  'services.heroImageAlt':
    'Tuiles flottantes représentant un bitcoin, un bouclier, une loupe, une balance, un document et un site bloqué',
  'services.urlCheckerBlurb':
    'Vérifiez si un site web est signalé comme dangereux avant de lui confier vos données.',
  'services.openChecker': 'Ouvrir le vérificateur',

  // Service names / descriptions
  'svc.cryptocurrency-recovery.title': 'Récupération de cryptomonnaie',
  'svc.cryptocurrency-recovery.blurb':
    'Utiliser des cryptomonnaies pour vos transactions ne garantit pas une immunité totale face aux escrocs et à la fraude en ligne.',
  'svc.cryptocurrency-recovery.short': 'Récupérez les actifs perdus à cause d’arnaques, de vols et de fraudes.',
  'svc.cryptocurrency-tracing.title': 'Traçage de cryptomonnaie',
  'svc.cryptocurrency-tracing.blurb':
    'Assistance aux victimes d’arnaques pour tracer les cryptomonnaies envoyées à des entités frauduleuses et identifier les points de retrait.',
  'svc.cryptocurrency-tracing.short': 'Tracez les cryptos volées jusqu’à leurs points de retrait.',
  'svc.website-forensics.title': 'Criminalistique de sites web',
  'svc.website-forensics.blurb':
    'Mettez au jour les réseaux d’arnaque et la criminalistique numérique liée à la fraude ou aux atteintes à la marque.',
  'svc.website-forensics.short': 'Mettez au jour les réseaux d’arnaque et les preuves de fraude.',
  'svc.brand-protection.title': 'Protection de la marque',
  'svc.brand-protection.blurb':
    'Nous savons tous que les cyberattaques peuvent être frustrantes et exposer votre propriété intellectuelle et vos secrets commerciaux.',
  'svc.brand-protection.short': 'Protégez votre PI et votre marque contre les attaques.',
  'svc.website-takedown.title': 'Retrait de site web',
  'svc.website-takedown.blurb':
    'Avec les progrès croissants dans l’espace numérique, les avantages et les risques considérables ne font aucun doute.',
  'svc.website-takedown.short': 'Faites retirer les sites frauduleux et contrefaisants.',
  'svc.dispute-resolution-support.title': 'Assistance à la résolution de litiges',
  'svc.dispute-resolution-support.blurb':
    'L’assistance à la résolution des litiges comprend l’ensemble des processus visant à traiter les litiges.',
  'svc.dispute-resolution-support.short': 'Un accompagnement tout au long du litige.',
  'svc.consultancy-documentation-support.title': 'Conseil & assistance documentaire',
  'svc.consultancy-documentation-support.blurb':
    'Faire appel à un cabinet de conseil sans une assistance documentaire adéquate est une erreur coûteuse.',
  'svc.consultancy-documentation-support.short': 'Un conseil d’expert, dans les règles.',
  'svc.due-diligence-investigations.title': 'Enquêtes de due diligence',
  'svc.due-diligence-investigations.blurb':
    'Beaucoup préfèrent acquérir une entreprise déjà établie ou s’y associer - vérifiez avant de vous engager.',
  'svc.due-diligence-investigations.short': 'Vérifiez vos partenaires avant de vous engager.',
  'svc.social-media-investigation.title': 'Enquête sur les réseaux sociaux',
  'svc.social-media-investigation.blurb':
    'Suivez, analysez et documentez l’activité sur les réseaux sociaux liée à la fraude, l’usurpation et l’abus de marque.',
  'svc.social-media-investigation.short': 'Suivez la fraude et l’usurpation sur les réseaux sociaux.',
  'svc.business-services.title': 'Services aux entreprises',
  'svc.business-services.blurb':
    'Le secteur des affaires reste l’un des plus concurrentiels de notre monde moderne.',
  'svc.business-services.short': 'Des services sur mesure pour des entreprises compétitives.',

  // Sustainability + address
  'sus.treesPlanted': 'Arbres plantés',
  'sus.co2': 'CO₂ compensé',
  'sus.happyCustomers': 'Clients satisfaits',
  'contact.address': 'Kalvermarkt 53, 2511 CB, La Haye, Pays-Bas.',
};
