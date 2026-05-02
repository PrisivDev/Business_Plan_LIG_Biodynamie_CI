const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, AlignmentType, PageBreak, TableOfContents, ShadingType,
  BorderStyle, ImageRun, Header, Footer, PageNumber, NumberFormat,
  convertInchesToTwip, LevelFormat, TabStopType, TabStopPosition,
  VerticalAlign
} = require("docx");
const fs = require("fs");

// ─── Palette FG-1 (Forest Mint) ─────────────────────────────────────
const P = {
  bg: "0C1F1A",
  primary: "FFFFFF",
  accent: "3DDBB5",
  cover: { titleColor: "FFFFFF", subtitleColor: "B0B8C0", metaColor: "90989F", footerColor: "687078" },
  table: { headerBg: "2A7A65", headerText: "FFFFFF", accentLine: "2A7A65", innerLine: "C5D8D0", surface: "EDF5F2" },
};

const BODY_COLOR = "000000";
const HEADING_COLOR = P.table.headerBg; // #2A7A65
const LINE_SPACING = 312; // 1.3x
const FIRST_LINE_INDENT = 480; // twips

// ─── Helper Functions ────────────────────────────────────────────────

function calcTitleLayout(text) {
  const len = text.length;
  if (len <= 20) return { size: 72, font: "Times New Roman" };
  if (len <= 40) return { size: 56, font: "Times New Roman" };
  if (len <= 60) return { size: 44, font: "Times New Roman" };
  return { size: 36, font: "Times New Roman" };
}

function calcCoverSpacing() {
  return { before: 1200, after: 200 };
}

function bodyPara(text, opts = {}) {
  const runs = [];
  if (typeof text === "string") {
    runs.push(new TextRun({ text, font: "Calibri", size: 22, color: BODY_COLOR, ...opts.runOpts }));
  } else if (Array.isArray(text)) {
    text.forEach(t => {
      if (typeof t === "string") {
        runs.push(new TextRun({ text: t, font: "Calibri", size: 22, color: BODY_COLOR }));
      } else {
        runs.push(new TextRun({ font: "Calibri", size: 22, color: BODY_COLOR, ...t }));
      }
    });
  }
  return new Paragraph({
    children: runs,
    spacing: { line: LINE_SPACING, after: 120 },
    alignment: AlignmentType.JUSTIFIED,
    indent: opts.noIndent ? {} : { firstLine: FIRST_LINE_INDENT },
    ...opts.paraOpts,
  });
}

function heading1(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Times New Roman", size: 36, color: HEADING_COLOR, bold: true })],
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200, line: LINE_SPACING },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: HEADING_COLOR } },
  });
}

function heading2(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Times New Roman", size: 30, color: HEADING_COLOR, bold: true })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150, line: LINE_SPACING },
  });
}

function heading3(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Times New Roman", size: 26, color: HEADING_COLOR, bold: true })],
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100, line: LINE_SPACING },
  });
}

function emptyLine(n = 1) {
  const paras = [];
  for (let i = 0; i < n; i++) {
    paras.push(new Paragraph({ children: [new TextRun({ text: "", font: "Calibri", size: 2 })], spacing: { after: 60 } }));
  }
  return paras;
}

function bulletPara(text, level = 0) {
  const runs = [];
  if (typeof text === "string") {
    runs.push(new TextRun({ text, font: "Calibri", size: 22, color: BODY_COLOR }));
  } else if (Array.isArray(text)) {
    text.forEach(t => {
      if (typeof t === "string") {
        runs.push(new TextRun({ text: t, font: "Calibri", size: 22, color: BODY_COLOR }));
      } else {
        runs.push(new TextRun({ font: "Calibri", size: 22, color: BODY_COLOR, ...t }));
      }
    });
  }
  return new Paragraph({
    children: runs,
    spacing: { line: LINE_SPACING, after: 80 },
    alignment: AlignmentType.JUSTIFIED,
    bullet: { level },
  });
}

// Table helper
const allNoBorders = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
};

const hOnlyBorders = {
  top: { style: BorderStyle.SINGLE, size: 1, color: P.table.innerLine },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: P.table.innerLine },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
};

const headerBorders = {
  top: { style: BorderStyle.SINGLE, size: 2, color: P.table.accentLine },
  bottom: { style: BorderStyle.SINGLE, size: 2, color: P.table.accentLine },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
};

function makeHeaderCell(text, widthPct) {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, font: "Calibri", size: 20, color: P.table.headerText, bold: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 40 },
    })],
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: P.table.headerBg },
    verticalAlign: VerticalAlign.CENTER,
  });
}

function makeCell(text, widthPct, opts = {}) {
  const runs = [];
  if (typeof text === "string") {
    runs.push(new TextRun({ text, font: "Calibri", size: 20, color: BODY_COLOR, ...opts.runOpts }));
  } else if (Array.isArray(text)) {
    text.forEach(t => {
      if (typeof t === "string") {
        runs.push(new TextRun({ text: t, font: "Calibri", size: 20, color: BODY_COLOR }));
      } else {
        runs.push(new TextRun({ font: "Calibri", size: 20, color: BODY_COLOR, ...t }));
      }
    });
  }
  return new TableCell({
    children: [new Paragraph({
      children: runs,
      alignment: opts.align || AlignmentType.LEFT,
      spacing: { before: 30, after: 30 },
    })],
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    shading: opts.shading ? { type: ShadingType.CLEAR, fill: opts.shading } : undefined,
    verticalAlign: VerticalAlign.CENTER,
  });
}

function makeTable(headers, rows, colWidths) {
  const headerRow = new TableRow({
    children: headers.map((h, i) => makeHeaderCell(h, colWidths[i])),
    tableHeader: true,
    cantSplit: true,
  });
  const dataRows = rows.map((row, ri) =>
    new TableRow({
      children: row.map((cell, ci) => makeCell(cell, colWidths[ci], {
        shading: ri % 2 === 1 ? P.table.surface : undefined,
      })),
    })
  );
  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

// Image helper
function chartImage(filename, widthPx = 550, heightPx = 380) {
  const imgPath = `/home/z/my-project/upload/bp_charts/${filename}`;
  const buf = fs.readFileSync(imgPath);
  return new Paragraph({
    children: [
      new ImageRun({
        data: buf,
        transformation: { width: widthPx, height: heightPx },
        type: "png",
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 200 },
  });
}

// ─── COVER PAGE ──────────────────────────────────────────────────────

function buildCover() {
  const titleLayout = calcTitleLayout("Business Plan");

  const coverTable = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({ children: [], spacing: { before: 2400 } }),
              new Paragraph({
                children: [new TextRun({
                  text: "Business Plan",
                  font: titleLayout.font,
                  size: titleLayout.size,
                  color: P.cover.titleColor,
                  bold: true,
                })],
                alignment: AlignmentType.CENTER,
                spacing: calcCoverSpacing(),
              }),
              new Paragraph({
                children: [new TextRun({
                  text: "Centre de Recherche Agricole LIAMBOU GISELE (LIG)",
                  font: "Times New Roman",
                  size: 28,
                  color: P.cover.subtitleColor,
                })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 200, after: 100 },
              }),
              new Paragraph({
                children: [new TextRun({
                  text: "Implantation en Cote d'Ivoire",
                  font: "Calibri",
                  size: 24,
                  color: P.cover.subtitleColor,
                })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 80, after: 80 },
              }),
              new Paragraph({
                children: [new TextRun({
                  text: "Lancement du Biofertilisant Biodynamie",
                  font: "Calibri",
                  size: 24,
                  color: P.cover.subtitleColor,
                  italics: true,
                })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 80, after: 400 },
              }),
              new Paragraph({
                children: [new TextRun({
                  text: "Partenaire Exclusif : Comptoir Agropastoral CI",
                  font: "Calibri",
                  size: 20,
                  color: P.cover.metaColor,
                })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 200, after: 100 },
              }),
              new Paragraph({
                children: [new TextRun({
                  text: "Decembre 2025",
                  font: "Calibri",
                  size: 20,
                  color: P.cover.metaColor,
                })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 80, after: 200 },
              }),
              new Paragraph({
                children: [new TextRun({
                  text: "Confidentiel",
                  font: "Calibri",
                  size: 18,
                  color: P.cover.footerColor,
                  italics: true,
                })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 600, after: 0 },
              }),
            ],
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: P.bg },
            verticalAlign: VerticalAlign.CENTER,
            borders: allNoBorders,
          }),
        ],
        height: { value: 16838, rule: "exact" },
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: allNoBorders.top, bottom: allNoBorders.bottom, left: allNoBorders.left, right: allNoBorders.right,
               insideHorizontal: allNoBorders.top, insideVertical: allNoBorders.left },
  });

  return [coverTable];
}

// ─── TABLE OF CONTENTS ──────────────────────────────────────────────

function buildTOC() {
  return [
    new Paragraph({
      children: [new TextRun({ text: "Table des matieres", font: "Times New Roman", size: 36, color: HEADING_COLOR, bold: true })],
      spacing: { before: 200, after: 300 },
      alignment: AlignmentType.CENTER,
    }),
    new TableOfContents("Table des matieres", {
      hyperlink: true,
      headingStyleRange: "1-3",
    }),
    new Paragraph({
      children: [new TextRun({ text: "Astuce : Pour mettre a jour la table des matieres, faites un clic droit dessus et selectionnez « Mettre a jour les champs ».", font: "Calibri", size: 18, color: "808080", italics: true })],
      spacing: { before: 200, after: 200 },
    }),
  ];
}

// ─── SECTION 3: RESUME EXECUTIF ─────────────────────────────────────

