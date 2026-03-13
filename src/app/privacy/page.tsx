import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Davar",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1 text-sm text-accent hover:text-accent-hover transition-colors"
        >
          &larr; Back to app
        </Link>

        <h1 className="mt-6 text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-text-secondary text-sm">
          Last updated: March 2026
        </p>

        <p className="mt-6 text-text-secondary leading-relaxed">
          Davar is a Hebrew learning app that respects your privacy. This policy
          explains what data we collect, how it is stored, and what choices you
          have.
        </p>

        {/* 1. What We Collect */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold">1. What We Collect</h2>
          <ul className="mt-3 list-disc pl-6 space-y-2 text-text-secondary leading-relaxed">
            <li>
              <strong className="text-text-primary">Email address</strong> —
              collected only if you create an account, via Google OAuth or magic
              link sign-in.
            </li>
            <li>
              <strong className="text-text-primary">Learning progress data</strong> —
              vocabulary reviews, quiz scores, XP, and streaks.
            </li>
            <li>
              <strong className="text-text-primary">
                No data is collected from users who do not create an account.
              </strong>{" "}
              You can use Davar fully without signing up.
            </li>
          </ul>
        </section>

        {/* 2. How Data Is Stored */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold">2. How Data Is Stored</h2>
          <ul className="mt-3 list-disc pl-6 space-y-2 text-text-secondary leading-relaxed">
            <li>
              All learning data is stored locally in your browser using
              localStorage.
            </li>
            <li>
              If you create an account, your progress is synced to Supabase (a
              cloud database) so you can access it across devices.
            </li>
            <li>
              Settings — including any API keys you configure — are stored only in
              your browser and are never synced to the cloud.
            </li>
          </ul>
        </section>

        {/* 3. Third-Party Services */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold">3. Third-Party Services</h2>
          <p className="mt-3 text-text-secondary leading-relaxed">
            Davar integrates with the following third-party services. Each is
            used only when you explicitly opt in.
          </p>
          <ul className="mt-3 list-disc pl-6 space-y-2 text-text-secondary leading-relaxed">
            <li>
              <strong className="text-text-primary">Supabase</strong> —
              authentication and data storage, used only if you create an
              account.
            </li>
            <li>
              <strong className="text-text-primary">
                AI providers (OpenAI, Anthropic, Google Gemini)
              </strong>{" "}
              — used only if you configure an AI provider in Settings. Text you
              submit for grammar hints and conversation practice is sent to your
              selected provider. We do not store this text.
            </li>
            <li>
              <strong className="text-text-primary">
                Text-to-Speech providers (Google Cloud, ElevenLabs)
              </strong>{" "}
              — used only if you configure a TTS provider. Text is sent for
              audio generation only.
            </li>
            <li>
              <strong className="text-text-primary">Google OAuth</strong> — if
              you sign in with Google, we receive your email address and profile
              name.
            </li>
          </ul>
        </section>

        {/* 4. Data Retention */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold">4. Data Retention</h2>
          <ul className="mt-3 list-disc pl-6 space-y-2 text-text-secondary leading-relaxed">
            <li>
              Local data persists until you clear your browser data or use the
              Reset function in Settings.
            </li>
            <li>
              Cloud data persists until you delete your account.
            </li>
            <li>We do not sell or share your data with anyone.</li>
          </ul>
        </section>

        {/* 5. Your Rights */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold">5. Your Rights</h2>
          <ul className="mt-3 list-disc pl-6 space-y-2 text-text-secondary leading-relaxed">
            <li>
              Export all your data at any time via{" "}
              <span className="font-medium text-text-primary">
                Settings &gt; Export
              </span>
              .
            </li>
            <li>
              Delete your cloud data by signing out and requesting deletion.
            </li>
            <li>
              Use the app without an account — it is fully functional with local
              storage only.
            </li>
          </ul>
        </section>

        {/* 6. Cookies and Local Storage */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold">6. Cookies &amp; Local Storage</h2>
          <ul className="mt-3 list-disc pl-6 space-y-2 text-text-secondary leading-relaxed">
            <li>
              We use localStorage to save your preferences and learning
              progress.
            </li>
            <li>
              Authentication cookies are used only if you create an account.
            </li>
            <li>No advertising or tracking cookies are used.</li>
          </ul>
        </section>

        {/* 7. Contact */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold">7. Contact</h2>
          <p className="mt-3 text-text-secondary leading-relaxed">
            For privacy questions, please open an issue on our{" "}
            <a
              href="https://github.com/joelprodev/Hebrew-Reader"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-hover underline transition-colors"
            >
              GitHub repository
            </a>
            .
          </p>
        </section>

        {/* 8. Changes */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold">8. Changes to This Policy</h2>
          <p className="mt-3 text-text-secondary leading-relaxed">
            We may update this privacy policy from time to time. The date at the
            top of this page will always reflect the most recent revision.
          </p>
        </section>

        <div className="mt-16 border-t border-border pt-6 text-center text-sm text-text-muted">
          Davar — Learn Hebrew
        </div>
      </div>
    </div>
  );
}
