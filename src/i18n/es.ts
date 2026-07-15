import type { UIKey } from './en';

// Spanish UI strings. A missing key is a compile error (Record<UIKey, string>).
export const es: Record<UIKey, string> = {
  // Navigation
  'nav.home': 'Inicio',
  'nav.about': 'Sobre nosotros',
  'nav.services': 'Servicios',
  'nav.news': 'Noticias',
  'nav.contact': 'Contacto',
  'nav.urlChecker': 'Verificador de URL',
  'nav.phoneCheck': 'Verificar teléfono',
  'nav.startProcess': 'Iniciar proceso',
  'nav.menu': 'Menú',
  'nav.close': 'Cerrar',
  'nav.allServices': 'Todos los servicios',

  // Buttons & shared actions
  'cta.startProcess': 'Iniciar proceso',
  'cta.contactUs': 'Contáctenos',
  'cta.learnMore': 'Saber más',
  'cta.readMore': 'Leer más',
  'cta.backHome': 'Volver al inicio',
  'cta.freeReview': 'Revisión gratuita del caso · respuesta en 48 horas',

  // Lead forms
  'form.fullName': 'Nombre completo',
  'form.email': 'Correo electrónico',
  'form.phone': 'Número de teléfono',
  'form.country': 'País de residencia',
  'form.amountLost': 'Cantidad perdida',
  'form.message': 'Mensaje',
  'form.platformName': 'Nombre de la plataforma',
  'form.platformWebsite': 'Sitio web de la plataforma',
  'form.firstTransaction': 'Fecha de la primera transacción',
  'form.lastTransaction': 'Fecha de la última transacción',
  'form.submit': 'Enviar',
  'form.sending': 'Enviando...',
  'form.back': 'Atrás',
  'form.next': 'Siguiente',
  'form.legal':
    'Protegido por CAPTCHA. Sus datos son confidenciales y son revisados por expertos certificados.',
  'form.successTitle': 'Hemos recibido sus datos',
  'form.successBody':
    'Un investigador certificado revisará su caso y responderá en un plazo de 48 horas. Todo lo que nos envíe es confidencial.',
  'form.errorGeneric':
    'Algo salió mal por nuestra parte. Vuelva a intentarlo o escriba a contact@cyberclaims.net.',
  'form.errorNetwork':
    'No se pudo conectar con el servidor. Compruebe su conexión e inténtelo de nuevo.',

  // News / blog
  'news.title': 'Noticias',
  'news.intro':
    'Guías, análisis de estafas e investigación de seguridad de nuestro equipo, para que detecte el fraude a tiempo y vaya un paso por delante.',
  'news.imageAlt': 'Fichas flotantes que muestran un periódico, una lupa, una bandera de alerta y un escudo',
  'news.allCategories': 'Todas',
  'news.readingTime': '{minutes} min de lectura',
  'news.empty': 'Aún no hay artículos. Vuelva pronto.',
  'news.related': 'Lecturas relacionadas',
  'news.seeAll': 'Ver todo',
  'news.by': 'Por',
  'news.backToNews': 'Todos los artículos',
  'news.loadMore': 'Cargar más',
  'news.loading': 'Cargando…',

  // Article sidebar
  'aside.services': 'Nuestros servicios',
  'share.title': 'Compartir este artículo',
  'share.on': 'Compartir en {platform}',
  'news.draftBanner': 'Está viendo un borrador. No es visible para nadie más.',

  // Q&A block
  'faq.eyebrow': 'Preguntas frecuentes',
  'faq.titleLead': '¿Tiene alguna',
  'faq.titleAccent': 'pregunta?',
  'faq.body':
    '¿No encuentra la respuesta que busca? Póngase en contacto con nuestro equipo y le responderemos en 24 horas.',

  // Trust / footer
  'trust.moj': 'Ministerio de Justicia neerlandés · POB {pob}',
  'trust.press': 'Presente en más de 350 medios de comunicación',
  'footer.rights': 'Todos los derechos reservados.',
  'footer.company': 'Transparent Business Solutions B.V.',

  // 404
  'notFound.title': 'Página no encontrada',
  'notFound.body':
    'Esa página no existe o se ha movido. Si alguien que dice representarnos le envió aquí, tenga cuidado: consulte la advertencia a continuación.',

  // Homepage
  'home.heroTitle': '¿Ha sido víctima de {accent}',
  'home.heroTitleA': 'estafas cripto?',
  'home.heroSub':
    'Podemos ayudarle a <strong>RASTREAR y CONGELAR</strong> sus activos. Cyberclaims, respaldada por la inteligencia y el análisis de blockchain líderes del mundo, ofrece servicios expertos de rastreo e investigación de criptomonedas para ayudar a los consumidores a afrontar casos complejos de fraude y estafas con criptomonedas.',
  'home.heroFormTitle': 'Inicie su recuperación',

  'home.aboutTitle': 'Hola, somos {accent}',
  'home.aboutTitleA': 'Cyberclaims',
  'home.aboutLead':
    'En Cyberclaims puede confiar en nuestro equipo de expertos dedicados y certificados para ofrecer e implementar las mejores soluciones a los desafíos que frenan el crecimiento de su negocio.',
  'home.aboutBody':
    'Si es víctima de fraude cibernético o ha perdido activos digitales por robo cibernético, contactarnos es el primer paso para recuperar sus activos y obtener el apoyo que necesita.',
  'home.aboutPoint1': 'Expertos certificados en análisis forense de cripto y blockchain',
  'home.aboutPoint2': 'Alcance global: trabajamos con usted desde cualquier lugar',
  'home.aboutPoint3': 'Revisión gratuita del caso con respuesta en 48 horas',
  'home.aboutImageAlt':
    'Rastreo en vivo del flujo de fondos en blockchain: nodos de cartera, exchange y mezclador vinculados a un punto de retirada marcado',

  'home.recTitle': 'Inicie su {accent} ahora',
  'home.recTitleA': 'recuperación',
  'home.recSub':
    'Hable con un experto certificado sobre su caso. Sin compromiso: solo una visión clara de sus opciones y los siguientes pasos.',

  'home.servicesTitle': 'Lo que {accent}',
  'home.servicesTitleA': 'investigamos',
  'home.servicesExplore': 'Explorar servicio',

  'home.tracingTitle': 'Rastreo de {accent}',
  'home.tracingTitleA': 'criptomonedas',
  'home.tracingBody':
    'Aprovechando la inteligencia y el análisis de blockchain líderes del mundo, ofrecemos información detallada sobre el rastreo de criptomonedas, los riesgos de blanqueo de capitales asociados a los proveedores de servicios de activos virtuales y mucho más. Nuestro software avanzado nos permite identificar riesgos relacionados con carteras cripto, seguir los puntos de retirada y determinar con precisión adónde se enviaron y dónde se retiraron los fondos.',
  'home.tracingViewMore': 'Ver más',
  'home.tracingChip1': 'On-chain',
  'home.tracingChip2': 'Riesgo VASP',
  'home.tracingChip3': 'Retirada',
  'home.tracingFoot': 'Fondos mapeados a lo largo de 5 saltos · 2 puntos de retirada marcados',

  'home.trace.victim': 'Cartera de la víctima',
  'home.trace.mixer': 'Mezclador',
  'home.trace.contract': 'Contrato de token',
  'home.trace.bridge': 'Puente',
  'home.trace.exchangeA': 'Exchange A',
  'home.trace.exchangeB': 'Exchange B',
  'home.trace.cashout': 'Retirada',
  'home.trace.hop': 'salto {n}',
  'home.trace.alt':
    'Gráfico ilustrativo de transacciones: los fondos que salen de la cartera de una víctima se siguen a través de un mezclador, un contrato de token, un puente y dos exchanges hasta un punto final de retirada.',

  'home.susTitle': 'Priorizamos la {accent}',
  'home.susTitleA': 'sostenibilidad',
  'home.susLead':
    'Combatir el delito digital no debería costarle al planeta. Parte de cada caso que resolvemos se destina a compensar nuestra huella.',

  'home.testiTitle': 'La confianza de personas a las que {accent}',
  'home.testiTitleA': 'ayudamos a recuperar',

  'home.partnersTitle': '{accent} del sector',
  'home.partnersTitleA': 'Aliados',
  'home.partnersLead':
    'Colaboramos con proveedores de inteligencia, bufetes de abogados y redes de cumplimiento líderes para dar a cada caso el alcance que necesita.',

  'home.pressBadge': 'Como se ha visto en — y en más de 350 sitios de noticias',
  'home.pressStory': 'La firma internacional de ciberdelincuencia {accent} en un caso de fraude con criptomonedas',
  'home.pressStoryA': 'CyberClaims recupera 90.000 €',
  'home.pressVerified': 'Verificado por BrandPush.co',

  'home.blogsTitle': 'Últimos {accent}',
  'home.blogsTitleA': 'artículos',
  'home.blogsAll': 'Todas las noticias',

  // Shared CTA strip
  'cta.stripTitle': '¿Ha sido víctima de {accent}',
  'cta.stripTitleA': 'estafas cripto?',
  'cta.stripSub': 'Podemos ayudarle a rastrear y congelar sus activos. Actúe ahora.',

  // Legal page titles
  'legal.privacyTitle': 'Política de privacidad',
  'legal.cookieTitle': 'Política de cookies',
  'legal.termsTitle': 'Términos y condiciones',
  'legal.dpaTitle': 'Anexo de protección de datos',

  // Footer
  'footer.tag': 'Protegemos su mundo digital, una reclamación a la vez',
  'footer.badgeRegistered': 'TBS B.V. registrada',
  'footer.badgeGdpr': 'Conforme al RGPD',
  'footer.colCompany': 'Empresa',
  'footer.colResources': 'Recursos',
  'footer.colContact': 'Contacto',
  'footer.legal':
    'Transparent Business Solutions B.V. (que opera como Cyberclaims) ofrece consultas gratuitas. Otros servicios implican los anticipos, honorarios o comisiones aplicables. Transparent Business Solutions B.V. es una agencia de investigación privada autorizada con el número POB {pob} del Ministerio de Justicia y Seguridad de los Países Bajos.',
  'footer.copyright': '© {year} Copyright Cyberclaims. Todos los derechos reservados.',

  // Impersonator warning band
  'impersonator.title': '¡Cuidado con los impostores!',
  'impersonator.body1':
    'Nos han alertado de que hay personas haciéndose pasar por representantes de CyberClaims para engañar a las víctimas. Los estafadores pueden llamar fingiendo ser nosotros y dirigirle a nuestro sitio.',
  'impersonator.body2':
    'Todos los correos, contratos y solicitudes de pago provendrán exclusivamente de @cyberclaims.net.',
  'impersonator.body3': 'Si tiene dudas, verifíquelo con nosotros en {email}. Manténgase alerta y a salvo.',

  // Services rail
  'servicesRail.exploreOur': 'Explore nuestros',
  'servicesRail.exploreOther': 'Explore otros',
  'servicesRail.services': 'servicios',

  // About page
  'about.metaTitle': 'Sobre nosotros - Cyberclaims',
  'about.metaDesc':
    'Descubra quiénes somos y cómo le ayudamos a recuperar sus fondos y criptomonedas perdidos con análisis forense certificado de cripto y blockchain.',
  'about.heroTitle': 'Descubra quiénes somos y cómo le ayudamos a recuperar sus fondos perdidos',
  'about.heroImageAlt':
    'Cinco fichas enlazadas que ascienden de izquierda a derecha: una moneda agrietada, una lupa, una red de carteras rastreadas, un expediente y una cartera recuperada',
  'about.s1Title': 'Convertir lo imposible en realidad: recuperar fondos perdidos y {accent}',
  'about.s1TitleA': 'criptomonedas',
  'about.s1Body':
    'En Cyberclaims nos especializamos en inteligencia de criptomonedas y análisis de blockchain de vanguardia para proteger sus activos digitales y recuperar fondos perdidos. Ya sea que se enfrente a estafas cripto, fraude o amenazas de seguridad, nuestras soluciones expertas aportan claridad y apoyo en cada paso. Confíe en nosotros para navegar la complejidad de la recuperación de criptomonedas y recupere el control de su futuro financiero con confianza.',
  'about.s1ImageAlt': 'Un anillo fracturado que se reensambla, símbolo de los activos recuperados',
  'about.s2Body1':
    'Nos especializamos en el rastreo avanzado de criptomonedas para ayudar a las víctimas de fraude cibernético a recuperar activos digitales perdidos. Nuestros expertos certificados utilizan análisis de blockchain de vanguardia para seguir el movimiento de los fondos robados e identificar a los responsables del robo de cripto.',
  'about.s2Body2':
    'Ya sea que sus activos se hayan transferido a carteras imposibles de rastrear o se hayan movido por varias plataformas, nuestro equipo está preparado para seguir el rastro y ayudarle a navegar la complejidad de la recuperación de cripto. Con un alcance global, nuestros servicios son accesibles desde cualquier parte del mundo y le brindan el apoyo que necesita para recuperar sus fondos de forma segura y eficiente.',
  'about.s2Body3':
    'Confíe en Cyberclaims como su guía a través de la blockchain, garantizando que dé los pasos correctos hacia la recuperación de sus activos.',
  'about.s3Title': 'Nuestros {accent}',
  'about.s3TitleA': 'valores',
  'about.s3Body':
    'En Cyberclaims creamos un entorno que atrae al mejor talento del sector de la recuperación de cripto y blockchain. Nuestro equipo utiliza análisis de blockchain avanzados para ayudar a las víctimas de fraude cibernético a recuperar activos digitales robados. Con presencia global y experiencia en rastreo de cripto, ofrecemos soluciones eficaces y orientadas a resultados a clientes de todo el mundo. Únase a nosotros y marque la diferencia en la lucha contra el delito cripto.',
  'about.s3ImageAlt': 'Órbitas entrelazadas alrededor de un núcleo brillante, símbolo de nuestros valores',

  // Thank-you page
  'thankYou.metaTitle': 'Gracias - Cyberclaims',
  'thankYou.metaDesc':
    'Hemos recibido los detalles de su caso. Un investigador certificado responderá en un plazo de 48 horas.',
  'thankYou.body':
    'Un investigador certificado revisará su caso y le responderá en un plazo de <strong>48 horas</strong>. Todo lo que nos envíe es confidencial.',
  'thankYou.warn':
    '<strong>Cuidado con los impostores.</strong> Nunca le pediremos que envíe criptomonedas ni que pague una «tarifa de liberación» por adelantado para recuperar sus fondos. Quien lo haga no somos nosotros.',
  'thankYou.urgent': 'Si su asunto es urgente, contáctenos en {email}.',

  // URL checker page
  'urlChecker.metaTitle': 'Verificador de URL - Cyberclaims',
  'urlChecker.metaDesc':
    'Compruebe si la URL de un sitio web está marcada como no segura. Nuestro verificador de estafas le protege del phishing, el malware y los sitios maliciosos.',
  'urlChecker.title': 'Verificador de estafas por URL',
  'urlChecker.lead':
    'Introduzca la URL de un sitio web a continuación para comprobar si está marcada como no segura. Esta herramienta le protege del phishing, el malware y los sitios maliciosos que podrían dañar su dispositivo o robar sus datos.',
  'urlChecker.inputLabel': 'URL del sitio web',
  'urlChecker.placeholder': 'p. ej., https://example.com',
  'urlChecker.submit': 'Verificar URL',
  'urlChecker.legal': 'Los resultados son solo orientativos. Para una investigación completa, abra un caso con nuestro equipo.',

  // 404 page
  'notFound.metaTitle': 'Página no encontrada - Cyberclaims',
  'notFound.help': '¿Busca ayuda con un caso? {start}, o escriba a {email}.',
  'notFound.helpStart': 'Empiece aquí',

  // Contact page
  'contact.metaTitle': 'Contacto - Cyberclaims',
  'contact.metaDesc':
    '¿Ha sido víctima de estafas cripto? Contacte con Cyberclaims: podemos ayudarle a rastrear y congelar sus activos.',
  'contact.heroIntro':
    '¿Ha sido víctima de estafas cripto? Podemos ayudarle a rastrear y congelar sus activos. Actúe ahora.',
  'contact.heroImageAlt': 'Fichas flotantes que muestran un sobre, un globo de chat, una arroba y un marcador de mapa',
  'contact.callUs': 'Llámenos',
  'contact.office': 'Oficina',
  'contact.formTitle': 'Envíenos un mensaje',

  // Start Process wizard
  'startProcess.metaTitle': 'Iniciar proceso - Cyberclaims',
  'startProcess.metaDesc':
    'Presente una reclamación con Cyberclaims. Responda con el mayor detalle posible y reciba una respuesta en un plazo de 24-72 horas hábiles.',
  'startProcess.heroIntro':
    'Rellene el formulario a continuación para presentar una reclamación. Responda con el mayor detalle posible.',
  'startProcess.heroImageAlt': 'Una ficha de lista de verificación vinculada a los pasos de documento, revisión y verificación',
  'startProcess.step1': 'Contacto',
  'startProcess.step2': 'Cantidad',
  'startProcess.step3': 'Incidente',
  'startProcess.step4': 'Confirmar',
  'startProcess.s1Title': 'Datos de contacto',
  'startProcess.s2Title': 'Cantidad perdida',
  'startProcess.s3Title': 'Información del incidente',
  'startProcess.s4Title': 'Confirmación',
  'startProcess.confirm':
    '¡Ya casi está! Revise toda la información y haga clic en «Enviar» para remitir su reclamación y recibir una respuesta nuestra en un plazo de 24-72 horas hábiles.',
  'startProcess.successTitle': 'Su reclamación ha sido enviada',
  'startProcess.successBody':
    'Gracias: nuestro equipo revisará los detalles que ha proporcionado y responderá en un plazo de 24-72 horas hábiles.',

  // Services index page
  'services.metaTitle': 'Nuestros servicios - Cyberclaims',
  'services.metaDesc':
    'Desde el rastreo de cripto robado hasta la retirada de sitios web, nuestros expertos certificados cubren todo el espectro de la investigación de fraude cibernético y la recuperación de activos.',
  'services.heroTitle': 'Nuestros servicios',
  'services.heroIntro':
    'Desde el rastreo de cripto robado hasta la retirada de sitios web fraudulentos, nuestros expertos certificados cubren todo el espectro de la investigación de fraude cibernético y la recuperación de activos.',
  'services.heroImageAlt':
    'Fichas flotantes que muestran bitcoin, un escudo, una lupa, una balanza, un documento y un sitio bloqueado',
  'services.urlCheckerBlurb':
    'Compruebe si un sitio web está marcado como no seguro antes de confiarle sus datos.',
  'services.openChecker': 'Abrir verificador',

  // Service names / descriptions
  'svc.cryptocurrency-recovery.title': 'Recuperación de criptomonedas',
  'svc.cryptocurrency-recovery.blurb':
    'Usar criptomonedas para las transacciones no garantiza una inmunidad total frente a estafadores y fraudes en línea.',
  'svc.cryptocurrency-recovery.short': 'Recupere activos perdidos por estafas, robos y fraudes.',
  'svc.cryptocurrency-tracing.title': 'Rastreo de criptomonedas',
  'svc.cryptocurrency-tracing.blurb':
    'Asistencia a las víctimas de estafas para rastrear las criptomonedas enviadas a entidades fraudulentas e identificar los puntos de retirada.',
  'svc.cryptocurrency-tracing.short': 'Rastree el cripto robado hasta sus puntos de retirada.',
  'svc.website-forensics.title': 'Análisis forense de sitios web',
  'svc.website-forensics.blurb':
    'Descubra redes de estafas y evidencia forense digital relacionada con fraudes o infracciones de marca.',
  'svc.website-forensics.short': 'Descubra redes de estafas y pruebas de fraude.',
  'svc.brand-protection.title': 'Protección de marca',
  'svc.brand-protection.blurb':
    'Todos sabemos que los ciberataques pueden ser frustrantes y dejar expuestos su propiedad intelectual y sus secretos comerciales.',
  'svc.brand-protection.short': 'Proteja su propiedad intelectual y su marca de los ataques.',
  'svc.website-takedown.title': 'Retirada de sitios web',
  'svc.website-takedown.blurb':
    'Con el avance del espacio digital, no cabe duda de sus enormes beneficios y riesgos.',
  'svc.website-takedown.short': 'Retire sitios fraudulentos e infractores.',
  'svc.dispute-resolution-support.title': 'Apoyo en la resolución de disputas',
  'svc.dispute-resolution-support.blurb':
    'El apoyo en la resolución de disputas abarca todos los procesos orientados a resolver conflictos.',
  'svc.dispute-resolution-support.short': 'Apoyo durante todo el proceso de disputa.',
  'svc.consultancy-documentation-support.title': 'Consultoría y apoyo documental',
  'svc.consultancy-documentation-support.blurb':
    'Contratar los servicios de una consultora sin el apoyo documental adecuado es un error costoso.',
  'svc.consultancy-documentation-support.short': 'Consultoría experta, hecha con rigor.',
  'svc.due-diligence-investigations.title': 'Investigaciones de diligencia debida',
  'svc.due-diligence-investigations.blurb':
    'Muchos prefieren adquirir o asociarse con un negocio ya establecido: verifique antes de comprometerse.',
  'svc.due-diligence-investigations.short': 'Verifique a sus socios antes de comprometerse.',
  'svc.social-media-investigation.title': 'Investigación en redes sociales',
  'svc.social-media-investigation.blurb':
    'Rastree, analice y documente la actividad en redes sociales vinculada al fraude, la suplantación y el abuso de marca.',
  'svc.social-media-investigation.short': 'Rastree el fraude y la suplantación en redes sociales.',
  'svc.business-services.title': 'Servicios empresariales',
  'svc.business-services.blurb':
    'El sector empresarial sigue siendo uno de los más competitivos de nuestro mundo moderno.',
  'svc.business-services.short': 'Servicios a medida para empresas competitivas.',

  // Sustainability stat labels + contact address
  'sus.treesPlanted': 'Árboles plantados',
  'sus.co2': 'CO₂ compensado',
  'sus.happyCustomers': 'Clientes satisfechos',
  'contact.address': 'Kalvermarkt 53, 2511 CB, La Haya, Países Bajos.',
} as const;
