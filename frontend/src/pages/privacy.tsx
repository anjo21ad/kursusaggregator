import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Navigation />

      <section className="max-w-4xl mx-auto px-6 py-16 flex-1">
        <h1 className="text-5xl font-bold text-white mb-4">Privatlivspolitik</h1>
        <p className="text-dark-text-secondary mb-8">
          Sidst opdateret: {new Date().toLocaleDateString('da-DK', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="prose prose-invert max-w-none space-y-8">
          {/* Introduktion */}
          <section className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">1. Introduktion</h2>
            <p className="text-dark-text-secondary leading-relaxed">
              CourseHub ApS ("vi", "os" eller "vores") respekterer dit privatliv og er forpligtet til at beskytte dine personoplysninger.
              Denne privatlivspolitik beskriver, hvordan vi indsamler, bruger, opbevarer og beskytter dine personoplysninger, når du bruger
              vores hjemmeside og tjenester (samlet "Tjenesten").
            </p>
            <p className="text-dark-text-secondary leading-relaxed mt-4">
              Ved at bruge vores Tjeneste accepterer du behandlingen af dine personoplysninger som beskrevet i denne politik. Hvis du ikke
              accepterer vilkårene i denne politik, bedes du ikke bruge vores Tjeneste.
            </p>
          </section>

          {/* Dataansvarlig */}
          <section className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">2. Dataansvarlig</h2>
            <div className="text-dark-text-secondary leading-relaxed">
              <p className="mb-4">Dataansvarlig for behandlingen af dine personoplysninger er:</p>
              <div className="pl-4 border-l-4 border-primary">
                <p><strong className="text-white">CourseHub ApS</strong></p>
                <p>CVR-nr.: 12345678</p>
                <p>Vestergade 1, 2. sal</p>
                <p>1456 København K</p>
                <p className="mt-2">
                  Email: <a href="mailto:privacy@coursehub.dk" className="text-primary hover:underline">privacy@coursehub.dk</a>
                </p>
                <p>Telefon: +45 70 12 34 56</p>
              </div>
            </div>
          </section>

          {/* Hvilke oplysninger indsamler vi */}
          <section className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">3. Hvilke personoplysninger indsamler vi</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">3.1 Oplysninger du giver os</h3>
                <ul className="list-disc pl-6 text-dark-text-secondary space-y-2">
                  <li>Navn, email og telefonnummer ved oprettelse af konto</li>
                  <li>Virksomhedsoplysninger (firmanavn, CVR-nr.) for erhvervskunder</li>
                  <li>Betalingsoplysninger (behandles af vores betalingsudbyder Stripe)</li>
                  <li>Kommunikation med vores support-team</li>
                  <li>Feedback og anmeldelser af kurser</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">3.2 Oplysninger vi indsamler automatisk</h3>
                <ul className="list-disc pl-6 text-dark-text-secondary space-y-2">
                  <li>IP-adresse og browsertype</li>
                  <li>Besøgte sider og klikaktivitet</li>
                  <li>Tidspunkt for besøg og session-varighed</li>
                  <li>Enhedsoplysninger (enhedstype, operativsystem)</li>
                  <li>Cookies og lignende teknologier (se vores <Link href="/cookies" className="text-primary hover:underline">cookie-politik</Link>)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">3.3 Oplysninger fra tredjeparter</h3>
                <ul className="list-disc pl-6 text-dark-text-secondary space-y-2">
                  <li>Login via Google eller Microsoft (navn, email, profilbillede)</li>
                  <li>Betalingsinformation fra Stripe (transaktion status, ikke kortoplysninger)</li>
                  <li>Analyseinformation fra Google Analytics (anonymiseret)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Hvordan bruger vi dine oplysninger */}
          <section className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">4. Hvordan bruger vi dine personoplysninger</h2>
            <div className="space-y-4">
              <p className="text-dark-text-secondary">Vi bruger dine personoplysninger til følgende formål:</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">📚 Levering af tjenester</h4>
                  <p className="text-dark-text-secondary text-sm">Oprette og administrere din konto, give adgang til kurser, behandle betalinger</p>
                </div>

                <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">💬 Kommunikation</h4>
                  <p className="text-dark-text-secondary text-sm">Sende vigtige opdateringer, kvitteringer, support-beskeder og marketing (med samtykke)</p>
                </div>

                <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">📊 Forbedring</h4>
                  <p className="text-dark-text-secondary text-sm">Analysere brug af platformen, identificere fejl, forbedre brugeroplevelsen</p>
                </div>

                <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">🔒 Sikkerhed</h4>
                  <p className="text-dark-text-secondary text-sm">Opdage og forebygge svindel, misbrug og sikkerhedstrusler</p>
                </div>

                <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">⚖️ Juridisk</h4>
                  <p className="text-dark-text-secondary text-sm">Overholde lovkrav, håndhæve vores vilkår, beskytte rettigheder</p>
                </div>

                <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">🎯 Personalisering</h4>
                  <p className="text-dark-text-secondary text-sm">Tilpasse indhold og anbefalinger baseret på dine interesser</p>
                </div>
              </div>
            </div>
          </section>

          {/* Retsgrundlag */}
          <section className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">5. Retsgrundlag for behandling (GDPR)</h2>
            <div className="space-y-3 text-dark-text-secondary">
              <p><strong className="text-white">Kontraktopfyldelse:</strong> Behandling nødvendig for at levere vores tjenester til dig</p>
              <p><strong className="text-white">Samtykke:</strong> Marketing-kommunikation og visse cookies kræver dit samtykke</p>
              <p><strong className="text-white">Legitime interesser:</strong> Forbedring af tjenesten, sikkerhed, forebyggelse af svindel</p>
              <p><strong className="text-white">Lovkrav:</strong> Opbevaring af bogføringsbilag, overholdelse af skattelovgivning</p>
            </div>
          </section>

          {/* Deling af data */}
          <section className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">6. Deling af personoplysninger</h2>
            <p className="text-dark-text-secondary mb-4">Vi deler kun dine personoplysninger med:</p>
            <ul className="list-disc pl-6 text-dark-text-secondary space-y-2">
              <li><strong className="text-white">Kursusudbydere:</strong> Når du køber et kursus, deler vi nødvendige oplysninger med udbyderen</li>
              <li><strong className="text-white">Betalingsudbydere:</strong> Stripe behandler betalinger på vores vegne</li>
              <li><strong className="text-white">Hosting og infrastruktur:</strong> Vercel, Supabase for drift af platformen</li>
              <li><strong className="text-white">Analyse-værktøjer:</strong> Google Analytics (anonymiseret data)</li>
              <li><strong className="text-white">Email-tjenester:</strong> For at sende transaktionelle emails og nyhedsbreve</li>
              <li><strong className="text-white">Juridiske krav:</strong> Hvis lovgivningen kræver det eller ved retskendelse</li>
            </ul>
            <p className="text-dark-text-secondary mt-4">
              <strong className="text-white">Vi sælger aldrig dine personoplysninger til tredjeparter.</strong>
            </p>
          </section>

          {/* Opbevaring */}
          <section className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">7. Opbevaring af personoplysninger</h2>
            <p className="text-dark-text-secondary mb-4">Vi opbevarer dine personoplysninger:</p>
            <ul className="list-disc pl-6 text-dark-text-secondary space-y-2">
              <li>Så længe du har en aktiv konto hos os</li>
              <li>I yderligere 5 år efter kontoafslutning for bogføringsformål (lovkrav)</li>
              <li>Anonymiseret analyse-data kan opbevares på ubestemt tid</li>
              <li>Marketing-samtykker slettes umiddelbart ved tilbagetrækning</li>
            </ul>
          </section>

          {/* Dine rettigheder */}
          <section className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">8. Dine rettigheder</h2>
            <p className="text-dark-text-secondary mb-4">Du har følgende rettigheder i henhold til GDPR:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">✅ Ret til indsigt</h4>
                <p className="text-dark-text-secondary text-sm">Se hvilke oplysninger vi har om dig</p>
              </div>

              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">✏️ Ret til berigtigelse</h4>
                <p className="text-dark-text-secondary text-sm">Rette forkerte eller ufuldstændige oplysninger</p>
              </div>

              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">🗑️ Ret til sletning</h4>
                <p className="text-dark-text-secondary text-sm">Få slettet dine oplysninger ("retten til at blive glemt")</p>
              </div>

              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">⏸️ Ret til begrænsning</h4>
                <p className="text-dark-text-secondary text-sm">Begrænse behandlingen af dine oplysninger</p>
              </div>

              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">📦 Ret til dataportabilitet</h4>
                <p className="text-dark-text-secondary text-sm">Modtage dine data i et struktureret format</p>
              </div>

              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">⛔ Ret til indsigelse</h4>
                <p className="text-dark-text-secondary text-sm">Gøre indsigelse mod behandling baseret på legitime interesser</p>
              </div>
            </div>

            <p className="text-dark-text-secondary mt-6">
              For at udøve dine rettigheder, kontakt os på <a href="mailto:privacy@coursehub.dk" className="text-primary hover:underline">privacy@coursehub.dk</a>.
              Vi behandler din anmodning inden for 30 dage.
            </p>
          </section>

          {/* Sikkerhed */}
          <section className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">9. Sikkerhed</h2>
            <p className="text-dark-text-secondary mb-4">
              Vi implementerer passende tekniske og organisatoriske sikkerhedsforanstaltninger for at beskytte dine personoplysninger:
            </p>
            <ul className="list-disc pl-6 text-dark-text-secondary space-y-2">
              <li>SSL/TLS-kryptering af al datatransmission</li>
              <li>Kryptering af følsomme data ved opbevaring</li>
              <li>Regelmæssige sikkerhedsaudits og penetrationstest</li>
              <li>Adgangskontrol og to-faktor autentifikation for medarbejdere</li>
              <li>Regelmæssige backups med kryptering</li>
              <li>Incident response plan ved databrud</li>
            </ul>
          </section>

          {/* Klage */}
          <section className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">10. Klage til Datatilsynet</h2>
            <p className="text-dark-text-secondary mb-4">
              Hvis du er utilfreds med vores behandling af dine personoplysninger, har du ret til at indgive en klage til Datatilsynet:
            </p>
            <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
              <p className="text-white font-semibold">Datatilsynet</p>
              <p className="text-dark-text-secondary">Carl Jacobsens Vej 35</p>
              <p className="text-dark-text-secondary">2500 Valby</p>
              <p className="text-dark-text-secondary mt-2">Email: dt@datatilsynet.dk</p>
              <p className="text-dark-text-secondary">Tlf: 33 19 32 00</p>
            </div>
          </section>

          {/* Ændringer */}
          <section className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">11. Ændringer til denne politik</h2>
            <p className="text-dark-text-secondary">
              Vi kan opdatere denne privatlivspolitik fra tid til anden. Væsentlige ændringer vil blive meddelt via email eller
              fremtrædende notifikation på vores hjemmeside. Dato for seneste opdatering findes øverst på denne side. Vi opfordrer
              dig til at gennemgå denne politik regelmæssigt.
            </p>
          </section>

          {/* Kontakt */}
          <section className="bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Har du spørgsmål?</h2>
            <p className="text-dark-text-secondary mb-6">
              Kontakt vores Data Protection Officer (DPO) hvis du har spørgsmål til denne privatlivspolitik
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="mailto:privacy@coursehub.dk"
                className="px-8 py-3 bg-primary rounded-xl text-white hover:bg-primary/90 transition-colors font-semibold"
              >
                Kontakt DPO
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
