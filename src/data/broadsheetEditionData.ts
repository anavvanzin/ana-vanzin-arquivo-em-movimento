/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Academic Broadsheet Edition Data: "Between Representation and Authentication"
 * Doctoral research and lectern script by Ana Vitória Vanzin Mendes
 * (PPGD/UFSC · Ius Gentium · Saberes França–Brasil 2026)
 */

export type BroadsheetLang = 'pt' | 'en' | 'fr';

export interface EvidenceLedgerItem {
  document: string;
  question: string;
}

export interface LegalNoteItem {
  num: string;
  title: string;
  desc: string;
}

export interface VerbItem {
  verb: string;
  definition: string;
}

export interface ComparisonBlockItem {
  title: string;
  paragraphs: string[];
}

export interface SourceItem {
  num: string;
  title: string;
  citation: string;
  pageRef?: string;
  anchor: string;
}

export interface BroadsheetContent {
  lang: BroadsheetLang;
  toplineLeft: string;
  toplineRight: string;
  mastheadTitle: string;
  mastheadSubtitle: string;
  mastheadMotto: string;
  authorName: string;
  authorTitle: string;
  authorInstitution: string;
  editionBanner: {
    event: string;
    duration: string;
    structure: string;
  };
  issueTheme: {
    badge: string;
    headline: string;
    subtitle: string;
  };
  navigation: {
    argument: string;
    caseFile: string;
    method: string;
    sources: string;
    typeToggle: string;
    typeToggleDesc: string;
    printBtn: string;
    slidesModalBtn: string;
    projectSlideLabel: string;
  };
  section1: {
    number: string;
    label: string;
    headline: string;
    deck: string;
    byline: string;
    dropCapLetter: string;
    leadP1: string;
    leadP2: string;
    evidenceLedger: {
      kicker: string;
      title: string;
      items: EvidenceLedgerItem[];
      footnote: string;
    };
    thinHeading: string;
    bodyP1: string;
    bodyP2: string;
    bodyP3: string;
    foldTitle: string;
    foldP1: string;
    foldP2: string;
    pullQuote: string;
    pullQuoteCite: string;
    linkedSlides: number[]; // 1-based [1, 2, 3, 4]
  };
  section2: {
    number: string;
    label: string;
    headline: string;
    deck: string;
    byline: string;
    dropCapLetter: string;
    leadP1: string;
    leadP2: string;
    benchmarkYear: string;
    benchmarkText: string;
    benchmarkFootnote: string;
    thinHeading: string;
    bodyP1: string;
    bodyP2: string;
    legalNotes: LegalNoteItem[];
    foldTitle: string;
    foldP1: string;
    foldP2: string;
    pullQuote: string;
    pullQuoteCite: string;
    readingNote: string;
    linkedSlides: number[]; // 1-based [9, 10, 11]
  };
  section3: {
    number: string;
    label: string;
    adEyebrow: string;
    adTitle: string;
    adTitleSpan: string;
    adSubtitle: string;
    adBodyTop: string;
    verbs: VerbItem[];
    adBodyBottom: string;
    adByline: string;
    comparisonKicker: string;
    comparisonTitle: string;
    comparisons: ComparisonBlockItem[];
    foldTitle: string;
    foldP1: string;
    foldP2: string;
    methodNote: string;
    linkedSlides: number[]; // 1-based [5, 6, 7, 8]
  };
  closing: {
    kicker: string;
    headline: string;
    closingP1: string;
    closingP2: string;
    editorialDisclosure: string;
    downloadPdfLabel: string;
    linkedSlides: number[]; // 1-based [12, 13]
  };
  sourcesSection: {
    title: string;
    subtitle: string;
    sources: SourceItem[];
    colophonLeft: string;
    colophonRight: string;
  };
}

