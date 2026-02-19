import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, ArrowRight, Shield, FileText, Users, CheckCircle, ClipboardCheck, Scale, BadgeCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-lg">ARC-CSU</span>
              <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">RDC</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/register">
              <Button>S&apos;inscrire</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-secondary/50 text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Plateforme officielle de la République Démocratique du Congo
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="text-primary">ARC-CSU</span>
            <br />
            <span className="text-foreground text-2xl md:text-4xl">
              Autorité de Régulation et Contrôle de la Couverture Santé Universelle
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            &quot;Ensemble pour garantir un accès équitable aux soins de santé de qualité sans barrière financière&quot;
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Accéder aux services en ligne
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Se connecter
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex justify-center gap-4 text-sm text-muted-foreground">
            <span>📞 +243 898 240 292</span>
            <span>📞 +243 893 779 022</span>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Nos Services</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <BadgeCheck className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Accréditation des établissements</h3>
            <p className="text-muted-foreground">
              Nous délivrons des accréditations aux établissements de soins de santé et 
              pharmaceutiques qui répondent aux normes de qualité et de sécurité en vigueur.
            </p>
          </div>
          <div className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-secondary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Certification du personnel</h3>
            <p className="text-muted-foreground">
              Nous garantissons la qualification des acteurs impliqués dans la mise en œuvre 
              de la CSU en certifiant leur compétence et leur conformité.
            </p>
          </div>
          <div className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
              <Scale className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Régulation des tarifs</h3>
            <p className="text-muted-foreground">
              Nous fixons des tarifs forfaitaires des prestations de soins de santé, 
              des produits pharmaceutiques et des dispositifs médicaux.
            </p>
          </div>
          <div className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
              <ClipboardCheck className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Validation des protocoles</h3>
            <p className="text-muted-foreground">
              Nous approuvons les protocoles thérapeutiques afin d&apos;assurer une prise en charge 
              médicale standardisée et efficace au sein du système CSU.
            </p>
          </div>
          <div className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Contrôle et conformité</h3>
            <p className="text-muted-foreground">
              Nous veillons à l&apos;application rigoureuse des normes et réglementations 
              pour assurer un système de CSU fiable et efficace.
            </p>
          </div>
          <div className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Gestion des établissements</h3>
            <p className="text-muted-foreground">
              Cartographie et suivi des établissements de santé (ESS) et pharmaceutiques (EPVG) 
              sur l&apos;ensemble du territoire national.
            </p>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Qu&apos;est-ce que l&apos;ARC-CSU ?
            </h2>
            <p className="text-muted-foreground mb-6">
              L&apos;Autorité de Régulation et Contrôle de la Couverture Santé Universelle (ARC-CSU) est un 
              établissement public institué par le Décret n° 22/14 du 09 avril 2022. Elle assure la régulation 
              et le contrôle du système de Couverture Santé Universelle (CSU) en République Démocratique du Congo, 
              en veillant au respect des normes et des principes établis par le cadre légal en vigueur.
            </p>
            <p className="text-sm text-muted-foreground">
              Conformément à la Loi n° 18/035 du 13 décembre 2018, modifiée et complétée par l&apos;Ordonnance-Loi n° 23/006 du 3 mars 2023
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <span className="font-bold text-lg">ARC-CSU</span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm max-w-md">
                Autorité de Régulation et Contrôle de la Couverture Santé Universelle
                <br />
                République Démocratique du Congo
              </p>
              <p className="text-muted-foreground text-xs mt-2">
                Établissement public institué par le Décret n° 22/14 du 09 avril 2022
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>53 Mbuji-mayi, Immeuble KALUME</li>
                <li>3ème étage, Kinshasa - Gombe</li>
                <li>Tél: +243 898 240 292</li>
                <li>contact@arccsu.gouv.cd</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Liens utiles</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://arccsu.gouv.cd" className="text-muted-foreground hover:text-primary transition-colors">
                    ARC-CSU
                  </a>
                </li>
                <li>
                  <a href="https://sante.gouv.cd" className="text-muted-foreground hover:text-primary transition-colors">
                    Ministère de la Santé
                  </a>
                </li>
                <li>
                  <a href="https://presidence.cd" className="text-muted-foreground hover:text-primary transition-colors">
                    Présidence RDC
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} ARC-CSU - République Démocratique du Congo. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
