import { FinalAnalysis, IkigaiSession } from "../types";

export const downloadDiscoveryAsHTML = (session: IkigaiSession) => {
  if (!session.finalAnalysis) return;

  const { finalAnalysis, answers } = session;
  const date = new Date((session.updatedAt?.seconds || 0) * 1000).toLocaleDateString();

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Ikigai Discovery - ${finalAnalysis.ikigai}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
    <style>
        :root {
            --passion: #E63946;
            --mission: #457B9D;
            --vocation: #1D3557;
            --talent: #2A9D8F;
            --bg: #FAFAF9;
            --text: #2D2926;
            --border: #E5E7EB;
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg);
            color: var(--text);
            line-height: 1.6;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 80px 40px;
        }

        header {
            text-align: center;
            margin-bottom: 80px;
            padding-bottom: 60px;
            position: relative;
        }

        .logo-container {
            display: flex;
            justify-content: center;
            margin-bottom: 40px;
        }

        .logo {
            height: 60px;
            width: auto;
        }

        .date {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.3em;
            font-weight: bold;
            opacity: 0.4;
            margin-bottom: 24px;
            display: block;
        }

        h1 {
            font-family: 'Playfair Display', serif;
            font-size: 64px;
            font-style: italic;
            margin: 0;
            color: var(--text);
            line-height: 1.1;
            letter-spacing: -0.02em;
        }

        .summary {
            font-family: 'Playfair Display', serif;
            font-size: 24px;
            font-style: italic;
            color: rgba(45, 41, 38, 0.6);
            margin-top: 32px;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
            line-height: 1.4;
        }

        .diagram-section {
            margin: 100px 0;
            display: flex;
            justify-content: center;
            background: white;
            padding: 60px;
            border-radius: 40px;
            border: 1px solid var(--border);
        }

        .diagram-svg {
            max-width: 500px;
            width: 100%;
            height: auto;
        }

        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 80px;
        }

        .pillar-card {
            padding: 40px;
            background: white;
            border-radius: 32px;
            border: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .pillar-label {
            font-size: 9px;
            text-transform: uppercase;
            font-weight: bold;
            letter-spacing: 0.25em;
            opacity: 0.4;
        }

        .pillar-val {
            font-family: 'Playfair Display', serif;
            font-style: italic;
            font-size: 20px;
            margin: 0;
            line-height: 1.4;
        }

        .section-title {
            font-family: 'Playfair Display', serif;
            font-size: 32px;
            font-style: italic;
            margin-bottom: 40px;
            display: block;
            opacity: 0.8;
        }

        .answers-section {
            padding: 80px 0;
            border-top: 1px solid var(--border);
        }

        .answers-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 48px;
        }

        .answer-group h4 {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 16px;
            opacity: 0.5;
        }

        .answer-list {
            padding: 0;
            list-style: none;
            margin: 0;
        }

        .answer-list li {
            margin-bottom: 12px;
            padding-left: 16px;
            border-left: 2px solid var(--border);
            font-family: 'Playfair Display', serif;
            font-style: italic;
            font-size: 16px;
        }

        .recommendations {
            padding: 80px 0;
            border-top: 1px solid var(--border);
        }

        .rec-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 32px;
        }

        .rec-card {
            padding: 32px;
            background: white;
            border: 1px solid var(--border);
            border-radius: 24px;
        }

        .rec-cat {
            font-size: 9px;
            text-transform: uppercase;
            font-weight: bold;
            color: var(--passion);
            letter-spacing: 0.1em;
            margin-bottom: 12px;
            display: block;
        }

        .rec-text {
            font-family: 'Playfair Display', serif;
            font-style: italic;
            font-size: 18px;
            margin: 0;
            line-height: 1.4;
        }

        .philosophy {
            margin-top: 120px;
            padding: 60px;
            background: var(--vocation);
            color: white;
            border-radius: 40px;
            display: flex;
            gap: 60px;
            align-items: center;
        }

        .philosophy-text {
            flex: 1;
        }

        .philosophy-text h3 {
            font-family: 'Playfair Display', serif;
            font-size: 28px;
            margin-top: 0;
            margin-bottom: 16px;
        }

        .philosophy-text p {
            font-size: 14px;
            opacity: 0.7;
            margin: 0;
        }

        .footer {
            text-align: center;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.4em;
            opacity: 0.3;
            margin-top: 120px;
            padding-bottom: 40px;
        }

        @media print {
            .container { padding: 20px; max-width: 100%; }
            body { background: white; }
            .philosophy { background: #f3f4f6; color: black; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="logo-container">
                <img src="/Trubblx_transparent.png" alt="Trubblx Logo" class="logo">
            </div>
            <span class="date">Trubblx discovery • ${date}</span>
            <h1>${finalAnalysis.ikigai}</h1>
            <p class="summary">"${finalAnalysis.summary}"</p>
        </header>

        <div class="diagram-section">
            <svg viewBox="-160 -120 320 320" class="diagram-svg">
                <!-- Foundations -->
                <circle cx="0" cy="-45" r="85" fill="rgba(232, 158, 138, 0.15)" stroke="#E89E8A" stroke-width="0.5" />
                <circle cx="-55" cy="35" r="85" fill="rgba(168, 188, 161, 0.15)" stroke="#A8BCA1" stroke-width="0.5" />
                <circle cx="55" cy="35" r="85" fill="rgba(165, 198, 209, 0.15)" stroke="#A5C6D1" stroke-width="0.5" />
                <circle cx="0" cy="115" r="85" fill="rgba(226, 195, 143, 0.15)" stroke="#E2C38F" stroke-width="0.5" />
                
                <!-- Center Piece -->
                <rect x="-35" y="25" width="70" height="20" fill="#2D2926" />
                <text x="0" y="38" text-anchor="middle" font-family="Inter" font-size="8" font-weight="bold" letter-spacing="2" fill="white">IKIGAI</text>
                
                <!-- Foundation Labels -->
                <g font-family="Inter" font-size="6" font-weight="bold" fill="rgba(45, 41, 38, 0.3)" text-anchor="middle" style="text-transform: uppercase;">
                    <text x="0" y="-55">What You Love</text>
                    <text x="-55" y="35">Talent</text>
                    <text x="55" y="35">Need</text>
                    <text x="0" y="125">Paid</text>
                </g>

                <!-- Intersection Labels -->
                <g font-family="Playfair Display" font-style="italic" font-size="7" fill="#2D2926" text-anchor="middle">
                    <text x="-32" y="-5">Passion</text>
                    <text x="32" y="-5">Mission</text>
                    <text x="32" y="75">Vocation</text>
                    <text x="-32" y="75">Profession</text>
                </g>
            </svg>
        </div>

        <section>
            <h2 class="section-title">The Four Pillars</h2>
            <div class="grid">
                <div class="pillar-card" style="border-left: 6px solid var(--passion)">
                    <span class="pillar-label">Passion</span>
                    <p class="pillar-val">"${finalAnalysis.passion}"</p>
                </div>
                <div class="pillar-card" style="border-left: 6px solid var(--mission)">
                    <span class="pillar-label">Mission</span>
                    <p class="pillar-val">"${finalAnalysis.mission}"</p>
                </div>
                <div class="pillar-card" style="border-left: 6px solid var(--vocation)">
                    <span class="pillar-label">Vocation</span>
                    <p class="pillar-val">"${finalAnalysis.vocation}"</p>
                </div>
                <div class="pillar-card" style="border-left: 6px solid var(--talent)">
                    <span class="pillar-label">Profession</span>
                    <p class="pillar-val">"${finalAnalysis.profession}"</p>
                </div>
            </div>
        </section>

        <section class="answers-section">
            <h2 class="section-title">Core Reflections</h2>
            <div class="answers-grid">
                <div class="answer-group">
                   <h4>What You Love</h4>
                   <ul class="answer-list">
                       ${answers.whatYouLove.map(a => `<li>${a}</li>`).join('')}
                   </ul>
                </div>
                <div class="answer-group">
                   <h4>What You're Good At</h4>
                   <ul class="answer-list">
                       ${answers.whatYouAreGoodAt.map(a => `<li>${a}</li>`).join('')}
                   </ul>
                </div>
                <div class="answer-group">
                   <h4>What the World Needs</h4>
                   <ul class="answer-list">
                       ${answers.whatTheWorldNeeds.map(a => `<li>${a}</li>`).join('')}
                   </ul>
                </div>
                <div class="answer-group">
                   <h4>Economic Value</h4>
                   <ul class="answer-list">
                       ${answers.whatYouCanBePaidFor.map(a => `<li>${a}</li>`).join('')}
                   </ul>
                </div>
            </div>
        </section>

        <section class="recommendations">
            <h2 class="section-title">Discovery Pathways</h2>
            <div class="rec-grid">
                ${finalAnalysis.recommendations.map(r => `
                    <div class="rec-card">
                        <span class="rec-cat">${r.category}</span>
                        <p class="rec-text">${r.text}</p>
                    </div>
                `).join('')}
            </div>
        </section>

        <section class="philosophy">
            <div class="philosophy-text">
                <h3>The Ikigai Philosophy</h3>
                <p>Ikigai is the Japanese concept of finding your "reason for being." It represents a lifestyle that strives to balance the spiritual with the practical. This discovery is not a final destination, but a starting point for a more intentional existence.</p>
            </div>
            <div style="flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; font-size: 11px; opacity: 0.8;">
                <div>
                    <strong style="display: block; margin-bottom: 4px; font-size: 9px; text-transform: uppercase;">Spirit</strong>
                    Passion & Mission drive your inner fulfillment and your alignment with humanity.
                </div>
                <div>
                    <strong style="display: block; margin-bottom: 4px; font-size: 9px; text-transform: uppercase;">Structure</strong>
                    Vocation & Profession provide the practical framework for your talent to thrive.
                </div>
            </div>
        </section>

        <div class="footer">
            Trubblx Ikigai Sanctuary • Sanctuary Discovery Report
        </div>
    </div>
</body>
</html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `my-ikigai-discovery-${finalAnalysis.ikigai.toLowerCase().replace(/\s+/g, '-')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
