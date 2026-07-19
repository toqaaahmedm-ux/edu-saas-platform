export const metadata = {
  title: "Privacy Policy | EduSaaS",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-10 text-slate-700">
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-slate-900">Privacy Policy</h1>
        <p className="text-sm text-slate-400 font-medium">Last updated: [DATE — fill in before launch]</p>
      </div>

      <p className="leading-relaxed">
        This Privacy Policy explains how EduSaaS ("we", "us") collects, uses,
        and protects information when you use our platform.
      </p>

      <section className="space-y-3">
        <h2 className="text-xl font-black text-slate-900">1. Information We Collect</h2>
        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
          <li>Account information: name, email address, and role (student, teacher, admin).</li>
          <li>Academic data: course enrollments, quiz attempts, grades, assignment submissions, and attendance records.</li>
          <li>Usage data: log data such as IP address, browser type, and pages visited, collected automatically.</li>
          <li>Uploaded content: files, images, and documents you or your Tenant upload to the platform.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black text-slate-900">2. How We Use Information</h2>
        <p className="leading-relaxed">
          We use collected information to operate and improve the Service,
          authenticate users, process payments, send transactional emails
          (such as password resets and account notifications), and provide
          customer support.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black text-slate-900">3. Data Isolation Between Tenants</h2>
        <p className="leading-relaxed">
          Each Tenant's data (students, courses, grades, and quizzes) is
          logically separated from other Tenants. Tenant administrators can
          access data belonging to their own organization only.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black text-slate-900">4. Data Sharing</h2>
        <p className="leading-relaxed">
          We do not sell personal information. We may share data with
          service providers who help us operate the platform (e.g. email
          delivery, file storage, payment processing), under confidentiality
          obligations. [Placeholder — list actual third-party processors
          before publishing, e.g. Resend, Cloudinary, Stripe.]
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black text-slate-900">5. Data Retention</h2>
        <p className="leading-relaxed">
          We retain account and academic data for as long as the account is
          active, or as needed to comply with legal obligations. Tenants may
          request deletion of their data by contacting support.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black text-slate-900">6. Your Rights</h2>
        <p className="leading-relaxed">
          Depending on your location, you may have rights to access, correct,
          or delete your personal information. To exercise these rights,
          contact us using the details below.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black text-slate-900">7. Security</h2>
        <p className="leading-relaxed">
          We use industry-standard measures — including password hashing and
          encrypted connections — to protect your information. No method of
          transmission or storage is 100% secure.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black text-slate-900">8. Children's Privacy</h2>
        <p className="leading-relaxed">
          Our Service may be used by students under the age of 18 through
          their school or academy (a Tenant). Tenants are responsible for
          obtaining any consent required by applicable law before enrolling
          minors on the platform.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black text-slate-900">9. Changes to This Policy</h2>
        <p className="leading-relaxed">
          We may update this Privacy Policy from time to time. We will
          notify users of material changes where required by law.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black text-slate-900">10. Contact</h2>
        <p className="leading-relaxed">
          Questions about this Privacy Policy can be sent to [SUPPORT EMAIL
          — fill in before launch].
        </p>
      </section>

      <p className="text-xs text-slate-400 italic pt-6 border-t">
        This document is a placeholder template and does not constitute
        legal advice. It should be reviewed by a qualified lawyer — ideally
        one familiar with data protection laws relevant to your users
        (e.g. GDPR, COPPA) — before the platform goes live.
      </p>
    </div>
  );
}