function buildResumeExecutif() {
  return [
    heading1("3. Resume Executif"),
    bodyPara("Le Centre de Recherche Agricole LIAMBOU GISELE (LIG) presente son plan d'affaires pour le lancement en Cote d'Ivoire du biofertilisant Biodynamie, un produit innovant issu de plus de vingt annees de recherche et developpement. Ce projet s'inscrit dans un contexte mondial et regional favorable a la transition vers des pratiques agricoles durables et ecologiques, positionnant la Cote d'Ivoire comme un acteur majeur de l'agriculture biologique en Afrique de l'Ouest."),
    bodyPara("Le biofertilisant Biodynamie se distingue par sa formulation 100% naturelle et biodegradable, offrant des resultats visibles en dix jours seulement. Compatible avec l'ensemble des cultures tropicales, il regenere la vie microbienne des sols tout en maintenant un pH optimal de 7,5. Cette innovation repond aux defis majeurs de l'agriculture ivoirienne : degradation des sols, dependance aux intrants chimiques couteux et necessite d'augmenter les rendements de maniere durable."),
    bodyPara("Le lancement officiel est prevu le 10 decembre 2025 a Abidjan, en partenariat exclusif avec le Comptoir Agropastoral CI. Les objectifs a court terme (decembre 2025 - mars 2026) sont ambitieux mais realistes : vendre 29 tonnes de produit, former 500 agriculteurs et etablir au moins trois partenariats majeurs avec des acteurs institutionnels et industriels du secteur agricole. Le budget alloue au marketing et a la communication s'eleve a 46 millions de Fcfa, soit environ 70 000 EUR."),
    bodyPara("Les projections financieres sur trois ans montrent une trajectoire de croissance progressive : un chiffre d'affaires de 17,4 millions de Fcfa en annee 1 (phase de lancement), 64 millions de Fcfa en annee 2 (phase de croissance) et 135 millions de Fcfa en annee 3 (phase de maturite). Le seuil de rentabilite est attendu au cours de la deuxieme annee d'activite, confirmant la viabilite economique du projet."),
  ];
}

// ─── SECTION 4: PRESENTATION DU PROJET ──────────────────────────────

function buildPresentation() {
  return [
    heading1("4. Presentation du Projet et de l'Entreprise"),

    heading2("4.1 Historique et Genese"),
    bodyPara("Le Centre de Recherche Agricole LIAMBOU GISELE (LIG) trouve ses origines dans la vision de sa fondatrice, Madame LIAMBOU GISELE, agronome de formation passionnee par les solutions agricoles durables. Depuis plus de vingt ans, elle consacre sa carriere a la recherche de formulations naturelles capables de regenerer les sols tropicaux tout en augmentant significativement les rendements agricoles. Ce travail de pionniere, mene dans des conditions souvent difficiles, a abouti a la mise au point du biofertilisant Biodynamie."),
    bodyPara("Les premieres experimentations ont ete conduites sur des parcelles experimentales en zone tropicale, ou les resultats ont rapidement depasse les attentes : augmentation des rendements de 30 a 50 pourcent selon les cultures, restauration de la biodiversite microbienne des sols et reduction drastique de l'utilisation d'engrais chimiques. Ces resultats ont ete confirmes par des essais complementaires menes en partenariat avec des institutions de recherche locales et regionales."),
    bodyPara("La decision d'implanter le projet en Cote d'Ivoire repose sur une conjugaison de facteurs strategiques : premier producteur mondial de cacao, economie agricole representant 25 pourcent du PIB, cadre reglementaire favorable a l'agriculture biologique (Loi n02015-537, Strategie Bio 2030) et positionnement geopolitique privilegie en Afrique de l'Ouest. Le pays constitue ainsi un marche naturel pour Biodynamie et une plateforme de lancement ideale vers les marches sous-regionaux."),

    heading2("4.2 Vision, Mission et Valeurs"),
    heading3("Vision"),
    bodyPara("Devenir le leader africain des solutions de biofertilisation d'ici 2030, en contribuant a la transformation durable des systemes agricoles tropicaux et a la securite alimentaire du continent."),
    heading3("Mission"),
    bodyPara("Fournir aux agriculteurs africains des solutions de fertilisation 100% naturelles, efficaces et accessibles, qui regenerent les sols, augmentent les rendements et preservent l'environnement pour les generations futures."),
    heading3("Valeurs"),
    bulletPara([{ text: "Innovation : ", bold: true }, "Portee par la recherche scientifique rigoureuse et l'amelioration continue de nos formulations."]),
    bulletPara([{ text: "Durabilite : ", bold: true }, "Engagement total envers la preservation des ecosystemes et la regeneration des sols."]),
    bulletPara([{ text: "Accessibilite : ", bold: true }, "Rendre les solutions biologiques abordables pour tous les agriculteurs, des petits exploitants aux agro-industriels."]),
    bulletPara([{ text: "Integrite : ", bold: true }, "Transparence totale sur la composition, les resultats et les pratiques commerciales."]),
    bulletPara([{ text: "Impact social : ", bold: true }, "Contribution active au developpement des communautes rurales et a l'autonomisation des agriculteurs."]),

    heading2("4.3 Structure Juridique et Organisationnelle"),
    bodyPara("Le Centre de Recherche Agricole LIAMBOU GISELE opere sous la forme juridique d'une societe a responsabilite limitee (SARL) immatriculee en Cote d'Ivoire. Cette structure offre la flexibilite necessaire pour une jeune entreprise en phase de lancement tout en garantissant la securite juridique des partenaires et investisseurs. Le capital social est detenu majoritairement par la fondatrice, avec une participation strategique du Comptoir Agropastoral CI."),
    bodyPara("L'organisation est articulee autour de quatre directions cles : la Direction Generale assuree par la fondatrice, la Direction de la Recherche et du Developpement responsible de l'innovation produit, la Direction Commerciale et Marketing en charge du deploiement marche, et la Direction Administrative et Financiere qui gere les operations et la trésorerie. Cette structure lean permet une reactivite maximale tout en couvrant l'ensemble des fonctions critiques de l'entreprise."),

    makeTable(
      ["Direction", "Responsable", "Effectif initial", "Missions principales"],
      [
        ["Direction Generale", "Fondatrice LIAMBOU G.", "1", "Strategie, pilotage, partenariats"],
        ["R&D et Qualite", "Directeur R&D", "3", "Innovation, controles qualite, essais"],
        ["Commerciale et Marketing", "Directeur Commercial", "5", "Ventes, marketing, distribution"],
        ["Administrative et Financiere", "Directrice Admin.", "2", "Comptabilite, RH, juridique"],
        ["Production", "Chef de Production", "4", "Fabrication, logistique, approvisionnement"],
      ],
      [20, 25, 15, 40]
    ),
    emptyLine(1),

    heading2("4.4 Partenaire Exclusif : Comptoir Agropastoral CI"),
    bodyPara("Le Comptoir Agropastoral CI est le partenaire exclusif de LIG pour la distribution et la commercialisation du biofertilisant Biodynamie en Cote d'Ivoire. Cette entreprise, forte de son experience dans le secteur agropastoral ivoirien, dispose d'un reseau etabli de contacts aupres des exploitants agricoles, des cooperatives et des agro-industriels. Son expertise logistique et sa connaissance approfondie du marche local constituent des atouts strategiques majeurs pour le lancement de Biodynamie."),
    bodyPara("L'accord de partenariat prevoit une repartition claire des roles : LIG conserve la maitrise totale de la production, de la qualite et de la recherche, tandis que le Comptoir Agropastoral CI assure la distribution commerciale, la gestion des relations avec les revendeurs et le deploiement terrain. Ce modele permet a chaque partenaire de se concentrer sur son coeur de competence, maximisant ainsi les chances de succes du lancement."),
  ];
}

// ─── SECTION 5: ANALYSE ENVIRONNEMENT ET MARCHE ─────────────────────

