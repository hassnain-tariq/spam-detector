import { useState, useRef } from "react";

const SYSTEM_PROMPT = `You are an expert email spam detection AI agent. Analyze the provided email content and determine if it is spam or not spam.

Respond ONLY with a valid JSON object (no markdown, no backticks, no extra text) in this exact format:
{
  "verdict": "SPAM" or "NOT SPAM",
  "confidence": a number from 0 to 100,
  "risk_level": "LOW", "MEDIUM", or "HIGH",
  "reasons": ["reason1", "reason2", "reason3"],
  "red_flags": ["flag1", "flag2"] or [],
  "summary": "A one sentence summary of your analysis"
}`;

const examples = [
  {
    label: "Phishing Example",
    text: `From: security@paypa1.com
Subject: URGENT: Your account has been suspended!

Dear Valued Customer,

Your PayPal account has been LIMITED! Click here immediately to verify your identity or your account will be permanently deleted within 24 hours.

Click here: http://paypal-secure-login.xyz/verify

You must provide: SSN, Credit Card Number, Bank Account Details

ACT NOW before it's too late!!!`,
  },
  {
    label: "Legitimate Email",
    text: `From: sarah.johnson@acmecorp.com
Subject: Q3 Project Update - Meeting Tomorrow

Hi team,

Just a quick reminder that we have our Q3 project review meeting tomorrow at 2 PM in Conference Room B.

Please come prepared with your status updates. The agenda has been shared on the company portal.

Looking forward to seeing everyone there.

Best,
Sarah`,
  },
  {
    label: "Prize Scam",
    text: `CONGRATULATIONS!!! You've been selected as our LUCKY WINNER!!!

You have WON $1,000,000 in the International Lottery!

To claim your prize, send $500 processing fee via Western Union to:
Mr. John Smith, Lagos Nigeria

Reply with your: Full name, Address, Phone, Bank details

LIMITED TIME OFFER - expires in 24 HOURS!!!
Do not ignore this email - MONEY IS WAITING FOR YOU!!!`,
  },
];

