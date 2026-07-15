import type { UIKey } from './en';

// Portuguese UI strings. A missing key is a compile error (Record<UIKey, string>).
export const pt: Record<UIKey, string> = {
  // Navigation
  'nav.home': 'Início',
  'nav.about': 'Sobre nós',
  'nav.services': 'Serviços',
  'nav.news': 'Notícias',
  'nav.contact': 'Contacto',
  'nav.urlChecker': 'Verificador de URL',
  'nav.phoneCheck': 'Verificar telefone',
  'nav.startProcess': 'Iniciar processo',
  'nav.menu': 'Menu',
  'nav.close': 'Fechar',
  'nav.allServices': 'Todos os serviços',

  // Buttons & shared actions
  'cta.startProcess': 'Iniciar processo',
  'cta.contactUs': 'Contacte-nos',
  'cta.learnMore': 'Saber mais',
  'cta.readMore': 'Ler mais',
  'cta.backHome': 'Voltar ao início',
  'cta.freeReview': 'Análise gratuita do caso · resposta em 48 horas',

  // Lead forms
  'form.fullName': 'Nome completo',
  'form.email': 'E-mail',
  'form.phone': 'Número de telefone',
  'form.country': 'País de residência',
  'form.amountLost': 'Montante perdido',
  'form.message': 'Mensagem',
  'form.platformName': 'Nome da plataforma',
  'form.platformWebsite': 'Site da plataforma',
  'form.firstTransaction': 'Data da primeira transação',
  'form.lastTransaction': 'Data da última transação',
  'form.submit': 'Enviar',
  'form.sending': 'A enviar...',
  'form.back': 'Voltar',
  'form.next': 'Seguinte',
  'form.legal':
    'Protegido por CAPTCHA. Os seus dados são confidenciais e analisados por peritos certificados.',
  'form.successTitle': 'Recebemos os seus dados',
  'form.successBody':
    'Um investigador certificado irá analisar o seu caso e responder no prazo de 48 horas. Tudo o que nos enviar é confidencial.',
  'form.errorGeneric':
    'Algo correu mal do nosso lado. Tente novamente ou escreva para contact@cyberclaims.net.',
  'form.errorNetwork':
    'Não foi possível contactar o servidor. Verifique a sua ligação e tente novamente.',

  // News / blog
  'news.title': 'Notícias',
  'news.intro':
    'Guias, análises de burlas e investigação de segurança da nossa equipa, para que detete a fraude cedo e fique um passo à frente.',
  'news.imageAlt': 'Cartões flutuantes a mostrar um jornal, uma lupa, uma bandeira de alerta e um escudo',
  'news.allCategories': 'Todas',
  'news.readingTime': '{minutes} min de leitura',
  'news.empty': 'Ainda não há artigos. Volte em breve.',
  'news.related': 'Leituras relacionadas',
  'news.seeAll': 'Ver tudo',
  'news.by': 'Por',
  'news.backToNews': 'Todos os artigos',
  'news.loadMore': 'Carregar mais',
  'news.loading': 'A carregar…',

  // Article sidebar
  'aside.services': 'Os nossos serviços',
  'share.title': 'Partilhar este artigo',
  'share.on': 'Partilhar no {platform}',
  'news.draftBanner': 'Está a pré-visualizar um rascunho. Não é visível para mais ninguém.',

  // Q&A block
  'faq.eyebrow': 'Perguntas frequentes',
  'faq.titleLead': 'Tem alguma',
  'faq.titleAccent': 'pergunta?',
  'faq.body':
    'Não encontra a resposta que procura? Contacte a nossa equipa e responder-lhe-emos no prazo de 24 horas.',

  // Trust / footer
  'trust.moj': 'Ministério da Justiça neerlandês · POB {pob}',
  'trust.press': 'Presente em mais de 350 meios de comunicação',
  'footer.rights': 'Todos os direitos reservados.',
  'footer.company': 'Transparent Business Solutions B.V.',

  // 404
  'notFound.title': 'Página não encontrada',
  'notFound.body':
    'Essa página não existe ou foi movida. Se foi enviado para aqui por alguém que diz representar-nos, tenha cuidado: consulte o aviso abaixo.',

  // Homepage
  'home.heroTitle': 'Foi vítima de {accent}',
  'home.heroTitleA': 'burlas com criptomoedas?',
  'home.heroSub':
    'Podemos ajudá-lo a <strong>RASTREAR e CONGELAR</strong> os seus ativos. A Cyberclaims, apoiada pela inteligência e análise de blockchain líderes mundiais, oferece serviços especializados de rastreio e investigação de criptomoedas para ajudar os consumidores a lidar com casos complexos de fraude e burlas com criptomoedas.',
  'home.heroFormTitle': 'Inicie a sua recuperação',

  'home.aboutTitle': 'Olá, somos a {accent}',
  'home.aboutTitleA': 'Cyberclaims',
  'home.aboutLead':
    'Na Cyberclaims pode contar com a nossa equipa de peritos dedicados e certificados para oferecer e implementar as melhores soluções para os desafios que travam o crescimento do seu negócio.',
  'home.aboutBody':
    'Se é vítima de fraude cibernética ou perdeu ativos digitais devido a roubo cibernético, contactar-nos é o primeiro passo para recuperar os seus ativos e obter o apoio de que necessita.',
  'home.aboutPoint1': 'Peritos certificados em análise forense de cripto e blockchain',
  'home.aboutPoint2': 'Alcance global — trabalhamos consigo a partir de qualquer lugar',
  'home.aboutPoint3': 'Análise gratuita do caso com resposta em 48 horas',
  'home.aboutImageAlt':
    'Rastreio ao vivo do fluxo de fundos em blockchain: nós de carteira, exchange e mixer ligados a um ponto de levantamento assinalado',

  'home.recTitle': 'Inicie a sua {accent} agora',
  'home.recTitleA': 'recuperação',
  'home.recSub':
    'Fale com um perito certificado sobre o seu caso. Sem compromisso — apenas uma visão clara das suas opções e dos próximos passos.',

  'home.servicesTitle': 'O que {accent}',
  'home.servicesTitleA': 'investigamos',
  'home.servicesExplore': 'Explorar serviço',

  'home.tracingTitle': 'Rastreio de {accent}',
  'home.tracingTitleA': 'criptomoedas',
  'home.tracingBody':
    'Aproveitando a inteligência e a análise de blockchain líderes mundiais, oferecemos informações detalhadas sobre o rastreio de criptomoedas, os riscos de branqueamento de capitais associados aos prestadores de serviços de ativos virtuais e muito mais. O nosso software avançado permite-nos identificar riscos relacionados com carteiras cripto, seguir os pontos de levantamento e determinar com precisão para onde os fundos foram enviados e levantados.',
  'home.tracingViewMore': 'Ver mais',
  'home.tracingChip1': 'On-chain',
  'home.tracingChip2': 'Risco VASP',
  'home.tracingChip3': 'Levantamento',
  'home.tracingFoot': 'Fundos mapeados ao longo de 5 saltos · 2 pontos de levantamento assinalados',

  'home.trace.victim': 'Carteira da vítima',
  'home.trace.mixer': 'Mixer',
  'home.trace.contract': 'Contrato de token',
  'home.trace.bridge': 'Ponte',
  'home.trace.exchangeA': 'Exchange A',
  'home.trace.exchangeB': 'Exchange B',
  'home.trace.cashout': 'Levantamento',
  'home.trace.hop': 'salto {n}',
  'home.trace.alt':
    'Gráfico ilustrativo de transações: os fundos que saem da carteira de uma vítima são seguidos através de um mixer, um contrato de token, uma ponte e dois exchanges até um ponto final de levantamento.',

  'home.susTitle': 'Priorizamos a {accent}',
  'home.susTitleA': 'sustentabilidade',
  'home.susLead':
    'Combater o crime digital não deve custar ao planeta. Parte de cada caso que resolvemos é reinvestida na compensação da nossa pegada.',

  'home.testiTitle': 'A confiança de pessoas que {accent}',
  'home.testiTitleA': 'ajudámos a recuperar',

  'home.partnersTitle': '{accent} do setor',
  'home.partnersTitleA': 'Aliados',
  'home.partnersLead':
    'Trabalhamos em conjunto com fornecedores de inteligência, escritórios de advogados e redes de conformidade líderes para dar a cada caso o alcance de que necessita.',

  'home.pressBadge': 'Como visto em — e em mais de 350 sites de notícias',
  'home.pressStory': 'Empresa internacional de cibercrime {accent} num caso de fraude com criptomoedas',
  'home.pressStoryA': 'CyberClaims recupera 90 000 €',
  'home.pressVerified': 'Verificado pela BrandPush.co',

  'home.blogsTitle': 'Últimos {accent}',
  'home.blogsTitleA': 'artigos',
  'home.blogsAll': 'Todas as notícias',

  // Shared CTA strip
  'cta.stripTitle': 'Foi vítima de {accent}',
  'cta.stripTitleA': 'burlas com criptomoedas?',
  'cta.stripSub': 'Podemos ajudá-lo a rastrear e congelar os seus ativos. Aja agora.',

  // Legal page titles
  'legal.privacyTitle': 'Política de privacidade',
  'legal.cookieTitle': 'Política de cookies',
  'legal.termsTitle': 'Termos e condições',
  'legal.dpaTitle': 'Adenda de proteção de dados',

  // Footer
  'footer.tag': 'A proteger o seu mundo digital, uma reclamação de cada vez',
  'footer.badgeRegistered': 'TBS B.V. registada',
  'footer.badgeGdpr': 'Em conformidade com o RGPD',
  'footer.colCompany': 'Empresa',
  'footer.colResources': 'Recursos',
  'footer.colContact': 'Contacto',
  'footer.legal':
    'A Transparent Business Solutions B.V. (que opera como Cyberclaims) oferece consultas gratuitas. Outros serviços implicam os avanços, honorários ou comissões aplicáveis. A Transparent Business Solutions B.V. é uma agência de investigação privada autorizada com o número POB {pob} do Ministério da Justiça e Segurança dos Países Baixos.',
  'footer.copyright': '© {year} Copyright Cyberclaims. Todos os direitos reservados.',

  // Impersonator warning band
  'impersonator.title': 'Cuidado com os impostores!',
  'impersonator.body1':
    'Fomos alertados de que há indivíduos a fazerem-se passar por representantes da CyberClaims para enganar as vítimas. Os burlões podem ligar fingindo ser nós e encaminhá-lo para o nosso site.',
  'impersonator.body2':
    'Todos os e-mails, contratos e pedidos de pagamento virão exclusivamente de @cyberclaims.net.',
  'impersonator.body3': 'Em caso de dúvida, confirme connosco em {email}. Mantenha-se atento e em segurança.',

  // Services rail
  'servicesRail.exploreOur': 'Explore os nossos',
  'servicesRail.exploreOther': 'Explore outros',
  'servicesRail.services': 'serviços',

  // About page
  'about.metaTitle': 'Sobre nós - Cyberclaims',
  'about.metaDesc':
    'Descubra quem somos e como o ajudamos a recuperar os seus fundos e criptomoedas perdidos com análise forense certificada de cripto e blockchain.',
  'about.heroTitle': 'Descubra quem somos e como o ajudamos a recuperar os seus fundos perdidos',
  'about.heroImageAlt':
    'Cinco cartões ligados que sobem da esquerda para a direita: uma moeda rachada, uma lupa, uma rede de carteiras rastreadas, um processo e uma carteira recuperada',
  'about.s1Title': 'Tornar o impossível realidade: recuperar fundos perdidos e {accent}',
  'about.s1TitleA': 'criptomoedas',
  'about.s1Body':
    'Na Cyberclaims especializamo-nos em inteligência de criptomoedas e análise de blockchain de ponta para proteger os seus ativos digitais e recuperar fundos perdidos. Quer esteja a lidar com burlas cripto, fraude ou ameaças de segurança, as nossas soluções especializadas oferecem clareza e apoio em cada passo. Confie em nós para navegar a complexidade da recuperação de criptomoedas e retome o controlo do seu futuro financeiro com confiança.',
  'about.s1ImageAlt': 'Um anel fraturado a reagrupar-se, símbolo dos ativos recuperados',
  'about.s2Body1':
    'Especializamo-nos no rastreio avançado de criptomoedas para ajudar as vítimas de fraude cibernética a recuperar ativos digitais perdidos. Os nossos peritos certificados usam análise de blockchain de ponta para seguir o movimento dos fundos roubados e identificar os responsáveis pelo roubo de cripto.',
  'about.s2Body2':
    'Quer os seus ativos tenham sido transferidos para carteiras impossíveis de rastrear ou movidos por várias plataformas, a nossa equipa está preparada para seguir o rasto e ajudá-lo a navegar a complexidade da recuperação de cripto. Com um alcance global, os nossos serviços são acessíveis a partir de qualquer parte do mundo e dão-lhe o apoio de que necessita para recuperar os seus fundos de forma segura e eficiente.',
  'about.s2Body3':
    'Confie na Cyberclaims como o seu guia através da blockchain, garantindo que dá os passos certos rumo à recuperação dos seus ativos.',
  'about.s3Title': 'Os nossos {accent}',
  'about.s3TitleA': 'valores',
  'about.s3Body':
    'Na Cyberclaims criamos um ambiente que atrai os melhores talentos do setor da recuperação de cripto e blockchain. A nossa equipa usa análise de blockchain avançada para ajudar as vítimas de fraude cibernética a recuperar ativos digitais roubados. Com presença global e experiência em rastreio de cripto, oferecemos soluções eficazes e orientadas para resultados a clientes de todo o mundo. Junte-se a nós e faça a diferença na luta contra o crime cripto.',
  'about.s3ImageAlt': 'Órbitas entrelaçadas em torno de um núcleo brilhante, símbolo dos nossos valores',

  // Thank-you page
  'thankYou.metaTitle': 'Obrigado - Cyberclaims',
  'thankYou.metaDesc':
    'Recebemos os detalhes do seu caso. Um investigador certificado responderá no prazo de 48 horas.',
  'thankYou.body':
    'Um investigador certificado irá analisar o seu caso e responder-lhe no prazo de <strong>48 horas</strong>. Tudo o que nos enviar é confidencial.',
  'thankYou.warn':
    '<strong>Cuidado com os impostores.</strong> Nunca lhe pediremos que envie criptomoedas nem que pague uma «taxa de libertação» adiantada para recuperar os seus fundos. Quem o fizer não somos nós.',
  'thankYou.urgent': 'Se o seu assunto é urgente, contacte-nos em {email}.',

  // URL checker page
  'urlChecker.metaTitle': 'Verificador de URL - Cyberclaims',
  'urlChecker.metaDesc':
    'Verifique se o URL de um site está assinalado como não seguro. O nosso verificador de burlas protege-o de phishing, malware e sites maliciosos.',
  'urlChecker.title': 'Verificador de burlas por URL',
  'urlChecker.lead':
    'Introduza o URL de um site abaixo para verificar se está assinalado como não seguro. Esta ferramenta protege-o de phishing, malware e sites maliciosos que podem danificar o seu dispositivo ou roubar os seus dados.',
  'urlChecker.inputLabel': 'URL do site',
  'urlChecker.placeholder': 'p. ex., https://example.com',
  'urlChecker.submit': 'Verificar URL',
  'urlChecker.legal': 'Os resultados são apenas indicativos. Para uma investigação completa, abra um caso com a nossa equipa.',

  // 404 page
  'notFound.metaTitle': 'Página não encontrada - Cyberclaims',
  'notFound.help': 'Procura ajuda com um caso? {start}, ou escreva para {email}.',
  'notFound.helpStart': 'Comece aqui',

  // Contact page
  'contact.metaTitle': 'Contacto - Cyberclaims',
  'contact.metaDesc':
    'Foi vítima de burlas com criptomoedas? Contacte a Cyberclaims — podemos ajudá-lo a rastrear e congelar os seus ativos.',
  'contact.heroIntro':
    'Foi vítima de burlas com criptomoedas? Podemos ajudá-lo a rastrear e congelar os seus ativos. Aja agora.',
  'contact.heroImageAlt': 'Cartões flutuantes a mostrar um envelope, um balão de conversa, uma arroba e um marcador de mapa',
  'contact.callUs': 'Ligue-nos',
  'contact.office': 'Escritório',
  'contact.formTitle': 'Envie-nos uma mensagem',

  // Start Process wizard
  'startProcess.metaTitle': 'Iniciar processo - Cyberclaims',
  'startProcess.metaDesc':
    'Apresente uma reclamação à Cyberclaims. Responda com o máximo de detalhe possível e receba uma resposta no prazo de 24-72 horas úteis.',
  'startProcess.heroIntro':
    'Preencha o formulário abaixo para apresentar uma reclamação. Responda com o máximo de detalhe possível.',
  'startProcess.heroImageAlt': 'Um cartão de lista de verificação ligado aos passos de documento, análise e verificação',
  'startProcess.step1': 'Contacto',
  'startProcess.step2': 'Montante',
  'startProcess.step3': 'Incidente',
  'startProcess.step4': 'Confirmar',
  'startProcess.s1Title': 'Dados de contacto',
  'startProcess.s2Title': 'Montante perdido',
  'startProcess.s3Title': 'Informação do incidente',
  'startProcess.s4Title': 'Confirmação',
  'startProcess.confirm':
    'Está quase! Reveja toda a informação e clique em «Enviar» para submeter a sua reclamação e receber uma resposta nossa no prazo de 24-72 horas úteis.',
  'startProcess.successTitle': 'A sua reclamação foi submetida',
  'startProcess.successBody':
    'Obrigado — a nossa equipa irá analisar os detalhes que forneceu e responder no prazo de 24-72 horas úteis.',

  // Services index page
  'services.metaTitle': 'Os nossos serviços - Cyberclaims',
  'services.metaDesc':
    'Do rastreio de cripto roubado à remoção de sites, os nossos peritos certificados cobrem todo o espectro da investigação de fraude cibernética e da recuperação de ativos.',
  'services.heroTitle': 'Os nossos serviços',
  'services.heroIntro':
    'Do rastreio de cripto roubado à remoção de sites fraudulentos, os nossos peritos certificados cobrem todo o espectro da investigação de fraude cibernética e da recuperação de ativos.',
  'services.heroImageAlt':
    'Cartões flutuantes a mostrar bitcoin, um escudo, uma lupa, uma balança, um documento e um site bloqueado',
  'services.urlCheckerBlurb':
    'Verifique se um site está assinalado como não seguro antes de lhe confiar os seus dados.',
  'services.openChecker': 'Abrir verificador',

  // Service names / descriptions
  'svc.cryptocurrency-recovery.title': 'Recuperação de criptomoedas',
  'svc.cryptocurrency-recovery.blurb':
    'Usar criptomoedas nas transações não garante imunidade total face a burlões e fraudes online.',
  'svc.cryptocurrency-recovery.short': 'Recupere ativos perdidos em burlas, roubos e fraudes.',
  'svc.cryptocurrency-tracing.title': 'Rastreio de criptomoedas',
  'svc.cryptocurrency-tracing.blurb':
    'Assistência às vítimas de burlas para rastrear as criptomoedas enviadas a entidades fraudulentas e identificar os pontos de levantamento.',
  'svc.cryptocurrency-tracing.short': 'Rastreie o cripto roubado até aos seus pontos de levantamento.',
  'svc.website-forensics.title': 'Análise forense de sites',
  'svc.website-forensics.blurb':
    'Descubra redes de burlas e evidência forense digital relacionada com fraudes ou infrações de marca.',
  'svc.website-forensics.short': 'Descubra redes de burlas e provas de fraude.',
  'svc.brand-protection.title': 'Proteção de marca',
  'svc.brand-protection.blurb':
    'Todos sabemos que os ciberataques podem ser frustrantes e deixar expostos a sua propriedade intelectual e os seus segredos comerciais.',
  'svc.brand-protection.short': 'Proteja a sua propriedade intelectual e a sua marca dos ataques.',
  'svc.website-takedown.title': 'Remoção de sites',
  'svc.website-takedown.blurb':
    'Com o avanço do espaço digital, não há dúvida quanto aos seus enormes benefícios e riscos.',
  'svc.website-takedown.short': 'Remova sites fraudulentos e infratores.',
  'svc.dispute-resolution-support.title': 'Apoio na resolução de litígios',
  'svc.dispute-resolution-support.blurb':
    'O apoio na resolução de litígios abrange todos os processos orientados para resolver conflitos.',
  'svc.dispute-resolution-support.short': 'Apoio durante todo o processo de litígio.',
  'svc.consultancy-documentation-support.title': 'Consultoria e apoio documental',
  'svc.consultancy-documentation-support.blurb':
    'Contratar os serviços de uma consultora sem o apoio documental adequado é um erro dispendioso.',
  'svc.consultancy-documentation-support.short': 'Consultoria especializada, feita com rigor.',
  'svc.due-diligence-investigations.title': 'Investigações de devida diligência',
  'svc.due-diligence-investigations.blurb':
    'Muitos preferem adquirir ou associar-se a um negócio já estabelecido — verifique antes de se comprometer.',
  'svc.due-diligence-investigations.short': 'Verifique os seus parceiros antes de se comprometer.',
  'svc.social-media-investigation.title': 'Investigação em redes sociais',
  'svc.social-media-investigation.blurb':
    'Rastreie, analise e documente a atividade nas redes sociais ligada a fraude, usurpação de identidade e abuso de marca.',
  'svc.social-media-investigation.short': 'Rastreie fraude e usurpação de identidade nas redes sociais.',
  'svc.business-services.title': 'Serviços empresariais',
  'svc.business-services.blurb':
    'O setor empresarial continua a ser um dos mais competitivos do nosso mundo moderno.',
  'svc.business-services.short': 'Serviços à medida para empresas competitivas.',

  // Sustainability stat labels + contact address
  'sus.treesPlanted': 'Árvores plantadas',
  'sus.co2': 'CO₂ compensado',
  'sus.happyCustomers': 'Clientes satisfeitos',
  'contact.address': 'Kalvermarkt 53, 2511 CB, Haia, Países Baixos.',
} as const;