function buildAnalyseMarche() {
  return [
    heading1("5. Analyse de l'Environnement et du Marche"),

    heading2("5.1 Analyse PESTEL de la Cote d'Ivoire"),
    heading3("Facteurs Politiques"),
    bodyPara("La Cote d'Ivoire beneficie d'une stabilite politique retroubee depuis 2011, avec un gouvernement fortement engage en faveur de la modernisation du secteur agricole. Le Plan National d'Investissement Agricole II (PNIA II) et le Programme National de Developpement Agricole Durable (PNDAD) constituent des cadres institutionnels favorables au developpement de solutions agricoles innovantes comme Biodynamie. La Strategie Bio 2030, lancee recemment, vise explicitement a promouvoir l'agriculture biologique et la reduction de l'utilisation des produits chimiques."),
    heading3("Facteurs Economiques"),
    bodyPara("Avec une economie agricole representant 25 pourcent du PIB et employant plus de 60 pourcent de la population active, la Cote d'Ivoire offre un marche considerable pour les intrants agricoles. La croissance economique soutenue (en moyenne 7 pourcent par an entre 2012 et 2019) et l'investissement croissant dans le secteur agricole creent un environnement propice au lancement de produits innovants. Cependant, le pouvoir d'achat des petits exploitants reste un facteur a considerer dans la strategie de prix."),
    heading3("Facteurs Socioculturels"),
    bodyPara("La population ivoirienne est jeune (medians d'age de 19 ans) et de plus en plus sensible aux questions environnementales et sanitaires. Les consumidores exigent des produits agricoles de meilleure qualite, libres de residus chimiques. Parallelement, les agriculteurs, bien que traditionnellement attaches aux methodes conventionnelles, sont de plus en plus ouverts aux alternatives biologiques lorsque leur efficacite est demontree. La formation et la demonstration seront donc des leviers essentiels."),
    heading3("Facteurs Technologiques"),
    bodyPara("La penetration digitale en Cote d'Ivoire (taux de penetration mobile superieur a 120 pourcent) offre des opportunites significatives pour la diffusion d'informations agricoles, la formation a distance et le marketing digital. L'utilisation croissante des reseaux sociaux et des applications mobiles dans le milieu agricole represente un canal de communication efficace et economique pour toucher les agriculteurs et les partenaires."),
    heading3("Facteurs Ecologiques"),
    bodyPara("La degradation des sols tropicaux, consequence de decennies d'utilisation intensive d'engrais chimiques, constitue a la fois un probleme majeur et une opportunite pour Biodynamie. Le changement climatique accentue la vulnerabilite des systemes agricoles, rendant indispensable l'adoption de pratiques plus resilientes. La demande pour des solutions regenerant les sols et preservant la biodiversite est en forte croissance."),
    heading3("Facteurs Legaux"),
    bodyPara("Le cadre reglementaire ivoirien relatif aux intrants agricoles est encadre par la Loi n02015-537 qui regit la mise sur le marche des produits fertilisants. La conformite a cette legislation est un prerequis pour le lancement de Biodynamie. L'obtention des homologations necessaires aupres des autorites competentes (Direction de la Protection des Vegetaux, du Contrat et de la Qualite - DPPVQ) constitue une etape cruciale du plan operationnel."),

    heading2("5.2 Analyse du Marche Agricole Ivoirien"),
    bodyPara("Le marche agricole ivoirien est domine par les cultures de rente (cacao, cafe, hevea, palmier a huile) et les cultures vivrieres (riz, manioc, igname, mais). La Cote d'Ivoire est le premier producteur mondial de cacao avec plus de 2 millions de tonnes par an, et un acteur majeur sur les marches du cafe, de l'hevea et de l'huile de palme. Ces cultures representent des marches cibles prioritaires pour Biodynamie, avec des besoins considerables en fertilisation."),
    bodyPara("Le marche des intrants agricoles en Cote d'Ivoire est estime a plus de 200 milliards de Fcfa par an, dont la majorite est constituee d'engrais chimiques importes. La part des biofertilisants reste marginale (moins de 2 pourcent du marche total), mais connait une croissance rapide tiree par la demande internationale de produits agricoles certifies biologiques et par les politiques de transition ecologique. Le potentiel de croissance du segment des biofertilisants est estime a plus de 15 pourcent par an sur les cinq prochaines annees."),
    bodyPara("Les segments de clientele identifies sont les suivants : les grands groupes agro-industriels (PALMCI, SIFCA, SAPH, SUCAF) representent un potentiel de volumes importants et de partenariats strategiques ; les cooperatives agricoles offrent un acces organise a un grand nombre d'agriculteurs ; les exploitants individuels, bien que plus disperses, constituent la base la plus large du marche ; enfin, les institutions de recherche et de formation (CNRA, INPHB) representent des relais d'influence et de validation scientifique."),

    makeTable(
      ["Segment", "Potentiel (tonnes/an)", "Priorite", "Strategie d'approche"],
      [
        ["Agro-industriels", "200+", "Haute", "Partenariats strategiques, essais pilotes"],
        ["Cooperatives", "150+", "Haute", "Formations collectives, demonstrations"],
        ["Exploitants individuels", "500+", "Moyenne", "Reseaux de distribution, marketing digital"],
        ["Institutions recherche", "10+", "Moyenne", "Collaborations scientifiques, publications"],
        ["Maraichage urbain", "50+", "Haute", "Points de vente, promotions lancement"],
      ],
      [25, 20, 15, 40]
    ),
    emptyLine(1),

    heading2("5.3 Analyse Concurrentielle"),
    bodyPara("Le marche des fertilisants en Cote d'Ivoire est domine par les grands groupes internationaux producteurs d'engrais chimiques (NPK, uree, sulfate d'ammoniaque) qui beneficient de reseau de distribution etablis et de la familiarite des agriculteurs avec leurs produits. Les principaux concurrents directs dans le segment des biofertilisants sont peu nombreux, ce qui constitue un avantage concurrentiel significatif pour Biodynamie."),
    bodyPara("Les produits concurrents existants dans le segment biologique sont principalement des composts et des biofertilisants importes d'Europe ou d'Asie, souvent mal adaptes aux conditions tropicales et a des prix eleves. Biodynamie se differencie clairement par sa formulation specifiquement concue pour les sols tropicaux, son rapport qualite-prix competitif et ses resultats rapides (visibles en 10 jours). La barriere a l'entree la plus significative reste la force de l'habitude des agriculteurs envers les engrais chimiques, qui necessite un effort soutenu de demonstration et de formation."),
    bodyPara("L'avantage concurrentiel de Biodynamie repose sur quatre piliers : l'expertise scientifique unique de plus de 20 ans de R&D, l'efficacite prouvee sur les cultures tropicales, le prix de lancement competitif (600 Fcfa/g contre 1 000 Fcfa/g pour le tarif standard) et le partenariat exclusif avec le Comptoir Agropastoral CI qui assure une capacite de deploiement rapide sur le territoire."),

    heading2("5.4 Analyse SWOT"),
    chartImage("swot_matrix.png", 520, 388),
    bodyPara("L'analyse SWOT met en evidence un profil favorable pour le lancement de Biodynamie en Cote d'Ivoire. Les forces du produit (formulation naturelle, R&D validee, resultats rapides) et les opportunites du marche (tendance bio, soutien politique, marche agricole important) outweigh les faiblesses (nouvel entrant, notoriete a construire) et les menaces (concurrence etablie, reticence au changement). La strategie retenue consiste a capitaliser sur les forces pour saisir les opportunites, tout en mitigeant les faiblesses par des investissements cibles en marketing et en formation, et en anticipant les menaces par la diversification des partenariats et le renforcement de la propriete intellectuelle."),
  ];
}

// ─── SECTION 6: PRODUIT ET INNOVATION ───────────────────────────────

function buildProduit() {
  return [
    heading1("6. Produit et Innovation"),

    heading2("6.1 Description du Produit Biodynamie"),
    bodyPara("Biodynamie est un biofertilisant liquide 100% naturel et ecologique, formule a partir de micro-organismes benefiques et d'extraits vegetaux soigneusement selectionnes pour leur synergie avec les ecosystemes tropicaux. Sa composition unique resulte de plus de vingt annees de recherche et developpement, ayant fait l'objet de multiples iterations et validations experimentales. Le produit agit sur trois niveaux complementaires : la stimulation de la biologie du sol, l'amelioration de la nutrition des plantes et le renforcement de leur resistance naturelle."),
    bodyPara("Les caracteristiques techniques du produit sont les suivantes : pH de 7,5 (neutre a legerement alcalin, optimal pour la plupart des cultures tropicales), 100% biodegradable, zero chimie de synthese, compatible avec tous les types de cultures tropicales (cacaoyers, cafeiers, palmiers a huile, heveas, cultures maraicheres, cereales). Les resultats sont visibles des le dixieme jour suivant l'application, avec une augmentation moyenne des rendements de 30 a 50 pourcent selon les cultures et les conditions pedoclimatiques."),

    makeTable(
      ["Caracteristique", "Specification", "Avantage"],
      [
        ["Composition", "100% naturelle (micro-organismes + extraits vegetaux)", "Zero residus chimiques"],
        ["Biodegradabilite", "100% biodegradable", "Preservation ecosystemes"],
        ["pH", "7,5", "Compatibilite universelle cultures tropicales"],
        ["Delai efficacite", "Resultats visibles en 10 jours", "Adoption rapide par les agriculteurs"],
        ["Action microbiologique", "Regenere la vie microbienne des sols", "Amelioration durable de la fertilite"],
        ["Compatibilite", "Toutes cultures tropicales", "Marche potentiel tres large"],
        ["Homologation", "En cours (Loi n02015-537)", "Conformite reglementaire assuree"],
      ],
      [25, 40, 35]
    ),
    emptyLine(1),

    heading2("6.2 Avantages Competitifs et Proposition de Valeur"),
    bodyPara("La proposition de valeur de Biodynamie s'articule autour de quatre axes differentiants fondamentaux qui repondent aux besoins non satisfaits du marche ivoirien. Premierement, la zero chimie garantit l'absence totale de residus toxiques dans les sols et les recoltes, repondant a la demande croissante des marches internationaux pour des produits agricoles sains et certificables. Deuxiemement, la regeneration microbiologique distingue fondamentalement Biodynamie des engrais chimiques qui, a long terme, appauvrissent les sols."),
    bodyPara("Troisiemement, la rapidite des resultats (10 jours) constitue un argument commercial decisif dans un contexte ou les agriculteurs sont habitues aux effets immediats des engrais chimiques. Cet avantage leve l'un des principaux obstacles a l'adoption des biofertilisants : la perception d'une efficacite lente. Quatriemement, le prix de lancement a 600 Fcfa/g (soit 40 pourcent de reduction par rapport au tarif standard de 1 000 Fcfa/g) rend le produit accessible et encourage l'essai."),

    heading2("6.3 Processus de Recherche et Developpement"),
    bodyPara("Le processus de R&D de Biodynamie s'etend sur plus de vingt ans et suit une demarche scientifique rigoureuse en quatre phases. La premiere phase (2003-2010) a consiste en la recherche fondamentale : identification des souches microbiennes les plus efficaces, etude de leurs synergies et mise au point des premieres formulations experimentales. La deuxieme phase (2010-2017) a porte sur les essais en conditions controlees : tests en laboratoire, optimisation des dosages et validation de l'efficacite sur differentes cultures tropicales."),
    bodyPara("La troisieme phase (2017-2023) a concerne les essais en conditions reelles : tests sur parcelles pilotes aupres d'agriculteurs volontaires, ajustements de la formulation en fonction des retours terrain et constitution d'un corpus de donnees de reference sur les performances du produit. La quatrieme phase (2023-2025) est celle de la pre-industrialisation : mise au point du processus de production a echelle industrielle, elaboration du packaging, constitution des dossiers reglementaires et preparation du lancement commercial."),
    bodyPara("Ce processus de R&D exemplaire constitue une barriere a l'entree significative pour d'eventuels concurrents. La complexite de la formulation, la maitrise des dosages et l'expertise accumulee sur plus de vingt ans ne peuvent etre reproduites rapidement. La protection de la propriete intellectuelle est assuree par le depot de brevet et la confidentialite de la formule complete."),

    heading2("6.4 Gamme de Produits et Packaging"),
    bodyPara("La gamme Biodynamie est declinee en trois formats adaptes aux differents segments de clientele et a leurs besoins specifiques. Chaque format beneficie d'un packaging ergonomique, resistant aux conditions tropicales et portant un identifiant visuel distinctif en coherence avec l'image de marque du produit."),

    makeTable(
      ["Format", "Poids net", "Prix lancement (Fcfa)", "Prix standard (Fcfa)", "Cible principale"],
      [
        ["Petit format", "100 g", "60 000", "100 000", "Petits exploitants, maraichage"],
        ["Format moyen", "500 g", "300 000", "500 000", "Cooperatives, exploitations moyennes"],
        ["Grand format", "1 kg", "600 000", "1 000 000", "Agro-industriels, grandes plantations"],
      ],
      [15, 12, 20, 20, 33]
    ),
    emptyLine(1),
    bodyPara("Le prix de lancement correspond a un tarif de 600 Fcfa par gramme, soit une reduction de 40 pourcent par rapport au tarif standard de 1 000 Fcfa par gramme. Cette politique tarifaire de penetration vise a encourager l'essai du produit et a accelerer son adoption. Le format 100 g constitue le produit d'appel, accessible aux petits exploitants qui representent la majorite des agriculteurs ivoiriens, tandis que les formats superieurs offrent des economies d'echelle pour les utilisateurs intensifs."),
  ];
}

