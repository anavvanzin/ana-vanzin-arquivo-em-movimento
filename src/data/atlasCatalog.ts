import bustoImg from '../assets/images/busto_republica_palacio_1794575371169.jpg';
import brantImg from '../assets/images/brant_narrenschiff_1494_1794575372224.jpg';
import giengImg from '../assets/images/gieng_fonte_justica_1543_1794575374330.jpg';
import ripaImg from '../assets/images/ripa_iconologia_1603_1794575375394.jpg';
import debretImg from '../assets/images/debret_coroacao_1822_1794575377274.jpg';
import numismaticaImg from '../assets/images/numismatica_ouro_1890_1794575379421.jpg';
import { AtlasEntry, DeckId, LangCode } from '../types';

export const LANGUAGES: { code: LangCode; label: string; nativeLabel: string }[] = [
  { code: 'pt', label: 'PT', nativeLabel: 'Português' },
  { code: 'en', label: 'EN', nativeLabel: 'English' },
  { code: 'fr', label: 'FR', nativeLabel: 'Français' },
  { code: 'it', label: 'IT', nativeLabel: 'Italiano' },
  { code: 'nl', label: 'NL', nativeLabel: 'Nederlands' },
];

export const ATLAS_ENTRIES: AtlasEntry[] = [
  {
    id: 'brant-1494',
    accessionCode: 'CAT. 1494.BRANT',
    axis: 'venda',
    year: '1494',
    sortYear: 1494,
    title: 'Das Narrenschiff — Cena do louco que venda a Justiça',
    creator: 'Sebastian Brant (atrib. oficina da Basileia / Mestre de Bergmann)',
    medium: 'Xilogravura impressa sobre papel vergê (prancha de estudo visual)',
    repositoryOrContext: 'Basileia, 1494 · Tradição satírica norte-europeia',
    imageSrc: brantImg,
    imageAlt:
      'Prancha de estudo em estilo de xilogravura de 1494 mostrando um bufão atando uma venda sobre os olhos da alegoria feminina da Justiça sentada com espada e balança.',
    aspectClass: 'aspect-[3/4]',
    epistemicStatus: 'locator_pending',
    statusDetail: 'Prancha de estudo visual · Edição e fólio do exemplar a fixar',
    analyticalFunction: 'Representação satírica e intervenção narrativa sobre o atributo',
    juridicalQuestion:
      'Como a venda surge em registro crítico — sinal de cegueira induzida no julgamento — antes de estabilizar-se como atributo de imparcialidade?',
    verificationNotes:
      'Conferir edição de referência (Basileia, Johann Bergmann von Olpe, 1494) e localizador exato da xilogravura para citação canônica.',
    linkedSlides: [
      { deck: 'representacao', slideIndex: 5, contextLabel: 'Slide 06 · A venda em comparação, 1494–1603' },
      { deck: 'representacao', slideIndex: 6, contextLabel: 'Slide 07 · Zwischenraum: uma hipótese sob exame' },
      { deck: 'trajeto', slideIndex: 5, contextLabel: 'Slide 06 · Warburg contra Panofsky?' },
    ],
  },
  {
    id: 'gieng-1543',
    accessionCode: 'CAT. 1543.GIENG',
    axis: 'venda',
    year: '1543',
    sortYear: 1543,
    title: 'Gerechtigkeitsbrunnen (Fonte da Justiça de Berna)',
    creator: 'Hans Gieng',
    medium: 'Escultura policromada em pedra calcária sobre coluna coríntia (prancha de estudo)',
    repositoryOrContext: 'Gerechtigkeitsgasse, Berna (original no Bernisches Historisches Museum)',
    imageSrc: giengImg,
    imageAlt:
      'Prancha de estudo arquitetônico da Fonte da Justiça de Berna (1543), com estátua policromada da Justiça vendada empunhando espada e balança sobre coluna.',
    aspectClass: 'aspect-[3/4]',
    epistemicStatus: 'study_plate',
    statusDetail: 'Prancha de estudo visual · Contexto cívico e usos monumentais sob cotejo',
    analyticalFunction: 'Figura cívica em espaço público urbano',
    juridicalQuestion:
      'De que modo a integração da venda em um monumento cívico altera o regime de leitura da figura sem implicar uma evolução linear desde 1494?',
    verificationNotes:
      'Articular a leitura formal com a documentação histórica sobre jurisdição municipal em Berna e a distinção entre o fuste/estátua original no museu e a cópia urbana.',
    linkedSlides: [
      { deck: 'representacao', slideIndex: 5, contextLabel: 'Slide 06 · A venda em comparação, 1494–1603' },
      { deck: 'representacao', slideIndex: 6, contextLabel: 'Slide 07 · Zwischenraum: uma hipótese sob exame' },
    ],
  },
  {
    id: 'ripa-1603',
    accessionCode: 'CAT. 1603.RIPA',
    axis: 'venda',
    year: '1593 / 1603',
    sortYear: 1603,
    title: 'Iconologia — Verbete Giustizia',
    creator: 'Cesare Ripa',
    medium: 'Gravura em metal e texto emblemático em livro impresso (prancha de estudo)',
    repositoryOrContext: 'Roma, 1593 (sem gravuras) / Roma, Lepido Facii, 1603 (1ª ed. ilustrada)',
    imageSrc: ripaImg,
    imageAlt:
      'Prancha de estudo em calcografia seiscentista representando a alegoria Giustizia vendada, de pé, com balança e espada, ao modo da Iconologia de Cesare Ripa.',
    aspectClass: 'aspect-[3/4]',
    epistemicStatus: 'locator_pending',
    statusDetail: 'Prancha de estudo visual · Edição (1593 vs. 1603) e subtipo de Giustizia a especificar',
    analyticalFunction: 'Codificação repertorial de atributos alegóricos',
    juridicalQuestion:
      'Qual das variantes de Giustizia descritas por Ripa porta efetivamente a venda, e como evitar projetar a edição ilustrada de 1603 sobre o texto de 1593?',
    verificationNotes:
      'Cotejar diretamente a página e a variante de Giustizia na edição romana de 1603 frente à editio princeps de 1593; verificar circulação em repertórios luso-brasileiros.',
    linkedSlides: [
      { deck: 'representacao', slideIndex: 3, contextLabel: 'Slide 04 · Circulação França–Brasil: objetos e percursos' },
      { deck: 'representacao', slideIndex: 5, contextLabel: 'Slide 06 · A venda em comparação, 1494–1603' },
      { deck: 'trajeto', slideIndex: 5, contextLabel: 'Slide 06 · Warburg contra Panofsky?' },
    ],
  },
  {
    id: 'debret-1822',
    accessionCode: 'CAT. 1822.DEBRET',
    axis: 'imperio',
    year: '1822 / 1839',
    sortYear: 1822,
    title: 'Alegoria do Governo Imperial e tábuas da Constituição',
    creator: 'Jean-Baptiste Debret',
    medium: 'Litografia aquarelada / composição cenográfica (prancha de estudo)',
    repositoryOrContext: 'Rio de Janeiro, 1822 · Voyage pittoresque et historique au Brésil, t. III, pr. 49 (Paris, 1839)',
    imageSrc: debretImg,
    imageAlt:
      'Prancha de estudo em litografia neoclássica aquarelada apresentando figura feminina coroada entronizada com espada erguida e tábuas da Constituição.',
    aspectClass: 'aspect-[4/3]',
    epistemicStatus: 'locator_pending',
    statusDetail: 'Prancha de estudo visual · Conferência direta da prancha 49 (vol. III, 1839) pendente',
    analyticalFunction: 'Representação fundacional prévia à Carta outorgada de 1824',
    juridicalQuestion:
      'Como distinguir a cena efêmera de aclamação/coroação em 1822 (anterior à Constituição de 1824) de sua recodificação editorial parisiense em 1839?',
    verificationNotes:
      'Conferir diretamente a descrição autoral de Debret no tomo III (1839, pr. 49) e cotejar com Silva (2017, p. 32), Lima Junior (2020, p. 136–139) e Rosa, Rodrigues e Abraham (2020, p. 71–72).',
    linkedSlides: [
      { deck: 'representacao', slideIndex: 7, contextLabel: 'Slide 08 · Debret: a Constituição em cena' },
      { deck: 'representacao', slideIndex: 3, contextLabel: 'Slide 04 · Circulação França–Brasil: objetos e percursos' },
      { deck: 'trajeto', slideIndex: 7, contextLabel: 'Slide 08 · Reunir imagens e sustentar uma tese' },
    ],
  },
  {
    id: 'numismatica-1890',
    accessionCode: 'DOC. 1890.1227',
    axis: 'republica',
    year: '1890 / 1906',
    sortYear: 1890,
    title: 'Moedas de ouro francesas (20 e 10 francos) & Efígie republicana de 1.000 réis',
    creator: 'Casa da Moeda de Paris (tipo Génie / Marianne) · Casa da Moeda do Rio de Janeiro',
    medium: 'Cunhagem monetária em ouro e prata + Decretos nº 847/1890 e nº 1.227/1890 (prancha de estudo)',
    repositoryOrContext: 'Legislação federal da Primeira República · Garantia bancária e tutela penal da moeda',
    imageSrc: numismaticaImg,
    imageAlt:
      'Prancha numismática comparativa de estudo exibindo moeda francesa de ouro de 20 francos com o Gênio gravando a Constituição ao lado de moeda republicana brasileira com efígie feminina de barrete frígio.',
    aspectClass: 'aspect-[4/3]',
    epistemicStatus: 'primary_verified',
    statusDetail: 'Fontes legislativas primárias consultadas · Espécimes numismáticos a catalogar',
    analyticalFunction: 'Autenticação jurídica vs. equivalência material',
    juridicalQuestion:
      'Se o art. 239 do Código Penal de 1890 pune a moeda fabricada “sem autoridade legitima” mesmo com idêntica matéria, forma, peso e valor intrínseco, onde reside exatamente a operação jurídica da forma visual?',
    verificationNotes:
      'Decreto nº 1.227/1890 (art. 10 dos estatutos anexos) e Decreto nº 847/1890 (art. 239) verificados em fonte primária; identificar catálogo, ano e cunho exato para o tipo Génie e para a moeda de 1.000 réis de 1906.',
    primarySourceUrl:
      'https://www2.camara.leg.br/legin/fed/decret/1824-1899/decreto-1227-30-dezembro-1890-522863-anexo-pe.pdf',
    primarySourceLabel: 'Decreto nº 1.227, de 30 dez. 1890 (Câmara dos Deputados)',
    linkedSlides: [
      { deck: 'representacao', slideIndex: 8, contextLabel: 'Slide 09 · Dezembro de 1890: ouro e emissão' },
      { deck: 'representacao', slideIndex: 9, contextLabel: 'Slide 10 · Uma cópia perfeita pode ser ilícita' },
      { deck: 'representacao', slideIndex: 10, contextLabel: 'Slide 11 · De volta à escada: figura e uso jurídico' },
      { deck: 'trajeto', slideIndex: 9, contextLabel: 'Slide 10 · 5. Uma cópia perfeita pode ser ilícita' },
    ],
  },
  {
    id: 'busto-palacio-1906',
    accessionCode: 'CAT. 1906.MHSC',
    axis: 'republica',
    year: 'c. 1906',
    sortYear: 1906,
    title: 'Busto Marianne–République na escadaria do Palácio Cruz e Sousa',
    creator: 'Atribuição catalográfica: Fundição Val d’Osne (França)',
    medium: 'Ferro fundido patinado sobre pedestal arquitetônico (prancha de estudo)',
    repositoryOrContext: 'Museu Histórico de Santa Catarina (MHSC), Palácio Cruz e Sousa, Florianópolis',
    imageSrc: bustoImg,
    imageAlt:
      'Prancha de estudo museológico mostrando busto neoclássico em ferro fundido da República com barrete frígio e cocarda junto à escadaria monumental de pedra.',
    aspectClass: 'aspect-[4/3]',
    epistemicStatus: 'locator_pending',
    statusDetail: 'Prancha de estudo visual · Cotas fotográficas IHG-FOT-2460 vs. IHG-FOT-2579 em conferência',
    analyticalFunction: 'Representação palaciana da ordem republicana estadual',
    juridicalQuestion:
      'Atribuir a fundição à Val d’Osne identifica o modelo industrial, mas que documentos provariam encomenda, rota de aquisição e eventual papel legitimador no hall palaciano?',
    verificationNotes:
      'Separar rigorosamente atribuição de fabrico (Makowiecky et al., 2023, p. 195) de rota de compra ainda não documentada; fixar identidade entre as cotas fotográficas do IHGSC.',
    linkedSlides: [
      { deck: 'representacao', slideIndex: 1, contextLabel: 'Slide 02 · Uma francesa ao pé da escada' },
      { deck: 'representacao', slideIndex: 3, contextLabel: 'Slide 04 · Circulação França–Brasil: objetos e percursos' },
      { deck: 'representacao', slideIndex: 10, contextLabel: 'Slide 11 · De volta à escada: figura e uso jurídico' },
      { deck: 'trajeto', slideIndex: 8, contextLabel: 'Slide 09 · 4. A frase que dizia mais do que a fonte' },
    ],
  },
];

