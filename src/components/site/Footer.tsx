import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube, Mail, Phone } from "lucide-react";

const policyLinks = [
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/terms-conditions", label: "Terms & Conditions" },
  { to: "/returns-refund-policy", label: "Returns & Refund Policy" },
  { to: "/shipping-policy", label: "Shipping Policy" },
] as const;

const quickLinks = [
  { to: "/about-us", label: "About Us" },
  { to: "/contact-us", label: "Contact Us" },
  { to: "/faq", label: "FAQ" },
  { to: "/order-tracking", label: "Order Tracking" },
  { to: "/bulk-order", label: "Bulk Order" },
  { to: "/customized-bracelet", label: "Custom Bracelet" },
] as const;

export function Footer() {
  return (
    <footer style={{ backgroundColor: "#24110D", color: "#F8F3EE" }} className="mt-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-14 grid md:grid-cols-4 gap-10">
        <div>
          <h3 className="text-2xl font-display font-semibold mb-3">GajananGems</h3>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(248,243,238,0.70)" }}>
            Your trusted source for authentic healing crystals, gemstone jewellery and spiritual decor since 2012.
          </p>
          <div className="flex gap-3 mt-5">
            <a href="https://www.instagram.com/gajanangems1?igsh=NGw2eWJteGhwZ25s" aria-label="Instagram" className="p-2 rounded-full transition-colors" style={{ backgroundColor: "rgba(248,243,238,0.10)" }} onMouseOver={e => (e.currentTarget.style.backgroundColor="#3F5C45")} onMouseOut={e => (e.currentTarget.style.backgroundColor="rgba(248,243,238,0.10)")}><Instagram className="h-4 w-4" /></a>
            <a href="#" aria-label="Facebook" className="p-2 rounded-full transition-colors" style={{ backgroundColor: "rgba(248,243,238,0.10)" }} onMouseOver={e => (e.currentTarget.style.backgroundColor="#3F5C45")} onMouseOut={e => (e.currentTarget.style.backgroundColor="rgba(248,243,238,0.10)")}><Facebook className="h-4 w-4" /></a>
            <a href="#" aria-label="YouTube" className="p-2 rounded-full transition-colors" style={{ backgroundColor: "rgba(248,243,238,0.10)" }} onMouseOver={e => (e.currentTarget.style.backgroundColor="#3F5C45")} onMouseOut={e => (e.currentTarget.style.backgroundColor="rgba(248,243,238,0.10)")}><Youtube className="h-4 w-4" /></a>
          </div>
        </div>
        <div>
          <h4 className="text-sm uppercase tracking-wider mb-4" style={{ color: "#F8F3EE" }}>Quick Links</h4>
          <ul className="space-y-2 text-sm" style={{ color: "rgba(248,243,238,0.70)" }}>
            {quickLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-primary transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm uppercase tracking-wider mb-4" style={{ color: "#F8F3EE" }}>Policies</h4>
          <ul className="space-y-2 text-sm" style={{ color: "rgba(248,243,238,0.70)" }}>
            {policyLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-primary transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm uppercase tracking-wider mb-4" style={{ color: "#F8F3EE" }}>Contact Us</h4>
          <p className="text-sm mb-3" style={{ color: "rgba(248,243,238,0.70)" }}>We're here to help! Reach out to us for any queries or support.</p>
          <div className="mt-5 space-y-2 text-sm" style={{ color: "rgba(248,243,238,0.70)" }}>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4" /><a href="tel:+916351563768"> +91 63515 63768</a></div>
            <div className="flex items-center gap-2"><Mail className="h-4 w-4" /><a href="mailto:hello@gajanangems.com"> hello@gajanangems.com</a></div>
          </div>
        </div>
      </div>
      <div className="py-4 text-center text-xs" style={{ borderTop: "1px solid rgba(248,243,238,0.10)", color: "rgba(248,243,238,0.50)" }}>
        © {new Date().getFullYear()} GajananGems. All rights reserved.
      </div>
    </footer>
  );
}