// ─── SECTION 7: MODELE ECONOMIQUE ───────────────────────────────────

function buildBusinessModel() {
  return [
    heading1("7. Modele Economique (Business Model Canvas)"),

    heading2("7.1 Segments de Clientele"),
    bodyPara("Le modele economique de Biodynamie cible quatre segments de clientele distincts, chacun avec des besoins, des volumes d'achat et des canaux d'acces specifiques. Le segment principal est celui des agro-industriels (PALMCI, SIFCA, SAPH, SUCAF), qui representent des volumes d'achat importants et des contrats pluriannuels. Le deuxieme segment est constitue des cooperatives agricoles, qui offrent un acces organise a un grand nombre d'agriculteurs et facilitent le deploiement a grande echelle."),
    bodyPara("Le troisieme segment comprend les exploitants individuels et les petits agriculteurs, qui representent la base la plus large du marche mais necessitent un reseau de distribution capillaire. Enfin, le segment des institutions de recherche et de formation (CNRA, INPHB, FAO) constitue un marche de niche mais strategiquement important pour la validation scientifique du produit et l'effet d'entrainement sur les autres segments."),

    heading2("7.2 Canaux de Distribution"),
    bodyPara("La strategie de distribution repose sur un modele multi-canal adapte aux specificites du marche ivoirien. Le canal principal est le reseau du Comptoir Agropastoral CI, qui dispose de points de vente et d'equipes commerciales couvrant les principales zones agricoles du pays. Ce canal assure la distribution directe aupres des agro-industriels et des cooperatives."),
    bodyPara("Le deuxieme canal est constitue des revendeurs agreés, des commercants locaux selectionnes et formes pour vendre Biodynamie dans les zones rurales et les marches agricoles. Le troisieme canal est le canal digital (site web ligbiodynamie.ci, WhatsApp Business), qui permet les commandes en ligne et la livraison directe. Enfin, les partenariats institutionnels avec les projets de developpement agricole financés par la FAO, la BAD ou le FIRCA constituent un canal indirect permettant d'atteindre les agriculteurs dans le cadre de programmes de formation et d'accompagnement."),

    heading2("7.3 Sources de Revenus"),
    bodyPara("Le modele de revenus de Biodynamie est principalement base sur la vente directe du produit, avec trois sources de revenus complementaires. La premiere est la vente de produits aux agro-industriels et cooperatives, generee par des contrats a volume avec des negociations de prix en fonction des quantites commandees. La deuxieme est la vente au detail via le reseau de revendeurs agreees et le canal digital, avec des marges distribuees aux intermediaires."),
    bodyPara("La troisieme source de revenus, a moyen terme, est constituee des services d'accompagnement et de formation : audits de sol, plans de fertilisation personnalises, sessions de formation certifiantes. Ces services, tout en generant des revenus directs, renforcent la fidelisation des clients et la valeur perçue du produit. A plus long terme, les redevances de licence pour l'exportation de la technologie vers d'autres marches africains constitueront une quatrieme source de revenus."),

    heading2("7.4 Structure de Couts"),
    bodyPara("La structure de couts de Biodynamie se decompose en trois categories principales. Les couts de production representent environ 35 pourcent du chiffre d'affaires et comprennent les matieres premieres (micro-organismes, extraits vegetaux), les emballages, la main-d'oeuvre de production et les charges du laboratoire de controle qualite. Les couts de commercialisation et de marketing representent environ 30 pourcent du chiffre d'affaires et incluent le budget marketing (46M Fcfa pour la phase de lancement), les commissions des equipes commerciales et les couts de distribution."),
    bodyPara("Les couts fixes (administration, loyers, salaires des equipes support) representent environ 20 pourcent du chiffre d'affaires. Le reste (environ 15 pourcent) est alloue a la recherche et au developpement continu, garantissant l'amelioration permanente du produit et le developpement de nouvelles formulations. Cette structure de couts est concue pour etre scalable : la part des couts fixes diminue avec l'augmentation des volumes, ameliorant progressivement la rentabilite."),

    makeTable(
      ["Poste de cout", "Annee 1 (M Fcfa)", "Annee 2 (M Fcfa)", "Annee 3 (M Fcfa)", "% CA An3"],
      [
        ["Production et approvisionnement", "6,1", "18,2", "28,7", "21%"],
        ["Marketing et communication", "12,0", "9,6", "13,5", "10%"],
        ["Commercial et distribution", "4,8", "9,6", "16,2", "12%"],
        ["Administration et RH", "4,5", "6,4", "10,8", "8%"],
        ["Recherche et developpement", "2,6", "5,1", "8,1", "6%"],
        ["Amortissements et financiers", "2,0", "3,1", "4,7", "3%"],
        ["Total charges", "32,0", "52,0", "82,0", "61%"],
      ],
      [30, 17, 17, 17, 19]
    ),
    emptyLine(1),
  ];
}

// ─── SECTION 8: STRATEGIE COMMERCIALE ET MARKETING ──────────────────

