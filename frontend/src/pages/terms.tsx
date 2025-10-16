import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Navigation />

      <section className="max-w-4xl mx-auto px-6 py-16 flex-1">
        <h1 className="text-5xl font-bold text-white mb-4">Vilkår & Betingelser</h1>
        <p className="text-dark-text-secondary mb-8">
          Sidst opdateret: {new Date().toLocaleDateString('da-DK', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="prose prose-invert max-w-none space-y-8">
          {/* Introduktion */}
          <section className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">1. Generelt</h2>
            <p className="text-dark-text-secondary leading-relaxed">
              Velkommen til CourseHub! Disse vilkår og betingelser ("Vilkår") regulerer din brug af CourseHub's hjemmeside og tjenester
              ("Tjenesten"), der leveres af CourseHub ApS, CVR-nr. 12345678 ("CourseHub", "vi", "os" eller "vores").
            </p>
            <p className="text-dark-text-secondary leading-relaxed mt-4">
              Ved at oprette en konto eller bruge vores Tjeneste accepterer du at være bundet af disse Vilkår. Hvis du ikke accepterer
              disse Vilkår, må du ikke bruge Tjenesten.
            </p>
          </section>

          {/* Anvendelse */}
          <section className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">2. Anvendelse af Tjenesten</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">2.1 Krav til brugere</h3>
                <p className="text-dark-text-secondary">
                  For at bruge Tjenesten skal du være mindst 18 år eller have forældrenes/værgens samtykke. Du skal angive
                  sandfærdige og fuldstændige oplysninger ved oprettelse af konto.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">2.2 Licens til brug</h3>
                <p className="text-dark-text-secondary">
                  Vi giver dig en begrænset, ikke-eksklusiv, ikke-overførbar licens til at bruge Tjenesten til personlig eller
                  erhvervsmæssig brug i overensstemmelse med disse Vilkår.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">2.3 Forbudt adfærd</h3>
                <p className="text-dark-text-secondary mb-2">Du må ikke:</p>
                <ul className="list-disc pl-6 text-dark-text-secondary space-y-1">
                  <li>Overtræde lovgivning eller andres rettigheder</li>
                  <li>Dele din konto med andre uden tilladelse</li>
                  <li>Forsøge at få uautoriseret adgang til Tjenesten</li>
                  <li>Reverse-engineer, dekompilere eller demonter Tjenesten</li>
                  <li>Uploade malware, vira eller skadelig kode</li>
                  <li>Spamme, phish eller distribuere uønsket indhold</li>
                  <li>Videresælge eller distribuere kurser uden tilladelse</li>
                  <li>Bruge automatiserede scripts (bots) uden godkendelse</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Brugerkonti */}
          <section className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">3. Brugerkonti</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">3.1 Kontooprettelse</h3>
                <p className="text-dark-text-secondary">
                  Du skal oprette en konto for at få adgang til de fleste funktioner. Du er ansvarlig for at beskytte dit kodeord
                  og for al aktivitet på din konto.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">3.2 Kontosikkerhed</h3>
                <p className="text-dark-text-secondary">
                  Du skal straks informere os hvis du opdager uautoriseret brug af din konto. Vi er ikke ansvarlige for tab
                  som følge af uautoriseret brug af din konto.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">3.3 Suspendering og lukning</h3>
                <p className="text-dark-text-secondary">
                  Vi forbeholder os retten til at suspendere eller lukke din konto hvis du overtræder disse Vilkår eller hvis
                  vi har mistanke om svigagtigt eller ulovligt brug.
                </p>
              </div>
            </div>
          </section>

          {/* Kurser og køb */}
          <section className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">4. Kurser og Køb</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">4.1 Kursuslicenser</h3>
                <p className="text-dark-text-secondary">
                  Når du køber et kursus, får du en ikke-eksklusiv licens til at få adgang til kursusindholdet. Licensen er
                  personlig og må ikke deles med andre medmindre andet er angivet (f.eks. virksomhedslicenser).
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">4.2 Priser</h3>
                <p className="text-dark-text-secondary">
                  Alle priser er angivet i danske kroner (DKK) inklusive moms, medmindre andet er angivet. Vi forbeholder os
                  retten til at ændre priser til enhver tid, men ændringer påvirker ikke allerede gennemførte køb.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">4.3 Betalingsmetoder</h3>
                <p className="text-dark-text-secondary">
                  Betaling behandles sikkert via vores betalingsudbyder Stripe. Vi gemmer ikke kortoplysninger. Ved køb
                  accepterer du at betale det angivne beløb og giver os tilladelse til at opkræve betalingen.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">4.4 Abonnementer</h3>
                <p className="text-dark-text-secondary">
                  Visse tjenester kan være abonnementsbaserede. Abonnementer fornyes automatisk medmindre du opsiger inden
                  næste fornyelsesdato. Du kan til enhver tid opsige dit abonnement i dine kontoindstillinger.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">4.5 Refusioner</h3>
                <p className="text-dark-text-secondary mb-2">
                  I henhold til dansk forbrugerlovgivning har du 14 dages fortrydelsesret fra købsdato. Du kan anmode om
                  fuld refusion inden for denne periode. Efter 14 dage vurderes refusion individuelt baseret på:
                </p>
                <ul className="list-disc pl-6 text-dark-text-secondary space-y-1">
                  <li>Om du har påbegyndt kurset</li>
                  <li>Omfanget af brugt indhold</li>
                  <li>Årsag til refusionsanmodning</li>
                </ul>
                <p className="text-dark-text-secondary mt-2">
                  Kontakt <a href="mailto:support@coursehub.dk" className="text-primary hover:underline">support@coursehub.dk</a> for refusionsanmodninger.
                </p>
              </div>
            </div>
          </section>

          {/* Intellektuel ejendomsret */}
          <section className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">5. Intellektuel Ejendomsret</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">5.1 CourseHub's rettigheder</h3>
                <p className="text-dark-text-secondary">
                  Al kursusindhold, tekster, grafik, logoer, ikoner, billeder, lydklip, videoklip og software tilhører
                  CourseHub eller vores licensgivere og er beskyttet af dansk og international ophavsret.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">5.2 Kursusudbyderes rettigheder</h3>
                <p className="text-dark-text-secondary">
                  Kursusudbydere bevarer alle rettigheder til deres kursusindhold. Ved at uploade indhold til vores platform
                  giver udbyderne os licens til at distribuere indholdet.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">5.3 Brugerindhold</h3>
                <p className="text-dark-text-secondary">
                  Ved at uploade indhold (anmeldelser, kommentarer, spørgsmål) giver du CourseHub en verdensomspændende,
                  ikke-eksklusiv, royalty-fri licens til at bruge, vise og distribuere indholdet i forbindelse med Tjenesten.
                </p>
              </div>
            </div>
          </section>

          {/* Ansvar og garanti */}
          <section className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">6. Ansvar og Garanti</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">6.1 Ansvarsfraskrivelse</h3>
                <p className="text-dark-text-secondary">
                  Tjenesten leveres "som den er" uden garantier af nogen art. Vi garanterer ikke at Tjenesten er fejlfri,
                  sikker eller tilgængelig til enhver tid. Vi er ikke ansvarlige for indhold leveret af tredjeparter (kursusudbydere).
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">6.2 Ansvarsbegrænsning</h3>
                <p className="text-dark-text-secondary">
                  I det omfang loven tillader det, er CourseHub's samlede ansvar begrænset til det beløb du har betalt til os
                  de seneste 12 måneder. Vi er ikke ansvarlige for indirekte tab, tabt fortjeneste eller følgeskader.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">6.3 Force majeure</h3>
                <p className="text-dark-text-secondary">
                  Vi er ikke ansvarlige for forsinkelser eller manglende opfyldelse af forpligtelser forårsaget af omstændigheder
                  uden for vores kontrol (naturkatastrofer, krig, strejker, internetudfald, etc.).
                </p>
              </div>
            </div>
          </section>

          {/* Opsigelse */}
          <section className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">7. Opsigelse</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">7.1 Din ret til opsigelse</h3>
                <p className="text-dark-text-secondary">
                  Du kan til enhver tid lukke din konto ved at kontakte os eller via kontoindstillingerne. Ved lukning af konto
                  mister du adgang til alle kurser, medmindre andet er aftalt.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">7.2 Vores ret til opsigelse</h3>
                <p className="text-dark-text-secondary">
                  Vi kan suspendere eller lukke din konto med øjeblikkelig virkning hvis du overtræder disse Vilkår. Ved
                  alvorlige overtrædelser forbeholder vi os retten til at nægte fremtidig adgang.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">7.3 Effekt af opsigelse</h3>
                <p className="text-dark-text-secondary">
                  Ved opsigelse slettes din personlige information i henhold til vores <Link href="/privacy" className="text-primary hover:underline">privatlivspolitik</Link>.
                  Bestemmelser der efter deres natur skal overleve (betalingsforpligtelser, ansvarsbegrænsninger) forbliver i kraft.
                </p>
              </div>
            </div>
          </section>

          {/* Lovvalg */}
          <section className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">8. Lovvalg og Tvistløsning</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">8.1 Lovvalg</h3>
                <p className="text-dark-text-secondary">
                  Disse Vilkår er underlagt dansk ret. Ved tvister mellem dig som forbruger og CourseHub gælder dansk rets
                  forbrugerværnsregler.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">8.2 Tvistløsning</h3>
                <p className="text-dark-text-secondary">
                  Vi opfordrer til at løse tvister i mindelighed. Som forbruger kan du klage til Konkurrence- og Forbrugerstyrelsen
                  eller Forbrugerklagenævnet. Erhvervskunder accepterer Københavns Byrets eksklusive kompetence.
                </p>
                <div className="mt-4 bg-dark-bg border border-dark-border rounded-lg p-4">
                  <p className="text-white font-semibold">Forbrugerklagenævnet</p>
                  <p className="text-dark-text-secondary">Toldboden 2</p>
                  <p className="text-dark-text-secondary">8800 Viborg</p>
                  <p className="text-dark-text-secondary mt-2">Email: naevn@naevneneshus.dk</p>
                  <p className="text-dark-text-secondary">Web: naevneneshus.dk</p>
                </div>
              </div>
            </div>
          </section>

          {/* Ændringer */}
          <section className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">9. Ændringer til Vilkår</h2>
            <p className="text-dark-text-secondary">
              Vi kan opdatere disse Vilkår fra tid til anden. Væsentlige ændringer vil blive meddelt via email eller fremtrædende
              notifikation på hjemmesiden mindst 30 dage før ikrafttræden. Din fortsatte brug af Tjenesten efter ændringerne
              træder i kraft udgør accept af de nye Vilkår.
            </p>
          </section>

          {/* Diverse */}
          <section className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">10. Diverse Bestemmelser</h2>
            <div className="space-y-3 text-dark-text-secondary">
              <p><strong className="text-white">10.1 Hele aftalen:</strong> Disse Vilkår udgør den fulde aftale mellem dig og CourseHub</p>
              <p><strong className="text-white">10.2 Overførsel:</strong> Du må ikke overføre dine rettigheder uden vores skriftlige samtykke</p>
              <p><strong className="text-white">10.3 Selvstændighed:</strong> Hvis en bestemmelse er ugyldig, forbliver de øvrige i kraft</p>
              <p><strong className="text-white">10.4 Afkald:</strong> Vores manglende håndhævelse af en rettighed udgør ikke afkald på rettigheden</p>
              <p><strong className="text-white">10.5 Overskrifter:</strong> Sektionsoverskrifter er kun til orientering og ikke juridisk bindende</p>
            </div>
          </section>

          {/* Kontakt */}
          <section className="bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Spørgsmål til Vilkårene?</h2>
            <p className="text-dark-text-secondary mb-6">
              Kontakt os hvis du har spørgsmål til disse vilkår og betingelser
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="mailto:legal@coursehub.dk"
                className="px-8 py-3 bg-primary rounded-xl text-white hover:bg-primary/90 transition-colors font-semibold"
              >
                Kontakt Juridisk
              </a>
              <Link
                href="/contact"
                className="px-8 py-3 bg-white text-dark-bg hover:bg-white/90 transition-colors font-semibold rounded-xl"
              >
                Generel kontakt
              </Link>
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </div>
  )
}
