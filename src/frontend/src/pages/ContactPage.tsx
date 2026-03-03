import { Mail, MessageSquare, Phone, Send } from "lucide-react";
import { useState } from "react";
import { SiDiscord, SiInstagram } from "react-icons/si";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh" }}>
      {/* Header */}
      <div
        className="py-16 px-4 text-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 107, 0, 0.06), rgba(114, 9, 183, 0.06))",
          borderBottom: "1px solid #2a2a3a",
        }}
      >
        <h1
          className="section-heading text-3xl sm:text-4xl md:text-5xl mb-4"
          style={{ color: "#f0f0f8" }}
        >
          Contact{" "}
          <span className="neon-text-orange neon-text-orange-boundary">Us</span>
        </h1>
        <p
          className="font-rajdhani text-base text-boundary"
          style={{ color: "#b8b8d0" }}
        >
          Have questions? We're here to help!
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h2
                className="font-orbitron font-700 text-xl mb-4 text-boundary"
                style={{ color: "#f0f0f8" }}
              >
                Get In Touch
              </h2>
              <p
                className="font-rajdhani text-sm leading-relaxed text-boundary"
                style={{ color: "#b8b8d0" }}
              >
                For tournament queries, payment issues, or general support,
                reach out to us through any of the channels below.
              </p>
            </div>

            {[
              {
                icon: <Mail className="w-5 h-5" />,
                label: "Email",
                value: "genZeSports2026@gmail.com",
                color: "#ff6b00",
              },
              {
                icon: <Phone className="w-5 h-5" />,
                label: "UPI / WhatsApp",
                value: "7087568640",
                color: "#e63946",
              },
              {
                icon: <MessageSquare className="w-5 h-5" />,
                label: "Response Time",
                value: "Within 24 hours",
                color: "#b44fe8",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{ background: "#12121a", border: "1px solid #2a2a3a" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${item.color}15`,
                    border: `1px solid ${item.color}30`,
                  }}
                >
                  <div style={{ color: item.color }}>{item.icon}</div>
                </div>
                <div>
                  <div
                    className="font-rajdhani text-xs font-600 tracking-wider uppercase mb-1 text-boundary"
                    style={{ color: "#b0b0c8" }}
                  >
                    {item.label}
                  </div>
                  <div
                    className="font-rajdhani font-600 text-sm text-boundary"
                    style={{ color: "#f0f0f8" }}
                  >
                    {item.value}
                  </div>
                </div>
              </div>
            ))}

            {/* Social */}
            <div
              className="p-4 rounded-xl"
              style={{ background: "#12121a", border: "1px solid #2a2a3a" }}
            >
              <div
                className="font-rajdhani text-xs font-600 tracking-wider uppercase mb-3 text-boundary"
                style={{ color: "#b0b0c8" }}
              >
                Follow Us
              </div>
              <div className="flex gap-3">
                {[
                  {
                    icon: <SiDiscord className="w-5 h-5" />,
                    label: "Discord",
                    color: "#5865f2",
                  },
                  {
                    icon: <SiInstagram className="w-5 h-5" />,
                    label: "Instagram",
                    color: "#e1306c",
                  },
                ].map(({ icon, label, color }) => (
                  <a
                    key={label}
                    href="/"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-rajdhani font-600 transition-all duration-200"
                    style={{
                      background: `${color}15`,
                      border: `1px solid ${color}30`,
                      color,
                    }}
                  >
                    {icon}
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div
            className="p-6 rounded-xl"
            style={{ background: "#12121a", border: "1px solid #2a2a3a" }}
          >
            <h2
              className="font-orbitron font-700 text-base mb-5 text-boundary"
              style={{ color: "#f0f0f8" }}
            >
              Send a Message
            </h2>

            {submitted && (
              <div
                className="mb-4 p-3 rounded-lg text-sm font-rajdhani"
                style={{
                  background: "rgba(34, 197, 94, 0.1)",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  color: "#22c55e",
                }}
              >
                ✓ Message sent! We'll get back to you within 24 hours.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="contact-name" className="form-label">
                  Your Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  className="gaming-input"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="form-label">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  className="gaming-input"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="form-label">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  className="gaming-input resize-none"
                  rows={5}
                  placeholder="Describe your query or issue..."
                  value={form.message}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, message: e.target.value }))
                  }
                  required
                />
              </div>
              <button
                type="submit"
                className="neon-btn-orange w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
