import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-16">
      <div className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(210,10,10,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,168,67,0.03),transparent_50%)]" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <span className="inline-block bg-ufc-red/10 text-ufc-red text-[10px] uppercase tracking-[0.2em] font-semibold px-4 py-1.5 rounded-full border border-ufc-red/20 mb-4">Legal</span>
          <h1 className="text-white text-3xl md:text-4xl font-bold uppercase tracking-tight">Terms of Service</h1>
          <p className="text-gray-500 text-sm mt-3">Last updated: June 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-20 space-y-8">
        <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-6 md:p-8 space-y-6 text-gray-300 text-sm leading-relaxed">
          <Section title="1. Acceptance of Terms">
            By accessing or using UFC.SOLUTIONS, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.
          </Section>

          <Section title="2. Service Description">
            UFC.SOLUTIONS provides links to third-party live streams and recorded fight content. We do not host, store, or transmit any copyrighted content on our servers. All content is embedded from or linked to third-party sources.
          </Section>

          <Section title="3. User Responsibilities">
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>You must be at least 18 years old to use this service</li>
              <li>You agree not to use the service for any unlawful purpose</li>
              <li>You agree not to attempt to bypass any content restrictions</li>
              <li>You are responsible for your account credentials</li>
            </ul>
          </Section>

          <Section title="4. Intellectual Property">
            All trademarks, logos, and brand names are the property of their respective owners. UFC.SOLUTIONS is not affiliated with, endorsed by, or sponsored by the UFC or any related entities.
          </Section>

          <Section title="5. Third-Party Links">
            Our service may contain links to third-party websites. We are not responsible for the content, privacy policies, or practices of these third-party sites.
          </Section>

          <Section title="6. Disclaimer of Warranties">
            The service is provided &ldquo;as is&rdquo; without any warranties, express or implied. We do not guarantee uninterrupted or error-free service.
          </Section>

          <Section title="7. Limitation of Liability">
            UFC.SOLUTIONS shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.
          </Section>

          <Section title="8. Changes to Terms">
            We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
          </Section>

          <Section title="9. Contact">
            For questions about these terms, please visit our <Link href="/contact" className="text-ufc-red hover:text-red-300 underline">Contact page</Link>.
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-white text-base font-bold mb-3">{title}</h2>
      <div className="text-gray-400 leading-relaxed">{children}</div>
    </div>
  );
}
