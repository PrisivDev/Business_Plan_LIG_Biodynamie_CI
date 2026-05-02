'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area
} from 'recharts'
import {
  Leaf, TrendingUp, Users, Handshake, Target, Calendar, DollarSign,
  Shield, ChevronDown, ChevronRight, Phone, Mail, MapPin, Globe,
  Sprout, Microscope, Award, ArrowUpRight, CheckCircle2, AlertTriangle,
  Download, Menu, X, ChevronUp, BarChart3, Lightbulb, Droplets
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

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
}

// ─── Chart Data ───
const budgetData = [
  { name: 'Identité visuelle', value: 10000000, color: '#2A7A65' },
  { name: 'Lancement officiel', value: 12000000, color: '#3DDBB5' },
  { name: 'Campagne digitale', value: 8000000, color: '#F3A847' },
  { name: 'Formations & tournées', value: 10000000, color: '#D4875A' },
  { name: 'Production de contenu', value: 6000000, color: '#5B8DB8' },
]

const financialData = [
  { year: 'Année 1 (2026)', CA: 17.4, couts: 32, resultat: -14.6 },
  { year: 'Année 2 (2027)', CA: 64, couts: 52, resultat: 9 },
  { year: 'Année 3 (2028)', CA: 135, couts: 82, resultat: 39.8 },
]

const revenueMixData = [
  { name: 'Agro-industries', value: 40, color: '#2A7A65' },
  { name: 'Coopératives', value: 25, color: '#3DDBB5' },
  { name: 'Maraîchers urbains', value: 15, color: '#F3A847' },
  { name: 'Distributeurs', value: 12, color: '#D4875A' },
  { name: 'Institutions', value: 8, color: '#5B8DB8' },
]

const cashFlowData = [
  { month: 'Jan', encaissements: 1.2, decaissements: 3.5 },
  { month: 'Fév', encaissements: 1.8, decaissements: 3.2 },
  { month: 'Mar', encaissements: 2.5, decaissements: 2.8 },
  { month: 'Avr', encaissements: 1.5, decaissements: 2.2 },
  { month: 'Mai', encaissements: 1.2, decaissements: 2.0 },
  { month: 'Jun', encaissements: 1.0, decaissements: 1.8 },
  { month: 'Jul', encaissements: 0.8, decaissements: 1.6 },
  { month: 'Aoû', encaissements: 0.9, decaissements: 1.5 },
  { month: 'Sep', encaissements: 1.4, decaissements: 2.0 },
  { month: 'Oct', encaissements: 1.8, decaissements: 2.2 },
  { month: 'Nov', encaissements: 2.0, decaissements: 2.5 },
  { month: 'Déc', encaissements: 1.3, decaissements: 3.0 },
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
  forces: [
    'Produit 100% naturel et biodégradable',
    'R&D de plus de 20 ans validée',
    'Résultats visibles sous 10 jours',
    'Compatible avec toutes les cultures tropicales',
    'Coûts d\'intrants divisés par 3',
    'Partenaire exclusif ancré localement',
  ],
  faiblesses: [
    'Nouveau sur le marché ivoirien',
    'Capacité de production initiale limitée',
    'Notoriété de marque à construire',
    'Réseau de distribution à établir',
    'Dépendance au partenaire local',
  ],
  opportunites: [
    'Agriculture = 25% du PIB ivoirien',
    'Cadre réglementaire favorable (Loi 2015-537)',
    'Stratégie Bio 2030 du gouvernement',
    'Forte dépendance aux engrais chimiques importés',
    'Demande croissante pour le bio en Afrique',
    'Soutien de bailleurs (BAD, FAO, PNUD)',
  ],
  menaces: [
    'Résistance au changement des agriculteurs',
    'Concurrence des engrais chimiques établis',
    'Risques climatiques sur la production',
    'Instabilité des prix des matières premières',
    'Complexité des certifications agricoles',
  ],
}

// ─── Risk Data ───
const riskData = [
  { name: 'Réticence agriculteurs', likelihood: 4, impact: 3, category: 'commercial' },
  { name: 'Concurrence engrais chimiques', likelihood: 5, impact: 4, category: 'commercial' },
  { name: 'Capacité production', likelihood: 3, impact: 4, category: 'technique' },
  { name: 'Retard réglementaire', likelihood: 2, impact: 3, category: 'reglementaire' },
  { name: 'Instabilité prix matières', likelihood: 3, impact: 2, category: 'financier' },
  { name: 'Dépendance partenaire', likelihood: 2, impact: 4, category: 'stratégique' },
  { name: 'Conditions météorologiques', likelihood: 3, impact: 2, category: 'technique' },
  { name: 'Contrefaçon produit', likelihood: 2, impact: 3, category: 'commercial' },
]

