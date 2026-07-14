// German UI strings.
//
// Typed as Record<UIKey, string>, so a key missing here is a COMPILE ERROR. Machine-
// translated first pass, for native/professional review before launch. Placeholders
// ({minutes}, {platform}, {pob}) and proper names (Cyberclaims, CAPTCHA, the legal
// entity "Transparent Business Solutions B.V.") are kept verbatim.
import type { UIKey } from './en';

export const de: Record<UIKey, string> = {
  // Navigation
  'nav.home': 'Startseite',
  'nav.about': 'Über uns',
  'nav.services': 'Leistungen',
  'nav.news': 'Aktuelles',
  'nav.contact': 'Kontakt',
  'nav.urlChecker': 'URL-Checker',
  'nav.startProcess': 'Prozess starten',
  'nav.menu': 'Menü',
  'nav.close': 'Schließen',
  'nav.allServices': 'Alle Leistungen',

  // Buttons & shared actions
  'cta.startProcess': 'Prozess starten',
  'cta.contactUs': 'Kontakt aufnehmen',
  'cta.learnMore': 'Mehr erfahren',
  'cta.readMore': 'Weiterlesen',
  'cta.backHome': 'Zurück zur Startseite',
  'cta.freeReview': 'Kostenlose Fallprüfung · Antwort innerhalb von 48 Stunden',

  // Lead forms
  'form.fullName': 'Vollständiger Name',
  'form.email': 'E-Mail',
  'form.phone': 'Telefonnummer',
  'form.country': 'Wohnsitzland',
  'form.amountLost': 'Verlorener Betrag',
  'form.message': 'Nachricht',
  'form.platformName': 'Name der Plattform',
  'form.platformWebsite': 'Website der Plattform',
  'form.firstTransaction': 'Datum der ersten Transaktion',
  'form.lastTransaction': 'Datum der letzten Transaktion',
  'form.submit': 'Senden',
  'form.sending': 'Wird gesendet...',
  'form.back': 'Zurück',
  'form.next': 'Weiter',
  'form.legal':
    'Durch CAPTCHA geschützt. Ihre Angaben sind vertraulich und werden von zertifizierten Experten geprüft.',
  'form.successTitle': 'Wir haben Ihre Angaben erhalten',
  'form.successBody':
    'Ein zertifizierter Ermittler prüft Ihren Fall und antwortet innerhalb von 48 Stunden. Alles, was Sie uns senden, ist vertraulich.',
  'form.errorGeneric':
    'Auf unserer Seite ist etwas schiefgelaufen. Bitte versuchen Sie es erneut oder schreiben Sie an contact@cyberclaims.net.',
  'form.errorNetwork':
    'Der Server konnte nicht erreicht werden. Bitte prüfen Sie Ihre Verbindung und versuchen Sie es erneut.',

  // News / blog
  'news.title': 'Aktuelles',
  'news.intro':
    'Ratgeber, Betrugsanalysen und Sicherheitsforschung von unserem Ermittlungsteam - damit Sie Betrug früh erkennen und einen Schritt voraus bleiben.',
  'news.imageAlt': 'Schwebende Kacheln mit Zeitung, Lupe, Warnflagge und Schild',
  'news.allCategories': 'Alle',
  'news.readingTime': '{minutes} Min. Lesezeit',
  'news.empty': 'Noch keine Artikel. Schauen Sie bald wieder vorbei.',
  'news.related': 'Weiterführende Artikel',
  'news.seeAll': 'Alle ansehen',
  'news.by': 'Von',
  'news.backToNews': 'Alle Artikel',
  'news.loadMore': 'Mehr laden',
  'news.loading': 'Wird geladen…',

  // Article sidebar
  'aside.services': 'Unsere Leistungen',
  'share.title': 'Diesen Artikel teilen',
  'share.on': 'Teilen auf {platform}',
  'news.draftBanner': 'Sie sehen eine Vorschau eines Entwurfs. Er ist für niemanden sonst sichtbar.',

  // Q&A block
  'faq.eyebrow': 'Häufig gestellte Fragen',
  'faq.titleLead': 'Haben Sie',
  'faq.titleAccent': 'Fragen?',
  'faq.body':
    'Finden Sie nicht die Antwort, die Sie suchen? Wenden Sie sich an unser Team und wir melden uns innerhalb von 24 Stunden.',

  // Trust / footer
  'trust.moj': 'Niederländisches MOJ · POB {pob}',
  'trust.press': 'In über 350 Medien erwähnt',
  'footer.rights': 'Alle Rechte vorbehalten.',
  'footer.company': 'Transparent Business Solutions B.V.',

  // 404
  'notFound.title': 'Seite nicht gefunden',
  'notFound.body':
    'Diese Seite existiert nicht oder wurde verschoben. Wenn Sie jemand hierher geschickt hat, der vorgibt, uns zu vertreten, seien Sie vorsichtig - siehe die Warnung unten.',

  // Homepage
  'home.heroTitle': 'Wurden Sie Opfer von {accent}',
  'home.heroTitleA': 'Krypto-Betrug?',
  'home.heroSub':
    'Wir helfen Ihnen, Ihre Vermögenswerte zu <strong>VERFOLGEN &amp; EINZUFRIEREN</strong>. Cyberclaims bietet, gestützt auf weltweit führende Kryptowährungs-Intelligence und Blockchain-Analyse, fachkundige Dienste für Krypto-Tracing und Ermittlungen, um Verbrauchern bei komplexen Fällen von kryptobezogenem Betrug &amp; Krypto-Scams zu helfen.',
  'home.heroFormTitle': 'Starten Sie Ihre Wiederherstellung',

  'home.aboutTitle': 'Hallo, wir sind {accent}',
  'home.aboutTitleA': 'Cyberclaims',
  'home.aboutLead':
    'Bei Cyberclaims können Sie sich auf unser Team engagierter und zertifizierter Experten verlassen, um die besten Lösungen für die Herausforderungen zu entwickeln und umzusetzen, die das Wachstum Ihres Unternehmens behindern.',
  'home.aboutBody':
    'Wenn Sie Opfer von Cyberbetrug sind oder digitale Vermögenswerte durch Cyberdiebstahl verloren haben, ist die Kontaktaufnahme mit uns der erste Schritt, um Ihre Vermögenswerte zurückzuerhalten und die Unterstützung zu bekommen, die Sie brauchen.',
  'home.aboutPoint1': 'Zertifizierte Experten für Krypto- & Blockchain-Forensik',
  'home.aboutPoint2': 'Weltweite Reichweite - wir arbeiten von überall mit Ihnen zusammen',
  'home.aboutPoint3': 'Kostenlose Fallprüfung mit Antwort innerhalb von 48 Stunden',
  'home.aboutImageAlt':
    'Live-Blockchain-Geldflussverfolgung: Wallet-, Börsen- und Mixer-Knoten, die mit einem markierten Auszahlungspunkt verbunden sind',

  'home.recTitle': 'Starten Sie jetzt Ihre {accent}',
  'home.recTitleA': 'Wiederherstellung',
  'home.recSub':
    'Sprechen Sie mit einem zertifizierten Experten über Ihren Fall. Unverbindlich - einfach ein klares Bild Ihrer Optionen und nächsten Schritte.',

  'home.servicesTitle': 'Was wir {accent}',
  'home.servicesTitleA': 'untersuchen',
  'home.servicesExplore': 'Leistung entdecken',

  'home.tracingTitle': 'Kryptowährungs-{accent}',
  'home.tracingTitleA': 'Nachverfolgung',
  'home.tracingBody':
    'Gestützt auf die weltweit führende Kryptowährungs-Intelligence und Blockchain-Analyse bieten wir tiefgehende Einblicke in die Nachverfolgung von Kryptowährungen, die Geldwäscherisiken im Zusammenhang mit Anbietern von Diensten für virtuelle Vermögenswerte und mehr. Unsere fortschrittliche Software ermöglicht es uns, Risiken rund um Krypto-Wallets zu erkennen, Auszahlungspunkte zu verfolgen und genau zu bestimmen, wohin Gelder gesendet und ausgezahlt wurden.',
  'home.tracingViewMore': 'Mehr ansehen',
  'home.tracingChip1': 'On-Chain',
  'home.tracingChip2': 'VASP-Risiko',
  'home.tracingChip3': 'Auszahlung',
  'home.tracingFoot': 'Gelder über 5 Hops kartiert · 2 Auszahlungspunkte markiert',

  'home.susTitle': 'Wir setzen auf {accent}',
  'home.susTitleA': 'Nachhaltigkeit',
  'home.susLead':
    'Der Kampf gegen digitale Kriminalität sollte den Planeten nicht belasten. Ein Teil jedes Falls, den wir lösen, fließt in den Ausgleich unseres Fußabdrucks zurück.',

  'home.testiTitle': 'Vertraut von Menschen, denen wir {accent} haben',
  'home.testiTitleA': 'bei der Rückgewinnung geholfen',

  'home.partnersTitle': 'Verbündete der {accent}',
  'home.partnersTitleA': 'Branche',
  'home.partnersLead':
    'Wir arbeiten mit führenden Intelligence-Anbietern, Anwaltskanzleien und Compliance-Netzwerken zusammen, um jedem Fall die nötige Reichweite zu geben.',

  'home.pressBadge': 'Zu sehen auf - und über 350 Nachrichtenseiten',
  'home.pressStory': 'Internationales Cybercrime-Unternehmen {accent} in einem Kryptobetrugsfall',
  'home.pressStoryA': 'CyberClaims holt 90.000 € zurück',
  'home.pressVerified': 'Verifiziert von BrandPush.co',

  'home.blogsTitle': 'Neueste {accent}',
  'home.blogsTitleA': 'Blogs',
  'home.blogsAll': 'Alle Beiträge',

  // Shared CTA strip
  'cta.stripTitle': 'Wurden Sie Opfer von {accent}',
  'cta.stripTitleA': 'Krypto-Betrug?',
  'cta.stripSub': 'Wir können Ihnen helfen, Ihre Vermögenswerte zu verfolgen und einzufrieren. Handeln Sie jetzt.',

  // Legal page titles
  'legal.privacyTitle': 'Datenschutzerklärung',
  'legal.cookieTitle': 'Cookie-Richtlinie',
  'legal.termsTitle': 'Allgemeine Geschäftsbedingungen',
  'legal.dpaTitle': 'Auftragsverarbeitungsvereinbarung',

  // Footer
  'footer.tag': 'Wir sichern Ihre digitale Welt, Fall für Fall',
  'footer.badgeRegistered': 'TBS B.V. registriert',
  'footer.badgeGdpr': 'DSGVO-konform',
  'footer.colCompany': 'Unternehmen',
  'footer.colResources': 'Ressourcen',
  'footer.colContact': 'Kontakt',
  'footer.legal':
    'Transparent Business Solutions B.V. (handelnd als Cyberclaims) bietet kostenlose Beratungen an. Andere Leistungen sind mit entsprechenden Vorschüssen, Gebühren oder Provisionen verbunden. Transparent Business Solutions B.V. ist eine zugelassene private Ermittlungsagentur unter der POB-Nummer {pob} des niederländischen Ministeriums für Justiz und Sicherheit.',
  'footer.copyright': '© {year} Copyright Cyberclaims. Alle Rechte vorbehalten.',

  // Impersonator warning band
  'impersonator.title': 'Vorsicht vor Betrügern!',
  'impersonator.body1':
    'Wir wurden darauf hingewiesen, dass sich Personen als Vertreter von CyberClaims ausgeben, um Opfer zu täuschen. Betrüger rufen möglicherweise an, geben sich als wir aus und leiten Sie auf unsere Website.',
  'impersonator.body2':
    'Alle E-Mails, Verträge und Zahlungsaufforderungen kommen ausschließlich von @cyberclaims.net.',
  'impersonator.body3': 'Im Zweifelsfall verifizieren Sie bei uns unter {email}. Bleiben Sie wachsam und sicher.',

  // Services rail
  'servicesRail.exploreOur': 'Entdecken Sie unsere',
  'servicesRail.exploreOther': 'Entdecken Sie weitere',
  'servicesRail.services': 'Leistungen',

  // About page
  'about.metaTitle': 'Über uns - Cyberclaims',
  'about.metaDesc':
    'Erfahren Sie, wer wir sind und wie wir Ihnen helfen, Ihre verlorenen Gelder und Kryptowährungen mit zertifizierter Krypto- & Blockchain-Forensik zurückzuholen.',
  'about.heroTitle': 'Erfahren Sie, wer wir sind und wie wir Ihnen helfen, Ihre verlorenen Gelder zurückzuholen',
  'about.heroImageAlt':
    'Fünf verbundene Kacheln, die von links nach rechts ansteigen: eine gesprungene Münze, eine Lupe, ein Netzwerk verfolgter Wallets, eine Fallakte und eine wiederhergestellte Wallet',
  'about.s1Title': 'Das Unmögliche Wirklichkeit werden lassen: verlorene Gelder und {accent} zurückholen',
  'about.s1TitleA': 'Kryptowährung',
  'about.s1Body':
    'Bei Cyberclaims sind wir auf modernste Kryptowährungs-Intelligence und Blockchain-Analyse spezialisiert, um Ihre digitalen Vermögenswerte zu schützen und verlorene Gelder zurückzuholen. Ob Sie mit Krypto-Betrug, Betrug oder Sicherheitsbedrohungen konfrontiert sind - unsere fachkundigen Lösungen bieten bei jedem Schritt Klarheit und Unterstützung. Vertrauen Sie darauf, dass wir Sie durch die Komplexität der Kryptowährungs-Rückgewinnung führen und Ihnen helfen, die Kontrolle über Ihre finanzielle Zukunft selbstbewusst zurückzugewinnen.',
  'about.s1ImageAlt': 'Ein zerbrochener Ring, der sich wieder zusammensetzt, als Symbol für zurückgeholte Vermögenswerte',
  'about.s2Body1':
    'Wir sind auf fortschrittliches Kryptowährungs-Tracing spezialisiert, um Opfern von Cyberbetrug zu helfen, verlorene digitale Vermögenswerte zurückzuholen. Unsere zertifizierten Experten nutzen modernste Blockchain-Analyse, um die Bewegung gestohlener Gelder zu verfolgen und die Täter hinter dem Krypto-Diebstahl zu identifizieren.',
  'about.s2Body2':
    'Ob Ihre Vermögenswerte auf nicht nachverfolgbare Wallets übertragen oder über mehrere Plattformen verschoben wurden - unser Team ist in der Lage, der Spur zu folgen und Sie durch die Komplexität der Krypto-Rückgewinnung zu begleiten. Dank weltweiter Reichweite sind unsere Dienste überall auf der Welt zugänglich und bieten Ihnen die Unterstützung, die Sie brauchen, um Ihre Gelder sicher und effizient zurückzuholen.',
  'about.s2Body3':
    'Vertrauen Sie Cyberclaims als Ihrem Wegweiser durch die Blockchain, damit Sie die richtigen Schritte zur Rückgewinnung Ihrer Vermögenswerte unternehmen.',
  'about.s3Title': 'Unsere {accent}',
  'about.s3TitleA': 'Werte',
  'about.s3Body':
    'Bei Cyberclaims schaffen wir ein Umfeld, das die besten Talente der Krypto- und Blockchain-Rückgewinnungsbranche anzieht. Unser Team nutzt fortschrittliche Blockchain-Analyse, um Opfern von Cyberbetrug zu helfen, gestohlene digitale Vermögenswerte zurückzuholen. Mit weltweiter Präsenz und Expertise im Krypto-Tracing liefern wir wirksame, ergebnisorientierte Lösungen für Kunden weltweit. Schließen Sie sich uns an und leisten Sie einen Beitrag im Kampf gegen die Kryptokriminalität.',
  'about.s3ImageAlt': 'Ineinandergreifende Umlaufbahnen um einen leuchtenden Kern, als Symbol für unsere Werte',

  // Thank-you page
  'thankYou.metaTitle': 'Danke - Cyberclaims',
  'thankYou.metaDesc':
    'Wir haben Ihre Falldaten erhalten. Ein zertifizierter Ermittler antwortet innerhalb von 48 Stunden.',
  'thankYou.body':
    'Ein zertifizierter Ermittler prüft Ihren Fall und meldet sich innerhalb von <strong>48 Stunden</strong> bei Ihnen. Alles, was Sie uns senden, ist vertraulich.',
  'thankYou.warn':
    '<strong>Vorsicht vor Betrügern.</strong> Wir werden Sie niemals bitten, Kryptowährung zu senden oder im Voraus eine „Freigabegebühr“ zu zahlen, um Ihre Gelder zurückzuerhalten. Wer das tut, sind nicht wir.',
  'thankYou.urgent': 'Ist Ihr Anliegen dringend? Erreichen Sie uns unter {email}.',

  // URL checker page
  'urlChecker.metaTitle': 'URL-Checker - Cyberclaims',
  'urlChecker.metaDesc':
    'Prüfen Sie, ob eine Website-URL als unsicher eingestuft ist. Unser URL-Betrugsprüfer schützt Sie vor Phishing, Malware und schädlichen Websites.',
  'urlChecker.title': 'URL-Betrugsprüfer',
  'urlChecker.lead':
    'Geben Sie unten eine Website-URL ein, um zu prüfen, ob sie als unsicher eingestuft ist. Dieses Tool schützt Sie vor Phishing, Malware und schädlichen Websites, die Ihr Gerät beschädigen oder Ihre Daten stehlen könnten.',
  'urlChecker.inputLabel': 'Website-URL',
  'urlChecker.placeholder': 'z. B. https://example.com',
  'urlChecker.submit': 'URL prüfen',
  'urlChecker.legal': 'Die Ergebnisse sind nur ein Anhaltspunkt. Für eine vollständige Untersuchung eröffnen Sie einen Fall bei unserem Team.',

  // 404 page
  'notFound.metaTitle': 'Seite nicht gefunden - Cyberclaims',
  'notFound.help': 'Brauchen Sie Hilfe bei einem Fall? {start}, oder schreiben Sie an {email}.',
  'notFound.helpStart': 'Hier starten',

  // Contact page
  'contact.metaTitle': 'Kontakt - Cyberclaims',
  'contact.metaDesc':
    'Wurden Sie Opfer von Krypto-Betrug? Kontaktieren Sie Cyberclaims - wir können Ihnen helfen, Ihre Vermögenswerte zu verfolgen und einzufrieren.',
  'contact.heroIntro':
    'Wurden Sie Opfer von Krypto-Betrug? Wir können Ihnen helfen, Ihre Vermögenswerte zu verfolgen und einzufrieren. Handeln Sie jetzt.',
  'contact.heroImageAlt': 'Schwebende Kacheln mit Umschlag, Sprechblase, At-Zeichen und Kartenmarkierung',
  'contact.callUs': 'Rufen Sie uns an',
  'contact.office': 'Büro',
  'contact.formTitle': 'Senden Sie uns eine Nachricht',

  // Start Process wizard
  'startProcess.metaTitle': 'Prozess starten - Cyberclaims',
  'startProcess.metaDesc':
    'Reichen Sie eine Beschwerde bei Cyberclaims ein. Antworten Sie so detailliert wie möglich und erhalten Sie innerhalb von 24-72 Geschäftsstunden eine Antwort.',
  'startProcess.heroIntro':
    'Bitte füllen Sie das untenstehende Formular aus, um eine Beschwerde einzureichen. Bitte antworten Sie so detailliert wie möglich.',
  'startProcess.heroImageAlt':
    'Eine Checklisten-Kachel, verbunden mit Dokument-, Prüfungs- und Verifizierungsschritten',
  'startProcess.step1': 'Kontakt',
  'startProcess.step2': 'Betrag',
  'startProcess.step3': 'Vorfall',
  'startProcess.step4': 'Bestätigen',
  'startProcess.s1Title': 'Kontaktdaten',
  'startProcess.s2Title': 'Verlorener Betrag',
  'startProcess.s3Title': 'Informationen zum Vorfall',
  'startProcess.s4Title': 'Bestätigung',
  'startProcess.confirm':
    'Fast geschafft! Bitte überprüfen Sie alle Angaben und klicken Sie auf „Senden“, um Ihre Beschwerde abzusenden und innerhalb von 24-72 Geschäftsstunden eine Antwort von uns zu erhalten.',
  'startProcess.successTitle': 'Ihre Beschwerde wurde eingereicht',
  'startProcess.successBody':
    'Vielen Dank - unser Team prüft die von Ihnen angegebenen Daten und antwortet innerhalb von 24-72 Geschäftsstunden.',

  // Services index page
  'services.metaTitle': 'Unsere Leistungen - Cyberclaims',
  'services.metaDesc':
    'Vom Verfolgen gestohlener Kryptowährung bis zur Abschaltung von Websites decken unsere zertifizierten Experten das gesamte Spektrum der Cyberbetrugs-Ermittlung und Vermögensrückgewinnung ab.',
  'services.heroTitle': 'Unsere Leistungen',
  'services.heroIntro':
    'Vom Verfolgen gestohlener Kryptowährung bis zur Abschaltung betrügerischer Websites decken unsere zertifizierten Experten das gesamte Spektrum der Cyberbetrugs-Ermittlung und Vermögensrückgewinnung ab.',
  'services.heroImageAlt':
    'Schwebende Kacheln mit Bitcoin, einem Schild, einer Lupe, einer Waage, einem Dokument und einer gesperrten Website',
  'services.urlCheckerBlurb':
    'Prüfen Sie, ob eine Website als unsicher eingestuft ist, bevor Sie ihr Ihre Daten anvertrauen.',
  'services.openChecker': 'Checker öffnen',

  // Service names / descriptions
  'svc.cryptocurrency-recovery.title': 'Kryptowährungs-Rückgewinnung',
  'svc.cryptocurrency-recovery.blurb':
    'Die Nutzung von Kryptowährungen für Transaktionen garantiert keine vollständige Immunität gegen Online-Betrüger und Betrug.',
  'svc.cryptocurrency-recovery.short': 'Holen Sie durch Betrug, Diebstahl und Fälschung verlorene Vermögenswerte zurück.',
  'svc.cryptocurrency-tracing.title': 'Kryptowährungs-Nachverfolgung',
  'svc.cryptocurrency-tracing.blurb':
    'Unterstützung für Betrugsopfer, um Kryptowährungen, die an betrügerische Stellen gesendet wurden, zu verfolgen und Auszahlungspunkte zu identifizieren.',
  'svc.cryptocurrency-tracing.short': 'Verfolgen Sie gestohlene Kryptowährung bis zu den Auszahlungspunkten.',
  'svc.website-forensics.title': 'Website-Forensik',
  'svc.website-forensics.blurb':
    'Decken Sie Betrugsnetzwerke und digitale Forensik im Zusammenhang mit Betrug oder Markenverletzungen auf.',
  'svc.website-forensics.short': 'Decken Sie Betrugsnetzwerke und Betrugsbeweise auf.',
  'svc.brand-protection.title': 'Markenschutz',
  'svc.brand-protection.blurb':
    'Wir alle wissen, dass Cyberangriffe frustrierend sein können und Ihr geistiges Eigentum und Ihre Geschäftsgeheimnisse offenlegen.',
  'svc.brand-protection.short': 'Schützen Sie Ihr geistiges Eigentum und Ihre Marke vor Angriffen.',
  'svc.website-takedown.title': 'Website-Abschaltung',
  'svc.website-takedown.blurb':
    'Mit dem zunehmenden Fortschritt im digitalen Raum stehen die enormen Vorteile und Risiken außer Frage.',
  'svc.website-takedown.short': 'Lassen Sie betrügerische, rechtsverletzende Websites abschalten.',
  'svc.dispute-resolution-support.title': 'Unterstützung bei Streitbeilegung',
  'svc.dispute-resolution-support.blurb':
    'Die Unterstützung bei der Streitbeilegung umfasst alle Prozesse zur Beilegung von Streitigkeiten.',
  'svc.dispute-resolution-support.short': 'Begleitung durch den gesamten Streitprozess.',
  'svc.consultancy-documentation-support.title': 'Beratung & Dokumentationsunterstützung',
  'svc.consultancy-documentation-support.blurb':
    'Ein Beratungsunternehmen ohne angemessene Dokumentationsunterstützung zu beauftragen, ist ein kostspieliger Fehler.',
  'svc.consultancy-documentation-support.short': 'Fachkundige Beratung, nach allen Regeln.',
  'svc.due-diligence-investigations.title': 'Due-Diligence-Untersuchungen',
  'svc.due-diligence-investigations.blurb':
    'Viele bevorzugen es, ein bereits etabliertes Unternehmen zu erwerben oder mit ihm zusammenzuarbeiten - prüfen Sie, bevor Sie sich festlegen.',
  'svc.due-diligence-investigations.short': 'Prüfen Sie Partner, bevor Sie sich festlegen.',
  'svc.social-media-investigation.title': 'Social-Media-Ermittlung',
  'svc.social-media-investigation.blurb':
    'Verfolgen, analysieren und dokumentieren Sie Social-Media-Aktivitäten im Zusammenhang mit Betrug, Identitätsmissbrauch und Markenmissbrauch.',
  'svc.social-media-investigation.short': 'Verfolgen Sie Betrug und Identitätsmissbrauch in sozialen Medien.',
  'svc.business-services.title': 'Unternehmensdienstleistungen',
  'svc.business-services.blurb':
    'Die Geschäftswelt bleibt eine der wettbewerbsintensivsten Branchen unserer modernen Welt.',
  'svc.business-services.short': 'Maßgeschneiderte Dienste für wettbewerbsfähige Unternehmen.',

  // Sustainability + address
  'sus.treesPlanted': 'Gepflanzte Bäume',
  'sus.co2': 'CO₂ kompensiert',
  'sus.happyCustomers': 'Zufriedene Kunden',
  'contact.address': 'Kalvermarkt 53, 2511 CB, Den Haag, Niederlande.',
};