export function getAtlasForSlide(deck: DeckId, slideIndex: number): AtlasEntry[] {
  return ATLAS_ENTRIES.filter((entry) =>
    entry.linkedSlides.some((link) => link.deck === deck && link.slideIndex === slideIndex)
  );
}

export const DEFAULT_PRESENTER_NOTES: Record<string, string> = {
  'trajeto:0':
    'Abertura tranquila (1 min). Situar o propósito deste percurso: mostrar as decisões metodológicas do primeiro ano de doutorado no PPGD/UFSC a partir daquilo que o confronto com as fontes obrigou a abandonar.',
  'trajeto:1':
    'Explicitar a assimetria central: proliferação de figuras femininas representando Justiça, Nação e República vs. restrições jurídicas concretas às mulheres. Enfatizar a pergunta no rodapé: que relação histórica é demonstrável?',
  'trajeto:2':
    'Explicar de modo acessível por que o projeto usa controle de versão (GitHub): não como fetichismo técnico, mas como caderno de laboratório filológico que preserva rascunhos superados.',
  'trajeto:3':
    'Primeira renúncia: abandonar o índice composto único. Reduzir dez indicadores visuais e contextuais a um escore apaga justamente a tensão histórica que importa analisar.',
  'trajeto:5':
    'Segunda renúncia: desfazer a falsa oposição entre Warburg (montagem, intervalos) e Panofsky (níveis descritivo e iconográfico). Na prática de arquivo, identificar edições precede qualquer montagem séria.',
  'trajeto:8':
    'Quarta renúncia (crucial para o rigor histórico): a frase elegante sobre a “figura comprada de um catálogo parisiense” dizia mais do que a fonte permite. Ter atribuição Val d’Osne não documenta o ato de compra.',
  'trajeto:9':
    'Quinta virada: leitura direta do art. 239 do Código Penal de 1890 (“sem autoridade legitima”). Mesmo uma moeda materialmente idêntica em ouro, peso e forma é ilícita se carece de autorização jurídica.',
  'trajeto:13':
    'Encerramento aberto ao debate com a banca/seminário: ouvir qual dessas depurações metodológicas mais altera o desenho da tese.',
  'representacao:0':
    'Abertura da comunicação Saberes França–Brasil (1 min 30 s). Delimitar o recorte temporal desta fala (1822–1906) dentro do arco maior da tese (Brasil, 1822–1922). Avisar que esta é uma edição de trabalho sob revisão autoral.',
  'representacao:1':
    'Partir do caso concreto em Florianópolis: o busto de Marianne–République na escadaria do Palácio Cruz e Sousa (MHSC). Sublinhar desde já o cuidado documental com as cotas do IHGSC e os limites da atribuição à Val d’Osne.',
  'representacao:2':
    'Formular a pergunta diretriz com nitidez: representar o Estado equivale a participar de sua autenticação jurídica? Antecipar que semelhança material não gera validade por si só.',
  'representacao:4':
    'Pausa didática essencial (2 min): distinguir as quatro funções analíticas — Representação, Legitimação, Autenticação e Justificação. Não são estágios evolutivos nem repetem a tríade Fundacional/Normativo/Militar.',
  'representacao:5':
    'Se oportuno, abrir a Mesa de Luz (tecla Z) para mostrar lado a lado Brant (1494), Gieng (1543) e Ripa (1593/1603). Reforçar: comparação situada, nunca linha evolutiva universal.',
  'representacao:6':
    'Apresentar a hipótese inspirada na noção de Zwischenraum com máxima cautela: justapor alegoria feminina e exclusão jurídica feminina formula um problema histórico, mas não prova por si um mecanismo compensatório.',
  'representacao:7':
    'Caso Debret: separar 1822 (projeto/cena anterior à Carta de 1824) de 1839 (publicação parisiense na prancha 49 do vol. III). Indicar transparência sobre os localizadores em conferência direta.',
  'representacao:8':
    'Entrar nas fontes primárias de dezembro de 1890 (Decreto nº 1.227, art. 10): moedas francesas de ouro de 20 e 10 francos no lastro bancário. Distinguir admissão em depósito metálico, curso legal e tipo iconográfico.',
  'representacao:9':
    'Ponto alto jurídico da comunicação: art. 239 do Código Penal de 1890. A cópia materialmente perfeita fabricada “sem autoridade legitima” é crime. A validade decorre de competência normativa, mas o dispositivo convoca “forma”.',
  'representacao:11':
    'Critério de falseabilidade da própria hipótese: explicitar que achados empíricos obrigariam a reformular ou abandonar a explicação proposta.',
  'representacao:12':
    'Fecho bibliográfico e agradecimento (1 min). Destacar diálogo com Agulhon, Warner, Landes, José Murilo de Carvalho, Lima Junior e pesquisadoras do acervo catarinense.',
};
