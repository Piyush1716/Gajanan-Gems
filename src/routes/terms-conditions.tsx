import { createFileRoute } from "@tanstack/react-router";
import { PageBanner } from "@/components/PageBanner";
import { StaticPageLayout } from "@/components/site/StaticPageLayout";

const terms = [
  "That you are a competent user who is eligible to enter into the contract as per the Indian Contract Act.",
  "That you are not specifically forbidden under any law of the land to make such transactions on GajananGems.",
  "That you are not using anyone else's login credentials or any other data including user name, email-id, password, financial details etc. without prior legal authorisation.",
  "That the customer is using a secured internet connection and a device which is free from any malware or viruses.",
  "That the customer is not using any illegal or unauthorised VPN server or any other technology which is not permissible to use under the law of the land.",
  "That in case we detect any such activity, omission or use of any such technology, GajananGems has every right and duty to not only cancel the transaction but also take necessary actions against such customer without prior intimation.",
  "That while surfing the website and placing the order, it is the sole responsibility of the customer to fill in the correct details. Once the order has been placed and the transaction stands complete, GajananGems shall not be responsible for any wrongly filled information.",
  "That it is the sole responsibility of the customer to provide the correct shipping address. In case of a wrong/insufficient address, GajananGems shall not be responsible for any refunds, returns or support.",
  "That each substance, content, product and picture used on gajanangems.com is the property of GajananGems.",
  "That you shall not post, replicate, download, transfer, transmit, redistribute, republish, recompile, dismantle or make any commercial abuse of any exclusive material made accessible through the website.",
  "That GajananGems is not a subsidiary of sites that might be connected to it through hypertext and is not responsible for mishaps arising from such sites.",
  "That GajananGems has no control over and is not in charge of the content on any linked site. Linked destinations are for user convenience only and you access them at your own risk.",
  "That GajananGems only saves and stores personal contact details of its customers for analytical or other purposes as stipulated in its policies, and does not store any financial details.",
  "That the customer shall solely be responsible for any mishaps while operating this website and shall not hold GajananGems or its affiliates liable for any data leak or transactional hazards.",
  "That in case of any dissatisfaction, the customer shall first approach the concerned officer of the website to resolve the issue. We are committed to serving our customers in the best possible way.",
  "That in case of any dispute, only the Courts located within the territory of New Delhi shall have the appropriate jurisdiction to try and decide the matter.",
  "That you have read and understood these terms and conditions before placing an order at GajananGems.",
];

export const Route = createFileRoute("/terms-conditions")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — GajananGems" },
      {
        name: "description",
        content:
          "Read the terms and conditions for using the GajananGems online store, including user eligibility, content ownership and jurisdiction.",
      },
      { property: "og:title", content: "Terms & Conditions — GajananGems" },
      { property: "og:url", content: "/terms-conditions" },
    ],
    links: [{ rel: "canonical", href: "/terms-conditions" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <StaticPageLayout>
      <PageBanner title="Terms & Conditions" crumb="Terms & Conditions" />
      <article className="prose-policy mx-auto max-w-3xl px-4 py-12">
        <p>
          By using our online platform "gajanangems.com" (hereinafter GajananGems), you
          agree:
        </p>
        <ol>
          {terms.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ol>
      </article>
    </StaticPageLayout>
  );
}