// ─── Timeline Data ───
const timelineData = [
  { period: 'Nov 2025', title: 'Pré-lancement', desc: 'Campagne de teasing digitale, signature des MoU avec FIRCA et PALMCI', status: 'upcoming' },
  { period: '10 Déc 2025', title: 'Lancement officiel', desc: 'Cérémonie à Abidjan avec partenaires, démonstration live, couverture médiatique RTI/Business24', status: 'upcoming' },
  { period: 'Jan–Mars 2026', title: 'LIG Biodynamie Tour', desc: 'Tournée dans 5 régions agricoles, formations gratuites, campagne influenceurs verts', status: 'upcoming' },
  { period: 'Avr–Jun 2026', title: 'Évaluation & Consolidation', desc: 'Évaluation des résultats, collecte témoignages, signature nouveaux contrats', status: 'upcoming' },
  { period: 'Jul–Déc 2026', title: 'Extension régionale', desc: 'Extension distribution régionale, lancement label "Fermes Biodynamiques", salons (SARA)', status: 'upcoming' },
]

// ─── Section IDs for navigation ───
const sections = [
  { id: 'resume', label: 'Résumé', icon: Target },
  { id: 'projet', label: 'Projet', icon: Sprout },
  { id: 'marche', label: 'Marché', icon: TrendingUp },
  { id: 'produit', label: 'Produit', icon: Leaf },
  { id: 'modele', label: 'Modèle', icon: DollarSign },
  { id: 'strategie', label: 'Stratégie', icon: Lightbulb },
  { id: 'operations', label: 'Opérations', icon: Calendar },
  { id: 'financier', label: 'Financier', icon: BarChart3 },
  { id: 'risques', label: 'Risques', icon: Shield },
  { id: 'vision', label: 'Vision', icon: Award },
]