function buildStrategieMarketing() {
  return [
    heading1("8. Strategie Commerciale et Marketing"),

    heading2("8.1 Positionnement et Message Cle"),
    bodyPara("Biodynamie se positionne comme le biofertilisant de reference pour l'agriculture tropicale, alliant efficacite prouvee et respect de l'environnement. Le positionnement s'articule autour du triptyque « Naturel, Efficace, Durable », qui repond aux trois preoccupations majeures des agriculteurs ivoiriens : la sante des sols et des consommateurs, l'augmentation des rendements, et la perennite de l'exploitation."),
    bodyPara("Le message cle du lancement est : « Biodynamie : La force de la nature au service de vos recoltes. Resultats visibles en 10 jours. » Ce message synthetise les deux arguments les plus differenciants du produit : son origine 100% naturelle et la rapidite de ses resultats. Il est decline en plusieurs versions adaptees aux differents segments de clientele et canaux de communication."),

    heading2("8.2 Strategie Marketing Mix (4P)"),
    heading3("Produit"),
    bodyPara("La gamme Biodynamie est declinee en trois formats (100g, 500g, 1kg) pour repondre aux besoins de chaque segment de clientele. Le packaging utilise des materiaux recyclables et un code couleur vert (en coherence avec les valeurs ecologiques du produit) avec des mentions reglementaires claires. Chaque conditionnement inclut un guide d'utilisation simplifie en francais et en langues locales, avec des pictogrammes pour les agriculteurs non alphabetises."),

    heading3("Prix"),
    bodyPara("La strategie de prix est une strategie de penetration avec un tarif de lancement a 600 Fcfa/g, soit une reduction de 40 pourcent par rapport au tarif standard de 1 000 Fcfa/g. Cette politique tarifaire vise a encourager l'essai du produit et a accelerer l'adoption. Le tarif standard sera applique progressivement a partir du second semestre 2026, une fois la notoriete etablie et les premiers resultats validates par les utilisateurs. Des remises de volume sont prevues pour les commandes superieures a 5 kg."),

    makeTable(
      ["Format", "Poids", "Prix lancement", "Prix standard", "Prix/g lancement", "Prix/g standard"],
      [
        ["Petit", "100 g", "60 000 Fcfa", "100 000 Fcfa", "600 Fcfa", "1 000 Fcfa"],
        ["Moyen", "500 g", "300 000 Fcfa", "500 000 Fcfa", "600 Fcfa", "1 000 Fcfa"],
        ["Grand", "1 kg", "600 000 Fcfa", "1 000 000 Fcfa", "600 Fcfa", "1 000 Fcfa"],
      ],
      [12, 10, 18, 18, 18, 18]
    ),
    emptyLine(1),

    heading3("Place (Distribution)"),
    bodyPara("Le reseau de distribution est structure en trois niveaux : la distribution directe par les equipes commerciales de LIG et du Comptoir Agropastoral CI aupres des grands comptes (agro-industriels et cooperatives) ; la distribution indirecte via un reseau de revendeurs agreees couvrant les principales zones agricoles (Abidjan, Yamoussoukro, Bouake, San Pedro, Daloa) ; et la distribution en ligne via le site web ligbiodynamie.ci et WhatsApp Business pour les commandes directes avec livraison."),

    heading3("Promotion"),
    bodyPara("La strategie promotionnelle du lancement combine plusieurs leviers : l'evenementiel (ceremonie de lancement le 10 decembre 2025 a Abidjan, participation aux foires agricoles), le marketing digital (campagnes sur les reseaux sociaux, contenus video, temoignages d'agriculteurs), le marketing terrain (demonstrations in situ, formations, essais gratuits) et les relations publiques (presse, partenariats medias, influenceurs agricoles). Le budget total de 46M Fcfa est reparti de maniere equilibree entre ces differents leviers."),

    heading2("8.3 Strategie Digitale"),
    bodyPara("La strategie digitale est au coeur du plan de communication de Biodynamie, avec un objectif de couverture maximale a cout maitrise. Le site web ligbiodynamie.ci constitue la plateforme centrale, offrant des informations detaillees sur le produit, des temoignages video d'utilisateurs, un blog sur l'agriculture biologique et une boutique en ligne pour les commandes directes. Le site est optimise pour le mobile, considerant que la majorite des agriculteurs ivoiriens accedent a internet via leur smartphone."),
    bodyPara("Les reseaux sociaux sont utilises de maniere differentiee : Facebook pour la communaute agricole et les groupes de discussion, Instagram pour l'image de marque et les visuels produit, LinkedIn pour les partenariats B2B et la credibilite institutionnelle, YouTube pour les tutoriels video et les temoignages, et WhatsApp Business pour le service client et les commandes directes. L'objectif est d'atteindre 10 000 abonnes cumules sur l'ensemble des plateformes dans les six premiers mois."),

    heading2("8.4 Plan de Communication"),
    chartImage("budget_repartition.png", 480, 384),
    bodyPara("Le plan de communication est structure en trois phases. La phase pre-lancement (octobre - novembre 2025) vise a creer l'anticipation et la notoriete : teasers sur les reseaux sociaux, communiques de presse, prises de contact avec les influenceurs agricoles et les journalistes specialises. La phase lancement (decembre 2025 - janvier 2026) concentre les efforts sur l'evenement de lancement, les campagnes publicitaires massives et les operations de terrain. La phase post-lancement (fevrier - mars 2026) capitalise sur les premiers resultats des utilisateurs pour nourrir la communication et entretenir la dynamique."),
    bodyPara("Le budget de communication de 46M Fcfa est reparti comme suit : communication digitale 11,5M Fcfa (25 pourcent), evenementiel et lancement 9,2M Fcfa (20 pourcent), marketing terrain 8,0M Fcfa (17 pourcent), production de contenu 5,5M Fcfa (12 pourcent), relations publiques 4,8M Fcfa (10 pourcent), formation et demonstrations 4,0M Fcfa (9 pourcent), et impreveus et contingence 3,0M Fcfa (7 pourcent)."),

    heading2("8.5 Partenariats Strategiques"),
    bodyPara("Les partenariats strategiques constituent un pilier de la strategie commerciale de Biodynamie. Les partenariats industriels avec PALMCI, SIFCA, SAPH et SUCAF visent a integrer Biodynamie dans les programmes de fertilisation de ces grands groupes, garantissant des volumes reguliers et une validation a grande echelle du produit. Les partenariats institutionnels avec le CNRA, le FIRCA, la FAO et la BAD offrent un acces aux programmes de subvention et de formation, ainsi qu'une credibilite scientifique et institutionnelle."),
    bodyPara("Le partenariat avec l'INPHB (Institut National Polytechnique Felix Houphouet-Boigny) permet de beneficier de l'expertise academique pour la validation des resultats et la formation des ingenieurs agronomes. Ces partenariats sont structures par des conventions cadres definissant les objectifs communs, les contributions de chaque partie et les indicateurs de suivi. L'objectif est d'etablir au minimum trois partenariats majeurs dans les quatre premiers mois suivant le lancement."),
  ];
}

// ─── SECTION 9: PLAN OPERATIONNEL ───────────────────────────────────

function buildPlanOperationnel() {
  return [
    heading1("9. Plan Operationnel"),

    heading2("9.1 Plan de Production et Approvisionnement"),
    bodyPara("La production de Biodynamie est organisee autour d'un processus en cinq etapes : la preparation des cultures microbiennes ( fermentation en bioréacteurs), le melange avec les extraits vegetaux selon la formule brevetee, le controle qualite en laboratoire (verification du pH, de la concentration et de l'activite biologique), le conditionnement en flacons de 100g, 500g et 1kg, et l'etiquetage avec les mentions reglementaires. La capacite de production initiale est de 5 tonnes par mois, scalable a 15 tonnes par mois dans la phase de croissance."),
    bodyPara("L'approvisionnement en matieres premieres repose sur un reseau de fournisseurs locaux et regionaux pour les extraits vegetaux, et sur des souches microbiennes produites en interne dans le laboratoire de LIG. La strategie d'approvisionnement prevoit un stock de securite de deux mois pour les matieres premieres critiques, afin de prevenir toute rupture de production. Les emballages sont fabriques par des fournisseurs locaux, conformement a la politique de developpement de la chaine de valeur locale."),

    heading2("9.2 Logistique et Distribution"),
    bodyPara("La logistique de Biodynamie est concue pour assurer la disponibilite du produit sur l'ensemble du territoire ivoirien tout en preservant la qualite du produit (stockage a temperature ambiante, protection contre la lumiere directe). L'entrepot principal est situe a Abidjan, avec deux entrepots secondaires a Yamoussoukro et San Pedro pour couvrir respectivement le centre et l'ouest du pays."),
    bodyPara("La livraison aux agro-industriels est assuree par transport routier direct depuis l'entrepot principal, avec des delais de 48 a 72 heures. La livraison aux revendeurs agreees est effectuee par des transporteurs locaux partenaires. La livraison directe aux agriculteurs (via les commandes en ligne) est assuree par les services de messagerie classiques, avec une option de retrait dans les points de vente du Comptoir Agropastoral CI."),

    heading2("9.3 Ressources Humaines"),
    bodyPara("L'equipe initiale comprend 15 collaborateurs repartis entre les quatre directions. Le plan de recrutement prevoit une montee en puissance progressive pour atteindre 25 collaborateurs en annee 2 et 35 en annee 3, en fonction de la croissance du chiffre d'affaires. Les competences cles recutees sont : des ingenieurs agronomes pour la R&D et les demonstrations terrain, des commerciaux experimentes dans le secteur agricole, et des techniciens de production formes aux procedes de fabrication biologique."),

    makeTable(
      ["Poste", "Annee 1", "Annee 2", "Annee 3"],
      [
        ["Direction et management", "2", "3", "4"],
        ["R&D et qualite", "3", "5", "7"],
        ["Commercial et marketing", "5", "9", "13"],
        ["Production", "4", "6", "8"],
        ["Administration et finance", "2", "2", "3"],
        ["Total", "15", "25", "35"],
      ],
      [40, 20, 20, 20]
    ),
    emptyLine(1),

    heading2("9.4 Calendrier Operationnel"),
    makeTable(
      ["Periode", "Activites cles", "Jalons"],
      [
        ["Oct - Nov 2025", "Pre-lancement : production stock initial, formations equipes, campagne teasing", "Stock initial de 10T pret"],
        ["Dec 2025", "Lancement officiel (10 dec.), demarrage commercial, evenement Abidjan", "Lancement reussi, 200 agriculteurs touches"],
        ["Jan - Mar 2026", "Phase de deploiement : demonstrations terrain, formations, partenariats", "29T vendues, 500 agriculteurs formes"],
        ["Avr - Jun 2026", "Consolidation : analyse des resultats, ajustements, preparation phase 2", "Premiers temoignages documentes"],
        ["Jul - Dec 2026", "Phase de croissance : extension territoriale, hausse production", "50T supplementaires vendues"],
        ["2027", "Expansion : nouveaux formats, export sous-regional, certification bio", "80T vendues, seuil de rentabilite atteint"],
        ["2028", "Maturite : leadership marche, diversification gamme, R&D nouvelle generation", "150T vendues, rentabilite confirmee"],
      ],
      [15, 45, 40]
    ),
    emptyLine(1),
  ];
}

// ─── SECTION 10: PLAN FINANCIER ─────────────────────────────────────

