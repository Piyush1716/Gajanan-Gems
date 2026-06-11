import { createFileRoute } from "@tanstack/react-router";
import { PageBanner } from "@/components/PageBanner";
import { StaticPageLayout } from "@/components/site/StaticPageLayout";

export const Route = createFileRoute("/returns-refund-policy")({
  head: () => ({
    meta: [
      { title: "Returns & Refund Policy — GajananGems" },
      {
        name: "description",
        content:
          "GajananGems returns and refund policy: eligibility, return shipping, inspection, refund timeframe and non-returnable items.",
      },
      { property: "og:title", content: "Returns & Refund Policy — GajananGems" },
      { property: "og:url", content: "/returns-refund-policy" },
    ],
    links: [{ rel: "canonical", href: "/returns-refund-policy" }],
  }),
  component: ReturnsPage,
});

function ReturnsPage() {
  return (
    <StaticPageLayout>
      <PageBanner title="Returns and Refund Policy" crumb="Returns and Refund Policy" />
      <article className="prose-policy mx-auto max-w-3xl px-4 py-12">
        <p>
          Thank you for shopping with GajananGems. We appreciate your business and want to ensure
          your satisfaction with our products. Please review our return and refund policy carefully.
        </p>
        <h4>1. Return Eligibility</h4>
        <p>Customers may return eligible items within 7 days from the date of receiving their orders.</p>
        <h4>2. Eligible Items</h4>
        <p>
          Only items that are damaged (broken during delivery) or have missing parts/products are
          eligible for return or refund. Items that are used or not in their original condition may
          not be accepted.
        </p>
        <h4>3. Initiation of Return</h4>
        <p>
          To initiate a return, customers must contact our customer service team within 7 days of
          receiving the order. Please provide your order number and a detailed reason for the return.
        </p>
        <h4>4. Return Shipping</h4>
        <p>
          Customers are responsible for the cost of return shipping. Please ensure that the items
          are securely packaged to prevent damage during transit. We recommend using a trackable
          shipping method.
        </p>
        <h4>5. Inspection and Processing</h4>
        <p>
          Once we receive the returned items, our team will inspect them for eligibility. If the
          items meet our return criteria, we will process the refund via bank transfer only. Kindly
          share your bank details by Email: hello@gajanangems.com or WhatsApp: 6351563768. If
          you opt to replace or change any received item, please note that return courier charges of
          up to ₹150 will apply. Replacement or exchange will be facilitated upon receipt of the
          item at our office.
        </p>
        <h4>6. Refund Timeframe</h4>
        <p>
          Refunds will be processed within 7 business days of receiving the returned items. It may
          take additional time for the refund to appear in your account, depending on your financial
          institution.
        </p>
        <h4>7. Non-Returnable Items</h4>
        <p>Certain items are non-returnable, including but not limited to:</p>
        <ul>
          <li>Personalized or customized items</li>
          <li>Gift cards</li>
          <li>Products marked as non-refundable or non-returnable</li>
        </ul>
        <h4>8. Exchanges</h4>
        <p>
          We do not currently offer exchanges. If you need a different item, please initiate a
          return and place a new order.
        </p>
        <h4>9. Damaged or Defective Items</h4>
        <p>
          Please record every parcel before opening the packaging. If you receive a damaged,
          defective or missing item, contact our customer service team within 24 hours of receiving
          the parcel. We will arrange for a replacement or refund as appropriate.
        </p>
        <h4>10. Contact Information</h4>
        <p>
          For any questions or concerns regarding our return and refund policy, please contact our
          customer service team at{" "}
          <a href="mailto:hello@gajanangems.com" className="text-primary underline">
            hello@gajanangems.com
          </a>
          .
        </p>
        <p>
          Note: This return and refund policy is subject to change without notice. Please check our
          website for the most up-to-date policy information. Thank you for choosing GajananGems.
        </p>
      </article>
    </StaticPageLayout>
  );
}
