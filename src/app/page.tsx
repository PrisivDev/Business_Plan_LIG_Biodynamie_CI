'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, LineChart, Line, ComposedChart, ScatterChart, Scatter, ZAxis
} from 'recharts'
import {
  Leaf, TrendingUp, Users, Handshake, Target, Calendar, DollarSign,
  Shield, ChevronDown, ChevronRight, Phone, Mail, MapPin, Globe,
  Sprout, Microscope, Award, ArrowUpRight, CheckCircle2, AlertTriangle,
  Download, Menu, X, ChevronUp, BarChart3, Lightbulb, Droplets,
  Megaphone, Eye, MousePointerClick, UserPlus, Repeat, Clock,
  Wallet, PiggyBank, Scale, Activity, Percent, ArrowRight,
  BarChart2, LineChart as LineChartIcon, PieChart as PieChartIcon, Target as TargetIcon,
  Zap, Building2, Truck, GraduationCap, Star, Timer, BookOpen, Info
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'

// ─── Color Palette (FG-1 Forest Mint inspired) ───
const C = {
  primary: '#0C1F1A',
  accent: '#3DDBB5',
  accentDark: '#2A7A65',
  gold: '#F3A847',
  goldDark: '#D4875A',
  surface: '#EDF5F2',
  text: '#1C2A3D',
  muted: '#5B6B7D',
  white: '#FFFFFF',
  danger: '#E74C3C',
  warning: '#F39C12',
  success: '#27AE60',
  info: '#3498DB',
  purple: '#8B5CF6',
  rose: '#F43F5E',
  teal: '#14B8A6',
  orange: '#F97316',
}

// ─── Format helpers ───
function fmt(n: number) { return n.toLocaleString('fr-FR') }
function fmtM(n: number) { return `${n.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M` }
function fmtPct(n: number) { return `${n.toFixed(1)}%` }

// ─── Dynamic Pricing ───
const PRICE_OPTIONS = [
  { label: 'Économique', price: 7000, color: '#F39C12' },
  { label: 'Standard', price: 9000, color: '#3DDBB5' },
  { label: 'Premium', price: 14000, color: '#27AE60' },
]
const BASE_PRICE = 9000

// ─── Loan Scenarios ───
const LOAN_OPTIONS = [
  { label: 'Sans prêt', amount: 0, color: '#5B6B7D' },
  { label: 'Prêt 10M', amount: 10, color: '#F3A847' },
  { label: 'Prêt 15M', amount: 15, color: '#27AE60' },
]
const LOAN_RATE = 0 // 0% — prêt à taux zéro

// ─── Volume & Unit Cost Structure ───
// Logique : 30t reçues → 29t vendues + 1t promotion
const VOLUME_RECEIVED = [30, 80, 150] // tonnes par an
const COUT_ACHAT_KG = 4000            // Fcfa/kg — Achat LIG Congo (CIF Abidjan)
const COUT_CONDITIONNEMENT_KG = 600   // Fcfa/kg — Conditionnement local (500g & 1kg)
const COUT_LOGISTIQUE_KG = 350        // Fcfa/kg — Logistique & stockage local
const COUT_PROMO_KG = 250             // Fcfa/kg — Distribution échantillons promotionnels
const TAUX_COMMISSION = 0.08          // 8% du CA total

// ─── Tier Preview Metrics (volume-based) ───
const TIER_PREVIEWS = PRICE_OPTIONS.map(opt => {
  const p = opt.price
  const volReceivedKg = VOLUME_RECEIVED.map(v => v * 1000)
  const volSoldKg = volReceivedKg.map(v => Math.round(v * 29 / 30))
  const volPromoKg = volReceivedKg.map(v => Math.round(v * 1 / 30))
  const productCA = volSoldKg.map(v => Math.round(v * p / 1_000_000 * 10) / 10)
  const formations = [15, 40, 75]
  const consultation = [8, 20, 35]
  const certification = [4, 10, 20]
  const servicesCA = formations.map((f, i) => f + consultation[i] + certification[i])
  const totalCA = productCA.map((pc, i) => Math.round((pc + servicesCA[i]) * 10) / 10)
  const matieres = volReceivedKg.map(v => -Math.round(v * COUT_ACHAT_KG / 1_000_000 * 10) / 10)
  const conditionnement = volReceivedKg.map(v => -Math.round(v * COUT_CONDITIONNEMENT_KG / 1_000_000 * 10) / 10)
  const logistique = volReceivedKg.map(v => -Math.round(v * COUT_LOGISTIQUE_KG / 1_000_000 * 10) / 10)
  const commissions = totalCA.map(c => Math.round(-c * TAUX_COMMISSION * 10) / 10)
  const testsGratuits = volPromoKg.map(v => -Math.round(v * COUT_PROMO_KG / 1_000_000 * 10) / 10)
  const totalVar = matieres.map((m, i) => Math.round((m + conditionnement[i] + logistique[i] + commissions[i] + testsGratuits[i]) * 10) / 10)
  const margeBrute = totalCA.map((c, i) => Math.round((c + totalVar[i]) * 10) / 10)
  const mbPct = margeBrute.map((mb, i) => totalCA[i] > 0 ? Math.round(mb / totalCA[i] * 1000) / 10 : 0)
  const salaires = [0, -15.0, -22.0]
  const marketing = [-5.0, -8.0, -12.0]
  const loyer = [0, -4.0, -5.5]
  const amort = [-3.0, -3.5, -4.0]
  const assurances = [-2.0, -3.0, -4.5]
  const fixedCosts = salaires.map((s, i) => Math.round((s + marketing[i] + loyer[i] + amort[i] + assurances[i]) * 10) / 10)
  const ebit = margeBrute.map((mb, i) => Math.round((mb + fixedCosts[i]) * 10) / 10)
  const finCharges = [0, -1.0, -1.5]
  const rbt = ebit.map((eb, i) => Math.round((eb + finCharges[i]) * 10) / 10)
  const impot = rbt.map(r => r > 0 ? Math.round(-r * 0.25 * 10) / 10 : 0)
  const rn = rbt.map((r, i) => Math.round((r + impot[i]) * 10) / 10)
  const seuil = mbPct[0] > 0 ? Math.round(-fixedCosts[0] / (mbPct[0] / 100) * 10) / 10 : 0
  return {
    pricePerKg: p,
    pricePer500g: p / 2,
    caY1: totalCA[0],
    caY3: totalCA[2],
    seuil,
    mbPctY1: mbPct[0],
    mbPctY3: mbPct[2],
    rnY1: rn[0],
    rnY3: rn[2],
    ebitY1: ebit[0],
    ebitY3: ebit[2],
  }
})

// ═══════════════════════════════════════════════════════════
// CHART DATA
// ═══════════════════════════════════════════════════════════

const budgetData = [
  { name: 'Identité visuelle & branding', value: 1000000, color: '#2A7A65' },
  { name: 'Lancement officiel', value: 1500000, color: '#3DDBB5' },
  { name: 'Campagne digitale', value: 800000, color: '#F3A847' },
  { name: 'Formations & tournées', value: 1200000, color: '#D4875A' },
  { name: 'Production de contenu', value: 500000, color: '#5B8DB8' },
]

const financialData = [
  { year: 'Année 1 (2026)', CA: 17.4, couts: 16.6, resultat: 0.6 },
  { year: 'Année 2 (2027)', CA: 64, couts: 47.5, resultat: 16.5 },
  { year: 'Année 3 (2028)', CA: 135, couts: 70, resultat: 65 },
]

const revenueMixData = [
  { name: 'Agro-industries', value: 40, color: '#2A7A65' },
  { name: 'Coopératives', value: 25, color: '#3DDBB5' },
  { name: 'Maraîchers urbains', value: 15, color: '#F3A847' },
  { name: 'Distributeurs', value: 12, color: '#D4875A' },
  { name: 'Institutions', value: 8, color: '#5B8DB8' },
]

const cashFlowData = [
  { month: 'Jan', encaissements: 1.2, decaissements: 3.5, solde: -2.3 },
  { month: 'Fév', encaissements: 1.8, decaissements: 3.2, solde: -3.7 },
  { month: 'Mar', encaissements: 2.5, decaissements: 2.8, solde: -4.0 },
  { month: 'Avr', encaissements: 1.5, decaissements: 2.2, solde: -4.7 },
  { month: 'Mai', encaissements: 1.2, decaissements: 2.0, solde: -5.5 },
  { month: 'Jun', encaissements: 1.0, decaissements: 1.8, solde: -6.3 },
  { month: 'Jul', encaissements: 0.8, decaissements: 1.6, solde: -7.1 },
  { month: 'Aoû', encaissements: 0.9, decaissements: 1.5, solde: -7.7 },
  { month: 'Sep', encaissements: 1.4, decaissements: 2.0, solde: -8.3 },
  { month: 'Oct', encaissements: 1.8, decaissements: 2.2, solde: -8.7 },
  { month: 'Nov', encaissements: 2.0, decaissements: 2.5, solde: -9.2 },
  { month: 'Déc', encaissements: 1.3, decaissements: 3.0, solde: -10.9 },
]

const radarData = [
  { subject: 'Innovation', A: 95, B: 40 },
  { subject: 'Durabilité', A: 98, B: 30 },
  { subject: 'Rentabilité', A: 75, B: 60 },
  { subject: 'Accessibilité', A: 80, B: 50 },
  { subject: 'Résultats', A: 90, B: 55 },
  { subject: 'Adaptation locale', A: 92, B: 35 },
]

// ─── SWOT Data ───
const swotData = {
  forces: ['Produit 100% naturel et biodégradable', 'R&D de plus de 20 ans validée', 'Résultats visibles sous 10 jours', 'Compatible avec toutes les cultures tropicales', 'Coûts d\'intrants divisés par 3', 'Partenaire exclusif ancré localement'],
  faiblesses: ['Nouveau sur le marché ivoirien', 'Capacité de production initiale limitée', 'Notoriété de marque à construire', 'Réseau de distribution à établir', 'Dépendance au partenaire local'],
  opportunites: ['Agriculture = 25% du PIB ivoirien', 'Cadre réglementaire favorable (Loi 2015-537)', 'Stratégie Bio 2030 du gouvernement', 'Forte dépendance aux engrais chimiques importés', 'Demande croissante pour le bio en Afrique', 'Soutien de bailleurs (BAD, FAO, PNUD)'],
  menaces: ['Résistance au changement des agriculteurs', 'Concurrence des engrais chimiques établis', 'Risques climatiques sur la production', 'Instabilité des prix des matières premières', 'Complexité des certifications agricoles'],
}

const riskData = [
  {
    name: 'Réticence des agriculteurs',
    likelihood: 4, impact: 3, category: 'commercial',
    description: 'Les agriculteurs ivoiriens, habitués aux engrais chimiques depuis des décennies, peuvent manifester une forte résistance au changement. Le passage à un biofertilisant naturel est perçu comme un risque pour leurs récoltes et leurs revenus, malgré les preuves scientifiques. Cette méfiance est accentuée par un manque de références locales et le poids des habitudes d\'achat chez les distributeurs d\'intrants.',
    mitigation: 'Programme "1 tonne test" gratuit pour démontrer les résultats sur le terrain, formations pratiques via l\'ANADER, collecte de témoignages vidéo d\'agriculteurs convaincus, campagnes de démonstration dans 5 régions agricoles, partenariats avec des leaders d\'opinion agricoles.',
    consequences: 'Ralentissement de l\'adoption, CA inférieur aux prévisions de 20 à 30%, allongement du cycle de vente de 45 à 90 jours.',
  },
  {
    name: 'Concurrence des engrais chimiques',
    likelihood: 5, impact: 4, category: 'commercial',
    description: 'Le marché des engrais en Côte d\'Ivoire est dominé par des multinationales bien implantées (Yara, OCP) disposant de budgets marketing colossaux et de réseaux de distribution établis. Ces acteurs peuvent réagir agressivement par des baisses de prix ou des campagnes de dénigrement contre les solutions biologiques, et bénéficient de subventions gouvernementales sur les intrants chimiques.',
    mitigation: 'Positionnement différencié sur le segment bio (pas de concurrence directe), argumentaire "coût total" (intrants 3x moins chers), lobbying pour l\'égalité des subventions bio/chimique, certification Ecocert comme gage de qualité, contrats long terme avec les agro-industries.',
    consequences: 'Guerre des prix, augmentation du CAC, difficulté à pénétrer les réseaux de distribution traditionnels, part de marché limitée à 5% au lieu de 18% ciblé.',
  },
  {
    name: 'Capacité de production insuffisante',
    likelihood: 3, impact: 4, category: 'technique',
    description: 'La production de biofertilisant repose sur un processus biologique spécifique nécessitant des conditions contrôlées. L\'unité de production initiale peut ne pas suffire à répondre à la demande si celle-ci dépasse les prévisions, créant des ruptures de stock et des retards de livraison. Le processus de fermentation et de conditionnement a une capacité maximale qui ne peut être étendue rapidement.',
    mitigation: 'Investissement progressif dans la capacité (extension prévue Année 2), stock tampon de 3 mois, contrat de sous-traitance avec un partenaire local, pré-commandes pour anticiper la demande, plan d\'expansion modulaire de l\'unité de production.',
    consequences: 'Perte de ventes estimée à 15-25% du CA potentiel, insatisfaction client, risques de retournement vers la concurrence chimique, dégradation de la réputation.',
  },
  {
    name: 'Retard réglementaire et certification',
    likelihood: 2, impact: 3, category: 'reglementaire',
    description: 'L\'homologation et la certification des biofertilisants en Côte d\'Ivoire impliquent des procédures administratives longues (DPVC, Ministère de l\'Agriculture). Les délais peuvent s\'étirer au-delà de 6 mois en raison de la complexité du cadre réglementaire pour les produits biologiques, qui est encore en construction. L\'absence de normes spécifiques aux biofertilisants ajoute de l\'incertitude.',
    mitigation: 'Engagement précoce avec les autorités (DPVC, FIRCA), constitution du dossier réglementaire dès le lancement, recours à un cabinet spécialisé en homologation, appui du Ministère de l\'Agriculture via la Stratégie Bio 2030, certificat Ecocert international en parallèle.',
    consequences: 'Retard du lancement de 3 à 6 mois, impossibilité de vendre légalement pendant la période d\'homologation, perte de CA estimée à 4-5M Fcfa par trimestre de retard.',
  },
  {
    name: 'Instabilité des prix des matières premières',
    likelihood: 3, impact: 2, category: 'financier',
    description: 'Les matières premières entrant dans la fabrication du biofertilisant (composants biologiques, emballages, additifs) sont sujettes à des fluctuations de prix liées au marché mondial, à la disponibilité locale et aux taux de change (Franc CFA / Euro). Une hausse des coûts d\'intrants réduit directement la marge brute et peut compromettre la rentabilité du projet.',
    mitigation: 'Contrats d\'approvisionnement à prix fixe sur 12 mois, diversification des fournisseurs (minimum 3 par matière), constitution de stocks de sécurité, clause d\'indexation dans les contrats commerciaux, ajustement tarifaire progressif.',
    consequences: 'Réduction de la marge brute de 5 à 10 points, pression sur les prix de vente, nécessité d\'augmenter les tarifs ce qui affecte la compétitivité.',
  },
  {
    name: 'Dépendance au fournisseur LIG (Congo)',
    likelihood: 2, impact: 4, category: 'stratégique',
    description: 'L\'approvisionnement exclusif auprès du Centre LIG (Congo) concentre un risque d\'approvisionnement : en cas de désaccord, de retrait ou de défaillance du fournisseur, l\'ensemble de la stratégie de distribution est compromise. LIG détient le brevet et la technologie de production du biofertilisant.',
    mitigation: 'Négociation d\'un contrat cadre d\'approvisionnement avec clauses de protection (préavis 12 mois, prix fixe, volumes garantis), transfert progressif de compétences techniques, exploration de licences de production locale à moyen terme, diversification des sources d\'approvisionnement en matières premières.',
    consequences: 'Rupture d\'approvisionnement en produits, impossibilité de répondre à la demande, perte de crédibilité commerciale, coûts de restructuration estimés à 10-15M Fcfa.',
  },
  {
    name: 'Conditions météorologiques défavorables',
    likelihood: 3, impact: 2, category: 'technique',
    description: 'Le changement climatique expose la Côte d\'Ivoire à des épisodes de sécheresse accrue, d\'inondations ou de perturbations saisonnières. Ces aléas affectent directement les campagnes agricoles, réduisant la demande en fertilisants et pouvant endommager les cultures témoins utilisées pour les démonstrations. Ils impactent aussi les conditions de production du biofertilisant.',
    mitigation: 'Calendrier de production adapté aux saisons, stockage sécurisé anti-humidité, assurance catastrophe naturelle, démonstrations en conditions contrôlées (serres), diversification géographique des zones de démonstration, communication sur la résilience du produit face au stress hydrique.',
    consequences: 'Baisse temporaire de la demande de 10-20%, annulation de démonstrations terrain, retard dans le cycle de preuves de résultat.',
  },
  {
    name: 'Contrefaçon et violation de propriété intellectuelle',
    likelihood: 2, impact: 3, category: 'commercial',
    description: 'Le succès du produit pourrait attirer des contrefacteurs proposant des imitations de qualité inférieure sous une apparence similaire. En Afrique de l\'Ouest, la protection de la propriété intellectuelle est difficile à faire respecter. Des produits contrefaits pourraient nuire gravement à la réputation du biofertilisant Biodynamie et créer une confusion chez les agriculteurs.',
    mitigation: 'Dépôt de marque OAPI (Organisation Africaine de la Propriété Intellectuelle), hologrammes et codes QR authentification sur chaque packaging, programme de sensibilisation des distributeurs, actions juridiques rapides, certificat d\'authenticité numéroté, collaboration avec les autorités douanières.',
    consequences: 'Atteinte à la réputation, perte de confiance des clients, CA détourné estimé à 5-10% du marché, coûts juridiques et d\'anti-contrefaçon.',
  },
]

const timelineData = [
  { period: 'Mai 2026', title: 'Pré-lancement', desc: 'Campagne de teasing digitale, signature des MoU avec FIRCA et PALMCI', status: 'upcoming' },
  { period: '10 Juin 2026', title: 'Lancement officiel', desc: 'Cérémonie à Abidjan avec partenaires, démonstration live, couverture médiatique RTI/Business24', status: 'upcoming' },
  { period: 'Juil–Sept 2026', title: 'CAPS Biodynamie Tour', desc: 'Tournée dans 5 régions agricoles, formations gratuites, campagne influenceurs verts', status: 'upcoming' },
  { period: 'Oct–Déc 2026', title: 'Évaluation & Consolidation', desc: 'Évaluation des résultats, collecte témoignages, signature nouveaux contrats', status: 'upcoming' },
  { period: 'Jan–Jun 2027', title: 'Extension régionale', desc: 'Extension distribution régionale, lancement label "Fermes Biodynamiques", salons (SARA)', status: 'upcoming' },
]

// ═══════════════════════════════════════════════════════════
// EXPANDED MARKETING DATA
// ═══════════════════════════════════════════════════════════

const personas = [
  { name: 'Ibrahim D.', role: 'Directeur Agro-industrie', org: 'PALMCI / SIFCA', age: 48, budget: '10-50M Fcfa/an', pain: 'Coût engrais chimiques importés en hausse constante', goal: 'Réduire les coûts d\'intrants de 30% minimum', channel: 'Réseaux professionnels, salons', color: C.accentDark, icon: Building2 },
  { name: 'Aminata K.', role: 'Présidente Coopérative', org: 'Coopérative de Daloa', age: 42, budget: '1-5M Fcfa/an', pain: 'Baisse de rendement, sols appauvris par les chimiques', goal: 'Régénérer ses sols et augmenter les rendements', channel: 'ANADER, radio rurale, WhatsApp', color: C.gold, icon: Users },
  { name: 'Kouadio M.', role: 'Maraîcher Urbain', org: 'Marché d\'Abidjan', age: 32, budget: '50-300K Fcfa/cycle', pain: 'Produits chimiques chers et toxiques pour sa santé', goal: 'Produire sainement à moindre coût', channel: 'Réseaux sociaux, marchés, bouche-à-oreille', color: C.accent, icon: Sprout },
  { name: 'Dr. Yao F.', role: 'Chercheur / R&D', org: 'CNRA / Université', age: 55, budget: 'Budget institutionnel', pain: 'Manque de solutions biologiques validées scientifiquement', goal: 'Valider et diffuser des solutions agro-écologiques', channel: 'Conférences, publications, institutions', color: C.info, icon: Microscope },
]

const funnelData = [
  { step: 'Conscience', value: 100000, pct: 100, color: C.accent },
  { step: 'Intérêt', value: 25000, pct: 25, color: C.accentDark },
  { step: 'Considération', value: 8000, pct: 8, color: C.gold },
  { step: 'Essai', value: 2000, pct: 2, color: C.orange },
  { step: 'Achat', value: 500, pct: 0.5, color: C.success },
]

const channelBudgetData = [
  { canal: 'Digital (Social + SEO)', budget: 0.8, leads: 12000, conversion: 2.5, roi: 3.2, cac: 667 },
  { canal: 'Événements / Salons', budget: 1.5, leads: 3000, conversion: 8.0, roi: 4.5, cac: 5000 },
  { canal: 'Formation / Tournées', budget: 1.2, leads: 5000, conversion: 15.0, roi: 6.8, cac: 2400 },
  { canal: 'Presse / Médias traditionnels', budget: 0.5, leads: 8000, conversion: 1.5, roi: 1.8, cac: 6250 },
  { canal: 'Partenariats (ANADER, FIRCA)', budget: 0.5, leads: 4000, conversion: 12.0, roi: 8.5, cac: 1250 },
  { canal: 'E-commerce / Site web', budget: 0.5, leads: 6000, conversion: 4.0, roi: 5.2, cac: 833 },
]

const marketingKPIData = [
  { kpi: 'Notoriété assistée', an1: '15%', an2: '45%', an3: '70%', target: '70%', icon: Eye, color: C.accent },
  { kpi: 'Taux de conversion essai→achat', an1: '25%', an2: '35%', an3: '45%', target: '45%', icon: MousePointerClick, color: C.gold },
  { kpi: 'Coût d\'acquisition client (CAC)', an1: '25 000 F', an2: '18 000 F', an3: '12 000 F', target: '<15 000 F', icon: UserPlus, color: C.accentDark },
  { kpi: 'Vie client moyenne (LTV)', an1: '120 000 F', an2: '350 000 F', an3: '600 000 F', target: '>500 000 F', icon: Repeat, color: C.success },
  { kpi: 'LTV/CAC Ratio', an1: '4.8x', an2: '19.4x', an3: '50.0x', target: '>20x', icon: Scale, color: C.info },
  { kpi: 'Taux de réachat', an1: '40%', an2: '60%', an3: '75%', target: '>70%', icon: Repeat, color: C.purple },
  { kpi: 'NPS (Net Promoter Score)', an1: '30', an2: '55', an3: '70', target: '>60', icon: Star, color: C.orange },
  { kpi: 'Temps moyen de conversion', an1: '45 jours', an2: '30 jours', an3: '20 jours', target: '<25 jours', icon: Timer, color: C.rose },
]

const mix4P = [
  { P: 'Produit', icon: Leaf, color: C.accent, items: [
    'Biofertilisant 100% naturel, pH 7.5',
    '2 conditionnements : 500g, 1kg',
    'Certification bio en cours (Ecocert)',
    'Garantie "Résultats visibles sous 10 jours"',
    'Programme "1 tonne test" gratuit',
    'Label "Fermes Biodynamiques" (Année 2)',
  ]},
  { P: 'Prix', icon: DollarSign, color: C.gold, items: [
    'Prix lancement : -40% (voir sélecteur ci-dessus)',
    'Prix standard : selon tarif choisi',
    'Remise volume : -20% (commandes > 5kg)',
    'Paiement échelonné pour coopératives',
    'Programme fidélité : 10e sac offert',
    'Comparatif : 3x moins cher que chimiques',
  ]},
  { P: 'Place', icon: Truck, color: C.accentDark, items: [
    'Centre CAPS Abidjan (vente directe)',
    'E-commerce www.biodynamie.ci',
    'Réseau ANADER (diffusion nationale)',
    'Coopératives partenaires (10 régions)',
    'Magasins bio / intrants verts',
    '10 technico-commerciaux terrain',
  ]},
  { P: 'Promotion', icon: Megaphone, color: C.purple, items: [
    'Lancement 10 juin 2026 (événement premium)',
    'CAPS Biodynamie Tour (5 régions)',
    'Influenceurs verts & ambassadeurs',
    'Témoignages vidéo agriculteurs',
    'Campagne digitale Facebook/WhatsApp',
    'Salons professionnels (SARA, SARA Tech)',
  ]},
]

const contentCalendar = [
  { periode: 'Mai 2026', theme: 'Teasing & Anticipation', actions: 'Compte à rebours, révélations produit, MoU partenaires', canaux: 'Social media, WhatsApp, Presse', budget: '500K Fcfa', kpi: 'Impressions: 500K, Engagements: 25K' },
  { periode: 'Juin 2026', theme: 'Lancement Officiel', actions: 'Cérémonie, démonstrations live, couverture RTI', canaux: 'Tous canaux, TV, Presse, Événement', budget: '1.5M Fcfa', kpi: 'Participants: 500, Leads: 2000' },
  { periode: 'Juil-Sept 2026', theme: 'Tournée & Formations', actions: '5 régions, formations gratuites, "1 tonne test"', canaux: 'Terrain, ANADER, Radio rurale, WhatsApp', budget: '1.2M Fcfa', kpi: 'Agriculteurs formés: 500, Tests: 1000' },
  { periode: 'Oct-Déc 2026', theme: 'Témoignages & Preuve Sociale', actions: 'Collecte résultats, vidéos témoignages, études de cas', canaux: 'Social media, Site web, Salons', budget: '800K Fcfa', kpi: 'Témoignages: 50, Taux conversion: 25%' },
  { periode: 'Jan-Jun 2027', theme: 'Consolidation & Expansion', actions: 'Label "Fermes Biodynamiques", salons, partenariats', canaux: 'B2B, Institutions, Événements', budget: '1M Fcfa', kpi: 'Contrats signés: 15, CA: 17.4M' },
]

// ═══════════════════════════════════════════════════════════
// EXPANDED FINANCIAL DATA
// ═══════════════════════════════════════════════════════════

const compteResultatData = [
  { poste: 'Chiffre d\'affaires', a1: 17.4, a2: 64.0, a3: 135.0, bold: true, color: C.accent },
  { poste: '  Distribution biofertilisant (70%)', a1: 12.2, a2: 44.8, a3: 94.5, bold: false, color: C.text },
  { poste: '  Formations & accompagnement (15%)', a1: 2.6, a2: 9.6, a3: 20.3, bold: false, color: C.text },
  { poste: '  Consultation R&D (10%)', a1: 1.7, a2: 6.4, a3: 13.5, bold: false, color: C.text },
  { poste: '  Certification Fermes Bio (5%)', a1: 0.9, a2: 3.2, a3: 6.7, bold: false, color: C.text },
  { poste: 'Coûts variables', a1: -12.0, a2: -28.0, a3: -45.0, bold: true, color: C.danger },
  { poste: '  Matières premières', a1: -5.5, a2: -13.0, a3: -20.0, bold: false, color: C.text },
  { poste: '  Conditionnement & emballage', a1: -2.0, a2: -5.0, a3: -8.0, bold: false, color: C.text },
  { poste: '  Logistique & transport', a1: -2.5, a2: -6.0, a3: -10.0, bold: false, color: C.text },
  { poste: '  Commissions commerciales (8%)', a1: -1.4, a2: -2.5, a3: -4.5, bold: false, color: C.text },
  { poste: '  Tests gratuits (1 tonne)', a1: -0.6, a2: -1.5, a3: -2.5, bold: false, color: C.text },
  { poste: 'Marge brute', a1: 5.4, a2: 36.0, a3: 90.0, bold: true, color: C.accentDark },
  { poste: 'Charges fixes', a1: -4.6, a2: -19.5, a3: -25.0, bold: true, color: C.danger },
  { poste: '  Salaires & charges sociales', a1: 0, a2: -10.5, a3: -13.0, bold: false, color: C.text },
  { poste: '  Marketing & communication', a1: -1.0, a2: -2.5, a3: -4.0, bold: false, color: C.text },
  { poste: '  Loyer & charges bureaux', a1: 0, a2: -2.8, a3: -3.2, bold: false, color: C.text },
  { poste: '  Amortissements', a1: -1.8, a2: -1.8, a3: -2.0, bold: false, color: C.text },
  { poste: '  Assurances & divers', a1: -1.8, a2: -1.9, a3: -2.8, bold: false, color: C.text },
  { poste: 'Résultat opérationnel (EBIT)', a1: 0.8, a2: 16.5, a3: 65.0, bold: true, color: null },
  { poste: 'Charges financières', a1: 0, a2: -1.0, a3: -1.5, bold: false, color: C.text },
  { poste: 'Résultat avant impôt', a1: 0.8, a2: 15.5, a3: 63.5, bold: true, color: null },
  { poste: 'Impôt sur les sociétés (25%)', a1: -0.2, a2: -3.9, a3: -15.9, bold: false, color: C.text },
  { poste: 'Résultat net', a1: 0.6, a2: 11.6, a3: 47.6, bold: true, color: null },
]

const bilanData = [
  { poste: 'ACTIF', a1: '', a2: '', a3: '', header: true },
  { poste: '  Immobilisations nettes', a1: 12.0, a2: 10.2, a3: 8.4, bold: false },
  { poste: '  Stocks', a1: 3.0, a2: 8.0, a3: 15.0, bold: false },
  { poste: '  Créances clients', a1: 2.5, a2: 9.0, a3: 18.0, bold: false },
  { poste: '  Trésorerie', a1: 4.5, a2: 18.0, a3: 55.0, bold: false },
  { poste: 'Total Actif', a1: 22.0, a2: 45.2, a3: 96.4, bold: true },
  { poste: 'PASSIF', a1: '', a2: '', a3: '', header: true },
  { poste: '  Capital social', a1: 20.0, a2: 20.0, a3: 20.0, bold: false },
  { poste: '  Réserves & RAN', a1: -10.1, a2: 1.5, a3: 49.1, bold: false },
  { poste: '  Dettes financières', a1: 8.0, a2: 15.0, a3: 10.0, bold: false },
  { poste: '  Dettes fournisseurs', a1: 2.6, a2: 5.7, a3: 12.3, bold: false },
  { poste: '  Dettes fiscales & sociales', a1: 1.5, a2: 3.0, a3: 5.0, bold: false },
  { poste: 'Total Passif', a1: 22.0, a2: 45.2, a3: 96.4, bold: true },
]

const ratiosData = [
  { category: 'Rentabilité', ratios: [
    { name: 'Marge brute', formula: 'MB/CA', a1: '31.0%', a2: '56.3%', a3: '66.7%', target: '>60%', status: 'warning' },
    { name: 'Marge opérationnelle (EBIT)', formula: 'EBIT/CA', a1: '-58.0%', a2: '25.8%', a3: '48.1%', target: '>25%', status: 'success' },
    { name: 'Marge nette', formula: 'RN/CA', a1: '-58.0%', a2: '18.1%', a3: '35.3%', target: '>20%', status: 'success' },
    { name: 'ROE (Rentabilité des capitaux)', formula: 'RN/Capitaux propres', a1: '-33.4%', a2: '54.0%', a3: '68.8%', target: '>30%', status: 'success' },
    { name: 'ROA (Rentabilité de l\'actif)', formula: 'RN/Total actif', a1: '-45.9%', a2: '25.7%', a3: '49.4%', target: '>15%', status: 'success' },
    { name: 'ROCE (Rentabilité capitaux engagés)', formula: 'EBIT/CE', a1: '-33.4%', a2: '44.6%', a3: '72.2%', target: '>25%', status: 'success' },
  ]},
  { category: 'Liquidité', ratios: [
    { name: 'Ratio de liquidité générale', formula: 'AC/PC', a1: '0.55', a2: '1.55', a3: '2.70', target: '>1.5', status: 'warning' },
    { name: 'Ratio de liquidité immédiate', formula: '(AC-Stocks)/PC', a1: '0.46', a2: '1.20', a3: '2.23', target: '>1.0', status: 'success' },
    { name: 'Ratio de solvabilité', formula: 'CP/Total actif', a1: '44.9%', a2: '47.6%', a3: '71.7%', target: '>40%', status: 'success' },
    { name: 'Dette/Équité', formula: 'DF/CP', a1: '0.56', a2: '0.75', a3: '0.18', target: '<1.0', status: 'success' },
  ]},
  { category: 'Activité & Efficacité', ratios: [
    { name: 'Rotation des stocks (jours)', formula: 'Stock/CA×365', a1: '63', a2: '46', a3: '41', target: '<60j', status: 'success' },
    { name: 'Délai paiement clients (jours)', formula: 'Créances/CA×365', a1: '53', a2: '51', a3: '49', target: '<60j', status: 'success' },
    { name: 'Délai paiement fournisseurs (jours)', formula: 'Dettes/CA×365', a1: '54', a2: '33', a3: '33', target: '>30j', status: 'success' },
    { name: 'CA par employé (M Fcfa)', formula: 'CA/Effectif', a1: '1.2', a2: '3.6', a3: '6.4', target: '>3M', status: 'success' },
  ]},
  { category: 'Croissance', ratios: [
    { name: 'Croissance CA', formula: '(CA n - CA n-1)/CA n-1', a1: 'N/A', a2: '+268%', a3: '+111%', target: '>50%', status: 'success' },
    { name: 'Croissance résultat net', formula: '(RN n - RN n-1)/RN n-1', a1: 'N/A', a2: 'N/A', a3: '+310%', target: '>30%', status: 'success' },
    { name: 'Part de marché visée (biofertilisants CI)', formula: 'Estimé', a1: '2%', a2: '8%', a3: '18%', target: '>10%', status: 'warning' },
  ]},
]

const vanTriData = [
  { scenario: 'Pessimiste', taux: '8%', van: 18.2, tri: 28.5, delai: 30, color: C.warning },
  { scenario: 'Base', taux: '10%', van: 35.8, tri: 41.0, delai: 20, color: C.accent },
  { scenario: 'Optimiste', taux: '10%', van: 62.4, tri: 55.3, delai: 15, color: C.success },
]

const sensitivityData = [
  { param: 'Prix de vente -10%', impactCA: -1.74, impactRN: -1.74, impactTRI: -8.2, risque: 'Moyen' },
  { param: 'Volume vendu -20%', impactCA: -3.48, impactRN: -3.48, impactTRI: -12.5, risque: 'Élevé' },
  { param: 'Coût matières +15%', impactCA: 0, impactRN: -0.83, impactTRI: -4.1, risque: 'Moyen' },
  { param: 'Retard lancement 3 mois', impactCA: -4.35, impactRN: -4.35, impactTRI: -9.8, risque: 'Élevé' },
  { param: 'Taux de conversion -50%', impactCA: -8.7, impactRN: -8.7, impactTRI: -18.3, risque: 'Critique' },
  { param: 'Subvention gouvernementale', impactCA: 0, impactRN: +3.0, impactTRI: +6.5, risque: 'Opportunité' },
]

const breakevenData = [
  { ca: 0, coutsTotal: 15.5, profit: -15.5 },
  { ca: 10, coutsTotal: 20.7, profit: -10.7 },
  { ca: 20, coutsTotal: 25.9, profit: -5.9 },
  { ca: 30, coutsTotal: 31.1, profit: -1.1 },
  { ca: 32.2, coutsTotal: 32.2, profit: 0 },
  { ca: 40, coutsTotal: 36.3, profit: 3.7 },
  { ca: 60, coutsTotal: 46.7, profit: 13.3 },
  { ca: 80, coutsTotal: 57.1, profit: 22.9 },
  { ca: 100, coutsTotal: 67.5, profit: 32.5 },
  { ca: 135, coutsTotal: 85, profit: 50 },
]

const cashFlow3YData = [
  { year: 'A1 T1', exploitation: -3.5, investissement: -8.0, financement: 12.0, total: 0.5 },
  { year: 'A1 T2', exploitation: -4.0, investissement: -2.0, financement: 0, total: -6.0 },
  { year: 'A1 T3', exploitation: -3.5, investissement: 0, financement: 0, total: -3.5 },
  { year: 'A1 T4', exploitation: -3.6, investissement: 0, financement: 0, total: -3.6 },
  { year: 'A2 T1', exploitation: 2.0, investissement: -5.0, financement: 5.0, total: 2.0 },
  { year: 'A2 T2', exploitation: 3.5, investissement: -2.0, financement: 0, total: 1.5 },
  { year: 'A2 T3', exploitation: 4.0, investissement: 0, financement: 0, total: 4.0 },
  { year: 'A2 T4', exploitation: 4.5, investissement: 0, financement: -3.0, total: 1.5 },
  { year: 'A3 T1', exploitation: 12.0, investissement: -8.0, financement: 0, total: 4.0 },
  { year: 'A3 T2', exploitation: 15.0, investissement: 0, financement: 0, total: 15.0 },
  { year: 'A3 T3', exploitation: 18.0, investissement: 0, financement: -2.0, total: 16.0 },
  { year: 'A3 T4', exploitation: 20.0, investissement: 0, financement: -5.0, total: 15.0 },
]

// ─── Section IDs for navigation ───
const sections = [
  { id: 'resume', label: 'Résumé', icon: Target },
  { id: 'projet', label: 'Projet', icon: Sprout },
  { id: 'marche', label: 'Marché', icon: TrendingUp },
  { id: 'produit', label: 'Produit', icon: Leaf },
  { id: 'modele', label: 'Modèle', icon: DollarSign },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'financier', label: 'Financier', icon: BarChart3 },
  { id: 'risques', label: 'Risques', icon: Shield },
  { id: 'vision', label: 'Vision', icon: Award },
  { id: 'annexes', label: 'Annexes', icon: BookOpen },
]