function buildPlanFinancier() {
  return [
    heading1("10. Plan Financier Previsionnel"),

    heading2("10.1 Hypotheses Financieres"),
    bodyPara("Les projections financieres sont etablies sur la base des hypotheses suivantes. Pour l'annee 1 (2026), le volume de ventes est cible a 29 tonnes (objectif Dec 2025 - Mar 2026 prolonge sur l'annee), avec un prix moyen de 600 Fcfa/g correspondant au tarif de lancement. Pour l'annee 2 (2027), le volume est projete a 80 tonnes avec une normalisation progressive du prix a 800 Fcfa/g. Pour l'annee 3 (2028), le volume vise est de 150 tonnes a un prix moyen de 900 Fcfa/g, refletant la montee en maturite du marche."),
    bodyPara("Les hypothese de couts sont les suivantes : le cout de production represente environ 21 a 23 pourcent du chiffre d'affaires, les charges marketing varient de 25 pourcent en annee 1 (effort de lancement) a 10 pourcent en annee 3, les charges de structure progressent en valeur absolue mais diminuent en proportion du chiffre d'affaires. L'investissement initial est estime a 25M Fcfa (equipements de production, laboratoire, vehicules, amenagements)."),

    heading2("10.2 Compte de Resultat Previsionnel (3 ans)"),
    chartImage("financial_projections.png", 530, 329),

    makeTable(
      ["Poste", "Annee 1 (2026)", "Annee 2 (2027)", "Annee 3 (2028)"],
      [
        ["Chiffre d'affaires", "17 400 000", "64 000 000", "135 000 000"],
        ["Cout des marchandises vendues", "(6 090 000)", "(18 200 000)", "(28 700 000)"],
        ["Marge brute", "11 310 000", "45 800 000", "106 300 000"],
        ["Charges marketing et communication", "(12 000 000)", "(9 600 000)", "(13 500 000)"],
        ["Charges commerciales et distribution", "(4 800 000)", "(9 600 000)", "(16 200 000)"],
        ["Charges administratives et RH", "(4 500 000)", "(6 400 000)", "(10 800 000)"],
        ["Charges R&D", "(2 600 000)", "(5 100 000)", "(8 100 000)"],
        ["Amortissements et charges financieres", "(2 000 000)", "(3 100 000)", "(4 700 000)"],
        ["Total des charges d'exploitation", "(25 900 000)", "(33 800 000)", "(53 300 000)"],
        ["Resultat d'exploitation", "(14 590 000)", "12 000 000", "53 000 000"],
        ["Impot sur les societes (25%)", "0", "(3 000 000)", "(13 250 000)"],
        ["Resultat net", "(14 590 000)", "9 000 000", "39 750 000"],
      ],
      [35, 22, 22, 22]
    ),
    emptyLine(1),
    bodyPara("Le compte de resultat previsionnel montre une perte controlee en annee 1, liee a l'investissement de lancement. L'annee 2 marque le passage a la rentabilite avec un benefice net de 9M Fcfa. L'annee 3 confirme la viabilite economique du modele avec un benefice net de pres de 40M Fcfa, soit une marge nette de 29,4 pourcent. La marge brute progresse de 65 pourcent du CA en annee 1 a 79 pourcent en annee 3, temoignant de l'amelioration de l'efficacite productive."),

    heading2("10.3 Bilan Previsionnel"),
    makeTable(
      ["Poste", "Annee 1", "Annee 2", "Annee 3"],
      [
        ["ACTIF", "", "", ""],
        ["Immobilisations nettes", "20 000 000", "19 500 000", "22 000 000"],
        ["Stocks", "3 000 000", "8 000 000", "12 000 000"],
        ["Creances clients", "2 500 000", "9 000 000", "18 000 000"],
        ["Tresorerie", "1 910 000", "12 910 000", "55 660 000"],
        ["Total Actif", "27 410 000", "49 410 000", "107 660 000"],
        ["PASSIF", "", "", ""],
        ["Capitaux propres", "10 410 000", "19 410 000", "59 160 000"],
        ["Dettes financieres", "12 000 000", "8 000 000", "4 000 000"],
        ["Dettes fournisseurs", "2 000 000", "5 000 000", "8 500 000"],
        ["Autres dettes", "3 000 000", "7 000 000", "10 000 000"],
        ["Total Passif", "27 410 000", "49 410 000", "107 660 000"],
      ],
      [35, 22, 22, 22]
    ),
    emptyLine(1),

    heading2("10.4 Plan de Tresorerie"),
    bodyPara("Le plan de tresorerie previsionnel prend en compte les besoins de financement du cycle d'exploitation et les investissements prevus. En annee 1, le besoin en fonds de roulement est couvert par l'apport en capital et un emprunt bancaire de 12M Fcfa sur 5 ans. La tresorerie reste positive tout au long de l'annee grace a la gestion rigoureuse des encaissements et decaissements, avec un solde minimum de 1,9M Fcfa en fin d'annee."),
    bodyPara("En annee 2, la tresorerie se renforce significativement grace a l'amelioration de la rentabilite et au recouvrement des creances clients. Le remboursement de l'emprunt (4M Fcfa par an) est assure sans difficulte. En annee 3, la tresorerie atteint 55,7M Fcfa, offrant une marge de manoeuvre confortable pour financer la croissance organique ou d'eventuelles opportunites d'investissement. Le ratio de liquidite generale reste superieur a 1,5 sur toute la periode."),

    makeTable(
      ["Poste", "Annee 1", "Annee 2", "Annee 3"],
      [
        ["Encaissements d'exploitation", "17 400 000", "64 000 000", "135 000 000"],
        ["Decaissements d'exploitation", "(25 900 000)", "(33 800 000)", "(53 300 000)"],
        ["Flux d'exploitation", "(8 500 000)", "30 200 000", "81 700 000"],
        ["Investissements", "(25 000 000)", "(5 000 000)", "(10 000 000)"],
        ["Financements (emprunt)", "12 000 000", "0", "0"],
        ["Remboursement emprunt", "0", "(4 000 000)", "(4 000 000)"],
        ["Variation tresorerie", "(21 500 000)", "21 200 000", "67 700 000"],
        ["Tresorerie cumulee", "1 910 000", "12 910 000", "55 660 000"],
      ],
      [35, 22, 22, 22]
    ),
    emptyLine(1),

    heading2("10.5 Seuil de Rentabilite"),
    bodyPara("Le seuil de rentabilite est atteint lorsque le chiffre d'affaires couvre l'ensemble des charges fixes et variables. Sur la base des hypotheses retenues, le seuil de rentabilite est estime a environ 47,6M Fcfa de chiffre d'affaires, ce qui correspond a un volume de vente d'environ 68 kg a 700 Fcfa/g (prix moyen pondere) ou environ 59,5 tonnes a 800 Fcfa/g. Ce seuil est atteint au cours du troisieme trimestre de l'annee 2, confirmant la viabilite du modele economique."),
    bodyPara("La marge de securite, c'est-a-dire l'ecart entre le chiffre d'affaires previsionnel et le seuil de rentabilite, est negative en annee 1 (-30,2M Fcfa), ce qui est normal pour une phase de lancement. Elle devient positive des l'annee 2 (+16,4M Fcfa) et atteint +87,4M Fcfa en annee 3, offrant une confortable marge de man oeuvre. Le levier operationnel est eleve, ce qui signifie que toute augmentation du chiffre d'affaires au-dela du seuil de rentabilite se traduit par une amplification proportionnellement plus importante du resultat."),

    makeTable(
      ["Indicateur", "Annee 1", "Annee 2", "Annee 3"],
      [
        ["Charges fixes", "13 100 000", "24 200 000", "43 600 000"],
        ["Taux de marge sur couts variables", "65%", "72%", "79%"],
        ["Seuil de rentabilite (CA)", "20 154 000", "33 611 000", "55 190 000"],
        ["CA previsionnel", "17 400 000", "64 000 000", "135 000 000"],
        ["Marge de securite", "(2 754 000)", "30 389 000", "79 810 000"],
        ["Indice de securite", "-15,8%", "47,5%", "59,1%"],
      ],
      [35, 22, 22, 22]
    ),
    emptyLine(1),

    heading2("10.6 Besoins de Financement"),
    bodyPara("Les besoins de financement totaux pour les trois premieres annees s'elevent a 72M Fcfa, decomposes comme suit : investissement initial de 25M Fcfa (equipements de production, laboratoire, amenagements locaux, vehicules), besoin en fonds de roulement de 15M Fcfa (stocks, creances clients), budget marketing de lancement de 12M Fcfa, et besoin de tresorerie complementaire de 20M Fcfa pour couvrir les pertes d'exploitation prevues en annee 1 et le financement de la croissance en annee 2."),
    bodyPara("Le plan de financement prevoit un apport en capital de 25M Fcfa par les associes, un emprunt bancaire de 12M Fcfa sur 5 ans (taux estime a 8 pourcent), une subvention du FIRCA estimee a 10M Fcfa dans le cadre du soutien a l'innovation agricole, et un apport en compte courant d'associe de 25M Fcfa, rembourse a compter de l'annee 2. Le plan de financement est equilibre sur les trois annees, avec un endettement maitrise et une capacite d'autofinancement progressive."),

    makeTable(
      ["Source de financement", "Montant (Fcfa)", "Conditions", "Echeance"],
      [
        ["Apport en capital", "25 000 000", "Fonds propres", "Permanent"],
        ["Emprunt bancaire", "12 000 000", "Taux 8%, sur 5 ans", "2026-2031"],
        ["Subvention FIRCA", "10 000 000", "Non remboursable", "2026"],
        ["Compte courant associe", "25 000 000", "Taux 0%, remb. annee 2+", "2026-2028"],
        ["Total financement", "72 000 000", "", ""],
      ],
      [25, 22, 25, 28]
    ),
    emptyLine(1),
  ];
}

// ─── SECTION 11: ANALYSE DES RISQUES ────────────────────────────────