export const BROADSHEET_DATA: Record<BroadsheetLang, BroadsheetContent> = {
  pt: {
    lang: 'pt',
    toplineLeft: 'Entre representação e autenticação',
    toplineRight: 'Edição acadêmica de conferência · Saberes França–Brasil · UFSC',
    mastheadTitle: 'Iconocracia',
    mastheadSubtitle: 'REVISTA DE HISTÓRIA DO DIREITO, IMAGEM E AUTORIDADE',
    mastheadMotto: 'LER A IMAGEM. SEGUIR O DOCUMENTO.',
    authorName: 'Ana Vitória Vanzin Mendes',
    authorTitle: 'Pesquisadora Doutoral em Direito',
    authorInstitution: 'Universidade Federal de Santa Catarina · Ius Gentium',
    editionBanner: {
      event: 'Edição de Pesquisa · Leitor de Evento',
      duration: 'Apresentação oral de 16–17 minutos',
      structure: '13 seções · Um argumento contínuo',
    },
    issueTheme: {
      badge: 'REPRESENTAÇÃO ≠ AUTENTICAÇÃO',
      headline: 'A imagem nos faz ver a autoridade.\nO documento ajuda a compreender como ela podia agir.',
      subtitle: 'Edição de conferência sobre provas, instituições e a vida jurídica das figuras alegóricas.',
    },
    navigation: {
      argument: 'Argumento',
      caseFile: 'Dossiê do caso',
      method: 'Método',
      sources: 'Fontes',
      typeToggle: 'Tamanho do tipo',
      typeToggleDesc: 'Aumentar ou restaurar tamanho da fonte',
      printBtn: 'Imprimir / Salvar PDF ↗',
      slidesModalBtn: 'Ver Lâminas (16:9)',
      projectSlideLabel: 'Projetar lâmina',
    },
    section1: {
      number: '01',
      label: 'Primeira Página · Representação',
      headline: 'Entre representação e autenticação',
      deck: 'Um busto, um sinete e uma moeda podem carregar a mesma efígie feminina. O mero reconhecimento não revela o que a instituição faz com ela.',
      byline: 'Ana Vitória Vanzin Mendes · Editado a partir das seções 01–04 · p. 1–2',
      dropCapLetter: 'P',
      leadP1:
        'Parto de um objeto em Florianópolis: um busto da República. O catálogo do museu atribui um nome à figura e credita a obra a uma fundição parisiense. No entanto, a fotografia não pode me dizer quem pagou pela peça, nem como ela chegou até aqui. O objeto diz muito; a partir de certo limiar, sou obrigada a interrogar outra fonte.',
      leadP2:
        'Esse limite impôs uma revisão no roteiro. Uma versão preliminar afirmava que o busto fora adquirido de um catálogo de Paris. A fundição produzia em série, o que tornava a hipótese verossímil, mas verossimilhança não é proveniência. Uma fatura ou um inventário respondem a uma pergunta diversa: como esta peça específica ingressou nesta coleção específica.',
      evidenceLedger: {
        kicker: 'LIVRO-RAZÃO DAS EVIDÊNCIAS',
        title: 'Documentos distintos respondem a perguntas distintas',
        items: [
          {
            document: 'Catálogo de Museu',
            question: 'Nomeia a figura alegórica e atribui a autoria ou fundição.',
          },
          {
            document: 'Catálogo de Vendas',
            question: 'Comprova que um modelo foi comercializado e fundido em série.',
          },
          {
            document: 'Fatura ou Inventário',
            question: 'Documenta compra, desembarque e registro patrimonial do exemplar.',
          },
        ],
        footnote:
          'Síntese editorial das seções 01–02 da conferência; os inventários subjacentes são analisados criticamente no dossiê.',
      },
      thinHeading: 'Reconhecimento não é autenticação',
      bodyP1:
        'O que faz uma figura feminina quando representa a autoridade do Estado? Encontrá-la em um palácio, num selo régio ou numa moeda permite reconhecer o Estado em cada um desses suportes. Mas o que decorre desse reconhecimento depende fundamentalmente do objeto.',
      bodyP2:
        'Num busto escultórico, reconhecer a República indica quem a efígie representa. Numa moeda, o reconhecimento visual não atesta se o metal é genuíno. Num sinete, é preciso saber quem tem competência para apor o carimbo e sob qual norma. Essas pequenas distinções alteram o que conta como resposta jurídica.',
      bodyP3:
        'A circulação entre França e Brasil pode se dar pela formação do artista, por um tratado de modelos ou pelo trajeto documental do artefato. São três trilhas de pesquisa independentes. A semelhança formal é um excelente pretexto para começar a investigar; não prova qual caminho uma imagem concreta percorreu.',
      foldTitle: 'Por que a escadaria ainda importa',
      foldP1:
        'O busto surge ladeado por outras figuras na escadaria do Palácio Cruz e Sousa, convidando a uma leitura de conjunto. Esse arranjo visual, todavia, não esclarece se as peças foram compradas juntas, nem se os contemporâneos as liam da mesma forma que nós hoje.',
      foldP2:
        'Retornar à escadaria ao término da tese torna visível o ponto metodológico: cada imagem pertence a uma história da autoridade, e reconstituir a instituição que a operou exige documentos de outra natureza.',
      pullQuote:
        '“A semelhança é um ótimo motivo para começar a procurar. Ela não me diz qual rota uma imagem específica percorreu.”',
      pullQuoteCite: 'Roteiro de tribuna, seção 04/13 · p. 2',
      linkedSlides: [1, 2, 3, 4],
    },
    section2: {
      number: '02',
      label: 'Dossiê do Caso · Direito & Numismática',
      headline: 'O que o ouro garante?',
      deck: 'A indagação jurídica tem início onde a comparação visual termina: sob qual autoridade legítima o objeto foi manufaturado?',
      byline: 'Estudo de caso por Ana Vitória Vanzin Mendes · Seções 09–11 · p. 5–6',
      dropCapLetter: 'N',
      leadP1:
        'No final de 1890, estatutos bancários anexos ao Decreto nº 1.227 incluíram moedas de ouro francesas de dez e vinte francos entre as espécies que podiam compor o depósito de garantia para a emissão de notas bancárias no Brasil republicano.',
      leadP2:
        'A palavra decisiva é garantia (securing). O dispositivo legal prescreve a finalidade daquelas moedas naquele arranjo institucional estrito. Ele não estabelece que moedas francesas fossem moeda de curso forçado geral no Brasil, nem que circulassem livremente no comércio cotidiano da população.',
      benchmarkYear: '1890',
      benchmarkText: 'Decreto nº 1.227 · 1890\nEstatutos bancários e o depósito que garantia a emissão de notas',
      benchmarkFootnote:
        'Esta edição reporta a leitura analítica do roteiro; a análise contrasta a circulação visual com a regulação monetária.',
      thinHeading: 'A cópia perfeita',
      bodyP1:
        'Imagine duas moedas idênticas em metal, cunho, peso e valor intrínseco. Nem o especialista mais refinado conseguiria distingui-las a olho nu. O Artigo 239 do Código Penal brasileiro de 1890 tipifica exatamente a fabricação de moeda que reproduza a legítima em todos esses quesitos.',
      bodyP2:
        'É quando ressoa a fórmula jurídica lapidar: “sem autoridade legítima”. Se a peça foi lavrada sem autorização soberana, a perfeita identidade com o objeto autêntico não impedia que sua fabricação constituísse crime inafiançável.',
      legalNotes: [
        {
          num: 'I.',
          title: 'Conformidade Material',
          desc: 'Material, forma, peso e toque intrínseco integram a descrição do suporte pelo tipo penal.',
        },
        {
          num: 'II.',
          title: 'Condição Jurídica',
          desc: 'Examinar o objeto isolado jamais revela se quem o cunhou possuía autoridade soberana.',
        },
        {
          num: 'III.',
          title: 'Estatuto da Prova',
          desc: 'Curso legal exige regra sobre pagamentos; circulação cotidiana exige prova de transações.',
        },
      ],
      foldTitle: 'O que constituiria um achado diferente?',
      foldP1:
        'Sustentar curso forçado geral exigiria uma norma impositiva de quitação de dívidas civis. Sustentar circulação corrente demandaria assentos contábeis de trocas mercantis. A pesquisa examina primeiro o que a regra autorizava no desenho bancário.',
      foldP2:
        'A mesma disciplina se aplica ao busto da República: a semelhança plástica é reconhecível, mas a legitimidade para produzir ou utilizar o artefato depende de uma história institucional que a imagem sozinha não fornece.',
      pullQuote:
        '“A conformidade com o objeto autêntico não impedia que sua fabricação fosse punível.”',
      pullQuoteCite: 'Roteiro de tribuna, seção 10/13 · p. 5',
      readingNote:
        'Estudo de caso metodológico em história do direito, não consultoria jurídica. A edição preserva a distinção epistemológica entre semelhança, autoridade e efeito vinculante.',
      linkedSlides: [9, 10, 11],
    },
    section3: {
      number: '03',
      label: 'Método · Marginalia & Iconologia',
      adEyebrow: 'VOCABULÁRIO OPERATIVO',
      adTitle: 'QUATRO',
      adTitleSpan: 'VERBOS',
      adSubtitle: 'Manter distintas as operações da imagem no direito',
      adBodyTop:
        'O roteiro articula quatro verbos para manter o rigor analítico. Na prática forense e social eles se sobrepõem, mas não respondem à mesma interrogação científica:',
      verbs: [
        {
          verb: 'Representar',
          definition: 'Dar a uma comunidade, magistratura ou nação uma forma sensível e reconhecível.',
        },
        {
          verb: 'Legitimar',
          definition: 'Tornar um poder ou soberania dignos de reverência e consentimento público.',
        },
        {
          verb: 'Autenticar',
          definition: 'Atestar que um documento ou suporte é genuíno mediante rito ou autoridade competente.',
        },
        {
          verb: 'Justificar',
          definition: 'Fornecer as razões jurídicas pelas quais uma decisão ou comando pode ser defendido.',
        },
      ],
      adBodyBottom:
        'A tensão máxima da pesquisa situa-se entre o primeiro verbo e o terceiro. A familiaridade visual explica a força pública de uma alegoria; o uso institucional e formal determina seus efeitos jurídicos.',
      adByline: 'Editado a partir da seção 05/13 · p. 3',
      comparisonKicker: 'A COMPARAÇÃO COMO INTERROGAÇÃO',
      comparisonTitle: 'Mudar a cena, mudar a pergunta',
      comparisons: [
        {
          title: 'A venda nos olhos',
          paragraphs: [
            'Na Nau dos Insensatos de Sebastian Brant (1494), um tolo coloca a venda na Justiça para cegá-la. Na fonte cívica de Berna, a Justiça já se encontra vendada como símbolo da imparcialidade comunal. Em Cesare Ripa (1593/1603), o atributo estabiliza-se num léxico alegórico.',
            'A comparação visual não propõe uma narrativa linear única para toda venda nos olhos; ela gera uma interrogação metodológica a ser levada de volta a cada processo histórico concreto.',
          ],
        },
        {
          title: 'Debret: duas datas',
          paragraphs: [
            'Em 1822, o desenho para o pano de boca da coroação de D. Pedro I responde a um evento político efêmero. Em 1839, a gravura impressa no Voyage Pittoresque alcança leitores distantes na Europa.',
            'As tábuas constitucionais figuram no pano cenográfico da coroação em 1822, embora a Carta outorgada date de 1824. Esse descompasso permite investigar a função simbólica da imagem, mas não substitui a análise da vigência da ordem constitucional.',
          ],
        },
        {
          title: 'A figura e as pessoas',
          paragraphs: [
            'A centralidade de uma figura feminina em imagens oficiais de Estado diz pouco, por si só, sobre o estatuto jurídico das mulheres concretas sob aquela jurisdição.',
            'Capacidade civil, direito de voto e acesso a profissões jurídicas possuem histórias institucionais distintas. A tese acompanha a alegoria e a condição legal sem presumir identidade entre elas.',
          ],
        },
      ],
      foldTitle: 'O que poderia falsear a hipótese?',
      foldP1:
        'Um documento que exigisse a presença desta efígie específica como condição de validade de um ato judicial conferiria à imagem eficácia legal direta. O mesmo emprego com figuras distintas levantaria outra questão: o gênero da alegoria era determinante?',
      foldP2:
        'A ausência temporária de uma fatura de compra não prova sua inexistência no arquivo. O método comparativo define qual documento buscar e o que a pesquisadora está disposta a revisar à luz de novos achados.',
      methodNote:
        'Semelhança visual não equivale a transmissão cultural. Uma montagem iconográfica warburguiana abre a hipótese; inventários, recibos, autos judiciais e normas suportam o ônus da prova.',
      linkedSlides: [5, 6, 7, 8],
    },
    closing: {
      kicker: 'EPÍLOGO · SEÇÃO 13/13',
      headline:
        '“Quando uma imagem entra em um palácio, num selo ou numa moeda, o que a instituição faz com ela?”',
      closingP1:
        'O busto escultórico separa o local de fundição da história de sua aquisição. A moeda cunhada separa a conformidade visual da autoridade soberana necessária para lavrá-la.',
      closingP2:
        'Em ambos os casos, o olhar demorado sobre o objeto conduz o historiador do direito a fontes de outra ordem. É nesse espaço fecundo (Zwischenraum) que a tese se ancora: entre a forma visível da autoridade e os documentos que nos ensinam como ela podia agir.',
      editorialDisclosure:
        'Nota editorial: esta edição transcreve e estrutura academicamente o roteiro de tribuna de Ana Vitória Vanzin Mendes para o colóquio Saberes França–Brasil. As lâminas integradas correspondem às projeções reais da comunicação científica.',
      downloadPdfLabel: 'Baixar roteiro completo da conferência (PDF) ↓',
      linkedSlides: [12, 13],
    },
    sourcesSection: {
      title: 'Fontes primárias e mapa de leitura',
      subtitle: 'REFERÊNCIAS & ACERVO',
      sources: [
        {
          num: '01',
          title: 'Between Representation and Authentication (Roteiro de Tribuna)',
          citation:
            'MENDES, Ana Vitória Vanzin. Between Representation and Authentication. Florianópolis: PPGD/UFSC, 2026. 8 f. Texto de tribuna em inglês e francês.',
          anchor: '#representation',
        },
        {
          num: '02',
          title: 'Busto, alegoria cívica, venda e a cena de Debret',
          citation:
            'Seções 01–08 do dossiê. Fontes iconográficas: Museu Histórico de Santa Catarina (MHSC), Brant (1494), Ripa (1603), Debret (1822/1839).',
          anchor: '#representation',
        },
        {
          num: '03',
          title: 'Ouro, lastro bancário, moeda falsa e revisão hermenêutica',
          citation:
            'Seções 09–13 do dossiê. Fontes legislativas: Decreto nº 1.227/1890; Código Penal dos Estados Unidos do Brasil de 1890 (Art. 239).',
          anchor: '#case-file',
        },
      ],
      colophonLeft:
        'Pesquisa e autoria: Ana Vitória Vanzin Mendes (PPGD/UFSC · Ius Gentium) · Edição adaptada para o colóquio Saberes França–Brasil 2026.',
      colophonRight:
        'Sem telemetria oculta, anúncios ou rastreamento. Tipografia: Cormorant Garamond, Space Mono e Pinyon Script.',
    },
  },

  en: {
    lang: 'en',
    toplineLeft: 'Between Representation and Authentication',
    toplineRight: 'Research edition · Saberes França–Brasil · UFSC',
    mastheadTitle: 'Iconocracia',
    mastheadSubtitle: 'A JOURNAL OF LAW, IMAGE & AUTHORITY',
    mastheadMotto: 'READ THE IMAGE. FOLLOW THE DOCUMENT.',
    authorName: 'Ana Vitória Vanzin Mendes',
    authorTitle: 'Doctoral Researcher in Law',
    authorInstitution: 'Federal University of Santa Catarina · Ius Gentium',
    editionBanner: {
      event: 'Research edition · Event reader',
      duration: '16–17 minute presentation',
      structure: '13 sections / one argument',
    },
    issueTheme: {
      badge: 'REPRESENTATION ≠ AUTHENTICATION',
      headline: 'The image lets us see authority.\nThe document helps us understand how it could act.',
      subtitle: 'An edited event edition on evidence, institutions, and the legal lives of allegorical figures.',
    },
    navigation: {
      argument: 'Argument',
      caseFile: 'Case file',
      method: 'Method',
      sources: 'Sources',
      typeToggle: 'Type size',
      typeToggleDesc: 'Increase or restore reading type size',
      printBtn: 'Print / Save PDF ↗',
      slidesModalBtn: 'View Slides (16:9)',
      projectSlideLabel: 'Project slide',
    },
    section1: {
      number: '01',
      label: 'Front page · Representation',
      headline: 'Between representation and authentication',
      deck: 'A bust, a seal, and a coin may carry the same female figure. Recognition alone does not tell us what the institution does with her.',
      byline: 'Ana Vitória Vanzin Mendes · Edited from sections 01–04 · p. 1–2',
      dropCapLetter: 'I',
      leadP1:
        'I begin with an object from Florianópolis: a bust of the Republic. The museum catalogue gives the figure a name and attributes the work to a foundry. But the photograph cannot tell me who paid for the bust, or how it arrived here. The object can tell me quite a lot; at a certain point, I have to ask a different source.',
      leadP2:
        'That limit forced a revision. An earlier version of the presentation said that the bust had been bought from a Paris catalogue. The foundry produced works in series, which made the sentence plausible, but plausibility was not provenance. A bill or an inventory could answer a different question: how this particular object entered this particular collection.',
      evidenceLedger: {
        kicker: 'AN EVIDENCE LEDGER',
        title: 'Different documents answer different questions',
        items: [
          {
            document: 'Museum catalogue',
            question: 'Names the figure and attributes the work.',
          },
          {
            document: 'Sales catalogue',
            question: 'Can establish that a model was offered in series.',
          },
          {
            document: 'Bill or inventory',
            question: 'May document purchase, arrival, or entry into the collection.',
          },
        ],
        footnote:
          'An editorial synthesis of sections 01–02; the underlying catalogues and inventory are scrutinized within the doctoral archive.',
      },
      thinHeading: 'Recognition is not authentication',
      bodyP1:
        'What does a female figure do when she stands for the authority of the state? Encounter her in a palace, on a seal, or on a coin, and you may recognise the state in each case. What follows from that recognition depends on the object.',
      bodyP2:
        'On a bust, recognising the Republic tells me whom the figure represents. On a coin, it does not tell me whether the coin is genuine. With a seal, I still need to know who may use it and under what rule. These small differences change what counts as an answer.',
      bodyP3:
        'France and Brazil can be connected through an artist’s training, a book or model, or the documented journey of an object. These are different lines of inquiry. A resemblance gives me a reason to start looking; it does not establish which route a particular image took.',
      foldTitle: 'Why the staircase still matters',
      foldP1:
        'The bust appears in the company of other figures, inviting a reading of the whole arrangement. That arrangement still cannot tell me whether the pieces were bought together, or whether the people who placed them there understood it as viewers do now.',
      foldP2:
        'Returning to the staircase at the end of the argument makes the methodological point visible again: each image belongs to a history of authority, and reconstructing the institution that used it requires another kind of evidence.',
      pullQuote:
        '“A resemblance is a good reason to start looking. It doesn’t tell me which route a particular image took.”',
      pullQuoteCite: 'Lectern script, section 04/13 · p. 2',
      linkedSlides: [1, 2, 3, 4],
    },
    section2: {
      number: '02',
      label: 'Case file · Law & numismatics',
      headline: 'What does the gold guarantee?',
      deck: 'The legal question begins where visual comparison ends: under what authority was the object made?',
      byline: 'Case study by Ana Vitória Vanzin Mendes · Sections 09–11 · p. 5–6',
      dropCapLetter: 'A',
      leadP1:
        'At the end of 1890, bank statutes annexed to Brazilian Decree No. 1,227 listed French ten- and twenty-franc coins among the kinds of gold that could make up the deposit securing the issue of banknotes.',
      leadP2:
        'The important word is securing. The provision tells me what those coins could be used for in that arrangement. It does not establish that French coins were general legal tender in Brazil, nor that they circulated in everyday trade.',
      benchmarkYear: '1890',
      benchmarkText: 'Decree No. 1,227 · 1890\nBank statutes and the deposit securing banknote issue',
      benchmarkFootnote:
        'This edition reports the argument of the lectern script; legal references are presented as framed in the doctoral inquiry.',
      thinHeading: 'The perfect copy',
      bodyP1:
        'Imagine two coins matching in material, form, weight, and intrinsic value. You might be unable to tell them apart. Article 239 of the Brazilian Penal Code of 1890 addresses the manufacture of a coin matching a genuine one in precisely those respects.',
      bodyP2:
        'Then the decisive words arrive: “sem autoridade legitima” — without lawful authority. If the coin was made without that authority, matching the genuine object did not keep its manufacture from being punishable.',
      legalNotes: [
        {
          num: 'I.',
          title: 'Material match',
          desc: 'Material, form, weight, and intrinsic value matter to the provision’s description of the object.',
        },
        {
          num: 'II.',
          title: 'Legal condition',
          desc: 'Examining the object alone cannot establish whether its maker had lawful authority.',
        },
        {
          num: 'III.',
          title: 'Different evidence',
          desc: 'Legal tender calls for a rule about payments; everyday circulation calls for evidence of transactions.',
        },
      ],
      foldTitle: 'What would count as a different finding?',
      foldP1:
        'A finding about general legal tender would require a rule governing payments. A finding about actual circulation would require evidence of transactions. The script asks first what this particular rule allowed, and in what institutional setting, before extending the claim beyond it.',
      foldP2:
        'The same discipline applies to the Republic bust: visible form may be recognisable, while the authority to produce or use an object depends on an institutional history that the image alone cannot supply.',
      pullQuote:
        '“Matching the genuine object didn’t keep the manufacture from being punishable.”',
      pullQuoteCite: 'Lectern script, section 10/13 · p. 5',
      readingNote:
        'This is a methodological case study, not legal advice. The edition preserves the source’s distinction between resemblance, authority, and legal effect.',
      linkedSlides: [9, 10, 11],
    },
    section3: {
      number: '03',
      label: 'Method · Marginalia',
      adEyebrow: 'A WORKING VOCABULARY',
      adTitle: 'FOUR',
      adTitleSpan: 'VERBS',
      adSubtitle: 'Keep the image’s operations distinct',
      adBodyTop:
        'The script uses four verbs to keep its bearings. They can overlap in practice, but they do not answer the same question:',
      verbs: [
        {
          verb: 'Represent',
          definition: 'Give a community or an office a recognisable form.',
        },
        {
          verb: 'Legitimate',
          definition: 'Make an authority appear deserving of consent.',
        },
        {
          verb: 'Authenticate',
          definition: 'Establish that something is genuine by a recognised procedure or criterion.',
        },
        {
          verb: 'Justify',
          definition: 'Give reasons why a rule or decision can be defended.',
        },
      ],
      adBodyBottom:
        'The argument’s main distance is between the first verb and the third. Familiarity may explain an image’s public power; institutional use tells me what it does legally.',
      adByline: 'Edited from section 05/13 · p. 3',
      comparisonKicker: 'COMPARISON AS A QUESTION',
      comparisonTitle: 'Change the scene, change the inquiry',
      comparisons: [
        {
          title: 'The blindfold',
          paragraphs: [
            'In Brant’s Ship of Fools (1494), a fool is putting the blindfold on Justice. At the fountain in Bern, Justice is already blindfolded when I encounter her as a civic figure. In Ripa (1593/1603), it belongs to a repertoire of attributes.',
            'The comparison does not propose one history for every blindfold. It produces a question to take back to each case.',
          ],
        },
        {
          title: 'Debret: two dates',
          paragraphs: [
            'In 1822, the design for Pedro I’s coronation theatre curtain belongs to a political occasion. In 1839, a printed plate brings the scene to different readers.',
            'The constitutional tablets appear in the coronation scene, while the Charter dates to 1824. That gap lets me ask what the image was doing; it does not, by itself, explain how the order acquired legal force.',
          ],
        },
        {
          title: 'The figure and the people',
          paragraphs: [
            'A female figure’s central place in an official image says little, by itself, about the legal position of women living under that authority.',
            'Civil capacity, voting, and entry into a profession have distinct institutional histories. The script follows both histories without assuming that they coincide.',
          ],
        },
      ],
      foldTitle: 'What might change my mind?',
      foldP1:
        'A document requiring this particular figure as a condition for recognising an act as valid would give the image a more precise legal role. The same use with different figures would raise a further question: is the figure’s gender decisive in that setting?',
      foldP2:
        'The absence of a discovered bill is not proof that no bill existed. Comparison helps identify what evidence to seek and what the researcher would be ready to revise.',
      methodNote:
        'Similarity is not transmission. A montage can open an investigation; inventories, bills, legal texts, and institutional rules carry different evidentiary burdens.',
      linkedSlides: [5, 6, 7, 8],
    },
    closing: {
      kicker: 'CLOSING · SECTION 13/13',
      headline:
        '“So when an image enters a palace, a seal or a coin, what does the institution do with it?”',
      closingP1:
        'The bust separates the place of manufacture from the history of purchase. The coin separates resemblance from the authority to make it.',
      closingP2:
        'In both cases, looking more closely at the object sends the researcher to a different source. That is where this edition leaves the argument: between the visible form of authority and the documents that help me understand how it could act.',
      editorialDisclosure:
        'Editorial disclosure: this is an independently designed reading edition of the supplied English lectern script. Headlines and transitions are edited; direct quotations retain quotation marks. The 13 slides correspond to the authentic conference projections.',
      downloadPdfLabel: 'Download the complete conference script (PDF) ↓',
      linkedSlides: [12, 13],
    },
    sourcesSection: {
      title: 'Source & reading map',
      subtitle: 'SOURCES & CREDITS',
      sources: [
        {
          num: '01',
          title: 'Between Representation and Authentication (Lectern Script)',
          citation:
            'MENDES, Ana Vitória Vanzin. Between Representation and Authentication. Florianópolis: PPGD/UFSC, 2026. 8 p. Complete conference script in English.',
          anchor: '#representation',
        },
        {
          num: '02',
          title: 'Bust, allegory, blindfold, and Debret',
          citation:
            'Sections 01–08. Sources: Museu Histórico de Santa Catarina (MHSC), Brant (1494), Ripa (1603), Debret (1822/1839).',
          anchor: '#representation',
        },
        {
          num: '03',
          title: 'Gold, lawful authority, and revision',
          citation:
            'Sections 09–13. Legal texts: Brazilian Decree No. 1,227 of 1890; Penal Code of 1890 (Art. 239).',
          anchor: '#case-file',
        },
      ],
      colophonLeft:
        'Research and authorship: Ana Vitória Vanzin Mendes · Editorial adaptation for Saberes França–Brasil 2026.',
      colophonRight:
        'No hidden analytics, ads, or tracking. Typography: Cormorant Garamond, Space Mono, and Pinyon Script.',
    },
  },

  fr: {
    lang: 'fr',
    toplineLeft: 'Entre représentation et authentification',
    toplineRight: 'Édition de recherche · Saberes França–Brasil · UFSC',
    mastheadTitle: 'Iconocracia',
    mastheadSubtitle: 'REVUE DE DROIT, IMAGE ET AUTORITÉ',
    mastheadMotto: 'LIRE L’IMAGE. SUIVRE LE DOCUMENT.',
    authorName: 'Ana Vitória Vanzin Mendes',
    authorTitle: 'Chercheuse Doctorale en Droit',
    authorInstitution: 'Université Fédérale de Santa Catarina · Ius Gentium',
    editionBanner: {
      event: 'Édition de Recherche · Lecteur de Conférence',
      duration: 'Communication orale de 16–17 minutes',
      structure: '13 sections / un seul argument',
    },
    issueTheme: {
      badge: 'REPRÉSENTATION ≠ AUTHENTIFICATION',
      headline: 'L’image nous donne à voir l’autorité.\nLe document nous aide à comprendre comment elle pouvait agir.',
      subtitle: 'Une édition de colloque sur les preuves, les institutions et les vies juridiques des allégories.',
    },
    navigation: {
      argument: 'Argument',
      caseFile: 'Dossier de cas',
      method: 'Méthode',
      sources: 'Sources',
      typeToggle: 'Taille du texte',
      typeToggleDesc: 'Agrandir ou rétablir la taille du texte',
      printBtn: 'Imprimer / Sauvegarder PDF ↗',
      slidesModalBtn: 'Voir les Diapositives (16:9)',
      projectSlideLabel: 'Projeter la diapositive',
    },
    section1: {
      number: '01',
      label: 'Première Page · Représentation',
      headline: 'Entre représentation et authentification',
      deck: 'Un buste, un sceau et une monnaie peuvent porter la même figure féminine. La seule reconnaissance ne nous dit pas ce que l’institution en fait.',
      byline: 'Ana Vitória Vanzin Mendes · Adapté des sections 01–04 · p. 1–2',
      dropCapLetter: 'J',
      leadP1:
        'Je commence par un objet de Florianópolis : un buste de la République. Le catalogue du musée donne un nom à la figure et attribue l’œuvre à une fonderie parisienne. Cependant, la photographie ne peut me dire qui a payé pour le buste, ni comment il est parvenu jusqu’ici. L’objet peut m’apprendre beaucoup ; au-delà d’un certain seuil, je dois interroger une autre source.',
      leadP2:
        'Cette limite a imposé une révision. Une version antérieure affirmait que le buste avait été acquis sur un catalogue parisien. La fonderie produisait en série, ce qui rendait la phrase plausible, mais la plausibilité n’est pas la provenance. Une facture ou un inventaire répondent à une question différente : comment cet objet précis est entré dans cette collection précise.',
      evidenceLedger: {
        kicker: 'REGISTRE DES PREUVES',
        title: 'Des documents distincts répondent à des questions distinctes',
        items: [
          {
            document: 'Catalogue de Musée',
            question: 'Nomme la figure allégorique et attribue la fonderie.',
          },
          {
            document: 'Catalogue de Vente',
            question: 'Établit qu’un modèle a été commercialisé en série.',
          },
          {
            document: 'Facture ou Inventaire',
            question: 'Documente l’achat, la traversée ou l’entrée dans la collection.',
          },
        ],
        footnote:
          'Synthèse éditoriale des sections 01–02 de la communication scientifique Saberes França–Brasil.',
      },
      thinHeading: 'La reconnaissance n’est pas l’authentification',
      bodyP1:
        'Que fait une figure féminine lorsqu’elle incarne l’autorité de l’État ? La rencontrer dans un palais, sur un sceau ou sur une pièce de monnaie permet de reconnaître l’État dans chaque situation. Ce qui découle de cette reconnaissance dépend de l’objet.',
      bodyP2:
        'Sur un buste, reconnaître la République m’indique qui la figure représente. Sur une monnaie, la reconnaissance visuelle n’atteste pas si la pièce est authentique. Sur un sceau, il faut encore savoir qui peut l’apposer et en vertu de quelle règle. Ces nuances transforment ce qui compte comme réponse juridique.',
      bodyP3:
        'La France et le Brésil peuvent être reliés par la formation d’un artiste, un manuel de modèles ou le trajet documenté d’un artefact. Ce sont des pistes indépendantes. Une ressemblance donne une bonne raison de commencer à chercher ; elle n’établit pas quelle route une image concrète a empruntée.',
      foldTitle: 'Pourquoi l’escalier importe encore',
      foldP1:
        'Le buste figure aux côtés d’autres statues au bas de l’escalier, invitant à une lecture d’ensemble. Cette disposition ne peut pourtant pas certifier si les pièces ont été acquises ensemble, ni si les contemporains la comprenaient comme nous.',
      foldP2:
        'Revenir à l’escalier à la fin de la thèse rend manifeste l’exigence méthodologique : chaque image appartient à une histoire de l’autorité, et reconstituer l’institution qui l’a employée exige des documents d’une autre nature.',
      pullQuote:
        '« Une ressemblance est une bonne raison de commencer à chercher. Elle ne dit pas quelle route une image a suivie. »',
      pullQuoteCite: 'Roteiro de tribuna, section 04/13 · p. 2',
      linkedSlides: [1, 2, 3, 4],
    },
    section2: {
      number: '02',
      label: 'Dossier de Cas · Droit & Numismatique',
      headline: 'Que garantit l’or ?',
      deck: 'L’interrogation juridique commence là où s’arrête la comparaison visuelle : sous quelle autorité l’objet a-t-il été fabriqué ?',
      byline: 'Étude de cas par Ana Vitória Vanzin Mendes · Sections 09–11 · p. 5–6',
      dropCapLetter: 'À',
      leadP1:
        'À la fin de 1890, des statuts bancaires annexés au décret brésilien nº 1.227 ont inscrit les pièces d’or françaises de dix et vingt francs parmi les espèces pouvant composer le dépôt de garantie pour l’émission de billets de banque.',
      leadP2:
        'Le terme décisif est garantie (securing). La disposition indique l’usage permis pour ces pièces dans cet arrangement précis. Elle n’établit nullement que les pièces françaises avaient cours légal général au Brésil, ni qu’elles circulaient dans le commerce ordinaire.',
      benchmarkYear: '1890',
      benchmarkText: 'Décret nº 1.227 · 1890\nStatuts bancaires et le dépôt garantissant l’émission de billets',
      benchmarkFootnote:
        'Cette édition rapporte la démarche du texte de conférence sans se substituer au texte légal certifié.',
      thinHeading: 'La copie parfaite',
      bodyP1:
        'Imaginez deux pièces identiques en métal, gravure, poids et valeur intrinsèque. Même un œil averti ne pourrait les distinguer. L’article 239 du Code pénal brésilien de 1890 vise précisément la frappe d’une monnaie conforme à la véritable en tous ces points.',
      bodyP2:
        'C’est alors qu’interviennent les mots décisifs : « sem autoridade legitima » — sans autorité légitime. Si la pièce a été fabriquée sans cette autorité, sa parfaite conformité matérielle n’empêchait pas sa fabrication d’être punissable.',
      legalNotes: [
        {
          num: 'I.',
          title: 'Conformité matérielle',
          desc: 'Le métal, le titre, le poids et la forme intègrent la description de l’objet par la loi pénale.',
        },
        {
          num: 'II.',
          title: 'Condition juridique',
          desc: 'L’examen isolé de l’objet ne peut établir si son fabricant détenait l’autorité souveraine.',
        },
        {
          num: 'III.',
          title: 'Régime de preuve',
          desc: 'Le cours légal requiert une règle de paiement ; la circulation quotidienne exige des traces de transactions.',
        },
      ],
      foldTitle: 'Qu’est-ce qui constituerait une conclusion différente ?',
      foldP1:
        'Prouver le cours forcé général exigerait une règle imposant l’acceptation des pièces pour éteindre une dette. Prouver la circulation ordinaire réclamerait des preuves de transactions. Le texte examine d’abord ce que cette règle précise permettait.',
      foldP2:
        'La même rigueur vaut pour le buste de la République : la forme visible est reconnaissable, mais l’autorité pour fabriquer ou employer un artefact dépend d’une histoire institutionnelle que l’image seule ne peut délivrer.',
      pullQuote:
        '« La conformité à l’objet authentique n’empêchait pas sa fabrication d’être punissable. »',
      pullQuoteCite: 'Texte de tribuna, section 10/13 · p. 5',
      readingNote:
        'Étude de cas méthodologique en histoire du droit. L’édition maintient la distinction fondamentale entre ressemblance visuelle, autorité souveraine et force obligatoire.',
      linkedSlides: [9, 10, 11],
    },
    section3: {
      number: '03',
      label: 'Méthode · Iconologie & Trajectoires',
      adEyebrow: 'VOCABULAIRE OPÉRATOIRE',
      adTitle: 'QUATRE',
      adTitleSpan: 'VERBES',
      adSubtitle: 'Distinguer les opérations de l’image dans le droit',
      adBodyTop:
        'Le texte s’appuie sur quatre verbes directeurs pour garder son cap épistémologique. Ils peuvent se recouper dans la pratique, mais ils ne répondent pas à la même question :',
      verbs: [
        {
          verb: 'Représenter',
          definition: 'Donner à une communauté ou à une magistrature une forme visible et reconnaissable.',
        },
        {
          verb: 'Légitimer',
          definition: 'Faire apparaître une autorité comme digne du consentement des gouvernés.',
        },
        {
          verb: 'Authentifier',
          definition: 'Établir qu’un acte ou un objet est véritable selon une procédure et une autorité instituées.',
        },
        {
          verb: 'Justifier',
          definition: 'Fournir les motifs juridiques pour lesquels une règle ou décision peut être défendue.',
        },
      ],
      adBodyBottom:
        'La distance principale de la thèse sépare le premier verbe du troisième. La familiarité visuelle explique l’impact civique d’une image ; l’usage institutionnel indique ce qu’elle accomplit légalement.',
      adByline: 'Adapté de la section 05/13 · p. 3',
      comparisonKicker: 'LA COMPARAISON COMME INTERROGATION',
      comparisonTitle: 'Changer de scène, changer de question',
      comparisons: [
        {
          title: 'Le bandeau sur les yeux',
          paragraphs: [
            'Dans la Nef des fous de Brant (1494), un insensé bande les yeux de la Justice. À la fontaine de Berne, la Justice a déjà les yeux bandés comme figure civique établie. Chez Ripa (1593/1603), l’attribut fait partie d’un lexique allégorique.',
            'La comparaison ne vise pas une histoire unique pour tout bandeau. Elle produit une interrogation à rapporter à chaque cas institutionnel.',
          ],
        },
        {
          title: 'Debret : deux dates',
          paragraphs: [
            'En 1822, le rideau de scène pour le couronnement de Pierre Ier relève d’une circonstance politique. En 1839, une planche gravée diffuse la scène auprès d’autres lecteurs européens.',
            'Les tables constitutionnelles figurent dans la scène de 1822, alors que la Charte date de 1824. Cet écart permet de questionner le rôle de l’image sans présumer de l’entrée en vigueur de l’ordre juridique.',
          ],
        },
        {
          title: 'La figure et les personnes',
          paragraphs: [
            'La place centrale d’une allégorie féminine dans l’iconographie étatique ne dit rien, en elle-même, de la condition juridique des femmes concrètes sous cette juridiction.',
            'Capacité civile, droit de suffrage et accès aux carrières juridiques ont des histoires institutionnelles distinctes que la thèse étudie sans les confondre.',
          ],
        },
      ],
      foldTitle: 'Qu’est-ce qui pourrait infirmer l’hypothèse ?',
      foldP1:
        'Un document imposant cette figure précise comme condition de validité d’un acte juridique conférerait à l’image un rôle légal direct. Le même usage avec d’autres figures poserait une autre question : le genre de l’allégorie était-il décisif ?',
      foldP2:
        'L’absence d’une facture retrouvée ne prouve pas son inexistence. La méthode comparative sert à identifier les pièces à chercher et ce que la chercheuse est prête à réviser.',
      methodNote:
        'Ressemblance n’est pas transmission. Un montage d’images peut amorcer une enquête ; inventaires, factures, textes de lois et règles d’institutions portent le fardeau de la preuve.',
      linkedSlides: [5, 6, 7, 8],
    },
    closing: {
      kicker: 'ÉPILOGUE · SECTION 13/13',
      headline:
        '« Quand une image entre dans un palais, sur un sceau ou une monnaie, que fait l’institution avec elle ? »',
      closingP1:
        'Le buste sépare le lieu de fabrication de l’histoire de son achat. La monnaie sépare la ressemblance plastique de l’autorité souveraine nécessaire à sa frappe.',
      closingP2:
        'Dans les deux cas, le regard attentif sur l’objet renvoie le juriste-historien vers une autre source. C’est là que cette édition laisse l’argument : entre la forme visible de l’autorité et les documents qui nous apprennent comment elle pouvait agir.',
      editorialDisclosure:
        'Édition de lecture de la communication scientifique de doctorat. Les 13 diapositives associées reproduisent fidèlement les documents originaux projetés lors du colloque Saberes França–Brasil.',
      downloadPdfLabel: 'Télécharger le texte de conférence original (PDF) ↓',
      linkedSlides: [12, 13],
    },
    sourcesSection: {
      title: 'Sources primaires et carte de lecture',
      subtitle: 'SOURCES & CRÉDITS',
      sources: [
        {
          num: '01',
          title: 'Between Representation and Authentication (Texte de conférence)',
          citation:
            'MENDES, Ana Vitória Vanzin. Between Representation and Authentication. Florianópolis: PPGD/UFSC, 2026. 8 p. Texte de conférence en anglais et français.',
          anchor: '#representation',
        },
        {
          num: '02',
          title: 'Buste, allégorie civique, bandeau et Debret',
          citation:
            'Sections 01–08. Sources: Museu Histórico de Santa Catarina (MHSC), Brant (1494), Ripa (1603), Debret (1822/1839).',
          anchor: '#representation',
        },
        {
          num: '03',
          title: 'Or, garantie bancaire, fausse monnaie et révision',
          citation:
            'Sections 09–13. Textes légaux: Décret brésilien nº 1.227/1890; Code pénal brésilien de 1890 (Art. 239).',
          anchor: '#case-file',
        },
      ],
      colophonLeft:
        'Recherche et rédaction : Ana Vitória Vanzin Mendes · Adaptation pour le colloque Saberes França–Brasil 2026.',
      colophonRight:
        'Sans traceurs, publicités ou collectes de données. Typographies : Cormorant Garamond, Space Mono et Pinyon Script.',
    },
  },
};
