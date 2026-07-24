export const metadata = {
  title: "Terms of Service | EduSaaS",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-10 text-slate-700">
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-slate-900">Terms of Service</h1>
        <p className="text-sm text-slate-400 font-medium">Last updated: [DATE — fill in before launch]</p>
      </div>

      <p className="leading-relaxed">
        These Terms of Service ("Terms") govern your access to and use of the
        EduSaaS platform ("Service"). By creating an account or using the
        Service, you agree to be bound by these Terms. If you do not agree,
        do not use the Service.
      </p>

      <section className="space-y-3">
        <h2 className="text-xl font-black text-slate-900">1. Accounts</h2>
        <p className="leading-relaxed">
          You are responsible for maintaining the confidentiality of your
          account credentials and for all activity that occurs under your
          account. You must provide accurate information when registering
          and keep it up to date.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black text-slate-900">2. Tenant Accounts &amp; Data</h2>
        <p className="leading-relaxed">
          Each school, academy, or organization ("Tenant") that registers on
          EduSaaS is responsible for the accuracy of the data it enters and
          for managing access for its own users (teachers, students, and
          administrators). Tenant data is logically isolated from other
          Tenants on the platform.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black text-slate-900">3. Acceptable Use</h2>
        <p className="leading-relaxed">
          You agree not to misuse the Service — including attempting to
          access another Tenant's data, interfering with the platform's
          operation, or uploading unlawful or infringing content.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black text-slate-900">4. Subscriptions &amp; Billing</h2>
        <p className="leading-relaxed">
          Paid plans are billed in advance on a recurring basis as described
          at checkout. Fees are non-refundable except where required by law.
          [Placeholder — confirm exact billing/refund terms with the billing
          module before publishing.]
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black text-slate-900">5. Termination</h2>
        <p className="leading-relaxed">
          We may suspend or terminate access to the Service for violation of
          these Terms. Tenants may cancel their subscription at any time;
          access continues until the end of the current billing period.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black text-slate-900">6. Disclaimer &amp; Limitation of Liability</h2>
        <p className="leading-relaxed">
          The Service is provided "as is" without warranties of any kind.
          To the maximum extent permitted by law, EduSaaS is not liable for
          indirect, incidental, or consequential damages arising from use of
          the Service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black text-slate-900">7. Changes to These Terms</h2>
        <p className="leading-relaxed">
          We may update these Terms from time to time. Continued use of the
          Service after changes take effect constitutes acceptance of the
          revised Terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black text-slate-900">8. Contact</h2>
        <p className="leading-relaxed">
          Questions about these Terms can be sent to [SUPPORT EMAIL — fill
          in before launch].
        </p>
      </section>

      <p className="text-xs text-slate-400 italic pt-6 border-t">
        This document is a placeholder template and does not constitute
        legal advice. It should be reviewed by a qualified lawyer before
        the platform goes live.
      </p>
    </div>
  );
}