function buildRisques() {
  return [
    heading1("11. Analyse des Risques et Mesures d'Attenuation"),

    heading2("11.1 Risques Techniques"),
    bodyPara("Le principal risque technique concerne la maitrise du processus de production a echelle industrielle. Le passage de la production artisanale (phase R&D) a la production industrielle comporte des defis de stabilite de la formulation, de reproductibilite des lots et de conservation du produit dans les conditions tropicales. Pour mitiger ce risque, un programme de qualification et de validation des procedes de production a ete mis en place, incluant des tests de stabilite acceleres et la constitution d'un stock tampon de securite."),
    bodyPara("Le deuxieme risque technique est lie a la variabilite des matieres premieres, en particulier les extraits vegetaux dont la composition peut varier selon les saisons et les provenances. La mesure d'attenuation principale consiste a qualifier plusieurs fournisseurs pour chaque matiere premiere et a mettre en place un controle qualite systematique des lots entrants. Un protocole d'ajustement de la formulation en fonction des analyses d'entree permet de garantir la constance de la qualite du produit final."),

    heading2("11.2 Risques Commerciaux"),
    bodyPara("Le risque commercial principal est la non-acceptation du produit par les agriculteurs, habitues aux engrais chimiques et sceptiques face aux solutions biologiques. Ce risque est attenue par la strategie de demonstrations in situ, qui permet aux agriculteurs de constater directement l'efficacite du produit sur leurs propres parcelles. Le prix de lancement a 600 Fcfa/g (40 pourcent de reduction) facilite egalement l'essai et reduit la barriere a l'entree."),
    bodyPara("Le risque de concurrence agressive de la part des producteurs d'engrais chimiques est attenue par la differentiation fondamentale du produit (naturel vs chimique) et par la tendance structurelle du marche vers les solutions biologiques. La protection de la propriete intellectuelle (depot de brevet, secret de fabrication) limite egalement le risque de contrefacon."),

    heading2("11.3 Risques Financiers"),
    bodyPara("Le risque financier majeur est le retard dans l'atteinte du seuil de rentabilite, qui pourrait compromettre la tresorerie de l'entreprise. Ce risque est attenue par la constitution d'une reserve de tresorerie (compte courant d'associe de 25M Fcfa), la diversification des sources de financement (capital, emprunt, subvention) et le pilotage rigoureux des depenses en phase de lancement. Des indicateurs d'alerte precoce ont ete definis pour detecter tout ecart par rapport aux objectifs et permettre des actions correctives rapides."),

    heading2("11.4 Risques Reglementaires"),
    bodyPara("Le risque reglementaire principal est le retard dans l'obtention de l'homologation du produit aupres des autorites ivoiriennes (DPPVQ). Ce risque est attenue par l'anticipation du depot du dossier d'homologation (depose des juillet 2025), la constitution d'un dossier scientifique complet et solide, et le suivi regulier du processus d'instruction en relation avec les autorites competentes. A titre conservatoire, une strategie de vente en tant que « biostimulant » (cadre reglementaire plus souple) est prevue en cas de retard de l'homologation en tant que fertilisant."),

    heading2("11.5 Matrice des Risques"),
    chartImage("risk_matrix.png", 480, 375),
    bodyPara("La matrice des risques ci-dessus positionne chaque risque identifie en fonction de sa probabilite d'occurrence et de son impact potentiel sur le projet. Les risques situes dans la zone rouge (probabilite et impact eleves) font l'objet d'un plan d'attenuation prioritaire et d'un suivi renforce. Les risques situes dans la zone orange necessitent des mesures preventives et un suivi regulier. Les risques de la zone verte sont consideres comme acceptables avec des mesures de surveillance simples."),

    makeTable(
      ["Risque", "Probabilite", "Impact", "Niveau", "Mesure d'attenuation"],
      [
        ["Defaut de production", "Faible", "Tres eleve", "Eleve", "Qualification processus, stock tampon"],
        ["Non-acceptation produit", "Moyenne", "Moyen", "Moyen", "Demonstrations in situ, prix lancement"],
        ["Retard lancement", "Faible", "Faible", "Faible", "Planning securise, buffers temporels"],
        ["Rupture approvisionnement", "Faible", "Moyen", "Moyen", "Multi-sourcing, stock securite 2 mois"],
        ["Concurrence agressive", "Moyenne", "Faible", "Moyen", "Differentiation, propriete intellectuelle"],
        ["Instabilite reglementaire", "Tres faible", "Moyen", "Faible", "Veille reglementaire, plan B biostimulant"],
        ["Problemes de tresorerie", "Faible", "Tres eleve", "Eleve", "Reserve tresorerie, pilotage rigoureux"],
        ["Aleas climatiques", "Faible", "Moyen", "Moyen", "Assurance, diversification geographique"],
        ["Piratage/contrefacon", "Tres faible", "Faible", "Faible", "Brevet, secret fabrication"],
        ["Perte partenaire cle", "Tres faible", "Tres eleve", "Eleve", "Contrats exclusifs, diversification"],
      ],
      [22, 13, 13, 10, 42]
    ),
    emptyLine(1),
  ];
}

// ─── SECTION 12: PLAN DE DEVELOPPEMENT ──────────────────────────────

function buildPlanDeveloppement() {
  return [
    heading1("12. Plan de Developpement a Moyen et Long Terme"),

    heading2("12.1 Vision a 5 Ans"),
    bodyPara("A horizon 2030, LIG Biodynamie vise a devenir le leader africain des biofertilisants tropicaux, avec une presence dans au moins cinq pays d'Afrique de l'Ouest et centrale, un chiffre d'affaires depassant 500M Fcfa, et une gamme elargie a cinq produits complementaires. Cette ambition repose sur la conviction que l'agriculture biologique tropicale est un marche en emergence massive, porte par les tendances mondiales de durabilite et les politiques nationales de transition ecologique."),
    bodyPara("La vision a 5 ans s'articule autour de quatre piliers strategiques : le leadership marche en Cote d'Ivoire (objectif de 30 pourcent de part de marche des biofertilisants), l'expansion sous-regionale (Burkina Faso, Mali, Ghana, Cameroun), la diversification des produits (gamme complete de solutions biologiques pour l'agriculture tropicale) et l'excellence operationnelle (certification ISO, production a plus grande echelle). Chaque pilier est decline en objectifs quantifies et en plans d'action detailles."),

    heading2("12.2 Axes de Developpement"),
    heading3("Axe 1 : Expansion geographique"),
    bodyPara("L'expansion geographique est planifiee en trois vagues. La premiere vague (2027) cible les marches limitrophes : Burkina Faso et Ghana, qui partagent des similarites agricoles avec la Cote d'Ivoire et disposent de marches importants pour les cultures de rente. La deuxieme vague (2028) vise le Mali et le Senegal, deux marches a fort potentiel pour les cultures cotonnieres et arachidiennes. La troisieme vague (2029-2030) concerne le Cameroun, le Nigeria et la RDC, des marches a tres fort potentiel mais plus complexes a penetrer."),

    heading3("Axe 2 : Diversification produit"),
    bodyPara("La diversification de la gamme est prevue a partir de 2027, avec le lancement de produits complementaires a Biodynamie : un biopesticide naturel (Biodynamie Protect), un bio-stimulant de croissance (Biodynamie Boost), un amendement organique du sol (Biodynamie Sol), et un conditionneur de semences (Biodynamie Seed). Ces produits partageront la meme philosophie (100% naturel, tropical) et la meme plateforme technologique, maximisant les synergies de R&D et de distribution."),

    heading3("Axe 3 : Excellence operationnelle et certification"),
    bodyPara("L'obtention de la certification ISO 9001 (management qualite) est visee pour 2027, suivie de la certification ISO 14001 (management environnemental) en 2028. Ces certifications renforceront la credibilite du produit aupres des clients industriels et institutionnels, et faciliteront l'acces aux marches d'exportation. L'investissement dans un nouveau site de production a plus grande capacite est prevu pour 2029, en fonction de la croissance du marche."),

    heading2("12.3 Indicateurs de Performance (KPI)"),
    makeTable(
      ["KPI", "Cible Annee 1", "Cible Annee 2", "Cible Annee 3", "Cible Annee 5"],
      [
        ["Volume vendu (tonnes)", "29", "80", "150", "400"],
        ["Chiffre d'affaires (M Fcfa)", "17,4", "64", "135", "500"],
        ["Nombre d'agriculteurs formes", "500", "1 500", "3 000", "10 000"],
        ["Nombre de partenariats majeurs", "3", "6", "10", "20"],
        ["Part de marche biofertilisants CI", "5%", "15%", "25%", "30%"],
        ["Nombre de pays couverts", "1", "1", "2", "5"],
        ["Nombre de produits dans la gamme", "1", "1", "2", "5"],
        ["Taux de satisfaction clients", "80%", "85%", "90%", "95%"],
        ["Nombre d'abonnes reseaux sociaux", "10 000", "30 000", "60 000", "150 000"],
        ["Resultat net (M Fcfa)", "N/A", "9", "39,8", "150"],
      ],
      [30, 18, 18, 18, 18]
    ),
    emptyLine(1),
    bodyPara("Ces indicateurs de performance seront suivis mensuellement et font l'objet d'un tableau de bord de direction. Tout ecart significatif par rapport aux objectifs declenche une analyse des causes et la mise en place d'actions correctives. Les KPI sont partages avec l'ensemble des equipes pour assurer l'alignement strategique et la mobilisation collective autour des objectifs communs."),
  ];
}

// ─── SECTION 13: CONCLUSION ──────────────────────────────────────────