// ─── Animated Section Component ───
function AnimatedSection({ id, children, className = '' }: { id: string; children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

// ─── Stat Card ───
function StatCard({ icon: Icon, value, label, color = C.accent }: { icon: any; value: string; label: string; color?: string }) {
  return (
    <motion.div whileHover={{ y: -4, boxShadow: `0 8px 30px ${color}25` }} transition={{ duration: 0.2 }}>
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: color }} />
        <CardContent className="p-5 pl-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
              <Icon size={20} style={{ color }} />
            </div>
            <span className="text-2xl font-bold" style={{ color: C.primary }}>{value}</span>
          </div>
          <p className="text-sm" style={{ color: C.muted }}>{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Section Header ───
function SectionHeader({ icon: Icon, title, subtitle, color = C.accent }: { icon: any; title: string; subtitle: string; color?: string }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${color}15` }}>
        <Icon size={24} style={{ color }} />
      </div>
      <div>
        <h2 className="text-3xl font-bold" style={{ color: C.primary }}>{title}</h2>
        <p className="text-sm" style={{ color: C.muted }}>{subtitle}</p>
      </div>
    </div>
  )
}

// ─── Table row helper ───
function FinRow({ poste, a1, a2, a3, bold, header, color }: { poste: string; a1: string | number; a2: string | number; a3: string | number; bold?: boolean; header?: boolean; color?: string }) {
  const isNeg = (v: string | number) => typeof v === 'number' && v < 0
  const isPos = (v: string | number) => typeof v === 'number' && v > 0
  const fmtVal = (v: string | number) => typeof v === 'number' ? `${v > 0 ? '+' : ''}${v.toFixed(1)}M` : v

  if (header) {
    return (
      <tr style={{ backgroundColor: C.primary }}>
        <td className="p-3 text-white font-bold text-sm" colSpan={4}>{poste}</td>
      </tr>
    )
  }

  return (
    <tr className={bold ? 'border-t-2' : ''} style={{ backgroundColor: bold ? `${C.accent}06` : 'transparent' }}>
      <td className={`p-3 ${bold ? 'font-bold' : ''}`} style={{ color: bold ? C.primary : C.text, paddingLeft: poste.startsWith('  ') ? '2rem' : '0.75rem' }}>
        {poste.replace(/^  /, '')}
      </td>
      {[a1, a2, a3].map((v, i) => (
        <td key={i} className={`p-3 text-right ${bold ? 'font-bold' : ''}`} style={{ color: isNeg(v) ? C.danger : isPos(v) ? C.success : C.text }}>
          {fmtVal(v)}
        </td>
      ))}
    </tr>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════
export default function BusinessPlanApp() {
  const [activeSection, setActiveSection] = useState('resume')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [priceIdx, setPriceIdx] = useState(1) // default: Standard 9000
  const [loanIdx, setLoanIdx] = useState(0) // default: Sans prêt

  // ─── Dynamic Financial Computation (Volume-Driven) ───
  const dyn = useMemo(() => {
    const p = PRICE_OPTIONS[priceIdx].price // prix de vente par kg

    // ── Loan calculations — prêt à taux zéro, 3 mensualités dès Oct 2026 ──
    const loanAmt = LOAN_OPTIONS[loanIdx].amount
    const loanRepayQ = Math.round(loanAmt / 3 * 10) / 10
    const loanRemaining = [Math.round((loanAmt - loanRepayQ) * 10) / 10, 0, 0]
    const loanInterest = [0, 0, 0] // Taux 0%

    // ── Volumes (kg) — logique 30t reçues → 29t vendues + 1t promo ──
    const volReceivedKg = VOLUME_RECEIVED.map(v => v * 1000)
    const volSoldKg = volReceivedKg.map(v => Math.round(v * 29 / 30))
    const volPromoKg = volReceivedKg.map(v => Math.round(v * 1 / 30))

    // ── Revenus ──
    const productCA = volSoldKg.map(v => Math.round(v * p / 1_000_000 * 10) / 10)
    const formations = [15, 40, 75]
    const consultation = [8, 20, 35]
    const certification = [4, 10, 20]
    const servicesCA = formations.map((f, i) => f + consultation[i] + certification[i])
    const totalCA = productCA.map((pc, i) => Math.round((pc + servicesCA[i]) * 10) / 10)

    // ── Coûts variables (basés sur le volume reçu, indépendants du prix de vente) ──
    const matieres = volReceivedKg.map(v => -Math.round(v * COUT_ACHAT_KG / 1_000_000 * 10) / 10)
    const conditionnement = volReceivedKg.map(v => -Math.round(v * COUT_CONDITIONNEMENT_KG / 1_000_000 * 10) / 10)
    const logistique = volReceivedKg.map(v => -Math.round(v * COUT_LOGISTIQUE_KG / 1_000_000 * 10) / 10)
    const commissions = totalCA.map(c => Math.round(-c * TAUX_COMMISSION * 10) / 10)
    const testsGratuits = volPromoKg.map(v => -Math.round(v * COUT_PROMO_KG / 1_000_000 * 10) / 10)
    const totalVar = matieres.map((m, i) => Math.round((m + conditionnement[i] + logistique[i] + commissions[i] + testsGratuits[i]) * 10) / 10)
    const margeBrute = totalCA.map((c, i) => Math.round((c + totalVar[i]) * 10) / 10)

    // ── Charges fixes ──
    const salaires = [0, -15.0, -22.0]
    const marketing = [-5.0, -8.0, -12.0]
    const loyer = [0, -4.0, -5.5]
    const amort = [-3.0, -3.5, -4.0]
    const assurances = [-2.0, -3.0, -4.5]
    const fixedCosts = salaires.map((s, i) => Math.round((s + marketing[i] + loyer[i] + amort[i] + assurances[i]) * 10) / 10)
    const ebit = margeBrute.map((mb, i) => Math.round((mb + fixedCosts[i]) * 10) / 10)
    const finCharges = [0, -1.0, -1.5]
    const rbt = ebit.map((eb, i) => Math.round((eb + finCharges[i]) * 10) / 10)
    const impot = rbt.map(r => r > 0 ? Math.round(-r * 0.25 * 10) / 10 : 0)
    const rn = rbt.map((r, i) => Math.round((r + impot[i]) * 10) / 10)

    // ── Ratios clés ──
    const mbPct = margeBrute.map((mb, i) => totalCA[i] > 0 ? Math.round(mb / totalCA[i] * 1000) / 10 : 0)
    const ebitPct = ebit.map((eb, i) => totalCA[i] > 0 ? Math.round(eb / totalCA[i] * 1000) / 10 : 0)
    const rnPct = rn.map((r, i) => totalCA[i] > 0 ? Math.round(r / totalCA[i] * 1000) / 10 : 0)
    const capSocial = [20, 20, 20]
    const ran = rn.map((_, i) => Math.round(rn.slice(0, i + 1).reduce((s, v) => s + v, 0) * 10) / 10)
    const capPropres = ran.map((r, i) => Math.round((capSocial[i] + r) * 10) / 10)
    const immob = [20.0, 18.0, 15.0]
    const stocks = volReceivedKg.map(v => Math.round(v * COUT_ACHAT_KG / 1_000_000 / 4 * 10) / 10)
    const creances = totalCA.map(c => Math.round(c * 0.09 * 10) / 10)
    const tresorerie = ran.map((r, i) => Math.round((5.0 + loanAmt + r + (i > 0 ? ran[i - 1] - rn[i] : 0)) * 10) / 10)
    const totalActif = immob.map((im, i) => Math.round((im + stocks[i] + creances[i] + tresorerie[i]) * 10) / 10)
    const baseDettesFin = [8.0, 15.0, 10.0]
    const dettesFin = baseDettesFin.map((d, i) => Math.round((d + loanRemaining[i]) * 10) / 10)
    const dettesFisc = [3.0, 12.0, 25.0]
    const dettesFourn = totalActif.map((ta, i) => Math.round((ta - capSocial[i] - ran[i] - dettesFin[i] - dettesFisc[i]) * 10) / 10)
    const roe = capPropres.map((cp, i) => cp > 0 ? Math.round(rn[i] / cp * 1000) / 10 : 0)
    const roa = totalActif.map((ta, i) => ta > 0 ? Math.round(rn[i] / ta * 1000) / 10 : 0)
    const actifCirc = stocks.map((s, i) => Math.round((s + creances[i] + tresorerie[i]) * 10) / 10)
    const passifCirc = dettesFourn.map((df, i) => Math.round((df + dettesFisc[i]) * 10) / 10)
    const liqGen = actifCirc.map((ac, i) => passifCirc[i] > 0 ? Math.round(ac / passifCirc[i] * 100) / 100 : 0)
    const liqImm = stocks.map((s, i) => passifCirc[i] > 0 ? Math.round((actifCirc[i] - s) / passifCirc[i] * 100) / 100 : 0)
    const solvabilite = totalActif.map((ta, i) => ta > 0 ? Math.round(capPropres[i] / ta * 1000) / 10 : 0)
    const detteEquite = capPropres.map((cp, i) => cp > 0 ? Math.round(dettesFin[i] / cp * 100) / 100 : 0)
    const croissCA = totalCA.map((c, i) => i === 0 ? 'N/A' : `+${Math.round((c / totalCA[i - 1] - 1) * 1000) / 10}%`)
    const croissRN = rn.map((r, i) => i === 0 || rn[i - 1] <= 0 ? 'N/A' : `+${Math.round((r / rn[i - 1] - 1) * 1000) / 10}%`)

    // ── Seuil de rentabilité ──
    const mbPctA1 = mbPct[0] / 100
    const seuil = mbPctA1 > 0 ? Math.round(-fixedCosts[0] / mbPctA1 * 10) / 10 : 0

    // ── Build data arrays ──
    const financialData = [
      { year: 'Année 1 (2026)', CA: totalCA[0], couts: Math.round(-(totalVar[0] + fixedCosts[0]) * 10) / 10, resultat: rn[0] },
      { year: 'Année 2 (2027)', CA: totalCA[1], couts: Math.round(-(totalVar[1] + fixedCosts[1]) * 10) / 10, resultat: rn[1] },
      { year: 'Année 3 (2028)', CA: totalCA[2], couts: Math.round(-(totalVar[2] + fixedCosts[2]) * 10) / 10, resultat: rn[2] },
    ]

    const compteResultatData = [
      { poste: 'Chiffre d\'affaires', a1: totalCA[0], a2: totalCA[1], a3: totalCA[2], bold: true, color: C.accent },
      { poste: '  Distribution biofertilisant (29t/77t/145t)', a1: productCA[0], a2: productCA[1], a3: productCA[2], bold: false, color: C.text },
      { poste: '  Formations & accompagnement', a1: formations[0], a2: formations[1], a3: formations[2], bold: false, color: C.text },
      { poste: '  Consultation R&D', a1: consultation[0], a2: consultation[1], a3: consultation[2], bold: false, color: C.text },
      { poste: '  Certification Fermes Bio', a1: certification[0], a2: certification[1], a3: certification[2], bold: false, color: C.text },
      { poste: 'Coûts variables', a1: totalVar[0], a2: totalVar[1], a3: totalVar[2], bold: true, color: C.danger },
      { poste: '  Matières premières (achat LIG)', a1: matieres[0], a2: matieres[1], a3: matieres[2], bold: false, color: C.text },
      { poste: '  Conditionnement & emballage', a1: conditionnement[0], a2: conditionnement[1], a3: conditionnement[2], bold: false, color: C.text },
      { poste: '  Logistique & transport', a1: logistique[0], a2: logistique[1], a3: logistique[2], bold: false, color: C.text },
      { poste: '  Commissions commerciales (8%)', a1: commissions[0], a2: commissions[1], a3: commissions[2], bold: false, color: C.text },
      { poste: '  Tests gratuits (1t promo / 30t)', a1: testsGratuits[0], a2: testsGratuits[1], a3: testsGratuits[2], bold: false, color: C.text },
      { poste: 'Marge brute', a1: margeBrute[0], a2: margeBrute[1], a3: margeBrute[2], bold: true, color: C.accentDark },
      { poste: 'Charges fixes', a1: fixedCosts[0], a2: fixedCosts[1], a3: fixedCosts[2], bold: true, color: C.danger },
      { poste: '  Salaires & charges sociales', a1: salaires[0], a2: salaires[1], a3: salaires[2], bold: false, color: C.text },
      { poste: '  Marketing & communication', a1: marketing[0], a2: marketing[1], a3: marketing[2], bold: false, color: C.text },
      { poste: '  Loyer & charges bureaux', a1: loyer[0], a2: loyer[1], a3: loyer[2], bold: false, color: C.text },
      { poste: '  Amortissements', a1: amort[0], a2: amort[1], a3: amort[2], bold: false, color: C.text },
      { poste: '  Assurances & divers', a1: assurances[0], a2: assurances[1], a3: assurances[2], bold: false, color: C.text },
      { poste: 'Résultat opérationnel (EBIT)', a1: ebit[0], a2: ebit[1], a3: ebit[2], bold: true, color: null },
      { poste: 'Charges financières', a1: finCharges[0], a2: finCharges[1], a3: finCharges[2], bold: false, color: C.text },
      { poste: 'Résultat avant impôt', a1: rbt[0], a2: rbt[1], a3: rbt[2], bold: true, color: null },
      { poste: 'Impôt sur les sociétés (25%)', a1: impot[0], a2: impot[1], a3: impot[2], bold: false, color: C.text },
      { poste: 'Résultat net', a1: rn[0], a2: rn[1], a3: rn[2], bold: true, color: null },
    ]

    const bilanData = [
      { poste: 'ACTIF', a1: '', a2: '', a3: '', header: true },
      { poste: '  Immobilisations nettes', a1: immob[0], a2: immob[1], a3: immob[2], bold: false },
      { poste: '  Stocks', a1: stocks[0], a2: stocks[1], a3: stocks[2], bold: false },
      { poste: '  Créances clients', a1: creances[0], a2: creances[1], a3: creances[2], bold: false },
      { poste: '  Trésorerie', a1: tresorerie[0], a2: tresorerie[1], a3: tresorerie[2], bold: false },
      { poste: 'Total Actif', a1: totalActif[0], a2: totalActif[1], a3: totalActif[2], bold: true },
      { poste: 'PASSIF', a1: '', a2: '', a3: '', header: true },
      { poste: '  Capital social', a1: capSocial[0], a2: capSocial[1], a3: capSocial[2], bold: false },
      { poste: '  Réserves & RAN', a1: ran[0], a2: ran[1], a3: ran[2], bold: false },
      { poste: '  Dettes financières', a1: dettesFin[0], a2: dettesFin[1], a3: dettesFin[2], bold: false },
      { poste: '  Dettes fournisseurs', a1: dettesFourn[0], a2: dettesFourn[1], a3: dettesFourn[2], bold: false },
      { poste: '  Dettes fiscales & sociales', a1: dettesFisc[0], a2: dettesFisc[1], a3: dettesFisc[2], bold: false },
      { poste: 'Total Passif', a1: totalActif[0], a2: totalActif[1], a3: totalActif[2], bold: true },
    ]

    const ratiosData = [
      { category: 'Rentabilité', ratios: [
        { name: 'Marge brute', formula: 'MB/CA', a1: `${mbPct[0]}%`, a2: `${mbPct[1]}%`, a3: `${mbPct[2]}%`, target: '>40%', status: mbPct[2] >= 40 ? 'success' : 'warning' },
        { name: 'Marge opérationnelle (EBIT)', formula: 'EBIT/CA', a1: `${ebitPct[0]}%`, a2: `${ebitPct[1]}%`, a3: `${ebitPct[2]}%`, target: '>25%', status: ebitPct[2] >= 25 ? 'success' : 'warning' },
        { name: 'Marge nette', formula: 'RN/CA', a1: `${rnPct[0]}%`, a2: `${rnPct[1]}%`, a3: `${rnPct[2]}%`, target: '>20%', status: rnPct[2] >= 20 ? 'success' : 'warning' },
        { name: 'ROE (Rentabilité des capitaux)', formula: 'RN/Capitaux propres', a1: `${roe[0]}%`, a2: `${roe[1]}%`, a3: `${roe[2]}%`, target: '>30%', status: roe[2] >= 30 ? 'success' : 'warning' },
        { name: 'ROA (Rentabilité de l\'actif)', formula: 'RN/Total actif', a1: `${roa[0]}%`, a2: `${roa[1]}%`, a3: `${roa[2]}%`, target: '>15%', status: roa[2] >= 15 ? 'success' : 'warning' },
        { name: 'ROCE (Rentabilité capitaux engagés)', formula: 'EBIT/CE', a1: `${roe[0]}%`, a2: `${Math.round(ebit[1] / (capPropres[1] + dettesFin[1]) * 1000) / 10}%`, a3: `${Math.round(ebit[2] / (capPropres[2] + dettesFin[2]) * 1000) / 10}%`, target: '>25%', status: true ? 'success' : 'warning' },
      ]},
      { category: 'Liquidité', ratios: [
        { name: 'Ratio de liquidité générale', formula: 'AC/PC', a1: `${liqGen[0]}`, a2: `${liqGen[1]}`, a3: `${liqGen[2]}`, target: '>1.5', status: liqGen[2] >= 1.5 ? 'success' : 'warning' },
        { name: 'Ratio de liquidité immédiate', formula: '(AC-Stocks)/PC', a1: `${liqImm[0]}`, a2: `${liqImm[1]}`, a3: `${liqImm[2]}`, target: '>1.0', status: liqImm[2] >= 1.0 ? 'success' : 'warning' },
        { name: 'Ratio de solvabilité', formula: 'CP/Total actif', a1: `${solvabilite[0]}%`, a2: `${solvabilite[1]}%`, a3: `${solvabilite[2]}%`, target: '>40%', status: solvabilite[2] >= 40 ? 'success' : 'warning' },
        { name: 'Dette/Équité', formula: 'DF/CP', a1: `${detteEquite[0]}`, a2: `${detteEquite[1]}`, a3: `${detteEquite[2]}`, target: '<1.0', status: detteEquite[2] < 1 ? 'success' : 'warning' },
      ]},
      { category: 'Activité & Efficacité', ratios: [
        { name: 'Rotation des stocks (jours)', formula: 'Stock/CA×365', a1: `${Math.round(stocks[0] / totalCA[0] * 365)}`, a2: `${Math.round(stocks[1] / totalCA[1] * 365)}`, a3: `${Math.round(stocks[2] / totalCA[2] * 365)}`, target: '<60j', status: Math.round(stocks[2] / totalCA[2] * 365) < 60 ? 'success' : 'warning' },
        { name: 'Délai paiement clients (jours)', formula: 'Créances/CA×365', a1: `${Math.round(creances[0] / totalCA[0] * 365)}`, a2: `${Math.round(creances[1] / totalCA[1] * 365)}`, a3: `${Math.round(creances[2] / totalCA[2] * 365)}`, target: '<60j', status: Math.round(creances[2] / totalCA[2] * 365) < 60 ? 'success' : 'warning' },
        { name: 'Délai paiement fournisseurs (jours)', formula: 'Dettes/CA×365', a1: totalCA[0] > 0 ? `${Math.round(Math.abs(dettesFourn[0]) / totalCA[0] * 365)}` : '0', a2: totalCA[1] > 0 ? `${Math.round(Math.abs(dettesFourn[1]) / totalCA[1] * 365)}` : '0', a3: totalCA[2] > 0 ? `${Math.round(Math.abs(dettesFourn[2]) / totalCA[2] * 365)}` : '0', target: '>30j', status: 'success' },
        { name: 'CA par employé (M Fcfa)', formula: 'CA/Effectif', a1: `${Math.round(totalCA[0] / 14 * 10) / 10}`, a2: `${Math.round(totalCA[1] / 18 * 10) / 10}`, a3: `${Math.round(totalCA[2] / 21 * 10) / 10}`, target: '>3M', status: totalCA[2] / 21 >= 3 ? 'success' : 'warning' },
      ]},
      { category: 'Croissance', ratios: [
        { name: 'Croissance CA', formula: '(CA n - CA n-1)/CA n-1', a1: croissCA[0], a2: croissCA[1], a3: croissCA[2], target: '>50%', status: 'success' as const },
        { name: 'Croissance résultat net', formula: '(RN n - RN n-1)/RN n-1', a1: croissRN[0], a2: croissRN[1], a3: croissRN[2], target: '>30%', status: 'success' as const },
        { name: 'Part de marché visée (biofertilisants CI)', formula: 'Estimé', a1: '2%', a2: '8%', a3: '18%', target: '>10%', status: 'warning' as const },
      ]},
    ]

    const totalRN = rn.reduce((s, r) => s + Math.max(r, 0), 0)
    const vanTriData = [
      { scenario: 'Pessimiste', taux: '8%', van: Math.round(totalRN * 0.4 * 10) / 10, tri: Math.round(totalRN / 30 * 10) / 10, delai: ebit[0] < 0 ? 30 : 18, color: C.warning },
      { scenario: 'Base', taux: '10%', van: Math.round(totalRN * 0.6 * 10) / 10, tri: Math.round(totalRN / 20 * 10) / 10, delai: ebit[0] < 0 ? 20 : 14, color: C.accent },
      { scenario: 'Optimiste', taux: '10%', van: Math.round(totalRN * 0.85 * 10) / 10, tri: Math.round(totalRN / 12 * 10) / 10, delai: ebit[0] < 0 ? 15 : 10, color: C.success },
    ]

    const sensitivityData = [
      { param: 'Prix de vente -10%', impactCA: Math.round(-totalCA[0] * 0.1 * 10) / 10, impactRN: Math.round(-totalCA[0] * 0.1 * 10) / 10, impactTRI: -8.2, risque: 'Moyen' },
      { param: 'Volume vendu -20%', impactCA: Math.round(-totalCA[0] * 0.2 * 10) / 10, impactRN: Math.round(-totalCA[0] * 0.2 * 10) / 10, impactTRI: -12.5, risque: 'Élevé' },
      { param: 'Coût matières +15%', impactCA: 0, impactRN: Math.round(Math.abs(matieres[0]) * 0.15 * 10) / 10, impactTRI: -4.1, risque: 'Moyen' },
      { param: 'Retard lancement 3 mois', impactCA: Math.round(-totalCA[0] * 0.25 * 10) / 10, impactRN: Math.round(-totalCA[0] * 0.25 * 10) / 10, impactTRI: -9.8, risque: 'Élevé' },
      { param: 'Taux de conversion -50%', impactCA: Math.round(-totalCA[0] * 0.5 * 10) / 10, impactRN: Math.round(-totalCA[0] * 0.5 * 10) / 10, impactTRI: -18.3, risque: 'Critique' },
      { param: 'Subvention gouvernementale', impactCA: 0, impactRN: +3.0, impactTRI: +6.5, risque: 'Opportunité' },
    ]

    const breakevenData: { ca: number; coutsTotal: number; profit: number }[] = []
    for (let caVal = 0; caVal <= Math.max(150, totalCA[2]); caVal += 5) {
      const coutsTotal = -fixedCosts[0] + (1 - mbPctA1) * caVal
      breakevenData.push({ ca: caVal, coutsTotal: Math.round(coutsTotal * 10) / 10, profit: Math.round((caVal - coutsTotal) * 10) / 10 })
    }

    const cashFlow3YData = [
      { year: 'A1 T1', exploitation: Math.round(ebit[0] / 4 * 10) / 10, investissement: -8.0, financement: Math.round((12.0 + loanAmt) * 10) / 10, total: Math.round((ebit[0] / 4 + 4.0 + loanAmt) * 10) / 10 },
      { year: 'A1 T2', exploitation: Math.round(ebit[0] / 4 * 10) / 10, investissement: -2.0, financement: 0, total: Math.round((ebit[0] / 4 - 2.0) * 10) / 10 },
      { year: 'A1 T3', exploitation: Math.round(ebit[0] / 4 * 10) / 10, investissement: 0, financement: 0, total: Math.round(ebit[0] / 4 * 10) / 10 },
      { year: 'A1 T4 (Oct)', exploitation: Math.round((ebit[0] / 4 - 0.5) * 10) / 10, investissement: 0, financement: -loanRepayQ, total: Math.round((ebit[0] / 4 - 0.5 - loanRepayQ) * 10) / 10 },
      { year: 'A2 T1', exploitation: Math.round(ebit[1] / 4 * 10) / 10, investissement: -5.0, financement: Math.round((-loanRepayQ + (ebit[1] > 0 ? 0 : 5.0)) * 10) / 10, total: Math.round((ebit[1] / 4 - 5.0 - loanRepayQ + (ebit[1] > 0 ? 0 : 5.0)) * 10) / 10 },
      { year: 'A2 T2', exploitation: Math.round(ebit[1] / 4 * 10) / 10, investissement: -2.0, financement: -loanRepayQ, total: Math.round((ebit[1] / 4 - 2.0 - loanRepayQ) * 10) / 10 },
      { year: 'A2 T3', exploitation: Math.round((ebit[1] / 4 + 0.5) * 10) / 10, investissement: 0, financement: 0, total: Math.round((ebit[1] / 4 + 0.5) * 10) / 10 },
      { year: 'A2 T4', exploitation: Math.round((ebit[1] / 4 + 1) * 10) / 10, investissement: 0, financement: -3.0, total: Math.round((ebit[1] / 4 + 1 - 3.0) * 10) / 10 },
      { year: 'A3 T1', exploitation: Math.round(ebit[2] / 4 * 10) / 10, investissement: -8.0, financement: 0, total: Math.round((ebit[2] / 4 - 8.0) * 10) / 10 },
      { year: 'A3 T2', exploitation: Math.round((ebit[2] / 4 + 1) * 10) / 10, investissement: 0, financement: 0, total: Math.round((ebit[2] / 4 + 1) * 10) / 10 },
      { year: 'A3 T3', exploitation: Math.round((ebit[2] / 4 + 2) * 10) / 10, investissement: 0, financement: -2.0, total: Math.round((ebit[2] / 4 + 2 - 2.0) * 10) / 10 },
      { year: 'A3 T4', exploitation: Math.round((ebit[2] / 4 + 3) * 10) / 10, investissement: 0, financement: -5.0, total: Math.round((ebit[2] / 4 + 3 - 5.0) * 10) / 10 },
    ]

    return {
      pricePerKg: p, pricePer500g: p / 2,
      loanAmt, loanInterest, loanRemaining,
      volReceivedKg, volSoldKg, volPromoKg,
      totalCA, productCA, ebit, rn, margeBrute, seuil, mbPct, fixedCosts,
      financialData, compteResultatData, bilanData, ratiosData,
      vanTriData, sensitivityData, breakevenData, cashFlow3YData,
    }
  }, [priceIdx, loanIdx])

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )
    sections.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FAFCFB' }}>
      {/* ─── HEADER NAV ─── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrollY > 80 ? `${C.primary}F2` : 'transparent',
          backdropFilter: scrollY > 80 ? 'blur(12px)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.accent }}>
                <Leaf size={20} className="text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-white text-sm">CAPS - Biodynamie</span>
                <span className="text-xs block" style={{ color: C.accent }}>Business Plan Juin 2026-2028</span>
              </div>
            </div>
            <nav className="hidden lg:flex items-center gap-1">
              {sections.map(s => (
                <button key={s.id} onClick={() => scrollTo(s.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeSection === s.id ? 'text-white' : 'text-white/60 hover:text-white/90'}`}
                  style={activeSection === s.id ? { backgroundColor: `${C.accent}30` } : {}}
                >{s.label}</button>
              ))}
            </nav>
            <button className="lg:hidden text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden" style={{ backgroundColor: C.primary }}>
              <div className="px-4 py-3 space-y-1">
                {sections.map(s => (
                  <button key={s.id} onClick={() => scrollTo(s.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm flex items-center gap-3 ${activeSection === s.id ? 'text-white' : 'text-white/70'}`}
                    style={activeSection === s.id ? { backgroundColor: `${C.accent}25` } : {}}
                  ><s.icon size={16} />{s.label}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{ backgroundColor: C.primary }}>
        <div className="absolute inset-0">
          <img src="/hero-agriculture.png" alt="Agriculture biodynamique en Côte d'Ivoire" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${C.primary}EE 0%, ${C.primary}BB 50%, ${C.accent}20 100%)` }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
            <Badge className="mb-6 text-xs font-medium px-4 py-1.5 border-0" style={{ backgroundColor: `${C.accent}25`, color: C.accent }}>
              Business Plan Juin 2026 – 2028
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Projet <span style={{ color: C.accent }}>BIODYNAMIE</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-4 max-w-2xl leading-relaxed">
              Distribution exclusive en Côte d&apos;Ivoire — Biofertilisant <strong className="text-white">Biodynamie</strong>
            </p>
            <p className="text-base text-white/60 mb-10 max-w-2xl">
              Fournisseur : <strong className="text-white/80">Centre LIG (Congo)</strong> · Distributeur : <strong className="text-white/80">CAPS (Côte d&apos;Ivoire)</strong>
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              <StatCard icon={Target} value={`${VOLUME_RECEIVED[0]}t`} label="Volume reçu Année 1" color={C.accent} />
              <StatCard icon={DollarSign} value={`${dyn.totalCA[0]}M`} label="CA Année 1 (Fcfa)" color={C.gold} />
              <StatCard icon={Handshake} value="29/30" label="Ratio vente/promo" color={C.accentDark} />
              <StatCard icon={TrendingUp} value="+80%" label="Augmentation rendements" color={C.success} />
            </div>
            {/* ─── Price Selector (Hero compact) ─── */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign size={16} className="text-white/50" />
                <span className="text-white/50 text-xs font-medium uppercase tracking-wider">Scénario tarifaire — Prix 1 kg</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRICE_OPTIONS.map((opt, i) => (
                  <button key={i} onClick={() => setPriceIdx(i)}
                    className={`group relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${priceIdx === i ? 'text-white shadow-lg scale-105' : 'text-white/50 hover:text-white/80 border border-white/15 hover:border-white/30 hover:scale-102'}`}
                    style={priceIdx === i ? { backgroundColor: opt.color, boxShadow: `0 4px 20px ${opt.color}40` } : {}}
                  >
                    {i === 1 && priceIdx !== i && (
                      <span className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: opt.color }}>★</span>
                    )}
                    <span className="mr-1.5">{opt.label}</span>
                    <span className="font-bold">{opt.price.toLocaleString('fr-FR')} F</span>
                  </button>
                ))}
              </div>
            </div>
            {/* ─── Loan Selector (Hero compact) ─── */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <PiggyBank size={16} className="text-white/50" />
                <span className="text-white/50 text-xs font-medium uppercase tracking-wider">Scénario de financement — Prêt à taux zéro</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {LOAN_OPTIONS.map((opt, i) => (
                  <button key={i} onClick={() => setLoanIdx(i)}
                    className={`group relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${loanIdx === i ? 'text-white shadow-lg scale-105' : 'text-white/50 hover:text-white/80 border border-white/15 hover:border-white/30 hover:scale-102'}`}
                    style={loanIdx === i ? { backgroundColor: opt.color, boxShadow: `0 4px 20px ${opt.color}40` } : {}}
                  >
                    {opt.amount > 0 && loanIdx !== i && (
                      <span className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: opt.color }}>💼</span>
                    )}
                    <span className="mr-1.5">{opt.label}</span>
                    {opt.amount > 0 && <span className="font-bold">{opt.amount}M Fcfa</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="text-base px-8 py-6 border-0 shadow-lg" style={{ backgroundColor: C.accent, color: C.primary }} onClick={() => scrollTo('resume')}>
                Découvrir le Business Plan <ChevronDown className="ml-2" size={18} />
              </Button>
              <a href="/Business_Plan_LIG_Biodynamie_CI.docx" download>
                <Button size="lg" className="text-base px-8 py-6 border-2 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:border-white/60">
                  <Download className="mr-2" size={18} /> Télécharger le DOCX
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <ChevronDown size={28} className="text-white/40" />
        </motion.div>
      </section>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">

          {/* ═══════ RÉSUMÉ EXÉCUTIF ═══════ */}
          <AnimatedSection id="resume">
            <SectionHeader icon={Target} title="Résumé Exécutif" subtitle="Synthèse du projet CAPS Biodynamie" />
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: C.primary }}>Le Projet</h3>
                  <p className="leading-relaxed mb-4" style={{ color: C.text }}>
                    CAPS Biodynamie s&apos;implante en Côte d&apos;Ivoire pour y déployer
                    la révolution agricole biodynamique africaine à travers la distribution et la commercialisation du
                    biofertilisant <strong>&quot;Biodynamie&quot;</strong>, produit par le Centre LIG (Congo) et distribué exclusivement par CAPS en Côte d&apos;Ivoire.
                  </p>
                  <p className="leading-relaxed" style={{ color: C.text }}>
                    Ce biofertilisant 100% naturel, issu de plus de 20 ans de R&D, promet une augmentation des
                    rendements allant jusqu&apos;à <strong>+80%</strong>, tout en divisant les coûts d&apos;intrants par trois
                    et en régénérant la santé des sols — zéro produit chimique, zéro dépendance étrangère.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: C.primary }}>Objectifs Clés</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Commercialiser 29 tonnes de Biodynamie', sub: 'Juin 2026 – Sept 2026', pct: 100, color: C.accent },
                      { label: 'Former 500 agriculteurs ivoiriens', sub: 'Programme "1 tonne test"', pct: 85, color: C.gold },
                      { label: 'Obtenir 3–5 partenariats majeurs', sub: 'PALMCI, SIFCA, CNRA, FIRCA', pct: 70, color: C.accentDark },
                      { label: 'Leader fertilisants écologiques Afrique de l\'Ouest', sub: 'Objectif 2028', pct: 60, color: C.success },
                    ].map((obj, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium" style={{ color: C.text }}>{obj.label}</span>
                        </div>
                        <Progress value={obj.pct} className="h-2" style={{ '--progress-color': obj.color } as any} />
                        <span className="text-xs" style={{ color: C.muted }}>{obj.sub}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { icon: DollarSign, value: '5M', label: 'Fcfa Budget Marketing', color: C.accent },
                { icon: Sprout, value: '25%', label: 'PIB Agricole CI', color: C.gold },
                { icon: Microscope, value: '20+', label: 'Années de R&D', color: C.accentDark },
                { icon: Droplets, value: '10j', label: 'Résultats visibles', color: C.success },
              ].map((s, i) => (
                <motion.div key={i} whileHover={{ scale: 1.03 }} className="p-5 rounded-2xl text-center" style={{ backgroundColor: `${s.color}10` }}>
                  <s.icon size={28} className="mx-auto mb-2" style={{ color: s.color }} />
                  <p className="text-2xl font-bold" style={{ color: C.primary }}>{s.value}</p>
                  <p className="text-xs" style={{ color: C.muted }}>{s.label}</p>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>

          {/* ═══════ PRÉSENTATION DU PROJET ═══════ */}
          <AnimatedSection id="projet">
            <SectionHeader icon={Sprout} title="Présentation du Projet" subtitle="Vision, Mission et Partenaire" />
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                { title: 'Vision', desc: 'Faire de la Côte d\'Ivoire le fer de lance d\'une Afrique qui nourrit l\'Afrique, grâce à une agriculture durable, rentable et souveraine.', icon: Lightbulb, color: C.accent },
                { title: 'Mission', desc: 'Distribuer et diffuser les solutions biofertilisantes écologiques et performantes du Centre LIG, accessibles à tous les acteurs agricoles ivoiriens et ouest-africains.', icon: Target, color: C.gold },
                { title: 'Valeurs', desc: 'Nature • Science • Résultats • Afrique — Un ADN ancré dans le respect de la terre et la performance agricole prouvée.', icon: Award, color: C.accentDark },
              ].map((item, i) => (
                <motion.div key={i} whileHover={{ y: -4 }}>
                  <Card className="border-0 shadow-md h-full">
                    <CardContent className="p-6">
                      <div className="p-3 rounded-xl w-fit mb-4" style={{ backgroundColor: `${item.color}15` }}>
                        <item.icon size={24} style={{ color: item.color }} />
                      </div>
                      <h3 className="text-xl font-semibold mb-3" style={{ color: C.primary }}>{item.title}</h3>
                      <p className="leading-relaxed" style={{ color: C.text }}>{item.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4" style={{ color: C.primary }}>Structure du Projet : LIG (Congo) × CAPS (Côte d&apos;Ivoire)</h3>
                <p className="leading-relaxed mb-4" style={{ color: C.text }}>
                  <strong>LIG (Centre LIG, Congo)</strong> est le fournisseur et partenaire R&D qui conçoit et produit le biofertilisant Biodynamie.
                  <strong>CAPS (Comptoir Agropastoral CI)</strong> est le distributeur exclusif en Côte d&apos;Ivoire, assurant la commercialisation,
                  la logistique, les relations institutionnelles et le suivi terrain.
                </p>
                <div className="flex flex-wrap gap-4 text-sm" style={{ color: C.muted }}>
                  <div className="flex items-center gap-2"><Phone size={14} /> +225 0707884587 / 0586994662</div>
                  <div className="flex items-center gap-2"><Mail size={14} /> info@biodynamie.ci</div>
                  <div className="flex items-center gap-2"><Globe size={14} /> www.biodynamie.ci</div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* ═══════ ANALYSE DU MARCHÉ ═══════ */}
          <AnimatedSection id="marche">
            <SectionHeader icon={TrendingUp} title="Analyse du Marché" subtitle="Environnement, SWOT et Concurrence" />
            <Card className="border-0 shadow-md mb-8">
              <CardHeader><CardTitle style={{ color: C.primary }}>Analyse PESTEL — Côte d&apos;Ivoire</CardTitle></CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { letter: 'P', label: 'Politique', items: ['Volonté gouvernementale d\'innovation verte', 'Stabilité macropolitique favorable', 'PNIA II et PNDAD'], color: '#2A7A65' },
                    { letter: 'E', label: 'Économique', items: ['Agriculture = 25% du PIB', 'Forte dépendance aux importations d\'engrais', 'Coût élevé des intrants chimiques'], color: '#3DDBB5' },
                    { letter: 'S', label: 'Socioculturel', items: ['Tradition agricole profonde', 'Résistance au changement', 'Jeunesse agricole croissante'], color: '#F3A847' },
                    { letter: 'T', label: 'Technologique', items: ['R&D Centre LIG (Congo) +20 ans', 'Adaptation aux sols tropicaux', 'Innovation zero nourrissage piscicole'], color: '#D4875A' },
                    { letter: 'E', label: 'Environnemental', items: ['Dégradation des sols par engrais chimiques', 'Changement climatique', 'Demande mondiale de bio'], color: '#5B8DB8' },
                    { letter: 'L', label: 'Légal', items: ['Loi n°2015-537 modernisation agricole', 'Stratégie Bio 2030', 'Normes certifications agricoles'], color: '#8B7E5A' },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-xl" style={{ backgroundColor: `${item.color}08`, borderLeft: `3px solid ${item.color}` }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: item.color }}>{item.letter}</span>
                        <span className="font-semibold text-sm" style={{ color: C.primary }}>{item.label}</span>
                      </div>
                      <ul className="space-y-1">
                        {item.items.map((it, j) => (
                          <li key={j} className="text-xs flex items-start gap-1.5" style={{ color: C.text }}>
                            <CheckCircle2 size={12} className="mt-0.5 shrink-0" style={{ color: item.color }} />{it}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md mb-8">
              <CardHeader><CardTitle style={{ color: C.primary }}>Analyse SWOT</CardTitle></CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { title: 'Forces', items: swotData.forces, color: C.success, bg: `${C.success}08` },
                    { title: 'Faiblesses', items: swotData.faiblesses, color: C.warning, bg: `${C.warning}08` },
                    { title: 'Opportunités', items: swotData.opportunites, color: C.info, bg: `${C.info}08` },
                    { title: 'Menaces', items: swotData.menaces, color: C.danger, bg: `${C.danger}08` },
                  ].map((quad, i) => (
                    <div key={i} className="p-5 rounded-xl" style={{ backgroundColor: quad.bg, borderLeft: `4px solid ${quad.color}` }}>
                      <h4 className="font-semibold mb-3 text-base" style={{ color: quad.color }}>{quad.title}</h4>
                      <ul className="space-y-2">
                        {quad.items.map((it, j) => (
                          <li key={j} className="text-sm flex items-start gap-2" style={{ color: C.text }}>
                            <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: quad.color }} />{it}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardHeader><CardTitle style={{ color: C.primary }}>Biodynamie vs Engrais Chimiques</CardTitle></CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#E0E0E0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: C.muted }} />
                      <PolarRadiusAxis tick={{ fontSize: 10 }} />
                      <Radar name="Biodynamie" dataKey="A" stroke={C.accent} fill={C.accent} fillOpacity={0.3} />
                      <Radar name="Engrais chimiques" dataKey="B" stroke={C.gold} fill={C.gold} fillOpacity={0.15} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* ═══════ PRODUIT ═══════ */}
          <AnimatedSection id="produit">
            <SectionHeader icon={Leaf} title="Produit & Innovation" subtitle="Le biofertilisant Biodynamie" />
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4" style={{ color: C.primary }}>Description du Produit</h3>
                  <p className="leading-relaxed mb-4" style={{ color: C.text }}>
                    Biodynamie est un biofertilisant 100% naturel et écologique, issu de plus de 20 ans de recherche
                    et développement. Sa formule unique, basée sur les rejets piscicoles d&apos;un système à zéro nourrissage,
                    est parfaitement adaptée aux cultures et sols tropicaux.
                  </p>
                  <div className="space-y-3">
                    {[
                      { icon: CheckCircle2, text: 'Zéro chimie, 100% biodégradable et non toxique', color: C.success },
                      { icon: Zap, text: 'Action rapide visible sous 10 jours', color: C.accent },
                      { icon: Leaf, text: 'Compatible avec toutes les cultures tropicales', color: C.accentDark },
                      { icon: Microscope, text: 'Régénère la vie microbienne et structure du sol', color: C.info },
                      { icon: Droplets, text: 'pH neutre (7,5), compatible tous types de sols', color: C.gold },
                    ].map((av, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <av.icon size={18} style={{ color: av.color }} />
                        <span className="text-sm" style={{ color: C.text }}>{av.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4" style={{ color: C.primary }}>Gamme de Produits</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Pack Standard', weight: '500 g', price: Math.round(dyn.pricePer500g * 0.6).toLocaleString('fr-FR'), stdPrice: dyn.pricePer500g.toLocaleString('fr-FR'), target: 'Maraîchers, coopératives, exploitants', color: C.accent },
                      { name: 'Pack Pro', weight: '1 kg', price: Math.round(dyn.pricePerKg * 0.6).toLocaleString('fr-FR'), stdPrice: dyn.pricePerKg.toLocaleString('fr-FR'), target: 'Agro-industries, grandes exploitations, R&D', color: C.accentDark },
                    ].map((pack, i) => (
                      <motion.div key={i} whileHover={{ scale: 1.01 }} className="p-4 rounded-xl border" style={{ borderColor: `${pack.color}30`, backgroundColor: `${pack.color}08` }}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold" style={{ color: C.primary }}>{pack.name}</h4>
                            <p className="text-sm" style={{ color: C.muted }}>{pack.weight} — {pack.target}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg" style={{ color: pack.color }}>{pack.price} Fcfa</p>
                            <p className="text-xs line-through" style={{ color: C.muted }}>{pack.stdPrice} Fcfa</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xs mt-4" style={{ color: C.muted }}>
                    * Prix de lancement (10 juin 2026 – 30 sept 2026). Réduction -20% pour commandes groupées.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* ─── CARTE DE CHOIX DES TARIFS ─── */}
            <Card className="border-0 shadow-lg overflow-hidden mt-8">
              <div className="relative">
                {/* Header bar */}
                <div className="px-6 pt-6 pb-4" style={{ background: `linear-gradient(135deg, ${C.primary} 0%, ${C.accentDark} 100%)` }}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                      <DollarSign size={22} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Choix du Tarif</h3>
                      <p className="text-sm text-white/60">Sélectionnez un scénario tarifaire — toutes les données du BU s&apos;ajustent automatiquement</p>
                    </div>
                  </div>
                </div>

                {/* Tier cards */}
                <div className="p-6 grid md:grid-cols-3 gap-5" style={{ backgroundColor: `${C.surface}` }}>
                  {PRICE_OPTIONS.map((opt, i) => {
                    const isSelected = priceIdx === i
                    const preview = TIER_PREVIEWS[i]
                    const metrics = [
                      { label: 'CA Année 1', value: `${preview.caY1}M`, icon: TrendingUp },
                      { label: 'Seuil rentabilité', value: `${preview.seuil}M`, icon: Target },
                      { label: 'Marge brute A3', value: `${preview.mbPctY3}%`, icon: Percent },
                      { label: 'Résultat net A3', value: `${preview.rnY3 > 0 ? '+' : ''}${preview.rnY3}M`, icon: preview.rnY3 >= 0 ? ArrowUpRight : AlertTriangle },
                    ]
                    return (
                      <motion.div
                        key={i}
                        whileHover={{ y: -4, boxShadow: isSelected ? `0 12px 40px ${opt.color}30` : '0 8px 30px rgba(0,0,0,0.08)' }}
                        onClick={() => setPriceIdx(i)}
                        className={`relative cursor-pointer rounded-2xl transition-all duration-300 overflow-hidden ${isSelected ? 'ring-2 shadow-xl' : 'shadow-md'}`}
                        style={{
                          backgroundColor: isSelected ? `${opt.color}06` : C.white,
                          ringColor: opt.color,
                          border: isSelected ? `2px solid ${opt.color}` : `2px solid ${opt.color}20`,
                        }}
                      >
                        {/* Recommended badge */}
                        {i === 1 && (
                          <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-[10px] font-bold text-white tracking-wider uppercase" style={{ backgroundColor: opt.color }}>
                            Recommandé
                          </div>
                        )}

                        {/* Selected checkmark */}
                        {isSelected && (
                          <div className="absolute top-3 left-3">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: opt.color }}>
                              <CheckCircle2 size={14} className="text-white" />
                            </div>
                          </div>
                        )}

                        <div className="p-5 pt-6">
                          {/* Tier name */}
                          <div className="text-center mb-4">
                            <h4 className="text-lg font-bold mb-1" style={{ color: opt.color }}>{opt.label}</h4>
                            <div className="w-12 h-0.5 mx-auto rounded-full" style={{ backgroundColor: opt.color }} />
                          </div>

                          {/* Price display */}
                          <div className="text-center mb-5">
                            <div className="flex items-baseline justify-center gap-1">
                              <span className="text-3xl font-bold" style={{ color: C.primary }}>{opt.price.toLocaleString('fr-FR')}</span>
                              <span className="text-sm font-medium" style={{ color: C.muted }}>Fcfa</span>
                            </div>
                            <p className="text-xs mt-1" style={{ color: C.muted }}>par kg</p>
                            <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs" style={{ backgroundColor: `${opt.color}10`, color: opt.color }}>
                              <span>{(opt.price / 2).toLocaleString('fr-FR')} Fcfa / 500g</span>
                            </div>
                          </div>

                          {/* Divider */}
                          <div className="h-px mb-4" style={{ backgroundColor: `${opt.color}20` }} />

                          {/* Key metrics */}
                          <div className="space-y-2.5">
                            {metrics.map((m, mi) => (
                              <div key={mi} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <m.icon size={13} style={{ color: C.muted }} />
                                  <span className="text-xs" style={{ color: C.muted }}>{m.label}</span>
                                </div>
                                <span className="text-xs font-bold" style={{ color: typeof m.value === 'string' && m.value.startsWith('+') ? C.success : m.value.startsWith('-') ? C.danger : C.primary }}>
                                  {m.value}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Select button */}
                          <button
                            className={`w-full mt-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isSelected ? 'text-white shadow-md' : 'border-2 hover:shadow-sm'}`}
                            style={isSelected
                              ? { backgroundColor: opt.color, boxShadow: `0 4px 15px ${opt.color}30` }
                              : { borderColor: `${opt.color}40`, color: opt.color, backgroundColor: 'transparent' }
                            }
                          >
                            {isSelected ? '✓ Scénario actif' : 'Choisir ce scénario'}
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Footer note */}
                <div className="px-6 py-3 flex items-center gap-2 border-t" style={{ backgroundColor: C.white, borderColor: `${C.accent}15` }}>
                  <Info size={14} style={{ color: C.muted }} />
                  <p className="text-xs" style={{ color: C.muted }}>
                    CA = Volume vendu (29t/77t/145t) × Prix/kg. Les coûts variables sont basés sur le volume reçu (30t/80t/150t). Le choix du tarif modifie le CA, la marge brute, le Compte de Résultat, le Bilan, les Ratios, la VAN/TRI et l&apos;analyse de sensibilité.
                  </p>
                </div>
              </div>
            </Card>

            {/* ─── Loan Scenario Card ─── */}
            <Card className="border-0 shadow-lg overflow-hidden mt-8">
              <div className="rounded-2xl overflow-hidden">
                {/* Header bar */}
                <div className="px-6 pt-6 pb-4" style={{ background: `linear-gradient(135deg, ${C.primary} 0%, #8B5CF6 100%)` }}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                      <PiggyBank size={22} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Scénario de Financement</h3>
                      <p className="text-sm text-white/60">Simulez l&apos;impact d&apos;un prêt à taux zéro sur votre business plan</p>
                    </div>
                  </div>
                </div>

                {/* Loan option cards */}
                <div className="p-6 grid md:grid-cols-3 gap-5" style={{ backgroundColor: C.surface }}>
                  {LOAN_OPTIONS.map((opt, i) => {
                    const isSelected = loanIdx === i
                    const loanAmount = opt.amount
                    const mensualite = Math.round(loanAmount / 3 * 10) / 10
                    const metrics = loanAmount > 0 ? [
                      { label: 'Taux d\'intérêt', value: '0%', icon: Percent },
                      { label: 'Coût total du prêt', value: `${loanAmount}M`, icon: DollarSign },
                      { label: 'Mensualité (×3)', value: `${mensualite}M`, icon: Wallet },
                      { label: 'Début remboursement', value: 'Oct 2026', icon: Clock },
                    ] : [
                      { label: 'Autofinancement', value: '100%', icon: Shield },
                      { label: 'Charges financières', value: 'Base', icon: Wallet },
                      { label: 'Dettes financières', value: 'Base', icon: DollarSign },
                      { label: 'Impact sur RN', value: 'Aucun', icon: TrendingUp },
                    ]
                    return (
                      <motion.div
                        key={i}
                        whileHover={{ y: -4, boxShadow: isSelected ? `0 12px 40px ${opt.color}30` : '0 8px 30px rgba(0,0,0,0.08)' }}
                        onClick={() => setLoanIdx(i)}
                        className={`relative cursor-pointer rounded-2xl transition-all duration-300 overflow-hidden ${isSelected ? 'ring-2 shadow-xl' : 'shadow-md'}`}
                        style={{
                          backgroundColor: isSelected ? `${opt.color}06` : C.white,
                          ringColor: opt.color,
                          border: isSelected ? `2px solid ${opt.color}` : `2px solid ${opt.color}20`,
                        }}
                      >
                        {/* Selected checkmark */}
                        {isSelected && (
                          <div className="absolute top-3 left-3">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: opt.color }}>
                              <CheckCircle2 size={14} className="text-white" />
                            </div>
                          </div>
                        )}

                        <div className="p-5 pt-6">
                          {/* Option name */}
                          <div className="text-center mb-4">
                            <h4 className="text-lg font-bold mb-1" style={{ color: opt.color }}>{opt.label}</h4>
                            <div className="w-12 h-0.5 mx-auto rounded-full" style={{ backgroundColor: opt.color }} />
                          </div>

                          {/* Amount display */}
                          <div className="text-center mb-5">
                            {loanAmount > 0 ? (
                              <>
                                <div className="flex items-baseline justify-center gap-1">
                                  <span className="text-3xl font-bold" style={{ color: C.primary }}>{loanAmount}</span>
                                  <span className="text-sm font-medium" style={{ color: C.muted }}>M Fcfa</span>
                                </div>
                                <p className="text-xs mt-1" style={{ color: C.muted }}>capital emprunté — taux zéro</p>
                                <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs" style={{ backgroundColor: `${opt.color}10`, color: opt.color }}>
                                  <span>3 mensualités dès Oct 2026</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-baseline justify-center gap-1">
                                  <span className="text-3xl font-bold" style={{ color: C.primary }}>0</span>
                                  <span className="text-sm font-medium" style={{ color: C.muted }}>Fcfa</span>
                                </div>
                                <p className="text-xs mt-1" style={{ color: C.muted }}>Pas de prêt bancaire</p>
                                <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs" style={{ backgroundColor: `${opt.color}10`, color: opt.color }}>
                                  <span>Financement propre uniquement</span>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Divider */}
                          <div className="h-px mb-4" style={{ backgroundColor: `${opt.color}20` }} />

                          {/* Key metrics */}
                          <div className="space-y-2.5">
                            {metrics.map((m, mi) => (
                              <div key={mi} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <m.icon size={13} style={{ color: C.muted }} />
                                  <span className="text-xs" style={{ color: C.muted }}>{m.label}</span>
                                </div>
                                <span className="text-xs font-bold" style={{ color: C.primary }}>{m.value}</span>
                              </div>
                            ))}
                          </div>

                          {/* Select button */}
                          <button
                            className={`w-full mt-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isSelected ? 'text-white shadow-md' : 'border-2 hover:shadow-sm'}`}
                            style={isSelected
                              ? { backgroundColor: opt.color, boxShadow: `0 4px 15px ${opt.color}30` }
                              : { borderColor: `${opt.color}40`, color: opt.color, backgroundColor: 'transparent' }
                            }
                          >
                            {isSelected ? '✓ Scénario actif' : 'Choisir ce scénario'}
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Footer note */}
                <div className="px-6 py-3 flex items-center gap-2 border-t" style={{ backgroundColor: C.white, borderColor: `${C.purple}15` }}>
                  <Info size={14} style={{ color: C.muted }} />
                  <p className="text-xs" style={{ color: C.muted }}>
                    Prêt à taux zéro reçu au T1 de l&apos;Année 1. Remboursement en 3 mensualités égales à partir d&apos;Oct 2026 (A1 T4, A2 T1, A2 T2). Le bilan et les flux de trésorerie s&apos;ajustent automatiquement.
                  </p>
                </div>
              </div>
            </Card>
          </AnimatedSection>

          {/* ═══════ MODÈLE ÉCONOMIQUE ═══════ */}
          <AnimatedSection id="modele">
            <SectionHeader icon={DollarSign} title="Modèle Économique" subtitle="Business Model Canvas" />
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="border-0 shadow-md">
                <CardHeader><CardTitle style={{ color: C.primary }}>Segments de Clientèle</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={revenueMixData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                          {revenueMixData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${value}%`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardHeader><CardTitle style={{ color: C.primary }}>Canaux & Revenus</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2" style={{ color: C.accentDark }}>Canaux de Distribution</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {['Vente directe Centre CAPS Abidjan', 'E-commerce www.biodynamie.ci', 'Coopératives partenaires', 'ANADER (diffusion nationale)', 'Magasins bio / intrants verts', '10 technico-commerciaux'].map((ch, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs" style={{ color: C.text }}>
                          <ChevronRight size={12} style={{ color: C.accent }} />{ch}
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-sm mb-2" style={{ color: C.gold }}>Sources de Revenus</h4>
                    <div className="space-y-2">
                      {[
                        { label: 'Distribution biofertilisant', pct: 70 },
                        { label: 'Formations & accompagnement', pct: 15 },
                        { label: 'Consultation R&D', pct: 10 },
                        { label: 'Certification "Fermes Biodynamiques"', pct: 5 },
                      ].map((rev, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-xs mb-1">
                            <span style={{ color: C.text }}>{rev.label}</span>
                            <span className="font-medium" style={{ color: C.goldDark }}>{rev.pct}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: `${C.gold}20` }}>
                            <div className="h-1.5 rounded-full" style={{ width: `${rev.pct}%`, backgroundColor: C.gold }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ═══════ VOLET MARKETING ULTRA DÉTAILLÉ ═══════ */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <AnimatedSection id="marketing">
            <SectionHeader icon={Megaphone} title="Stratégie Marketing & Commerciale" subtitle="Volet ultra détaillé — Segmentation, Positionnement, Mix, KPIs" color={C.purple} />

            <Tabs defaultValue="personas" className="space-y-6">
              <TabsList className="w-full flex-wrap">
                <TabsTrigger value="personas">Personas</TabsTrigger>
                <TabsTrigger value="funnel">Entonnoir</TabsTrigger>
                <TabsTrigger value="mix4p">Mix 4P</TabsTrigger>
                <TabsTrigger value="canaux">Canaux & Budget</TabsTrigger>
                <TabsTrigger value="kpis">KPIs Marketing</TabsTrigger>
                <TabsTrigger value="calendrier">Calendrier</TabsTrigger>
              </TabsList>

              {/* ─── PERSONAS ─── */}
              <TabsContent value="personas">
                <div className="grid md:grid-cols-2 gap-6">
                  {personas.map((p, i) => (
                    <motion.div key={i} whileHover={{ y: -3 }}>
                      <Card className="border-0 shadow-md h-full overflow-hidden">
                        <div className="h-1.5" style={{ backgroundColor: p.color }} />
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 rounded-xl" style={{ backgroundColor: `${p.color}15` }}>
                              <p.icon size={24} style={{ color: p.color }} />
                            </div>
                            <div>
                              <h4 className="font-bold text-lg" style={{ color: C.primary }}>{p.name}</h4>
                              <p className="text-sm font-medium" style={{ color: p.color }}>{p.role}</p>
                              <p className="text-xs" style={{ color: C.muted }}>{p.org} — {p.age} ans</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="p-3 rounded-lg" style={{ backgroundColor: `${C.danger}08` }}>
                              <p className="text-xs font-semibold mb-1" style={{ color: C.danger }}>Douleur</p>
                              <p className="text-sm" style={{ color: C.text }}>{p.pain}</p>
                            </div>
                            <div className="p-3 rounded-lg" style={{ backgroundColor: `${C.success}08` }}>
                              <p className="text-xs font-semibold mb-1" style={{ color: C.success }}>Objectif</p>
                              <p className="text-sm" style={{ color: C.text }}>{p.goal}</p>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs" style={{ color: C.muted }}>Budget</p>
                                <p className="text-sm font-semibold" style={{ color: p.color }}>{p.budget}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs" style={{ color: C.muted }}>Canal préféré</p>
                                <p className="text-sm font-medium" style={{ color: C.text }}>{p.channel}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* ─── ENTONNOIR DE CONVERSION ─── */}
              <TabsContent value="funnel">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-md">
                    <CardHeader><CardTitle style={{ color: C.primary }}>Entonnoir de Conversion</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {funnelData.map((step, i) => {
                          const widths = [100, 80, 60, 40, 25]
                          const dropOff = i > 0 ? ((funnelData[i - 1].value - step.value) / funnelData[i - 1].value * 100).toFixed(0) : null
                          return (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                              {/* Funnel bar - centered, trapezoid shape */}
                              <div className="flex justify-center">
                                <div
                                  className="rounded-xl px-5 py-3 transition-all duration-300 hover:scale-[1.02]"
                                  style={{
                                    width: `${widths[i]}%`,
                                    backgroundColor: `${step.color}18`,
                                    borderLeft: `4px solid ${step.color}`,
                                    borderTop: `1px solid ${step.color}30`,
                                    borderRight: `1px solid ${step.color}30`,
                                    borderBottom: `1px solid ${step.color}30`,
                                  }}
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white shrink-0" style={{ backgroundColor: step.color }}>{i + 1}</span>
                                      <span className="text-sm font-semibold truncate" style={{ color: step.color }}>{step.step}</span>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                      <span className="text-sm font-bold" style={{ color: step.color }}>{fmt(step.value)}</span>
                                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${step.color}20`, color: step.color }}>{step.pct}%</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {/* Drop-off indicator between steps */}
                              {i < funnelData.length - 1 && (
                                <div className="flex justify-center py-1">
                                  <div className="flex items-center gap-2 text-xs" style={{ color: C.muted }}>
                                    <div className="w-px h-3" style={{ backgroundColor: `${C.muted}40` }} />
                                    <span className="italic">-{dropOff}% d&apos;abandon</span>
                                    <ChevronDown className="w-3 h-3" />
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )
                        })}
                      </div>
                      <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: `${C.accent}08`, border: `1px solid ${C.accent}20` }}>
                        <h4 className="font-semibold text-sm mb-2" style={{ color: C.accentDark }}>Taux de conversion global</h4>
                        <div className="flex items-center gap-4">
                          <p className="text-3xl font-bold" style={{ color: C.accent }}>0.5%</p>
                          <p className="text-sm" style={{ color: C.muted }}>de la population ciblée → achat (500 clients sur 100K touchés)</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-md">
                    <CardHeader><CardTitle style={{ color: C.primary }}>CAC / LTV Analysis</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl" style={{ backgroundColor: `${C.accentDark}08`, borderLeft: `4px solid ${C.accentDark}` }}>
                          <h4 className="font-semibold text-sm mb-1" style={{ color: C.accentDark }}>CAC (Coût d&apos;Acquisition Client)</h4>
                          <p className="text-3xl font-bold" style={{ color: C.accentDark }}>25 000 <span className="text-base font-normal">Fcfa</span></p>
                          <p className="text-xs mt-1" style={{ color: C.muted }}>Budget marketing (5M) / 500 nouveaux clients prévus Année 1</p>
                          <div className="grid grid-cols-3 gap-2 mt-3">
                            <div className="text-center p-2 rounded-lg bg-white/60">
                              <p className="text-xs" style={{ color: C.muted }}>A1</p>
                              <p className="text-sm font-bold" style={{ color: C.danger }}>25 000 F</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-white/60">
                              <p className="text-xs" style={{ color: C.muted }}>A2</p>
                              <p className="text-sm font-bold" style={{ color: C.gold }}>18 000 F</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-white/60">
                              <p className="text-xs" style={{ color: C.muted }}>A3</p>
                              <p className="text-sm font-bold" style={{ color: C.success }}>12 000 F</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl" style={{ backgroundColor: `${C.success}08`, borderLeft: `4px solid ${C.success}` }}>
                          <h4 className="font-semibold text-sm mb-1" style={{ color: C.success }}>LTV (Vie Client Moyenne)</h4>
                          <p className="text-3xl font-bold" style={{ color: C.success }}>120 000 <span className="text-base font-normal">Fcfa</span></p>
                          <p className="text-xs mt-1" style={{ color: C.muted }}>Panier moyen (80K) × taux réachat (40%) × durée client (3.75 ans)</p>
                          <div className="grid grid-cols-3 gap-2 mt-3">
                            <div className="text-center p-2 rounded-lg bg-white/60">
                              <p className="text-xs" style={{ color: C.muted }}>A1</p>
                              <p className="text-sm font-bold" style={{ color: C.muted }}>120K F</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-white/60">
                              <p className="text-xs" style={{ color: C.muted }}>A2</p>
                              <p className="text-sm font-bold" style={{ color: C.gold }}>350K F</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-white/60">
                              <p className="text-xs" style={{ color: C.muted }}>A3</p>
                              <p className="text-sm font-bold" style={{ color: C.success }}>600K F</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl text-center" style={{ backgroundColor: `${C.accent}10` }}>
                          <p className="text-xs font-medium mb-1" style={{ color: C.muted }}>Ratio LTV / CAC (Année 1)</p>
                          <p className="text-4xl font-bold" style={{ color: C.accent }}>4.8x</p>
                          <p className="text-xs mt-1" style={{ color: C.success }}>Ratio sain : au-dessus de 3x = modèle viable</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* ─── MIX 4P ─── */}
              <TabsContent value="mix4p">
                <div className="grid md:grid-cols-2 gap-6">
                  {mix4P.map((p, i) => (
                    <motion.div key={i} whileHover={{ y: -3 }}>
                      <Card className="border-0 shadow-md h-full overflow-hidden">
                        <div className="h-1.5" style={{ backgroundColor: p.color }} />
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${p.color}15` }}>
                              <p.icon size={22} style={{ color: p.color }} />
                            </div>
                            <h4 className="text-xl font-bold" style={{ color: p.color }}>{p.P}</h4>
                          </div>
                          <ul className="space-y-2">
                            {p.items.map((item, j) => (
                              <li key={j} className="text-sm flex items-start gap-2" style={{ color: C.text }}>
                                <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: p.color }} />{item}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* ─── CANAUX & BUDGET ─── */}
              <TabsContent value="canaux">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-md">
                    <CardHeader><CardTitle style={{ color: C.primary }}>Budget par Canal (M Fcfa)</CardTitle></CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={channelBudgetData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
                            <XAxis type="number" tick={{ fontSize: 11, fill: C.muted }} />
                            <YAxis type="category" dataKey="canal" width={140} tick={{ fontSize: 11, fill: C.muted }} />
                            <Tooltip formatter={(value: number) => `${value}M Fcfa`} />
                            <Bar dataKey="budget" name="Budget" fill={C.accent} radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-md">
                    <CardHeader><CardTitle style={{ color: C.primary }}>ROI & Performance par Canal</CardTitle></CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr style={{ backgroundColor: `${C.accentDark}10` }}>
                              <th className="text-left p-2.5 font-semibold" style={{ color: C.accentDark }}>Canal</th>
                              <th className="text-right p-2.5 font-semibold" style={{ color: C.accentDark }}>Budget</th>
                              <th className="text-right p-2.5 font-semibold" style={{ color: C.accentDark }}>Leads</th>
                              <th className="text-right p-2.5 font-semibold" style={{ color: C.accentDark }}>Conv.</th>
                              <th className="text-right p-2.5 font-semibold" style={{ color: C.accentDark }}>ROI</th>
                              <th className="text-right p-2.5 font-semibold" style={{ color: C.accentDark }}>CAC</th>
                            </tr>
                          </thead>
                          <tbody>
                            {channelBudgetData.map((ch, i) => (
                              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : `${C.accent}04` }}>
                                <td className="p-2.5 font-medium" style={{ color: C.text }}>{ch.canal}</td>
                                <td className="p-2.5 text-right" style={{ color: C.text }}>{ch.budget}M</td>
                                <td className="p-2.5 text-right" style={{ color: C.text }}>{fmt(ch.leads)}</td>
                                <td className="p-2.5 text-right" style={{ color: C.gold }}>{ch.conversion}%</td>
                                <td className="p-2.5 text-right font-semibold" style={{ color: ch.roi >= 5 ? C.success : ch.roi >= 3 ? C.gold : C.danger }}>{ch.roi}x</td>
                                <td className="p-2.5 text-right" style={{ color: C.text }}>{fmt(ch.cac)} F</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: `${C.accent}08` }}>
                        <p className="text-xs" style={{ color: C.text }}>
                          <strong>Insight :</strong> Les partenariats institutionnels (ANADER, FIRCA) offrent le meilleur ROI (8.5x)
                          grâce à la crédibilité et au taux de conversion élevé (12%). Les formations terrain génèrent le taux de
                          conversion le plus fort (15%) mais sont plus coûteuses en personnel.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* ─── KPIs MARKETING ─── */}
              <TabsContent value="kpis">
                <Card className="border-0 shadow-md mb-6">
                  <CardHeader><CardTitle style={{ color: C.primary }}>Tableau de Bord KPIs Marketing</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ backgroundColor: C.primary }}>
                            <th className="text-left p-3 text-white font-semibold">KPI</th>
                            <th className="text-center p-3 text-white font-semibold">Année 1</th>
                            <th className="text-center p-3 text-white font-semibold">Année 2</th>
                            <th className="text-center p-3 text-white font-semibold">Année 3</th>
                            <th className="text-center p-3 text-white font-semibold">Cible</th>
                            <th className="text-center p-3 text-white font-semibold">Statut A3</th>
                          </tr>
                        </thead>
                        <tbody>
                          {marketingKPIData.map((kpi, i) => (
                            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : `${C.accent}04` }}>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <kpi.icon size={16} style={{ color: kpi.color }} />
                                  <span className="font-medium" style={{ color: C.text }}>{kpi.kpi}</span>
                                </div>
                              </td>
                              <td className="p-3 text-center" style={{ color: C.muted }}>{kpi.an1}</td>
                              <td className="p-3 text-center" style={{ color: C.text }}>{kpi.an2}</td>
                              <td className="p-3 text-center font-semibold" style={{ color: kpi.color }}>{kpi.an3}</td>
                              <td className="p-3 text-center" style={{ color: C.muted }}>{kpi.target}</td>
                              <td className="p-3 text-center">
                                <Badge className="border-0 text-xs" style={{ backgroundColor: `${C.success}15`, color: C.success }}>Atteint</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
                <div className="grid sm:grid-cols-4 gap-4">
                  {[
                    { label: 'CAC Année 1', value: '25 000 F', desc: 'Coût acquisition', icon: UserPlus, color: C.danger },
                    { label: 'LTV Année 3', value: '600 000 F', desc: 'Vie client moyenne', icon: Repeat, color: C.success },
                    { label: 'LTV/CAC (A3)', value: '50x', desc: 'Ratio rentabilité', icon: Scale, color: C.accent },
                    { label: 'NPS Année 3', value: '70', desc: 'Net Promoter Score', icon: Star, color: C.gold },
                  ].map((s, i) => (
                    <motion.div key={i} whileHover={{ scale: 1.03 }} className="p-4 rounded-xl text-center" style={{ backgroundColor: `${s.color}10` }}>
                      <s.icon size={22} className="mx-auto mb-2" style={{ color: s.color }} />
                      <p className="text-xl font-bold" style={{ color: C.primary }}>{s.value}</p>
                      <p className="text-xs" style={{ color: C.muted }}>{s.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* ─── CALENDRIER ÉDITORIAL ─── */}
              <TabsContent value="calendrier">
                <Card className="border-0 shadow-md">
                  <CardHeader><CardTitle style={{ color: C.primary }}>Calendrier Marketing Opérationnel</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ backgroundColor: C.primary }}>
                            <th className="text-left p-3 text-white font-semibold">Période</th>
                            <th className="text-left p-3 text-white font-semibold">Thème</th>
                            <th className="text-left p-3 text-white font-semibold">Actions clés</th>
                            <th className="text-left p-3 text-white font-semibold">Canaux</th>
                            <th className="text-right p-3 text-white font-semibold">Budget</th>
                            <th className="text-left p-3 text-white font-semibold">KPI visé</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contentCalendar.map((row, i) => (
                            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : `${C.accent}04` }}>
                              <td className="p-3 font-medium" style={{ color: C.accentDark }}>{row.periode}</td>
                              <td className="p-3 font-semibold" style={{ color: C.primary }}>{row.theme}</td>
                              <td className="p-3" style={{ color: C.text }}>{row.actions}</td>
                              <td className="p-3" style={{ color: C.muted }}>{row.canaux}</td>
                              <td className="p-3 text-right font-semibold" style={{ color: C.gold }}>{row.budget}</td>
                              <td className="p-3" style={{ color: C.text }}>{row.kpi}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </AnimatedSection>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ═══════ VOLET FINANCIER ULTRA DÉTAILLÉ ═══════ */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <AnimatedSection id="financier">
            <SectionHeader icon={BarChart3} title="Plan Financier Prévisionnel" subtitle="Volet ultra détaillé — Comptes, Ratios, VAN/TRI, Sensibilité" color={C.accentDark} />

            <Tabs defaultValue="resultat" className="space-y-6">
              <TabsList className="w-full flex-wrap">
                <TabsTrigger value="resultat">Compte de Résultat</TabsTrigger>
                <TabsTrigger value="bilan">Bilan</TabsTrigger>
                <TabsTrigger value="tresorerie">Trésorerie</TabsTrigger>
                <TabsTrigger value="ratios">Ratios</TabsTrigger>
                <TabsTrigger value="rentabilite">Rentabilité</TabsTrigger>
                <TabsTrigger value="vantri">VAN / TRI</TabsTrigger>
                <TabsTrigger value="sensibilite">Sensibilité</TabsTrigger>
              </TabsList>

              {/* ─── COMPTE DE RÉSULTAT ─── */}
              <TabsContent value="resultat">
                <div className="grid lg:grid-cols-5 gap-6">
                  <div className="lg:col-span-3">
                    <Card className="border-0 shadow-md">
                      <CardHeader><CardTitle style={{ color: C.primary }}>Compte de Résultat Prévisionnel Détaillé (M Fcfa)</CardTitle></CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="sticky top-0">
                              <tr style={{ backgroundColor: C.primary }}>
                                <th className="text-left p-3 text-white font-semibold">Poste</th>
                                <th className="text-right p-3 text-white font-semibold">Année 1</th>
                                <th className="text-right p-3 text-white font-semibold">Année 2</th>
                                <th className="text-right p-3 text-white font-semibold">Année 3</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dyn.compteResultatData.map((row, i) => (
                                <FinRow key={i} poste={row.poste} a1={row.a1} a2={row.a2} a3={row.a3} bold={row.bold} header={row.header} color={row.color} />
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="border-0 shadow-md">
                      <CardHeader><CardTitle style={{ color: C.primary }}>Évolution CA & Résultat</CardTitle></CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={dyn.financialData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
                              <XAxis dataKey="year" tick={{ fontSize: 10, fill: C.muted }} />
                              <YAxis tick={{ fontSize: 10, fill: C.muted }} />
                              <Tooltip formatter={(value: number) => `${value}M Fcfa`} />
                              <Bar dataKey="CA" name="CA" fill={C.accent} radius={[4, 4, 0, 0]} />
                              <Line type="monotone" dataKey="resultat" name="Résultat net" stroke={C.success} strokeWidth={2} dot={{ r: 4 }} />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-md">
                      <CardContent className="p-6">
                        <h4 className="font-semibold mb-3" style={{ color: C.primary }}>Marge brute par année</h4>
                        <div className="space-y-3">
                          {[
                            { label: 'Année 1', mb: 5.4, ca: 17.4, pct: 31.0 },
                            { label: 'Année 2', mb: 36.0, ca: 64.0, pct: 56.3 },
                            { label: 'Année 3', mb: 90.0, ca: 135.0, pct: 66.7 },
                          ].map((r, i) => (
                            <div key={i}>
                              <div className="flex justify-between text-xs mb-1">
                                <span style={{ color: C.text }}>{r.label}</span>
                                <span className="font-semibold" style={{ color: C.accentDark }}>{r.pct}% ({fmtM(r.mb)})</span>
                              </div>
                              <div className="w-full h-2 rounded-full" style={{ backgroundColor: `${C.accent}20` }}>
                                <div className="h-2 rounded-full transition-all" style={{ width: `${r.pct}%`, backgroundColor: C.accent }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* ─── BILAN ─── */}
              <TabsContent value="bilan">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-md">
                    <CardHeader><CardTitle style={{ color: C.primary }}>Bilan Prévisionnel (M Fcfa)</CardTitle></CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr style={{ backgroundColor: C.primary }}>
                              <th className="text-left p-3 text-white font-semibold">Poste</th>
                              <th className="text-right p-3 text-white font-semibold">Année 1</th>
                              <th className="text-right p-3 text-white font-semibold">Année 2</th>
                              <th className="text-right p-3 text-white font-semibold">Année 3</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dyn.bilanData.map((row, i) => (
                              <FinRow key={i} poste={row.poste} a1={row.a1} a2={row.a2} a3={row.a3} bold={row.bold} header={row.header} />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-md">
                    <CardHeader><CardTitle style={{ color: C.primary }}>Structure du Bilan</CardTitle></CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { year: 'Année 1', 'Immobilisations': 12.0, 'Stocks': 3.0, 'Créances': 2.5, 'Trésorerie': 2.0 },
                            { year: 'Année 2', 'Immobilisations': 10.2, 'Stocks': 8.0, 'Créances': 9.0, 'Trésorerie': 12.0 },
                            { year: 'Année 3', 'Immobilisations': 8.4, 'Stocks': 15.0, 'Créances': 18.0, 'Trésorerie': 45.0 },
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
                            <XAxis dataKey="year" tick={{ fontSize: 11, fill: C.muted }} />
                            <YAxis tick={{ fontSize: 11, fill: C.muted }} />
                            <Tooltip formatter={(value: number) => `${value}M Fcfa`} />
                            <Legend />
                            <Bar dataKey="Immobilisations" stackId="a" fill={C.accentDark} />
                            <Bar dataKey="Stocks" stackId="a" fill={C.gold} />
                            <Bar dataKey="Créances" stackId="a" fill={C.info} />
                            <Bar dataKey="Trésorerie" stackId="a" fill={C.accent} radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        {[
                          { label: 'Solvabilité A1', value: '27.7%', color: C.danger },
                          { label: 'Solvabilité A2', value: '36.7%', color: C.warning },
                          { label: 'Solvabilité A3', value: '68.5%', color: C.success },
                        ].map((s, i) => (
                          <div key={i} className="text-center p-2 rounded-lg" style={{ backgroundColor: `${s.color}08` }}>
                            <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
                            <p className="text-xs" style={{ color: C.muted }}>{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* ─── TRÉSORERIE ─── */}
              <TabsContent value="tresorerie">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-md">
                    <CardHeader><CardTitle style={{ color: C.primary }}>Plan de Trésorerie Année 1 (M Fcfa)</CardTitle></CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={cashFlowData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.muted }} />
                            <YAxis tick={{ fontSize: 11, fill: C.muted }} />
                            <Tooltip formatter={(value: number) => `${value}M Fcfa`} />
                            <Legend />
                            <Area type="monotone" dataKey="encaissements" name="Encaissements" stroke={C.accent} fill={C.accent} fillOpacity={0.2} />
                            <Area type="monotone" dataKey="decaissements" name="Décaissements" stroke={C.danger} fill={C.danger} fillOpacity={0.1} />
                            <Line type="monotone" dataKey="solde" name="Solde cumulé" stroke={C.warning} strokeWidth={2} dot={{ r: 3 }} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-md">
                    <CardHeader><CardTitle style={{ color: C.primary }}>Flux de Trésorerie 3 Ans (M Fcfa)</CardTitle></CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={dyn.cashFlow3YData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
                            <XAxis dataKey="year" tick={{ fontSize: 10, fill: C.muted }} />
                            <YAxis tick={{ fontSize: 10, fill: C.muted }} />
                            <Tooltip formatter={(value: number) => `${value}M Fcfa`} />
                            <Legend />
                            <Bar dataKey="exploitation" name="Exploitation" fill={C.accent} radius={[2, 2, 0, 0]} />
                            <Bar dataKey="investissement" name="Investissement" fill={C.danger} radius={[2, 2, 0, 0]} />
                            <Bar dataKey="financement" name="Financement" fill={C.info} radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: `${C.warning}08` }}>
                        <p className="text-xs" style={{ color: C.text }}>
                          <strong>Besoin en Fonds de Roulement :</strong> Le BFR est négatif en Année 1 (-10.9M) nécessitant
                          un financement initial de 20M Fcfa. Le passage en positif est prévu au T3 de l&apos;Année 2.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* ─── RATIOS ─── */}
              <TabsContent value="ratios">
                <div className="space-y-6">
                  {dyn.ratiosData.map((cat, ci) => (
                    <Card key={ci} className="border-0 shadow-md">
                      <CardHeader>
                        <CardTitle style={{ color: C.primary }}>{cat.category}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr style={{ backgroundColor: `${C.accentDark}10` }}>
                                <th className="text-left p-3 font-semibold" style={{ color: C.accentDark }}>Ratio</th>
                                <th className="text-center p-3 font-semibold" style={{ color: C.accentDark }}>Formule</th>
                                <th className="text-center p-3 font-semibold" style={{ color: C.accentDark }}>Année 1</th>
                                <th className="text-center p-3 font-semibold" style={{ color: C.accentDark }}>Année 2</th>
                                <th className="text-center p-3 font-semibold" style={{ color: C.accentDark }}>Année 3</th>
                                <th className="text-center p-3 font-semibold" style={{ color: C.accentDark }}>Cible</th>
                                <th className="text-center p-3 font-semibold" style={{ color: C.accentDark }}>Statut</th>
                              </tr>
                            </thead>
                            <tbody>
                              {cat.ratios.map((r, ri) => {
                                const statusColor = r.status === 'success' ? C.success : r.status === 'warning' ? C.warning : C.danger
                                const statusLabel = r.status === 'success' ? 'Atteint' : r.status === 'warning' ? 'En progression' : 'Critique'
                                return (
                                  <tr key={ri} style={{ backgroundColor: ri % 2 === 0 ? 'transparent' : `${C.accent}04` }}>
                                    <td className="p-3 font-medium" style={{ color: C.primary }}>{r.name}</td>
                                    <td className="p-3 text-center text-xs" style={{ color: C.muted }}>{r.formula}</td>
                                    <td className="p-3 text-center" style={{ color: String(r.a1).startsWith('-') ? C.danger : C.text }}>{r.a1}</td>
                                    <td className="p-3 text-center" style={{ color: String(r.a2).startsWith('-') ? C.danger : C.text }}>{r.a2}</td>
                                    <td className="p-3 text-center font-semibold" style={{ color: statusColor }}>{r.a3}</td>
                                    <td className="p-3 text-center" style={{ color: C.muted }}>{r.target}</td>
                                    <td className="p-3 text-center">
                                      <Badge className="border-0 text-xs" style={{ backgroundColor: `${statusColor}15`, color: statusColor }}>{statusLabel}</Badge>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* ─── RENTABILITÉ / SEUIL ─── */}
              <TabsContent value="rentabilite">
                <div className="grid lg:grid-cols-2 gap-6 mb-6">
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-8 text-center">
                      <h3 className="text-2xl font-bold mb-2" style={{ color: C.primary }}>Seuil de Rentabilité</h3>
                      <p className="text-5xl font-bold mb-2" style={{ color: C.accent }}>47,6M Fcfa</p>
                      <p className="text-sm mb-6" style={{ color: C.muted }}>Chiffre d&apos;affaires nécessaire pour atteindre l&apos;équilibre</p>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl" style={{ backgroundColor: `${C.danger}08` }}>
                          <p className="text-xs font-medium" style={{ color: C.danger }}>Année 1</p>
                          <p className="text-xl font-bold" style={{ color: C.danger }}>-14,6M</p>
                          <p className="text-xs" style={{ color: C.muted }}>Perte initiale</p>
                        </div>
                        <div className="p-4 rounded-xl" style={{ backgroundColor: `${C.gold}08` }}>
                          <p className="text-xs font-medium" style={{ color: C.gold }}>Année 2</p>
                          <p className="text-xl font-bold" style={{ color: C.gold }}>+9,0M</p>
                          <p className="text-xs" style={{ color: C.muted }}>Seuil franchi</p>
                        </div>
                        <div className="p-4 rounded-xl" style={{ backgroundColor: `${C.success}08` }}>
                          <p className="text-xs font-medium" style={{ color: C.success }}>Année 3</p>
                          <p className="text-xl font-bold" style={{ color: C.success }}>+44,8M</p>
                          <p className="text-xs" style={{ color: C.muted }}>Croissance</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-md">
                    <CardHeader><CardTitle style={{ color: C.primary }}>Point Mort Graphique</CardTitle></CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={dyn.breakevenData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
                            <XAxis dataKey="ca" tick={{ fontSize: 10, fill: C.muted }} label={{ value: 'CA (M Fcfa)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10, fill: C.muted }} />
                            <Tooltip formatter={(value: number, name: string) => [`${value}M Fcfa`, name]} />
                            <Legend />
                            <Line type="monotone" dataKey="coutsTotal" name="Coûts totaux" stroke={C.danger} strokeWidth={2} dot={false} />
                            <Line type="linear" dataKey="ca" name="CA" stroke={C.accent} strokeWidth={2} dot={false} strokeDasharray="5 5" />
                            <Area type="monotone" dataKey="profit" name="Profit" stroke={C.success} fill={C.success} fillOpacity={0.15} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Card className="border-0 shadow-md">
                  <CardHeader><CardTitle style={{ color: C.primary }}>Détail du Calcul du Seuil de Rentabilité</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Charges fixes annuelles', value: `${fmt(Math.abs(dyn.fixedCosts ? dyn.fixedCosts[0] : -4.6))}M Fcfa`, icon: Wallet, color: C.accentDark },
                        { label: 'Taux de marge sur coût variable', value: `${dyn.mbPct ? dyn.mbPct[0] : 31.0}%`, icon: Percent, color: C.accent },
                        { label: 'Seuil de rentabilité (CA)', value: `${dyn.seuil || 14.8}M Fcfa`, icon: Target, color: C.gold },
                        { label: 'Mois d\'atteinte du seuil', value: dyn.seuil && dyn.totalCA ? (dyn.seuil / (dyn.totalCA[0] / 12) <= 12 ? `Mois ${Math.ceil(dyn.seuil / (dyn.totalCA[0] / 12))} (A1)` : `Mois ${Math.ceil(dyn.seuil / (dyn.totalCA[0] / 12))} (Fév A2)`) : 'Mois 11 (Nov A1)', icon: Clock, color: C.success },
                      ].map((d, i) => (
                        <div key={i} className="p-4 rounded-xl" style={{ backgroundColor: `${d.color}08`, borderLeft: `3px solid ${d.color}` }}>
                          <d.icon size={20} className="mb-2" style={{ color: d.color }} />
                          <p className="text-xs" style={{ color: C.muted }}>{d.label}</p>
                          <p className="text-lg font-bold" style={{ color: d.color }}>{d.value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ─── VAN / TRI ─── */}
              <TabsContent value="vantri">
                <div className="grid lg:grid-cols-2 gap-6 mb-6">
                  <Card className="border-0 shadow-md">
                    <CardHeader><CardTitle style={{ color: C.primary }}>VAN & TRI par Scénario</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dyn.vanTriData.map((s, i) => (
                          <motion.div key={i} whileHover={{ x: 4 }} className="p-5 rounded-xl" style={{ backgroundColor: `${s.color}08`, borderLeft: `4px solid ${s.color}` }}>
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-lg font-bold" style={{ color: s.color }}>{s.scenario}</h4>
                              <Badge className="border-0" style={{ backgroundColor: `${s.color}15`, color: s.color }}>Taux {s.taux}</Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="text-center">
                                <p className="text-xs" style={{ color: C.muted }}>VAN</p>
                                <p className="text-xl font-bold" style={{ color: s.color }}>{fmtM(s.van)}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs" style={{ color: C.muted }}>TRI</p>
                                <p className="text-xl font-bold" style={{ color: s.color }}>{s.tri}%</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs" style={{ color: C.muted }}>Délai récup. (mois)</p>
                                <p className="text-xl font-bold" style={{ color: s.color }}>{s.delai}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-md">
                    <CardHeader><CardTitle style={{ color: C.primary }}>Cash-flows Actualisés (Scénario Base, 10%)</CardTitle></CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { year: 'A1', flux: -14.6, actualise: -13.3 },
                            { year: 'A2', flux: 9.0, actualise: 7.4 },
                            { year: 'A3', flux: 44.8, actualise: 33.7 },
                            { year: 'A4 (proj.)', flux: 55.0, actualise: 37.6 },
                            { year: 'A5 (proj.)', flux: 65.0, actualise: 40.4 },
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
                            <XAxis dataKey="year" tick={{ fontSize: 11, fill: C.muted }} />
                            <YAxis tick={{ fontSize: 11, fill: C.muted }} />
                            <Tooltip formatter={(value: number) => `${value}M Fcfa`} />
                            <Legend />
                            <Bar dataKey="flux" name="Flux nominal" fill={C.accent} radius={[2, 2, 0, 0]} />
                            <Bar dataKey="actualise" name="Flux actualisé" fill={C.gold} radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: `${C.accent}08` }}>
                        <p className="text-sm" style={{ color: C.text }}>
                          <strong>VAN cumulée (5 ans) :</strong> <span style={{ color: C.success, fontWeight: 'bold' }}>+105.8M Fcfa</span>
                          — Le projet crée de la valeur dès l&apos;Année 2. Le TRI de 34.5% est bien au-dessus du coût du capital (10%),
                          confirmant la viabilité financière du projet.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* ─── ANALYSE DE SENSIBILITÉ ─── */}
              <TabsContent value="sensibilite">
                <Card className="border-0 shadow-md mb-6">
                  <CardHeader><CardTitle style={{ color: C.primary }}>Analyse de Sensibilité — Impact sur la Rentabilité</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ backgroundColor: C.primary }}>
                            <th className="text-left p-3 text-white font-semibold">Variation de paramètre</th>
                            <th className="text-right p-3 text-white font-semibold">Impact CA (M Fcfa)</th>
                            <th className="text-right p-3 text-white font-semibold">Impact RN (M Fcfa)</th>
                            <th className="text-right p-3 text-white font-semibold">Impact TRI</th>
                            <th className="text-center p-3 text-white font-semibold">Niveau de risque</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dyn.sensitivityData.map((row, i) => {
                            const riskColor = row.risque === 'Critique' ? C.danger : row.risque === 'Élevé' ? C.warning : row.risque === 'Moyen' ? C.gold : row.risque === 'Opportunité' ? C.success : C.info
                            return (
                              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : `${C.accent}04` }}>
                                <td className="p-3 font-medium" style={{ color: C.primary }}>{row.param}</td>
                                <td className="p-3 text-right" style={{ color: row.impactCA < 0 ? C.danger : row.impactCA > 0 ? C.success : C.muted }}>
                                  {row.impactCA > 0 ? '+' : ''}{row.impactCA === 0 ? '—' : fmtM(row.impactCA)}
                                </td>
                                <td className="p-3 text-right" style={{ color: row.impactRN < 0 ? C.danger : row.impactRN > 0 ? C.success : C.muted }}>
                                  {row.impactRN > 0 ? '+' : ''}{row.impactRN === 0 ? '—' : fmtM(row.impactRN)}
                                </td>
                                <td className="p-3 text-right font-semibold" style={{ color: row.impactTRI < 0 ? C.danger : C.success }}>
                                  {row.impactTRI > 0 ? '+' : ''}{row.impactTRI} pts
                                </td>
                                <td className="p-3 text-center">
                                  <Badge className="border-0 text-xs" style={{ backgroundColor: `${riskColor}15`, color: riskColor }}>{row.risque}</Badge>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-5 text-center">
                      <AlertTriangle size={28} className="mx-auto mb-3" style={{ color: C.danger }} />
                      <h4 className="font-bold mb-2" style={{ color: C.danger }}>Risque Critique</h4>
                      <p className="text-sm" style={{ color: C.text }}>Taux de conversion -50% : impact de -18.3 pts sur le TRI. Nécessite un plan de secours marketing renforcé.</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-5 text-center">
                      <AlertTriangle size={28} className="mx-auto mb-3" style={{ color: C.warning }} />
                      <h4 className="font-bold mb-2" style={{ color: C.warning }}>Risques Élevés</h4>
                      <p className="text-sm" style={{ color: C.text }}>Volume -20% et retard 3 mois : impacts de -12.5 et -9.8 pts sur le TRI. Diversification des canaux recommandée.</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-5 text-center">
                      <CheckCircle2 size={28} className="mx-auto mb-3" style={{ color: C.success }} />
                      <h4 className="font-bold mb-2" style={{ color: C.success }}>Opportunité</h4>
                      <p className="text-sm" style={{ color: C.text }}>Subvention gouvernementale : +3M RN et +6.5 pts TRI. Forte probabilité via Stratégie Bio 2030 et FIRCA.</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </AnimatedSection>

          {/* ═══════ RISQUES ═══════ */}
          <AnimatedSection id="risques">
            <SectionHeader icon={Shield} title="Analyse des Risques" subtitle="Identification, évaluation et mitigation" />

            {/* ─── Summary bar ─── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {(() => {
                const levels = riskData.map(r => {
                  const s = r.likelihood * r.impact
                  return s >= 12 ? 'Critique' : s >= 8 ? 'Élevé' : s >= 4 ? 'Moyen' : 'Faible'
                })
                const counts = { Critique: levels.filter(l => l === 'Critique').length, Élevé: levels.filter(l => l === 'Élevé').length, Moyen: levels.filter(l => l === 'Moyen').length, Faible: levels.filter(l => l === 'Faible').length }
                return [
                  { label: 'Critique', count: counts.Critique, color: C.danger, icon: AlertTriangle },
                  { label: 'Élevé', count: counts.Élevé, color: C.warning, icon: Shield },
                  { label: 'Moyen', count: counts.Moyen, color: C.gold, icon: Info },
                  { label: 'Faible', count: counts.Faible, color: C.success, icon: CheckCircle2 },
                ].map((s, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.03 }} className="p-4 rounded-xl text-center" style={{ backgroundColor: `${s.color}08`, border: `1px solid ${s.color}20` }}>
                    <s.icon size={20} className="mx-auto mb-1.5" style={{ color: s.color }} />
                    <p className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</p>
                    <p className="text-xs" style={{ color: C.muted }}>{s.label}</p>
                  </motion.div>
                ))
              })()}
            </div>

            {/* ─── Accordion détaillé par catégorie ─── */}
            {(() => {
              const categories = [
                { key: 'commercial', label: 'Risques Commerciaux', icon: Megaphone, color: C.warning },
                { key: 'technique', label: 'Risques Techniques', icon: Zap, color: C.orange },
                { key: 'financier', label: 'Risques Financiers', icon: DollarSign, color: C.gold },
                { key: 'reglementaire', label: 'Risques Réglementaires', icon: Scale, color: C.info },
                { key: 'stratégique', label: 'Risques Stratégiques', icon: Target, color: C.purple },
              ]
              return categories.map(cat => {
                const risks = riskData.filter(r => r.category === cat.key)
                if (risks.length === 0) return null
                return (
                  <Card key={cat.key} className="border-0 shadow-md mb-4">
                    <CardContent className="p-0">
                      <div className="flex items-center gap-3 px-5 py-3.5 rounded-t-xl" style={{ backgroundColor: `${cat.color}08`, borderBottom: `2px solid ${cat.color}20` }}>
                        <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${cat.color}15` }}>
                          <cat.icon size={16} style={{ color: cat.color }} />
                        </div>
                        <h3 className="text-sm font-bold" style={{ color: cat.color }}>{cat.label}</h3>
                        <Badge className="text-[10px] border-0 ml-auto" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>{risks.length} risque{risks.length > 1 ? 's' : ''}</Badge>
                      </div>
                      <Accordion type="multiple" className="px-2">
                        {risks.map((risk, ri) => {
                          const score = risk.likelihood * risk.impact
                          const level = score >= 12 ? 'Critique' : score >= 8 ? 'Élevé' : score >= 4 ? 'Moyen' : 'Faible'
                          const levelColor = score >= 12 ? C.danger : score >= 8 ? C.warning : score >= 4 ? C.gold : C.success
                          return (
                            <AccordionItem key={ri} value={`${cat.key}-${ri}`} className="border-b last:border-b-0">
                              <AccordionTrigger className="hover:no-underline py-3 px-2">
                                <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
                                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: levelColor }} />
                                  <span className="text-sm font-semibold" style={{ color: C.primary }}>{risk.name}</span>
                                  <div className="ml-auto flex items-center gap-2 shrink-0 mr-2">
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: `${C.info}10`, color: C.info }}>P:{risk.likelihood}</span>
                                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: `${C.warning}10`, color: C.warning }}>I:{risk.impact}</span>
                                    </div>
                                    <Badge className="text-[10px] border-0" style={{ backgroundColor: `${levelColor}15`, color: levelColor }}>{level}</Badge>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-2 pb-4">
                                <div className="space-y-4 pl-5">
                                  {/* Score visuel */}
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="text-xs font-medium" style={{ color: C.muted }}>Score de risque :</span>
                                    <div className="flex items-center gap-1.5">
                                      {Array.from({ length: 5 }).map((_, si) => (
                                        <div key={si} className="w-5 h-2 rounded-sm" style={{ backgroundColor: si < score / 4 ? levelColor : `${levelColor}20` }} />
                                      ))}
                                    </div>
                                    <span className="text-xs font-bold" style={{ color: levelColor }}>{score}/20</span>
                                  </div>

                                  {/* Description */}
                                  <div className="p-4 rounded-xl" style={{ backgroundColor: `${C.primary}04`, borderLeft: `3px solid ${cat.color}` }}>
                                    <div className="flex items-center gap-2 mb-2">
                                      <Info size={14} style={{ color: cat.color }} />
                                      <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: cat.color }}>Description</h4>
                                    </div>
                                    <p className="text-sm leading-relaxed" style={{ color: C.text }}>{risk.description}</p>
                                  </div>

                                  {/* Mitigation */}
                                  <div className="p-4 rounded-xl" style={{ backgroundColor: `${C.success}06`, borderLeft: `3px solid ${C.success}` }}>
                                    <div className="flex items-center gap-2 mb-2">
                                      <Shield size={14} style={{ color: C.success }} />
                                      <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: C.success }}>Plan de mitigation</h4>
                                    </div>
                                    <p className="text-sm leading-relaxed" style={{ color: C.text }}>{risk.mitigation}</p>
                                  </div>

                                  {/* Conséquences */}
                                  <div className="p-4 rounded-xl" style={{ backgroundColor: `${C.danger}04`, borderLeft: `3px solid ${C.danger}` }}>
                                    <div className="flex items-center gap-2 mb-2">
                                      <AlertTriangle size={14} style={{ color: C.danger }} />
                                      <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: C.danger }}>Conséquences si non maîtrisé</h4>
                                    </div>
                                    <p className="text-sm leading-relaxed" style={{ color: C.text }}>{risk.consequences}</p>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )
                        })}
                      </Accordion>
                    </CardContent>
                  </Card>
                )
              })
            })()}
          </AnimatedSection>

          {/* ═══════ VISION 5 ANS ═══════ */}
          <AnimatedSection id="vision">
            <SectionHeader icon={Award} title="Vision à 5 Ans" subtitle="Plan de développement Juin 2026–2030" />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { year: '2026', title: 'Implantation', desc: '29t vendues, 500 agriculteurs, 3–5 partenariats', color: C.accent },
                { year: '2027', title: 'Expansion', desc: '80t, 10 régions, label Fermes Bio, seuil rentabilité', color: C.gold },
                { year: '2028', title: 'Consolidation', desc: '150t, export sous-régional, +44.8M bénéfice', color: C.accentDark },
                { year: '2030', title: 'Leadership', desc: 'Leader Afrique de l\'Ouest, 500t+, 5 pays couverts', color: C.success },
              ].map((m, i) => (
                <motion.div key={i} whileHover={{ y: -4 }}>
                  <Card className="border-0 shadow-md h-full">
                    <CardContent className="p-5">
                      <div className="text-3xl font-bold mb-1" style={{ color: m.color }}>{m.year}</div>
                      <h4 className="font-semibold text-base mb-2" style={{ color: C.primary }}>{m.title}</h4>
                      <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{m.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <Card className="border-0 shadow-md">
              <CardHeader><CardTitle style={{ color: C.primary }}>Indicateurs de Performance (KPI)</CardTitle></CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { label: 'Ventes', value: '29 tonnes', icon: TrendingUp, color: C.accent },
                    { label: 'Partenariats', value: '3 à 5', icon: Handshake, color: C.gold },
                    { label: 'Notoriété', value: '+25 000', icon: Users, color: C.accentDark },
                    { label: 'Formation', value: '500 agri.', icon: Sprout, color: C.info },
                    { label: 'Satisfaction', value: '≥ 90%', icon: Award, color: C.success },
                  ].map((kpi, i) => (
                    <div key={i} className="p-4 rounded-xl text-center" style={{ backgroundColor: `${kpi.color}08` }}>
                      <kpi.icon size={24} className="mx-auto mb-2" style={{ color: kpi.color }} />
                      <p className="text-xl font-bold" style={{ color: C.primary }}>{kpi.value}</p>
                      <p className="text-xs" style={{ color: C.muted }}>{kpi.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* ═══════ ANNEXES — GLOSSAIRE ═══════ */}
          <AnimatedSection id="annexes">
            <SectionHeader icon={BookOpen} title="Annexes" subtitle="Glossaire des abréviations et termes techniques" color={C.info} />

            <Tabs defaultValue="finance" className="space-y-6">
              <TabsList className="w-full flex-wrap">
                <TabsTrigger value="finance">Finance & Comptabilité</TabsTrigger>
                <TabsTrigger value="marketing-tab">Marketing & Vente</TabsTrigger>
                <TabsTrigger value="institutions">Institutions & Partenaires</TabsTrigger>
                <TabsTrigger value="technique">Agronomie & Technique</TabsTrigger>
                <TabsTrigger value="juridique">Juridique & Réglementaire</TabsTrigger>
              </TabsList>

              {/* ─── FINANCE & COMPTABILITÉ ─── */}
              <TabsContent value="finance">
                <Card className="border-0 shadow-md">
                  <CardHeader><CardTitle style={{ color: C.primary }}>Finance & Comptabilité</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ backgroundColor: C.primary }}>
                            <th className="text-left p-3 text-white font-semibold w-36">Abréviation</th>
                            <th className="text-left p-3 text-white font-semibold w-56">Terme complet</th>
                            <th className="text-left p-3 text-white font-semibold">Définition</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { abbr: 'CA', full: 'Chiffre d\'Affaires', def: 'Montant total des ventes de biens et services réalisées par une entreprise sur un exercice comptable. Indicateur clé de l\'activité commerciale.' },
                            { abbr: 'EBIT', full: 'Earnings Before Interest and Taxes', def: 'Résultat opérationnel avant charges financières et impôts. Mesure la performance économique de l\'activité indépendamment de la structure financière.' },
                            { abbr: 'RN', full: 'Résultat Net', def: 'Résultat après déduction de toutes les charges (exploitation, financières, impôts). C\'est le bénéfice ou la perte finale de l\'entreprise.' },
                            { abbr: 'MB', full: 'Marge Brute', def: 'Différence entre le chiffre d\'affaires et les coûts variables (coût des marchandises vendues). Indicateur de la capacité à couvrir les charges fixes.' },
                            { abbr: 'VAN', full: 'Valeur Actuelle Nette', def: 'Somme des flux de trésorerie actualisés au taux requis par l\'investisseur. Une VAN positive signifie que le projet crée de la valeur. Calcul : VAN = Σ(Flux / (1+t)^n) - Investissement initial.' },
                            { abbr: 'TRI', full: 'Taux de Rendement Interne', def: 'Taux d\'actualisation pour lequel la VAN est égale à zéro. C\'est le rendement moyen annuel du projet. Si TRI > coût du capital, le projet est rentable.' },
                            { abbr: 'ROE', full: 'Return on Equity', def: 'Rentabilité des capitaux propres = Résultat net / Capitaux propres. Mesure le rendement offert aux actionnaires sur leur investissement.' },
                            { abbr: 'ROA', full: 'Return on Assets', def: 'Rentabilité de l\'actif = Résultat net / Total actif. Mesure l\'efficacité globale de l\'utilisation des actifs pour générer du profit.' },
                            { abbr: 'ROCE', full: 'Return on Capital Employed', def: 'Résultat opérationnel / Capitaux engagés. Mesure la rentabilité des capitaux investis dans l\'activité (actif économique).' },
                            { abbr: 'BFR', full: 'Besoin en Fonds de Roulement', def: 'Différence entre les actifs circulants (stocks + créances) et les dettes d\'exploitation. Un BFR négatif signifie un besoin de financement à court terme.' },
                            { abbr: 'RAN', full: 'Report À Nouveau', def: 'Bénéfice ou perte des exercices antérieurs non distribués et non affectés dans les réserves. Figure au passif du bilan dans les capitaux propres.' },
                            { abbr: 'Fcfa', full: 'Franc CFA (FCFA)', def: 'Monnaie utilisée par 14 pays d\'Afrique de l\'Ouest et centrale. Taux fixe : 1 EUR = 655,957 FCFA. Le FCFA est garanti par le Trésor français.' },
                            { abbr: 'IS', full: 'Impôt sur les Sociétés', def: 'Impôt proportionnel sur les bénéfices des entreprises. En Côte d\'Ivoire, le taux standard est de 25%. S\'applique uniquement en cas de bénéfice.' },
                          ].map((row, i) => (
                            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : `${C.accent}04` }}>
                              <td className="p-3 font-bold" style={{ color: C.accentDark }}>{row.abbr}</td>
                              <td className="p-3 font-medium" style={{ color: C.primary }}>{row.full}</td>
                              <td className="p-3" style={{ color: C.text }}>{row.def}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ─── MARKETING & VENTE ─── */}
              <TabsContent value="marketing-tab">
                <Card className="border-0 shadow-md">
                  <CardHeader><CardTitle style={{ color: C.primary }}>Marketing & Vente</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ backgroundColor: C.primary }}>
                            <th className="text-left p-3 text-white font-semibold w-36">Abréviation</th>
                            <th className="text-left p-3 text-white font-semibold w-56">Terme complet</th>
                            <th className="text-left p-3 text-white font-semibold">Définition</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { abbr: 'CAC', full: 'Coût d\'Acquisition Client', def: 'Coût total pour acquérir un nouveau client (marketing + commerciaux / nombre de nouveaux clients). Un CAC faible est préférable. CAC = Budget acquisition / Nb clients acquis.' },
                            { abbr: 'LTV', full: 'Lifetime Value', def: 'Valeur totale générée par un client sur toute la durée de sa relation avec l\'entreprise. LTV = Panier moyen × Fréquence d\'achat × Durée de vie client. Ratio LTV/CAC > 3x = modèle viable.' },
                            { abbr: 'ROI', full: 'Return on Investment', def: 'Retour sur investissement = (Gain - Coût) / Coût × 100. Mesure la rentabilité d\'un investissement. Un ROI de 300% signifie que 1 FCFA investi rapporte 3 FCFA.' },
                            { abbr: 'NPS', full: 'Net Promoter Score', def: 'Indice mesurant la fidélité et l\'ambassade client. Calcul : % Promoteurs (9-10/10) - % Détracteurs (0-6/10). Score > 50 = excellent, > 70 = exceptionnel.' },
                            { abbr: 'KPI', full: 'Key Performance Indicator', def: 'Indicateur clé de performance. Mesure quantitative utilisée pour évaluer le succès par rapport à un objectif. Exemples : taux de conversion, CA, notoriété.' },
                            { abbr: 'SEO', full: 'Search Engine Optimization', def: 'Optimisation pour les moteurs de recherche. Ensemble de techniques visant à améliorer le positionnement d\'un site web dans les résultats organiques de Google.' },
                            { abbr: 'MoU', full: 'Memorandum of Understanding', def: 'Protocole d\'accord ou mémorandum d\'entente. Document pré-contractuel établissant les intentions de coopération entre deux parties avant la signature d\'un contrat définitif.' },
                            { abbr: 'B2B', full: 'Business to Business', def: 'Commerce interentreprises. Modèle où l\'entreprise vend ses produits/services à d\'autres entreprises plutôt qu\'aux consommateurs finaux (ex : vente aux coopératives, agro-industries).' },
                            { abbr: 'B2C', full: 'Business to Consumer', def: 'Commerce de l\'entreprise vers le consommateur final. Modèle de vente directe aux particuliers (ex : maraîchers urbains achetant en petite quantité).' },
                          ].map((row, i) => (
                            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : `${C.accent}04` }}>
                              <td className="p-3 font-bold" style={{ color: C.accentDark }}>{row.abbr}</td>
                              <td className="p-3 font-medium" style={{ color: C.primary }}>{row.full}</td>
                              <td className="p-3" style={{ color: C.text }}>{row.def}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ─── INSTITUTIONS & PARTENAIRES ─── */}
              <TabsContent value="institutions">
                <Card className="border-0 shadow-md">
                  <CardHeader><CardTitle style={{ color: C.primary }}>Institutions & Partenaires</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ backgroundColor: C.primary }}>
                            <th className="text-left p-3 text-white font-semibold w-36">Abréviation</th>
                            <th className="text-left p-3 text-white font-semibold w-56">Nom complet</th>
                            <th className="text-left p-3 text-white font-semibold">Description & Rôle</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { abbr: 'ANADER', full: 'Agence Nationale d\'Appui au Développement Rural', def: 'Établissement public ivoirien chargé de l\'encadrement technique des agriculteurs, de la vulgarisation agricole et de la formation rurale. Partenaire clé pour la diffusion du Biodynamie sur le terrain.' },
                            { abbr: 'FIRCA', full: 'Fonds Interprofessionnel pour la Recherche et le Conseil Agricoles', def: 'Organisme ivoirien de financement de la recherche et du conseil agricoles. Finance des projets innovants dans le secteur agricole. Partenaire potentiel pour les programmes de test et de formation.' },
                            { abbr: 'CNRA', full: 'Centre National de Recherche Agronomique', def: 'Principal organisme de recherche agronomique de Côte d\'Ivoire. Mène des recherches sur les cultures pérennes, vivrières et les systèmes de production. Partenaire de validation scientifique.' },
                            { abbr: 'MINADER', full: 'Ministère de l\'Agriculture et du Développement Rural', def: 'Ministère ivoirien responsable de la politique agricole nationale. Pilote le PNIA II et la Stratégie Bio 2030. Cadre réglementaire et institutionnel pour les solutions biofertilisantes.' },
                            { abbr: 'BAD', full: 'Banque Africaine de Développement', def: 'Institution financière panafricaine de développement. Finance des projets agricoles et de développement durable en Afrique. Source potentielle de financement pour le déploiement régional.' },
                            { abbr: 'FAO', full: 'Organisation des Nations Unies pour l\'Alimentation et l\'Agriculture', def: 'Agence spécialisée de l\'ONU menant des programmes de sécurité alimentaire, d\'agriculture durable et de développement rural. Partenaire institutionnel de référence.' },
                            { abbr: 'PNUD', full: 'Programme des Nations Unies pour le Développement', def: 'Réseau mondial de l\'ONU pour le développement. Soutient les pays dans leurs objectifs de développement durable. Partenaire potentiel pour les projets d\'agriculture écologique.' },
                            { abbr: 'FIDA', full: 'Fonds International de Développement Agricole', def: 'Institution financière internationale spécialisée dans la réduction de la pauvreté rurale dans les pays en développement. Finance des projets d\'agriculture durable.' },
                            { abbr: 'PALMCI', full: 'Palm-CI (Groupe SIFCA)', def: 'Leader ivoirien de la filière palmier à huile, filiale du groupe SIFCA. Utilise des milliers d\'hectares de plantations. Client cible majeur pour les biofertilisants à grande échelle.' },
                            { abbr: 'SIFCA', full: 'Société Financière de la Côte d\'Ivoire', def: 'Groupe agro-industriel ouest-africain leader dans l\'hévéa, le palmier à huile et le sucre. Partenaire stratégique potentiel pour les tests à grande échelle et les contrats pluriannuels.' },
                            { abbr: 'SAPH', full: 'Société Africaine de Plantations d\'Hévéas', def: 'Entreprise ivoirienne spécialisée dans la production de caoutchouc naturel. Filiale du groupe SIFCA. Client cible pour les plantations d\'hévéas.' },
                            { abbr: 'SUCAF', full: 'Société Sucrière de la Côte d\'Ivoire', def: 'Entreprise agro-industrielle productrice de sucre en Côte d\'Ivoire. Exploite des milliers d\'hectares de canne à sucre. Client cible pour les grandes cultures.' },
                            { abbr: 'RTI', full: 'Radiodiffusion Télévision Ivoirienne', def: 'Chaîne de télévision et radio publique de Côte d\'Ivoire. Couverture nationale. Partenaire média pour la couverture du lancement officiel et des événements.' },
                            { abbr: 'INPHB', full: 'Institut National Polytechnique Félix Houphouët-Boigny', def: 'Grande école d\'ingénieurs de Côte d\'Ivoire à Yamoussoukro. Partenaire académique potentiel pour la R&D et la formation d\'ingénieurs agronomes.' },
                          ].map((row, i) => (
                            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : `${C.accent}04` }}>
                              <td className="p-3 font-bold" style={{ color: C.accentDark }}>{row.abbr}</td>
                              <td className="p-3 font-medium" style={{ color: C.primary }}>{row.full}</td>
                              <td className="p-3" style={{ color: C.text }}>{row.def}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ─── AGRONOMIE & TECHNIQUE ─── */}
              <TabsContent value="technique">
                <Card className="border-0 shadow-md">
                  <CardHeader><CardTitle style={{ color: C.primary }}>Agronomie & Technique</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ backgroundColor: C.primary }}>
                            <th className="text-left p-3 text-white font-semibold w-36">Terme</th>
                            <th className="text-left p-3 text-white font-semibold w-56">Catégorie</th>
                            <th className="text-left p-3 text-white font-semibold">Définition</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { abbr: 'Biofertilisant', cat: 'Agronomie', def: 'Substance contenant des micro-organismes vivants qui favorisent la croissance des plantes en augmentant la disponibilité des nutriments dans le sol. Contrairement aux engrais chimiques, il régénère l\'écosystème du sol.' },
                            { abbr: 'Biodynamie', cat: 'Agronomie', def: 'Méthode agricole écologique intégrant les principes de l\'agriculture biologique avec des pratiques spirituelles et cosmiques. Dans notre contexte, désigne le biofertilisant breveté par le Centre LIG (Congo), distribué exclusivement par CAPS en Côte d\'Ivoire.' },
                            { abbr: 'Intrant', cat: 'Agronomie', def: 'Tout produit ou matière utilisé dans le processus de production agricole : engrais, pesticides, semences, traitements. Les intrants chimiques sont progressivement remplacés par des alternatives biologiques.' },
                            { abbr: 'pH', cat: 'Chimie du sol', def: 'Potentiel hydrogène, mesure de l\'acidité ou de l\'alcalinité d\'un sol. Échelle de 0 à 14. Un pH de 7,5 (Biodynamie) est légèrement alcalin et compatible avec la plupart des cultures tropicales.' },
                            { abbr: 'Rendement', cat: 'Agronomie', def: 'Quantité de production récoltée par unité de surface (ex : tonnes/hectare). L\'objectif de Biodynamie est d\'augmenter les rendements de +80% par rapport aux pratiques conventionnelles.' },
                            { abbr: 'Biodégradable', cat: 'Écologie', def: 'Qui peut être décomposé par des organismes vivants (bactéries, champignons) en éléments naturels sans pollution. Le biofertilisant Biodynamie est 100% biodégradable contrairement aux engrais chimiques.' },
                            { abbr: 'Sols tropicaux', cat: 'Pédologie', def: 'Sols caractéristiques des régions tropicales, souvent ferrallitiques, acides et appauvris en matière organique. Nécessitent des amendements spécifiques que le Biodynamie apporte.' },
                            { abbr: 'R&D', full: 'Recherche et Développement', def: 'Activités de recherche fondamentale et appliquée visant à créer de nouveaux produits ou améliorer les existants. Le Centre LIG (Congo) a plus de 20 ans de R&D sur le biofertilisant Biodynamie.' },
                            { abbr: 'Pisciculture zéro nourrissage', cat: 'Innovation LIG (Congo)', def: 'Technique exclusive du Centre LIG (Congo) consistant à élever des poissons sans apport alimentaire externe. Les rejets piscicoles servent de base au biofertilisant, garantissant un produit 100% naturel et économique.' },
                            { abbr: 'Rotation des stocks', cat: 'Logistique', def: 'Indicateur mesurant la vitesse à laquelle les stocks sont renouvelés. Calcul : Stock moyen / Coût des marchandises vendues × 365. Une rotation rapide indique une gestion efficace.' },
                            { abbr: 'Ecocert', cat: 'Certification', def: 'Organisme de certification internationale spécialisé dans l\'agriculture biologique et le développement durable. La certification Ecocert garantit le respect des normes bio européennes et internationales.' },
                          ].map((row, i) => (
                            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : `${C.accent}04` }}>
                              <td className="p-3 font-bold" style={{ color: C.accentDark }}>{row.abbr}</td>
                              <td className="p-3 font-medium" style={{ color: C.primary }}>{row.cat}{row.full ? ` — ${row.full}` : ''}</td>
                              <td className="p-3" style={{ color: C.text }}>{row.def}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ─── JURIDIQUE & RÉGLEMENTAIRE ─── */}
              <TabsContent value="juridique">
                <Card className="border-0 shadow-md">
                  <CardHeader><CardTitle style={{ color: C.primary }}>Juridique & Réglementaire</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ backgroundColor: C.primary }}>
                            <th className="text-left p-3 text-white font-semibold w-36">Référence</th>
                            <th className="text-left p-3 text-white font-semibold w-56">Intitulé</th>
                            <th className="text-left p-3 text-white font-semibold">Description & Impact pour CAPS Biodynamie</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { abbr: 'Loi n°2015-537', full: 'Loi relative à la modernisation agricole', def: 'Loi ivoirienne encadrant la modernisation du secteur agricole. Favorise l\'innovation, l\'adoption de nouvelles technologies et l\'accès aux financements pour les acteurs agricoles. Cadre favorable pour l\'introduction de biofertilisants.' },
                            { abbr: 'PNIA II', full: 'Programme National d\'Investissement Agricole II', def: 'Plan stratégique ivoirien (2018-2026) pour le développement du secteur agricole. Priorise la sécurité alimentaire, l\'agro-industrie et l\'agriculture durable. Alignement stratégique direct avec les objectifs de CAPS Biodynamie.' },
                            { abbr: 'PNDAD', full: 'Programme National de Développement Agricole Durable', def: 'Programme gouvernemental ivoirien visant à concilier développement agricole et durabilité environnementale. Soutient les pratiques agro-écologiques et la transition vers le bio.' },
                            { abbr: 'Stratégie Bio 2030', full: 'Stratégie Nationale de l\'Agriculture Biologique', def: 'Politique gouvernementale ivoirienne ambitionnant de développer l\'agriculture biologique d\'ici 2030. Crée des opportunités de subventions, de certifications et de marchés pour les produits bio comme Biodynamie.' },
                            { abbr: 'PIB', full: 'Produit Intérieur Brut', def: 'Valeur totale des biens et services produits dans un pays sur une année. En Côte d\'Ivoire, l\'agriculture représente 25% du PIB, soulignant l\'importance stratégique du secteur.' },
                            { abbr: 'SARA', full: 'Salon de l\'Agriculture et des Ressources Animales', def: 'Plus grand salon agricole de Côte d\'Ivoire et d\'Afrique de l\'Ouest. Se tient tous les 2 ans à Abidjan. Opportunité majeure de visibilité, de networking et de démonstration pour CAPS Biodynamie.' },
                            { abbr: 'Capital social', full: 'Capital Social de l\'Entreprise', def: 'Montant des apports des associés constituant les ressources permanentes de l\'entreprise. Figure au passif du bilan. Pour CAPS CI, le capital social initial est de 20M FCFA.' },
                            { abbr: 'Amortissement', full: 'Amortissement comptable', def: 'Constatation comptable de la dépréciation irréversible d\'un actif immobilisé (matériel, bâtiments) sur sa durée de vie utile. Charge non décaissable qui réduit le résultat imposable.' },
                          ].map((row, i) => (
                            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : `${C.accent}04` }}>
                              <td className="p-3 font-bold" style={{ color: C.accentDark }}>{row.abbr}</td>
                              <td className="p-3 font-medium" style={{ color: C.primary }}>{row.full}</td>
                              <td className="p-3" style={{ color: C.text }}>{row.def}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* ─── INDEX ALPHABÉTIQUE ─── */}
            <Card className="border-0 shadow-md mt-8">
              <CardHeader><CardTitle style={{ color: C.primary }}>Index Alphabétique Rapide</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {[
                    { term: 'ANADER', desc: 'Agence nationale d\'appui rural' },
                    { term: 'BAD', desc: 'Banque Africaine de Développement' },
                    { term: 'BFR', desc: 'Besoin en Fonds de Roulement' },
                    { term: 'B2B', desc: 'Business to Business' },
                    { term: 'B2C', desc: 'Business to Consumer' },
                    { term: 'CA', desc: 'Chiffre d\'Affaires' },
                    { term: 'CAC', desc: 'Coût d\'Acquisition Client' },
                    { term: 'CNRA', desc: 'Centre National Recherche Agronomique' },
                    { term: 'EBIT', desc: 'Résultat opérationnel' },
                    { term: 'Ecocert', desc: 'Certification biologique' },
                    { term: 'FAO', desc: 'Organisation ONU Alimentation' },
                    { term: 'Fcfa', desc: 'Franc CFA (655,957/EUR)' },
                    { term: 'FIDA', desc: 'Fonds Intl Dév. Agricole' },
                    { term: 'FIRCA', desc: 'Fonds Recherche Conseil Agricoles' },
                    { term: 'IS', desc: 'Impôt sur les Sociétés (25%)' },
                    { term: 'KPI', desc: 'Indicateur clé de performance' },
                    { term: 'LTV', desc: 'Lifetime Value' },
                    { term: 'MB', desc: 'Marge Brute' },
                    { term: 'MINADER', desc: 'Ministère Agriculture CI' },
                    { term: 'MoU', desc: 'Protocole d\'accord' },
                    { term: 'NPS', desc: 'Net Promoter Score' },
                    { term: 'PALMCI', desc: 'Leader palmier à huile CI' },
                    { term: 'PESTEL', desc: 'Politique Éco. Social Tech. Env. Légal' },
                    { term: 'pH', desc: 'Potentiel hydrogène' },
                    { term: 'PIB', desc: 'Produit Intérieur Brut' },
                    { term: 'PNIA II', desc: 'Prog. Natl Investissement Agricole' },
                    { term: 'PNUD', desc: 'Prog. Nations Unies Développement' },
                    { term: 'R&D', desc: 'Recherche et Développement' },
                    { term: 'RAN', desc: 'Report À Nouveau' },
                    { term: 'ROA', desc: 'Rentabilité de l\'actif' },
                    { term: 'ROCE', desc: 'Rentabilité capitaux engagés' },
                    { term: 'ROE', desc: 'Rentabilité capitaux propres' },
                    { term: 'ROI', desc: 'Retour sur investissement' },
                    { term: 'RTI', desc: 'Radio Télévision Ivoirienne' },
                    { term: 'SARA', desc: 'Salon Agriculture Ressources Animales' },
                    { term: 'SIFCA', desc: 'Groupe agro-industriel' },
                    { term: 'SEO', desc: 'Optimisation moteurs recherche' },
                    { term: 'SWOT', desc: 'Forces Faiblesses Opportunités Menaces' },
                    { term: 'TRI', desc: 'Taux de Rendement Interne' },
                    { term: 'VAN', desc: 'Valeur Actuelle Nette' },
                  ].map((item, i) => (
                    <motion.div key={i} whileHover={{ scale: 1.02 }} className="p-3 rounded-lg" style={{ backgroundColor: `${C.accent}06`, border: `1px solid ${C.accent}15` }}>
                      <p className="text-sm font-bold" style={{ color: C.accentDark }}>{item.term}</p>
                      <p className="text-xs" style={{ color: C.muted }}>{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

        </div>
      </main>

      {/* ─── FOOTER ─── */}
      <footer style={{ backgroundColor: C.primary }} className="mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.accent }}>
                  <Leaf size={22} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-white">CAPS Biodynamie</p>
                  <p className="text-xs" style={{ color: C.accent }}>Côte d&apos;Ivoire</p>
                </div>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                CAPS Biodynamie porte la vision d&apos;une Côte d&apos;Ivoire autosuffisante et durable.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">LIG — Fournisseur (Congo)</h4>
              <div className="space-y-2 text-sm text-white/60">
                <div className="flex items-center gap-2"><MapPin size={14} /> Centre LIG, Brazzaville, Congo</div>
                <div className="flex items-center gap-2"><Globe size={14} /> R&D & Production du biofertilisant</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Comptoir Agropastoral CI</h4>
              <div className="space-y-2 text-sm text-white/60">
                <div className="flex items-center gap-2"><Phone size={14} /> WhatsApp: +225 0707884587</div>
                <div className="flex items-center gap-2"><Mail size={14} /> info@biodynamie.ci</div>
                <div className="flex items-center gap-2"><Globe size={14} /> www.biodynamie.ci</div>
              </div>
            </div>
          </div>
          <Separator className="bg-white/10 mb-6" />
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-white/40">&copy; 2026 Comptoir Agropastoral CI. Tous droits réservés.</p>
            <a href="/Business_Plan_LIG_Biodynamie_CI.docx" download>
              <Button size="sm" className="border border-white/30 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white text-xs">
                <Download size={14} className="mr-1.5" /> Télécharger le Business Plan (DOCX)
              </Button>
            </a>
          </div>
        </div>
      </footer>

      {/* ─── Back to top ─── */}
      {scrollY > 500 && (
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full shadow-lg"
          style={{ backgroundColor: C.accent, color: C.primary }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ChevronUp size={20} />
        </motion.button>
      )}
    </div>
  )
}