// ─── Animated Section Component ───
function AnimatedSection({ id, children, className = '' }: { id: string; children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

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

// ─── Format number ───
function fmt(n: number) {
  return n.toLocaleString('fr-FR')
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════
export default function BusinessPlanApp() {
  const [activeSection, setActiveSection] = useState('resume')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
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
                <span className="font-bold text-white text-sm">LIG Biodynamie</span>
                <span className="text-xs block" style={{ color: C.accent }}>Business Plan 2025-2028</span>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeSection === s.id
                      ? 'text-white'
                      : 'text-white/60 hover:text-white/90'
                  }`}
                  style={activeSection === s.id ? { backgroundColor: `${C.accent}30` } : {}}
                >
                  {s.label}
                </button>
              ))}
            </nav>

            {/* Mobile Menu Toggle */}
            <button className="lg:hidden text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden"
              style={{ backgroundColor: C.primary }}
            >
              <div className="px-4 py-3 space-y-1">
                {sections.map(s => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm flex items-center gap-3 ${
                      activeSection === s.id ? 'text-white' : 'text-white/70'
                    }`}
                    style={activeSection === s.id ? { backgroundColor: `${C.accent}25` } : {}}
                  >
                    <s.icon size={16} />
                    {s.label}
                  </button>
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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <Badge className="mb-6 text-xs font-medium px-4 py-1.5 border-0" style={{ backgroundColor: `${C.accent}25`, color: C.accent }}>
              Business Plan 2025 – 2028
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Centre de Recherche
              <br />
              Agricole{' '}
              <span style={{ color: C.accent }}>LIAMBOU GISELE</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-4 max-w-2xl leading-relaxed">
              Implantation en Côte d&apos;Ivoire — Lancement du Biofertilisant <strong className="text-white">Biodynamie</strong>
            </p>
            <p className="text-base text-white/60 mb-10 max-w-2xl">
              Partenaire Exclusif : <strong className="text-white/80">Comptoir Agropastoral CI</strong>
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <StatCard icon={Target} value="29 t" label="Objectif de vente Année 1" color={C.accent} />
              <StatCard icon={Users} value="500" label="Agriculteurs formés" color={C.gold} />
              <StatCard icon={Handshake} value="3–5" label="Partenariats majeurs" color={C.accentDark} />
              <StatCard icon={TrendingUp} value="+80%" label="Augmentation rendements" color={C.success} />
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="text-base px-8 py-6 border-0 shadow-lg"
                style={{ backgroundColor: C.accent, color: C.primary }}
                onClick={() => scrollTo('resume')}
              >
                Découvrir le Business Plan
                <ChevronDown className="ml-2" size={18} />
              </Button>
              <a href="/Business_Plan_LIG_Biodynamie_CI.docx" download>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8 py-6 border-white/30 text-white hover:bg-white/10"
                >
                  <Download className="mr-2" size={18} />
                  Télécharger le DOCX
                </Button>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown size={28} className="text-white/40" />
        </motion.div>
      </section>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">

          {/* ═══════ RÉSUMÉ EXÉCUTIF ═══════ */}
          <AnimatedSection id="resume">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${C.accent}15` }}>
                <Target size={24} style={{ color: C.accent }} />
              </div>
              <div>
                <h2 className="text-3xl font-bold" style={{ color: C.primary }}>Résumé Exécutif</h2>
                <p className="text-sm" style={{ color: C.muted }}>Synthèse du projet LIG Biodynamie</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: C.primary }}>Le Projet</h3>
                  <p className="leading-relaxed mb-4" style={{ color: C.text }}>
                    Le Centre de Recherche Agricole LIAMBOU GISELE (LIG) s&apos;implante en Côte d&apos;Ivoire pour y déployer
                    la révolution agricole biodynamique africaine à travers la production et la commercialisation du
                    biofertilisant <strong>&quot;Biodynamie&quot;</strong>, en partenariat exclusif avec le Comptoir Agropastoral CI.
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
                      { label: 'Commercialiser 29 tonnes de Biodynamie', sub: 'Déc 2025 – Mars 2026', pct: 100, color: C.accent },
                      { label: 'Former 500 agriculteurs ivoiriens', sub: 'Programme "1 tonne test"', pct: 85, color: C.gold },
                      { label: 'Obtenir 3–5 partenariats majeurs', sub: 'PALMCI, SIFCA, CNRA, FIRCA', pct: 70, color: C.accentDark },
                      { label: 'Leader fertilisants écologiques Afrique de l\'Ouest', sub: 'Objectif 2026', pct: 60, color: C.success },
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
              <motion.div whileHover={{ scale: 1.03 }} className="p-5 rounded-2xl text-center" style={{ backgroundColor: `${C.accent}10` }}>
                <DollarSign size={28} className="mx-auto mb-2" style={{ color: C.accent }} />
                <p className="text-2xl font-bold" style={{ color: C.primary }}>46M</p>
                <p className="text-xs" style={{ color: C.muted }}>Fcfa Budget Marketing</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} className="p-5 rounded-2xl text-center" style={{ backgroundColor: `${C.gold}10` }}>
                <Sprout size={28} className="mx-auto mb-2" style={{ color: C.gold }} />
                <p className="text-2xl font-bold" style={{ color: C.primary }}>25%</p>
                <p className="text-xs" style={{ color: C.muted }}>PIB Agricole CI</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} className="p-5 rounded-2xl text-center" style={{ backgroundColor: `${C.accentDark}10` }}>
                <Microscope size={28} className="mx-auto mb-2" style={{ color: C.accentDark }} />
                <p className="text-2xl font-bold" style={{ color: C.primary }}>20+</p>
                <p className="text-xs" style={{ color: C.muted }}>Années de R&D</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} className="p-5 rounded-2xl text-center" style={{ backgroundColor: `${C.success}10` }}>
                <Droplets size={28} className="mx-auto mb-2" style={{ color: C.success }} />
                <p className="text-2xl font-bold" style={{ color: C.primary }}>10j</p>
                <p className="text-xs" style={{ color: C.muted }}>Résultats visibles</p>
              </motion.div>
            </div>
          </AnimatedSection>

          {/* ═══════ PRÉSENTATION DU PROJET ═══════ */}
          <AnimatedSection id="projet">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${C.accent}15` }}>
                <Sprout size={24} style={{ color: C.accent }} />
              </div>
              <div>
                <h2 className="text-3xl font-bold" style={{ color: C.primary }}>Présentation du Projet</h2>
                <p className="text-sm" style={{ color: C.muted }}>Vision, Mission et Partenaire</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                {
                  title: 'Vision',
                  desc: 'Faire de la Côte d\'Ivoire le fer de lance d\'une Afrique qui nourrit l\'Afrique, grâce à une agriculture durable, rentable et souveraine.',
                  icon: Lightbulb,
                  color: C.accent,
                },
                {
                  title: 'Mission',
                  desc: 'Produire et diffuser des solutions biofertilisantes écologiques et performantes, accessibles à tous les acteurs agricoles ivoiriens et ouest-africains.',
                  icon: Target,
                  color: C.gold,
                },
                {
                  title: 'Valeurs',
                  desc: 'Nature • Science • Résultats • Afrique — Un ADN ancré dans le respect de la terre et la performance agricole prouvée.',
                  icon: Award,
                  color: C.accentDark,
                },
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
                <h3 className="text-xl font-semibold mb-4" style={{ color: C.primary }}>Partenaire Exclusif : Comptoir Agropastoral CI</h3>
                <p className="leading-relaxed mb-4" style={{ color: C.text }}>
                  Le Comptoir Agropastoral CI est le partenaire exclusif de LIG en Côte d&apos;Ivoire. Implanté localement, il assure la distribution,
                  la logistique, les relations institutionnelles et le suivi terrain. Cette alliance stratégique garantit une ancrage local solide,
                  une compréhension approfondie du marché ivoirien et un réseau établi auprès des coopératives et agro-industries.
                </p>
                <div className="flex flex-wrap gap-4 text-sm" style={{ color: C.muted }}>
                  <div className="flex items-center gap-2"><Phone size={14} /> +225 07070707 / 05050505</div>
                  <div className="flex items-center gap-2"><Mail size={14} /> info@biodynamie.ci</div>
                  <div className="flex items-center gap-2"><Globe size={14} /> ligbiodynamie.ci</div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* ═══════ ANALYSE DU MARCHÉ ═══════ */}
          <AnimatedSection id="marche">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${C.accent}15` }}>
                <TrendingUp size={24} style={{ color: C.accent }} />
              </div>
              <div>
                <h2 className="text-3xl font-bold" style={{ color: C.primary }}>Analyse du Marché</h2>
                <p className="text-sm" style={{ color: C.muted }}>Environnement, SWOT et Concurrence</p>
              </div>
            </div>

            {/* PESTEL */}
            <Card className="border-0 shadow-md mb-8">
              <CardHeader>
                <CardTitle style={{ color: C.primary }}>Analyse PESTEL — Côte d&apos;Ivoire</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { letter: 'P', label: 'Politique', items: ['Volonté gouvernementale d\'innovation verte', 'Stabilité macropolitique favorable', 'PNIA II et PNDAD'], color: '#2A7A65' },
                    { letter: 'E', label: 'Économique', items: ['Agriculture = 25% du PIB', 'Forte dépendance aux importations d\'engrais', 'Coût élevé des intrants chimiques'], color: '#3DDBB5' },
                    { letter: 'S', label: 'Socioculturel', items: ['Tradition agricole profonde', 'Résistance au changement', 'Jeunesse agricole croissante'], color: '#F3A847' },
                    { letter: 'T', label: 'Technologique', items: ['R&D LIG +20 ans', 'Adaptation aux sols tropicaux', 'Innovation zero nourrissage piscicole'], color: '#D4875A' },
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
                            <CheckCircle2 size={12} className="mt-0.5 shrink-0" style={{ color: item.color }} />
                            {it}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SWOT */}
            <Card className="border-0 shadow-md mb-8">
              <CardHeader>
                <CardTitle style={{ color: C.primary }}>Analyse SWOT</CardTitle>
              </CardHeader>
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
                            <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: quad.color }} />
                            {it}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Radar Chart - Biodynamie vs Engrais chimiques */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle style={{ color: C.primary }}>Biodynamie vs Engrais Chimiques</CardTitle>
              </CardHeader>
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
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${C.accent}15` }}>
                <Leaf size={24} style={{ color: C.accent }} />
              </div>
              <div>
                <h2 className="text-3xl font-bold" style={{ color: C.primary }}>Produit &amp; Innovation</h2>
                <p className="text-sm" style={{ color: C.muted }}>Le biofertilisant Biodynamie</p>
              </div>
            </div>

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
                      { name: 'Pack Découverte', weight: '100 g', price: '60 000', stdPrice: '100 000', target: 'Maraîchers urbains, testeurs', color: C.accent },
                      { name: 'Pack Standard', weight: '500 g', price: '300 000', stdPrice: '500 000', target: 'Coopératives, exploitants', color: C.gold },
                      { name: 'Pack Pro', weight: '1 kg', price: '600 000', stdPrice: '1 000 000', target: 'Agro-industries, R&D', color: C.accentDark },
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
                    * Prix de lancement (10 déc. 2025 – 31 mars 2026). Réduction -20% pour commandes groupées.
                    1 tonne réservée aux tests gratuits officiels.
                  </p>
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>

          {/* ═══════ MODÈLE ÉCONOMIQUE ═══════ */}
          <AnimatedSection id="modele">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${C.accent}15` }}>
                <DollarSign size={24} style={{ color: C.accent }} />
              </div>
              <div>
                <h2 className="text-3xl font-bold" style={{ color: C.primary }}>Modèle Économique</h2>
                <p className="text-sm" style={{ color: C.muted }}>Business Model Canvas</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle style={{ color: C.primary }}>Segments de Clientèle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={revenueMixData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                          {revenueMixData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${value}%`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle style={{ color: C.primary }}>Canaux &amp; Revenus</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2" style={{ color: C.accentDark }}>Canaux de Distribution</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {['Vente directe Centre LIG Abidjan', 'E-commerce ligbiodynamie.ci', 'Coopératives partenaires', 'ANADER (diffusion nationale)', 'Magasins bio / intrants verts', '10 technico-commerciaux'].map((ch, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs" style={{ color: C.text }}>
                          <ChevronRight size={12} style={{ color: C.accent }} />
                          {ch}
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-sm mb-2" style={{ color: C.gold }}>Sources de Revenus</h4>
                    <div className="space-y-2">
                      {[
                        { label: 'Vente de biofertilisant', pct: 70 },
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

          {/* ═══════ STRATÉGIE COMMERCIALE ═══════ */}
          <AnimatedSection id="strategie">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${C.accent}15` }}>
                <Lightbulb size={24} style={{ color: C.accent }} />
              </div>
              <div>
                <h2 className="text-3xl font-bold" style={{ color: C.primary }}>Stratégie Commerciale</h2>
                <p className="text-sm" style={{ color: C.muted }}>Marketing, Communication &amp; Partenariats</p>
              </div>
            </div>

            {/* Positioning */}
            <Card className="border-0 shadow-md mb-8">
              <CardContent className="p-8 text-center">
                <p className="text-2xl font-bold italic mb-4" style={{ color: C.accentDark }}>
                  &ldquo;Biodynamie : la puissance de la nature au service de vos sols.&rdquo;
                </p>
                <div className="flex flex-wrap justify-center gap-3 mt-6">
                  {[
                    { label: '+80% rendements', icon: TrendingUp, color: C.success },
                    { label: 'Coûts /3', icon: DollarSign, color: C.gold },
                    { label: 'Zéro chimie', icon: Leaf, color: C.accent },
                    { label: 'Sols régénérés', icon: Sprout, color: C.accentDark },
                  ].map((p, i) => (
                    <Badge key={i} className="px-4 py-2 text-sm border-0" style={{ backgroundColor: `${p.color}15`, color: p.color }}>
                      <p.icon size={14} className="mr-1.5" />
                      {p.label}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border-0 shadow-md mb-8">
              <CardHeader>
                <CardTitle style={{ color: C.primary }}>Calendrier de Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {timelineData.map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: C.accent, backgroundColor: i === 0 ? C.accent : 'transparent' }} />
                        {i < timelineData.length - 1 && <div className="w-0.5 h-16" style={{ backgroundColor: `${C.accent}30` }} />}
                      </div>
                      <div className="pb-6">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="text-xs border-0" style={{ backgroundColor: `${C.accent}15`, color: C.accentDark }}>
                            {item.period}
                          </Badge>
                          <span className="font-semibold text-sm" style={{ color: C.primary }}>{item.title}</span>
                        </div>
                        <p className="text-sm" style={{ color: C.muted }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Partners */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle style={{ color: C.primary }}>Partenaires Stratégiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { category: 'Agro-industries', partners: ['PALMCI', 'SAPH', 'SIFCA', 'SUCAF'], color: C.accentDark },
                    { category: 'Institutions publiques', partners: ['MINADER', 'CNRA', 'FIRCA'], color: C.accent },
                    { category: 'Bailleurs & ONG', partners: ['FAO', 'BAD', 'FIDA', 'PNUD'], color: C.gold },
                    { category: 'Recherche & Formation', partners: ['INPHB', 'Univ. Nangui Abrogoua'], color: C.info },
                  ].map((cat, i) => (
                    <div key={i} className="p-4 rounded-xl" style={{ backgroundColor: `${cat.color}08`, border: `1px solid ${cat.color}20` }}>
                      <h4 className="font-semibold text-sm mb-3" style={{ color: cat.color }}>{cat.category}</h4>
                      <div className="space-y-1.5">
                        {cat.partners.map((p, j) => (
                          <div key={j} className="flex items-center gap-2 text-xs" style={{ color: C.text }}>
                            <Handshake size={12} style={{ color: cat.color }} />
                            {p}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* ═══════ OPÉRATIONS ═══════ */}
          <AnimatedSection id="operations">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${C.accent}15` }}>
                <Calendar size={24} style={{ color: C.accent }} />
              </div>
              <div>
                <h2 className="text-3xl font-bold" style={{ color: C.primary }}>Plan Opérationnel</h2>
                <p className="text-sm" style={{ color: C.muted }}>Production, Logistique &amp; RH</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle style={{ color: C.primary }}>Production &amp; Approvisionnement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm" style={{ color: C.text }}>
                  <p>La production du biofertilisant Biodynamie repose sur un processus exclusif de pisciculture sans nourrissage,
                    garantissant un produit 100% naturel. L&apos;unité de production sera établie à Abidjan avec une capacité
                    initiale de 50 tonnes/an, extensible à 200 tonnes.</p>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: `${C.accent}08` }}>
                      <p className="font-bold text-lg" style={{ color: C.accent }}>50 t/an</p>
                      <p className="text-xs" style={{ color: C.muted }}>Capacité initiale</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: `${C.gold}08` }}>
                      <p className="font-bold text-lg" style={{ color: C.gold }}>200 t/an</p>
                      <p className="text-xs" style={{ color: C.muted }}>Capacité cible (Année 3)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle style={{ color: C.primary }}>Ressources Humaines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { role: 'Directeur Général CI', count: 1, color: C.accentDark },
                      { role: 'Responsable Commercial', count: 1, color: C.accent },
                      { role: 'Technico-commerciaux ambassadeurs', count: 10, color: C.gold },
                      { role: 'Responsable R&D / Production', count: 1, color: C.info },
                      { role: 'Community Manager', count: 2, color: C.success },
                      { role: 'Assistante administrative', count: 1, color: C.muted },
                    ].map((r, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: `${r.color}06` }}>
                        <span className="text-sm" style={{ color: C.text }}>{r.role}</span>
                        <Badge className="border-0 text-xs" style={{ backgroundColor: `${r.color}15`, color: r.color }}>{r.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>

          {/* ═══════ PLAN FINANCIER ═══════ */}
          <AnimatedSection id="financier">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${C.accent}15` }}>
                <BarChart3 size={24} style={{ color: C.accent }} />
              </div>
              <div>
                <h2 className="text-3xl font-bold" style={{ color: C.primary }}>Plan Financier Prévisionnel</h2>
                <p className="text-sm" style={{ color: C.muted }}>Projections sur 3 ans (en millions Fcfa)</p>
              </div>
            </div>

            <Tabs defaultValue="projections" className="space-y-6">
              <TabsList className="bg-white shadow-sm">
                <TabsTrigger value="projections">Projections</TabsTrigger>
                <TabsTrigger value="budget">Budget Marketing</TabsTrigger>
                <TabsTrigger value="tresorerie">Trésorerie</TabsTrigger>
                <TabsTrigger value="rentabilite">Rentabilité</TabsTrigger>
              </TabsList>

              <TabsContent value="projections">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-md">
                    <CardHeader>
                      <CardTitle style={{ color: C.primary }}>Compte de Résultat Prévisionnel</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={financialData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
                            <XAxis dataKey="year" tick={{ fontSize: 11, fill: C.muted }} />
                            <YAxis tick={{ fontSize: 11, fill: C.muted }} />
                            <Tooltip formatter={(value: number) => `${value}M Fcfa`} />
                            <Legend />
                            <Bar dataKey="CA" name="Chiffre d'affaires" fill={C.accent} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="couts" name="Coûts totaux" fill={C.gold} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="resultat" name="Résultat net" fill={C.accentDark} radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md">
                    <CardHeader>
                      <CardTitle style={{ color: C.primary }}>Détail Financier</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr style={{ backgroundColor: `${C.accentDark}10` }}>
                              <th className="text-left p-3 font-semibold" style={{ color: C.accentDark }}>Poste</th>
                              <th className="text-right p-3 font-semibold" style={{ color: C.accentDark }}>Année 1</th>
                              <th className="text-right p-3 font-semibold" style={{ color: C.accentDark }}>Année 2</th>
                              <th className="text-right p-3 font-semibold" style={{ color: C.accentDark }}>Année 3</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              ['Chiffre d\'affaires', '17,4M', '64,0M', '135,0M', C.accent],
                              ['Coûts de production', '-12,0M', '-28,0M', '-45,0M', C.muted],
                              ['Coûts marketing', '-12,0M', '-14,0M', '-18,0M', C.muted],
                              ['Charges fixes', '-8,0M', '-10,0M', '-12,0M', C.muted],
                              ['Coûts totaux', '-32,0M', '-52,0M', '-75,0M', C.gold],
                              ['Résultat net', '-14,6M', '+9,0M', '+39,8M', null],
                            ].map((row, i) => (
                              <tr key={i} className={i % 2 === 0 ? '' : ''} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : `${C.accent}04` }}>
                                <td className="p-3 font-medium" style={{ color: C.primary }}>{row[0]}</td>
                                <td className="p-3 text-right" style={{ color: String(row[1]).startsWith('-') ? C.danger : C.text }}>{row[1]}</td>
                                <td className="p-3 text-right" style={{ color: String(row[2]).startsWith('-') ? C.danger : C.text }}>{row[2]}</td>
                                <td className="p-3 text-right font-semibold" style={{ color: String(row[3]).startsWith('-') ? C.danger : (row[4] as string || C.success) }}>{row[3]}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="budget">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle style={{ color: C.primary }}>Répartition du Budget Marketing (46M Fcfa)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={budgetData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                            {budgetData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `${fmt(value)} Fcfa`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tresorerie">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle style={{ color: C.primary }}>Plan de Trésorerie Prévisionnel (Année 1)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={cashFlowData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
                          <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.muted }} />
                          <YAxis tick={{ fontSize: 11, fill: C.muted }} />
                          <Tooltip formatter={(value: number) => `${value}M Fcfa`} />
                          <Legend />
                          <Area type="monotone" dataKey="encaissements" name="Encaissements" stroke={C.accent} fill={C.accent} fillOpacity={0.2} />
                          <Area type="monotone" dataKey="decaissements" name="Décaissements" stroke={C.danger} fill={C.danger} fillOpacity={0.1} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rentabilite">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold mb-2" style={{ color: C.primary }}>Seuil de Rentabilité</h3>
                      <p className="text-4xl font-bold" style={{ color: C.accent }}>47,6M Fcfa</p>
                      <p className="text-sm mt-2" style={{ color: C.muted }}>Chiffre d&apos;affaires nécessaire pour atteindre l&apos;équilibre — Prévu en Année 2</p>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-6">
                      <div className="text-center p-5 rounded-xl" style={{ backgroundColor: `${C.danger}08` }}>
                        <p className="text-sm font-medium" style={{ color: C.danger }}>Année 1</p>
                        <p className="text-xl font-bold" style={{ color: C.danger }}>-14,6M</p>
                        <p className="text-xs" style={{ color: C.muted }}>Perte initiale prévue</p>
                      </div>
                      <div className="text-center p-5 rounded-xl" style={{ backgroundColor: `${C.gold}08` }}>
                        <p className="text-sm font-medium" style={{ color: C.gold }}>Année 2</p>
                        <p className="text-xl font-bold" style={{ color: C.gold }}>+9,0M</p>
                        <p className="text-xs" style={{ color: C.muted }}>Seuil de rentabilité franchi</p>
                      </div>
                      <div className="text-center p-5 rounded-xl" style={{ backgroundColor: `${C.success}08` }}>
                        <p className="text-sm font-medium" style={{ color: C.success }}>Année 3</p>
                        <p className="text-xl font-bold" style={{ color: C.success }}>+39,8M</p>
                        <p className="text-xs" style={{ color: C.muted }}>Croissance rentable</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </AnimatedSection>

          {/* ═══════ RISQUES ═══════ */}
          <AnimatedSection id="risques">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${C.accent}15` }}>
                <Shield size={24} style={{ color: C.accent }} />
              </div>
              <div>
                <h2 className="text-3xl font-bold" style={{ color: C.primary }}>Analyse des Risques</h2>
                <p className="text-sm" style={{ color: C.muted }}>Identification et mitigation</p>
              </div>
            </div>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="grid gap-3">
                  {riskData.map((risk, i) => {
                    const score = risk.likelihood * risk.impact
                    const level = score >= 12 ? 'Critique' : score >= 8 ? 'Élevé' : score >= 4 ? 'Moyen' : 'Faible'
                    const levelColor = score >= 12 ? C.danger : score >= 8 ? C.warning : score >= 4 ? C.gold : C.success
                    return (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: `${levelColor}06` }}>
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: levelColor }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" style={{ color: C.primary }}>{risk.name}</p>
                        </div>
                        <Badge className="text-xs border-0 shrink-0" style={{ backgroundColor: `${levelColor}15`, color: levelColor }}>
                          {risk.category}
                        </Badge>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-xs" style={{ color: C.muted }}>P:{risk.likelihood}</span>
                          <span className="text-xs" style={{ color: C.muted }}>I:{risk.impact}</span>
                        </div>
                        <Badge className="text-xs border-0 shrink-0" style={{ backgroundColor: `${levelColor}15`, color: levelColor }}>
                          {level}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* ═══════ VISION 5 ANS ═══════ */}
          <AnimatedSection id="vision">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${C.accent}15` }}>
                <Award size={24} style={{ color: C.accent }} />
              </div>
              <div>
                <h2 className="text-3xl font-bold" style={{ color: C.primary }}>Vision à 5 Ans</h2>
                <p className="text-sm" style={{ color: C.muted }}>Plan de développement 2025–2030</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { year: '2026', title: 'Implantation', desc: '29t vendues, 500 agriculteurs, 3–5 partenariats, lancement officiel', color: C.accent },
                { year: '2027', title: 'Expansion', desc: '80t, couverture 10 régions, label Fermes Biodynamiques, seuil rentabilité', color: C.gold },
                { year: '2028', title: 'Consolidation', desc: '150t, export sous-régional, plate-forme e-commerce mature, +39,8M bénéfice', color: C.accentDark },
                { year: '2030', title: 'Leadership', desc: 'Leader Afrique de l\'Ouest fertilisants écologiques, 500t+, 5 pays couverts', color: C.success },
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

            {/* KPIs */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle style={{ color: C.primary }}>Indicateurs de Performance (KPI)</CardTitle>
              </CardHeader>
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
                  <p className="font-bold text-white">LIG Biodynamie</p>
                  <p className="text-xs" style={{ color: C.accent }}>Côte d&apos;Ivoire</p>
                </div>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                Le Centre LIAMBOU GISELE porte la vision d&apos;une Côte d&apos;Ivoire autosuffisante et durable.
                Avec Biodynamie, la nature redevient le moteur de la souveraineté agricole africaine.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">LIG Côte d&apos;Ivoire</h4>
              <div className="space-y-2 text-sm text-white/60">
                <div className="flex items-center gap-2"><Phone size={14} /> +225 21270000</div>
                <div className="flex items-center gap-2"><Phone size={14} /> +225 21271010</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Comptoir Agropastoral CI</h4>
              <div className="space-y-2 text-sm text-white/60">
                <div className="flex items-center gap-2"><Phone size={14} /> WhatsApp: +225 07070707</div>
                <div className="flex items-center gap-2"><Phone size={14} /> WhatsApp: +225 05050505</div>
                <div className="flex items-center gap-2"><Mail size={14} /> info@biodynamie.ci</div>
                <div className="flex items-center gap-2"><Globe size={14} /> ligbiodynamie.ci</div>
              </div>
            </div>
          </div>

          <Separator className="bg-white/10 mb-6" />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-white/40">&copy; 2025 Comptoir Agropastoral CI. Tous droits réservés.</p>
            <a href="/Business_Plan_LIG_Biodynamie_CI.docx" download>
              <Button variant="outline" size="sm" className="border-white/20 text-white/60 hover:bg-white/10 hover:text-white text-xs">
                <Download size={14} className="mr-1.5" />
                Télécharger le Business Plan (DOCX)
              </Button>
            </a>
          </div>
        </div>
      </footer>

      {/* ─── Back to top ─── */}
      {scrollY > 500 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
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

// Missing icon definition
function Zap(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  )
}