function buildConclusion() {
  return [
    heading1("13. Conclusion"),
    bodyPara("Le projet LIG Biodynamie en Cote d'Ivoire represente une opportunite strategique majeure a la croisee de plusieurs tendances structurelles : la demande mondiale croissante pour des produits agricoles sains et durables, la transition ecologique du secteur agricole africain, et le cadre politique favorable en Cote d'Ivoire (Strategie Bio 2030, PNIA II, Loi n02015-537). Le biofertilisant Biodynamie, fort de plus de vingt ans de recherche et developpement, est parfaitement positionne pour repondre a ces enjeux."),
    bodyPara("Le marche ivoirien offre un potentiel considerable : l'agriculture represente 25 pourcent du PIB, le pays est le premier producteur mondial de cacao, et le marche des biofertilisants connait une croissance annuelle de plus de 15 pourcent. Les objectifs de lancement (29 tonnes vendues, 500 agriculteurs formes, 3 partenariats majeurs d'ici mars 2026) sont ambitieux mais realistes, s'appuyant sur le partenariat exclusif avec le Comptoir Agropastoral CI et un budget marketing de 46M Fcfa."),
    bodyPara("Les projections financieres demontrent la viabilite economique du projet, avec un seuil de rentabilite atteint au cours de la deuxieme annee et un benefice net de pres de 40M Fcfa en annee 3. Le plan de financement est equilibre, combinant fonds propres, emprunt bancaire et subventions institutionnelles. L'analyse des risques, bien que identifiant des points de vigilance, montre que les mesures d'attenuation mises en place sont adequates pour maitriser les exposition."),
    bodyPara("Au-dela de la performance economique, le projet LIG Biodynamie porte une ambition societale forte : contribuer a la securite alimentaire, regenerer les sols degrades, reduire la dependance aux intrants chimiques importes et ameliorer les revenus des agriculteurs ivoiriens. Ce plan d'affaires constitue la feuille de route pour les trois premieres annees du projet, avec une vision claire a cinq ans pour faire de Biodynamie la reference africaine des biofertilisants tropicaux."),
  ];
}

// ─── SECTION 14: ANNEXES ────────────────────────────────────────────

function buildAnnexes() {
  return [
    heading1("14. Annexes"),

    heading2("Annexe A : Fiche Technique Produit"),
    makeTable(
      ["Parametre", "Valeur / Specification"],
      [
        ["Designation commerciale", "Biodynamie"],
        ["Type de produit", "Biofertilisant liquide"],
        ["Composition", "Micro-organismes benefiques + extraits vegetaux (formule brevetee)"],
        ["pH", "7,5 (+/- 0,3)"],
        ["Biodegradabilite", "100%"],
        ["Duree de conservation", "24 mois (emballage ferme, temperature ambiante)"],
        ["Conditions de stockage", "A l'abri de la lumiere directe, temperature < 35C"],
        ["Mode d'application", "Dilution dans l'eau d'irrigation ou pulverisation foliaire"],
        ["Dose recommandee", "Selon culture et stade vegetatif (voir guide d'utilisation)"],
        ["Delai avant recolte", "Aucun (zero residus)"],
        ["Compatibilite", "Toutes cultures tropicales"],
        ["Homologation", "En cours (DPPVQ, Cote d'Ivoire)"],
      ],
      [35, 65]
    ),
    emptyLine(1),

    heading2("Annexe B : Calendrier Detaille du Lancement"),
    makeTable(
      ["Semaine", "Periode", "Activites", "Responsable"],
      [
        ["S1-S2", "1er - 14 oct. 2025", "Production stock initial (10T), formation equipes commerciales", "Directeur Production"],
        ["S3-S4", "15 - 31 oct. 2025", "Campagne teasing reseaux sociaux, contacts medias", "Directeur Marketing"],
        ["S5-S6", "1er - 14 nov. 2025", "Demonstrations pilotes, preparation evenement lancement", "Equipe terrain"],
        ["S7-S8", "15 - 30 nov. 2025", "Finalisation partenariats, essais gratuits, RP", "Direction Generale"],
        ["S9", "1er - 7 dec. 2025", "Repetitions evenement, logistique lancement", "Comite lancement"],
        ["S10", "10 dec. 2025", "CEREMONIE DE LANCEMENT - Abidjan", "Direction Generale"],
        ["S11-S14", "11 dec. - 31 dec.", "Ventes intensives, demonstrations terrain, suivi medias", "Equipe commerciale"],
        ["S15-S22", "Jan. - Mar. 2026", "Phase deploiement, formations, consolidation partenariats", "Equipe terrain"],
      ],
      [8, 18, 45, 29]
    ),
    emptyLine(1),

    heading2("Annexe C : Contacts"),
    makeTable(
      ["Canal", "Coordonnees"],
      [
        ["Telephone", "+225 21270000 / 21271010"],
        ["WhatsApp", "+225 07070707 / 05050505"],
        ["Email", "info@biodynamie.ci"],
        ["Site web", "www.ligbiodynamie.ci"],
        ["Facebook", "@LIGBiodynamie"],
        ["Instagram", "@ligbiodynamie"],
        ["LinkedIn", "LIG Biodynamie"],
        ["YouTube", "LIG Biodynamie"],
        ["Adresse", "Abidjan, Cote d'Ivoire"],
      ],
      [30, 70]
    ),
    emptyLine(1),

    heading2("Annexe D : Cadre Reglementaire"),
    bodyPara("Le cadre reglementaire applicable au projet LIG Biodynamie en Cote d'Ivoire comprend les textes suivants :"),
    bulletPara([{ text: "Loi n02015-537 : ", bold: true }, "Regissant la mise sur le marche des produits fertilisants en Cote d'Ivoire, cette loi definit les conditions d'homologation, d'etiquetage et de controle qualite des fertilisants. Biodynamie est soumis a cette reglementation pour son homologation en tant que fertilisant biologique."]),
    bulletPara([{ text: "PNIA II (Plan National d'Investissement Agricole) : ", bold: true }, "Cadre strategique de l'investissement agricole en Cote d'Ivoire pour la periode 2018-2025, le PNIA II encourage l'innovation dans le secteur agricole et prevoit des mecanismes de soutien financier pour les projets innovants comme Biodynamie."]),
    bulletPara([{ text: "Strategie Bio 2030 : ", bold: true }, "Strategie nationale pour le developpement de l'agriculture biologique en Cote d'Ivoire, visant a atteindre 10% de surfaces agricoles en bio d'ici 2030. Cette strategie constitue un cadre politique tres favorable au deploiement de Biodynamie."]),
    bulletPara([{ text: "PNDAD (Programme National de Developpement Agricole Durable) : ", bold: true }, "Ce programme appuie la transition vers des pratiques agricoles durables et offre des possibilites de subvention pour les intrants ecologiques."]),
  ];
}

// ─── MAIN DOCUMENT ASSEMBLY ──────────────────────────────────────────

async function main() {
  const chartDir = "/home/z/my-project/upload/bp_charts";
  const chartsExist = fs.existsSync(chartDir) && 
    fs.readdirSync(chartDir).length >= 4;

  if (!chartsExist) {
    console.error("Charts not found. Please generate them first.");
    process.exit(1);
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22, color: BODY_COLOR },
          paragraph: { spacing: { line: LINE_SPACING } },
        },
        heading1: {
          run: { font: "Times New Roman", size: 36, color: HEADING_COLOR, bold: true },
          paragraph: { spacing: { before: 400, after: 200, line: LINE_SPACING } },
        },
        heading2: {
          run: { font: "Times New Roman", size: 30, color: HEADING_COLOR, bold: true },
          paragraph: { spacing: { before: 300, after: 150, line: LINE_SPACING } },
        },
        heading3: {
          run: { font: "Times New Roman", size: 26, color: HEADING_COLOR, bold: true },
          paragraph: { spacing: { before: 200, after: 100, line: LINE_SPACING } },
        },
        listParagraph: {
          run: { font: "Calibri", size: 22, color: BODY_COLOR },
          paragraph: { spacing: { line: LINE_SPACING, after: 80 } },
        },
      },
      paragraphStyles: [
        { id: "Normal", name: "Normal", run: { font: "Calibri", size: 22, color: BODY_COLOR } },
      ],
    },
    numbering: {
      config: [{
        reference: "bullet-list",
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: "\u2022",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }, {
          level: 1,
          format: LevelFormat.BULLET,
          text: "\u25E6",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1440, hanging: 360 } } },
        }],
      }],
    },
    sections: [
      // ─── Section 1: Cover (no page numbers) ────────────────
      {
        properties: {
          page: {
            margin: { top: 0, bottom: 0, left: 0, right: 0 },
          },
        },
        children: buildCover(),
      },
      // ─── Section 2: Front matter / TOC (Roman numerals) ─────
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
            pageNumbers: { start: 1 },
          },
          titlePage: true,
        },
        headers: {
          default: new Header({
            children: [new Paragraph({
              children: [new TextRun({ text: "Business Plan - LIG Biodynamie", font: "Calibri", size: 18, color: "808080" })],
              alignment: AlignmentType.RIGHT,
            })],
          }),
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              children: [
                new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 18, color: "808080" }),
              ],
              alignment: AlignmentType.CENTER,
            })],
          }),
        },
        children: buildTOC(),
      },
      // ─── Section 3: Body (Arabic from 1) ───────────────────
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
            pageNumbers: { start: 1 },
          },
        },
        headers: {
          default: new Header({
            children: [new Paragraph({
              children: [new TextRun({ text: "Business Plan - LIG Biodynamie", font: "Calibri", size: 18, color: "808080" })],
              alignment: AlignmentType.RIGHT,
            })],
          }),
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              children: [
                new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 18, color: "808080" }),
              ],
              alignment: AlignmentType.CENTER,
            })],
          }),
        },
        children: [
          ...buildResumeExecutif(),
          ...buildPresentation(),
          ...buildAnalyseMarche(),
          ...buildProduit(),
          ...buildBusinessModel(),
          ...buildStrategieMarketing(),
          ...buildPlanOperationnel(),
          ...buildPlanFinancier(),
          ...buildRisques(),
          ...buildPlanDeveloppement(),
          ...buildConclusion(),
          ...buildAnnexes(),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = "/home/z/my-project/upload/Business_Plan_LIG_Biodynamie_CI.docx";
  fs.writeFileSync(outputPath, buffer);
  console.log(`Document generated: ${outputPath}`);
  console.log(`File size: ${(buffer.length / 1024).toFixed(1)} KB`);
}

main().catch(err => {
  console.error("Error generating document:", err);
  process.exit(1);
});
