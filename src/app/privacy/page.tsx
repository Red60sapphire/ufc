import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-16">
      <div className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(210,10,10,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,168,67,0.03),transparent_50%)]" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <span className="inline-block bg-ufc-red/10 text-ufc-red text-[10px] uppercase tracking-[0.2em] font-semibold px-4 py-1.5 rounded-full border border-ufc-red/20 mb-4">Legal</span>
          <h1 className="text-white text-3xl md:text-4xl font-bold uppercase tracking-tight">Privacy Policy</h1>
          <p className="text-gray-500 text-sm mt-3">Last updated: June 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-20 space-y-8">
        <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-6 md:p-8 space-y-6 text-gray-300 text-sm leading-relaxed">
          <Section title="1. Information We Collect">
            We collect minimal information necessary to provide our service:
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
              <li>Account information (username, email) if you register</li>
              <li>Chat messages you send</li>
              <li>Basic usage analytics (page views, referrer)</li>
            </ul>
          </Section>

          <Section title="2. Cookies">
            We use a session cookie to maintain your login state. This cookie contains your session information encoded in base64. No tracking cookies are used. You can clear cookies at any time in your browser settings.
          </Section>

          <Section title="3. Data Storage">
            Your data is stored on our servers (Neon Postgres database). We implement reasonable security measures to protect your information. Passwords are hashed using bcrypt before storage.
          </Section>

          <Section title="4. Third-Party Services">
            We use the following third-party services:
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
              <li>Neon (Postgres database hosting)</li>
              <li>Vercel (hosting and deployment)</li>
              <li>Vercel Blob (video upload storage)</li>
            </ul>
            Each service has its own privacy policy governing how they handle data.
          </Section>

          <Section title="5. Data Sharing">
            We do not sell, trade, or share your personal information with third parties except as required by law or as necessary to operate our service.
          </Section>

          <Section title="6. Your Rights">
            You may request deletion of your account and associated data by contacting us. Chat messages are anonymized rather than deleted to preserve conversation context.
          </Section>

          <Section title="7. Changes to This Policy">
            We may update this privacy policy from time to time. Changes will be posted on this page with an updated &ldquo;Last updated&rdquo; date.
          </Section>

          <Section title="8. Contact">
            For questions about this policy, please visit our <Link href="/contact" className="text-ufc-red hover:text-red-300 underline">Contact page</Link>.
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
