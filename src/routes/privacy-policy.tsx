import { createFileRoute } from "@tanstack/react-router";
import { PageBanner } from "@/components/PageBanner";
import { StaticPageLayout } from "@/components/site/StaticPageLayout";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — GajananGems" },
      {
        name: "description",
        content:
          "How GajananGems collects, uses, shares and protects your personal information when you use our website.",
      },
      { property: "og:title", content: "Privacy Policy — GajananGems" },
      { property: "og:url", content: "/privacy-policy" },
    ],
    links: [{ rel: "canonical", href: "/privacy-policy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <StaticPageLayout>
      <PageBanner title="Privacy Policy" crumb="Privacy Policy" />
      <article className="prose-policy mx-auto max-w-3xl px-4 py-12">
        <p>
          We value the trust you place in us. That's why we insist upon the highest standards for
          secure transactions and customer information privacy. Please read the following statement
          to learn about our information gathering and dissemination practices.
        </p>
        <p>
          Note: Our privacy policy is subject to change at any time without notice. To make sure you
          are aware of any changes, please review this policy periodically. By visiting this website
          you agree to be bound by the terms of this Privacy Policy. If you do not agree, please do
          not use or access our website.
        </p>
        <h4>Collection of Information</h4>
        <p>
          When you use our website, we collect and store the personal information you provide from
          time to time. Our primary goal is to provide you a safe, efficient, smooth and customized
          experience. In general, you can browse the website without telling us who you are or
          revealing any personal information. We may automatically track certain information about
          you based on your behaviour on our website, such as the URL you came from, the URL you go
          to next, your browser information, and your IP address.
        </p>
        <p>
          If you transact with us, we only collect basic information such as billing address, login
          id, email id and contact number. We do not collect or store confidential information like
          credit/debit card numbers, expiration dates or other payment instrument details. Such
          information is stored by your device or with the payment gateway, over which we have no
          access or control.
        </p>
        <h4>Use of Your Information</h4>
        <p>
          We use personal information to provide services at the request of customers, resolve
          disputes, troubleshoot problems, promote a safe service, measure consumer interest, inform
          you about offers, customize your experience, and detect and protect against error, fraud
          and other criminal activity. To the extent we use your personal information to market to
          you, we provide the ability to opt out.
        </p>
        <h4>Cookies</h4>
        <p>
          We use data collection devices such as "cookies" on certain pages of the website to help
          analyse our web page flow, measure promotional effectiveness, and promote trust and
          safety. Most cookies are "session cookies", automatically deleted at the end of a session.
          You are free to decline cookies if your browser permits, though some features may not be
          available.
        </p>
        <h4>Sharing of Personal Information</h4>
        <p>
          We may share personal information with our corporate entities and affiliates. We may
          disclose personal information to third parties when required to provide our services,
          comply with legal obligations, enforce our User Agreement, or prevent fraud. We may also
          disclose information if required by law or in good faith belief that disclosure is
          reasonably necessary.
        </p>
        <h4>Links to Other Sites</h4>
        <p>
          Our website links to other websites that may collect personally identifiable information
          about you. GajananGems is not responsible for the privacy practices or content of those
          linked websites.
        </p>
        <h4>Security Precautions</h4>
        <p>
          Our website has stringent security measures in place to protect against the loss, misuse
          and alteration of information under our control, including the use of firewalls,
          encryption and data leakage prevention technologies, vendor audits, and continuous
          monitoring of our physical and technical environment.
        </p>
        <h4>Choice / Opt-Out</h4>
        <p>
          We provide all users the opportunity to opt out of receiving non-essential (promotional,
          marketing-related) communications. To remove your contact information from all GajananGems
          lists and newsletters, please email us at hello@gajanangems.com.
        </p>
        <h4>Your Consent</h4>
        <p>
          By using the website and/or providing your information, you consent to the collection and
          use of the information you disclose in accordance with this Privacy Policy. If we decide to
          change our privacy policy, we will post those changes on this page.
        </p>
      </article>
    </StaticPageLayout>
  );
}