export default function SpamDetector() {
  const [emailText, setEmailText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanLine, setScanLine] = useState(false);
  const textareaRef = useRef(null);

  const analyzeEmail = async () => {
    if (!emailText.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setScanLine(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: `Analyze this email:\n\n${emailText}` }],
        }),
      });

      const data = await response.json();
      const raw = data.content?.map((b) => b.text || "").join("") || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (err) {
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setScanLine(false), 600);
    }
  };

  const loadExample = (ex) => {
    setEmailText(ex.text);
    setResult(null);
    setError(null);
  };

  const isSpam = result?.verdict === "SPAM";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      fontFamily: "'Courier New', monospace",
      color: "#e0e0e0",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Grid background */}
      <div style={{
        position: "fixed", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,255,100,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,100,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        pointerEvents: "none",
      }} />

      {/* Scan line animation */}
      {scanLine && (
        <div style={{
          position: "fixed", left: 0, right: 0, height: "2px",
          background: "linear-gradient(90deg, transparent, #00ff64, transparent)",
          animation: "scanDown 0.6s ease-out forwards",
          top: 0, zIndex: 100,
        }} />
      )}

      <style>{`
        @keyframes scanDown {
          from { top: 0; opacity: 1; }
          to { top: 100vh; opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .btn-primary {
          background: #00ff64;
          color: #0a0a0f;
          border: none;
          padding: 12px 32px;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }
        .btn-primary:hover { background: #00cc50; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .example-btn {
          background: transparent;
          border: 1px solid #333;
          color: #888;
          padding: 6px 14px;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 1px;
        }
        .example-btn:hover { border-color: #00ff64; color: #00ff64; }
        textarea {
          background: #0d0d14;
          border: 1px solid #222;
          color: #c0c0c0;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          padding: 16px;
          width: 100%;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s;
          line-height: 1.6;
          box-sizing: border-box;
        }
        textarea:focus { border-color: #00ff64; }
      `}</style>

      <div style={{ maxWidth: "780px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "36px", borderBottom: "1px solid #1a1a2a", paddingBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div style={{
              width: "10px", height: "10px", borderRadius: "50%",
              background: "#00ff64",
              animation: "pulse 2s infinite",
            }} />
            <span style={{ color: "#00ff64", fontSize: "11px", letterSpacing: "3px" }}>SYSTEM ACTIVE</span>
          </div>
          <h1 style={{
            fontSize: "clamp(24px, 5vw, 36px)",
            fontWeight: "bold",
            color: "#ffffff",
            margin: 0,
            letterSpacing: "1px",
          }}>
            SPAM<span style={{ color: "#00ff64" }}>_</span>DETECTOR
          </h1>
          <p style={{ color: "#555", fontSize: "12px", marginTop: "6px", letterSpacing: "1px" }}>
            AI-POWERED EMAIL THREAT ANALYSIS // v2.4.1
          </p>
        </div>

        {/* Examples */}
        <div style={{ marginBottom: "20px" }}>
          <p style={{ color: "#444", fontSize: "11px", letterSpacing: "2px", marginBottom: "10px" }}>
            LOAD EXAMPLE:
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {examples.map((ex) => (
              <button key={ex.label} className="example-btn" onClick={() => loadExample(ex)}>
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div style={{ marginBottom: "16px" }}>
          <textarea
            ref={textareaRef}
            rows={10}
            placeholder={`Paste email content here...\n\nInclude: From, Subject, Body\n\nThe AI agent will analyze for spam signals, phishing attempts, scam patterns, and more.`}
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
          />
        </div>

        {/* Analyze button */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
          <button
            className="btn-primary"
            onClick={analyzeEmail}
            disabled={loading || !emailText.trim()}
          >
            {loading ? "ANALYZING..." : "ANALYZE EMAIL"}
          </button>
          {loading && (
            <span style={{ color: "#00ff64", fontSize: "12px", animation: "pulse 1s infinite" }}>
              SCANNING CONTENT
              <span style={{ animation: "blink 0.8s infinite" }}>_</span>
            </span>
          )}
          {emailText && !loading && (
            <button
              className="example-btn"
              onClick={() => { setEmailText(""); setResult(null); setError(null); }}
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            border: "1px solid #ff4040",
            background: "rgba(255,64,64,0.05)",
            padding: "16px",
            color: "#ff4040",
            fontSize: "13px",
            animation: "slideIn 0.3s ease",
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{ animation: "slideIn 0.4s ease" }}>
            {/* Verdict banner */}
            <div style={{
              padding: "24px",
              background: isSpam ? "rgba(255,50,50,0.07)" : "rgba(0,255,100,0.05)",
              border: `2px solid ${isSpam ? "#ff3232" : "#00ff64"}`,
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}>
              <div>
                <div style={{ fontSize: "11px", color: "#555", letterSpacing: "2px", marginBottom: "6px" }}>
                  VERDICT
                </div>
                <div style={{
                  fontSize: "clamp(28px, 6vw, 42px)",
                  fontWeight: "bold",
                  color: isSpam ? "#ff3232" : "#00ff64",
                  letterSpacing: "2px",
                }}>
                  {isSpam ? "⚠ SPAM" : "✓ SAFE"}
                </div>
                <div style={{ color: "#666", fontSize: "12px", marginTop: "4px" }}>{result.summary}</div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", color: "#555", letterSpacing: "2px", marginBottom: "6px" }}>
                  CONFIDENCE
                </div>
                <div style={{ fontSize: "36px", fontWeight: "bold", color: "#ffffff" }}>
                  {result.confidence}%
                </div>
                <div style={{
                  display: "inline-block",
                  padding: "2px 10px",
                  background: result.risk_level === "HIGH" ? "#ff3232" : result.risk_level === "MEDIUM" ? "#ff9900" : "#00ff64",
                  color: "#0a0a0f",
                  fontSize: "11px",
                  fontWeight: "bold",
                  letterSpacing: "2px",
                  marginTop: "6px",
                }}>
                  {result.risk_level} RISK
                </div>
              </div>
            </div>

            {/* Confidence bar */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ height: "4px", background: "#1a1a2a", width: "100%" }}>
                <div style={{
                  height: "100%",
                  width: `${result.confidence}%`,
                  background: isSpam
                    ? `linear-gradient(90deg, #ff3232, #ff6060)`
                    : `linear-gradient(90deg, #00aa44, #00ff64)`,
                  transition: "width 1s ease",
                }} />
              </div>
            </div>

            {/* Details grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              {/* Reasons */}
              <div style={{
                background: "#0d0d14",
                border: "1px solid #1a1a2a",
                padding: "18px",
              }}>
                <div style={{ fontSize: "10px", color: "#444", letterSpacing: "2px", marginBottom: "14px" }}>
                  ANALYSIS REASONS
                </div>
                {result.reasons?.map((r, i) => (
                  <div key={i} style={{
                    display: "flex", gap: "8px", marginBottom: "8px",
                    fontSize: "12px", color: "#aaa", alignItems: "flex-start",
                  }}>
                    <span style={{ color: "#00ff64", flexShrink: 0 }}>→</span>
                    {r}
                  </div>
                ))}
              </div>

              {/* Red flags */}
              <div style={{
                background: "#0d0d14",
                border: "1px solid #1a1a2a",
                padding: "18px",
              }}>
                <div style={{ fontSize: "10px", color: "#444", letterSpacing: "2px", marginBottom: "14px" }}>
                  RED FLAGS DETECTED
                </div>
                {result.red_flags?.length > 0 ? (
                  result.red_flags.map((f, i) => (
                    <div key={i} style={{
                      display: "flex", gap: "8px", marginBottom: "8px",
                      fontSize: "12px", color: "#ff6060", alignItems: "flex-start",
                    }}>
                      <span style={{ flexShrink: 0 }}>⚑</span>
                      {f}
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: "12px", color: "#555" }}>No red flags detected.</div>
                )}
              </div>
            </div>

            {/* Recommendation */}
            <div style={{
              background: isSpam ? "rgba(255,50,50,0.05)" : "rgba(0,255,100,0.03)",
              border: `1px solid ${isSpam ? "#3a1010" : "#0a2a18"}`,
              padding: "16px",
              fontSize: "12px",
              color: "#777",
              letterSpacing: "0.5px",
            }}>
              <span style={{ color: isSpam ? "#ff6060" : "#00cc50", fontWeight: "bold" }}>
                RECOMMENDATION:{" "}
              </span>
              {isSpam
                ? "Do not click any links or reply to this email. Mark as spam and delete. Do not provide any personal information."
                : "This email appears to be legitimate. Exercise normal caution with any links or attachments."}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: "40px", borderTop: "1px solid #1a1a2a", paddingTop: "16px" }}>
          <p style={{ color: "#444", fontSize: "11px", letterSpacing: "2px", textAlign: "center" }}>
            POWERED BY HASSNAIN NIAZ TARIQ
          </p>
        </div>

      </div>
    </div>
  );
}
