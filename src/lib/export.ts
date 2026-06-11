import { FinalAnalysis, IkigaiSession } from "../types";

export const downloadDiscoveryAsHTML = (session: IkigaiSession) => {
  if (!session.finalAnalysis) return;

  const { finalAnalysis, answers } = session;
  const updatedAtSeconds = session.updatedAt?.seconds || (Date.now() / 1000);
  const date = new Date(updatedAtSeconds * 1000).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ikigai Discovery Report | ${finalAnalysis.ikigai}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
    <style>
        :root {
            --passion: #E89E8A;
            --talent: #A8BCA1;
            --mission: #A5C6D1;
            --vocation: #E2C38F;
            --text-dark: #2D2926;
            --text-muted: #6B7280;
            --bg-page: #FDFCFB;
            --bg-card: #FFFFFF;
            --border: #F3F4F6;
        }

        * { box-sizing: border-box; }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-page);
            color: var(--text-dark);
            line-height: 1.6;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }

        .document-wrapper {
            max-width: 900px;
            margin: 40px auto;
            background: var(--bg-card);
            box-shadow: 0 40px 100px rgba(0,0,0,0.05);
            border-radius: 40px;
            overflow: hidden;
            position: relative;
        }

        .hero-header {
            padding: 100px 80px 60px;
            text-align: center;
            border-bottom: 1px solid var(--border);
            background: linear-gradient(to bottom, #FFF, var(--bg-page));
        }

        .logo-mark {
            font-family: 'Playfair Display', serif;
            font-weight: 700;
            font-style: italic;
            font-size: 24px;
            color: var(--text-dark);
            margin-bottom: 60px;
            letter-spacing: -0.02em;
            display: inline-block;
        }

        .meta-stamp {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.4em;
            font-weight: 700;
            color: var(--text-muted);
            margin-bottom: 30px;
            display: block;
        }

        h1.ikigai-title {
            font-family: 'Playfair Display', serif;
            font-size: 84px;
            line-height: 1;
            margin: 0;
            font-style: italic;
            letter-spacing: -0.04em;
            color: var(--text-dark);
        }

        .summary-block {
            margin: 40px auto 0;
            max-width: 600px;
            font-family: 'Playfair Display', serif;
            font-size: 22px;
            line-height: 1.5;
            color: var(--text-muted);
            font-style: italic;
        }

        .content-section {
            padding: 80px;
        }

        .visual-discovery {
            display: flex;
            align-items: center;
            gap: 60px;
            margin-bottom: 100px;
        }

        .diagram-container {
            flex: 1;
            background: #FAFAF9;
            padding: 40px;
            border-radius: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .diagram-svg {
            width: 100%;
            height: auto;
            max-width: 400px;
        }

        .foundation-grid {
            flex: 1;
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
        }

        .pillar-card {
            padding: 24px;
            border-radius: 20px;
            border: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .pillar-label {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            color: var(--text-muted);
        }

        .pillar-val {
            font-family: 'Playfair Display', serif;
            font-size: 16px;
            font-style: italic;
            margin: 0;
            line-height: 1.4;
        }

        .section-header {
            margin-bottom: 40px;
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .section-header h2 {
            font-family: 'Playfair Display', serif;
            font-size: 28px;
            font-style: italic;
            margin: 0;
            white-space: nowrap;
        }

        .section-header .line {
            flex: 1;
            height: 1px;
            background: var(--border);
        }

        .discovery-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 40px;
            margin-bottom: 80px;
        }

        .reflection-card {
            background: #FFF;
        }

        .reflection-card h4 {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            margin-bottom: 20px;
            color: var(--text-muted);
        }

        .reflection-list {
            padding: 0;
            list-style: none;
            margin: 0;
        }

        .reflection-list li {
            font-family: 'Playfair Display', serif;
            font-style: italic;
            font-size: 18px;
            margin-bottom: 12px;
            padding-left: 20px;
            position: relative;
            color: var(--text-dark);
        }

        .reflection-list li::before {
            content: '';
            position: absolute;
            left: 0;
            top: 10px;
            width: 4px;
            height: 4px;
            background: var(--text-muted);
            border-radius: 50%;
            opacity: 0.3;
        }

        .pathway-section {
            background: #FAFAF9;
            padding: 60px;
            border-radius: 32px;
            margin-bottom: 80px;
        }

        .pathway-list {
            display: grid;
            grid-template-columns: 1fr;
            gap: 24px;
        }

        .pathway-item {
            display: flex;
            gap: 24px;
            align-items: flex-start;
        }

        .pathway-num {
            font-family: 'Playfair Display', serif;
            font-size: 32px;
            font-style: italic;
            color: var(--passion);
            opacity: 0.4;
            line-height: 1;
            padding-top: 4px;
        }

        .pathway-content b {
            display: block;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 6px;
            color: var(--text-muted);
        }

        .pathway-content p {
            margin: 0;
            font-family: 'Playfair Display', serif;
            font-size: 18px;
            font-style: italic;
            color: var(--text-dark);
        }

        .footer-note {
            text-align: center;
            padding: 60px 80px;
            background: var(--text-dark);
            color: #FFF;
        }

        .footer-note p {
            font-family: 'Playfair Display', serif;
            font-style: italic;
            font-size: 18px;
            max-width: 500px;
            margin: 0 auto 30px;
            opacity: 0.8;
        }

        .footer-meta {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.4em;
            opacity: 0.4;
        }

        @media print {
            body { background: white; }
            .document-wrapper { 
                box-shadow: none; 
                margin: 0;
                border-radius: 0;
                max-width: 100%;
            }
            .hero-header { padding: 40px; }
            .content-section { padding: 40px; }
            .visual-discovery { flex-direction: column; }
            .footer-note { background: white; color: black; border-top: 1px solid var(--border); }
        }

        @media (max-width: 768px) {
            .hero-header { padding: 60px 30px; }
            h1.ikigai-title { font-size: 48px; }
            .content-section { padding: 30px; }
            .visual-discovery { flex-direction: column; }
            .discovery-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="document-wrapper">
        <header class="hero-header">
            <div class="logo-mark">Trubblx Sanctuary</div>
            <span class="meta-stamp">Purpose Blueprint • ${date}</span>
            <h1 class="ikigai-title">${finalAnalysis.ikigai}</h1>
            <div class="summary-block">
                "${finalAnalysis.summary}"
            </div>
        </header>

        <main class="content-section">
            <div class="visual-discovery">
                <div class="diagram-container">
                    <svg viewBox="-160 -120 320 320" class="diagram-svg">
                        <defs>
                            <radialGradient id="grad-passion" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stop-color="#E89E8A" stop-opacity="0.2" />
                                <stop offset="100%" stop-color="#E89E8A" stop-opacity="0.05" />
                            </radialGradient>
                            <radialGradient id="grad-talent" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stop-color="#A8BCA1" stop-opacity="0.2" />
                                <stop offset="100%" stop-color="#A8BCA1" stop-opacity="0.05" />
                            </radialGradient>
                            <radialGradient id="grad-mission" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stop-color="#A5C6D1" stop-opacity="0.2" />
                                <stop offset="100%" stop-color="#A5C6D1" stop-opacity="0.05" />
                            </radialGradient>
                            <radialGradient id="grad-vocation" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stop-color="#E2C38F" stop-opacity="0.2" />
                                <stop offset="100%" stop-color="#E2C38F" stop-opacity="0.05" />
                            </radialGradient>
                        </defs>
                        
                        <!-- Circles -->
                        <circle cx="0" cy="-45" r="90" fill="url(#grad-passion)" stroke="#E89E8A" stroke-width="0.5" stroke-dasharray="2,2" />
                        <circle cx="-55" cy="35" r="90" fill="url(#grad-talent)" stroke="#A8BCA1" stroke-width="0.5" stroke-dasharray="2,2" />
                        <circle cx="55" cy="35" r="90" fill="url(#grad-mission)" stroke="#A5C6D1" stroke-width="0.5" stroke-dasharray="2,2" />
                        <circle cx="0" cy="115" r="90" fill="url(#grad-vocation)" stroke="#E2C38F" stroke-width="0.5" stroke-dasharray="2,2" />
                        
                        <!-- Core -->
                        <rect x="-40" y="22" width="80" height="26" fill="#2D2926" rx="13" />
                        <text x="0" y="38" text-anchor="middle" font-family="Inter" font-size="8" font-weight="700" letter-spacing="3" fill="#FFFFFF">IKIGAI</text>
                        
                        <!-- Context Labels -->
                        <g font-family="Playfair Display" font-style="italic" font-size="8" fill="#2D2926" text-anchor="middle" opacity="0.6">
                            <text x="-38" y="-5">Passion</text>
                            <text x="38" y="-5">Mission</text>
                            <text x="38" y="80">Vocation</text>
                            <text x="-38" y="80">Profession</text>
                        </g>

                        <g font-family="Inter" font-size="6" font-weight="700" fill="#2D2926" text-anchor="middle" letter-spacing="1" opacity="0.3">
                            <text x="0" y="-105">LOVE</text>
                            <text x="-120" y="38">TALENT</text>
                            <text x="120" y="38">NEED</text>
                            <text x="0" y="180">PAID</text>
                        </g>
                    </svg>
                </div>
                
                <div class="foundation-grid">
                    <div class="pillar-card" style="border-left: 4px solid var(--passion)">
                        <span class="pillar-label">Passion</span>
                        <p class="pillar-val">"${finalAnalysis.passion}"</p>
                    </div>
                    <div class="pillar-card" style="border-left: 4px solid var(--mission)">
                        <span class="pillar-label">Mission</span>
                        <p class="pillar-val">"${finalAnalysis.mission}"</p>
                    </div>
                    <div class="pillar-card" style="border-left: 4px solid var(--vocation)">
                        <span class="pillar-label">Vocation</span>
                        <p class="pillar-val">"${finalAnalysis.vocation}"</p>
                    </div>
                    <div class="pillar-card" style="border-left: 4px solid var(--talent)">
                        <span class="pillar-label">Talent</span>
                        <p class="pillar-val">"${finalAnalysis.profession}"</p>
                    </div>
                </div>
            </div>

            <div class="section-header">
                <h2>Discovery Pathways</h2>
                <div class="line"></div>
            </div>

            <section class="pathway-section">
                <div class="pathway-list">
                    ${finalAnalysis.recommendations.map((r, i) => `
                        <div class="pathway-item">
                            <div class="pathway-num">0${i + 1}</div>
                            <div class="pathway-content">
                                <b>${r.category}</b>
                                <p>${r.text}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>

            <div class="section-header">
                <h2>The Substratum</h2>
                <div class="line"></div>
            </div>

            <div class="discovery-grid">
                <div class="reflection-card">
                    <h4>Internal Fires</h4>
                    <ul class="reflection-list">
                        ${answers.whatYouLove.map(a => `<li>${a}</li>`).join('')}
                    </ul>
                </div>
                <div class="reflection-card">
                    <h4>Technical Shadows</h4>
                    <ul class="reflection-list">
                        ${answers.whatYouAreGoodAt.map(a => `<li>${a}</li>`).join('')}
                    </ul>
                </div>
                <div class="reflection-card">
                    <h4>Worldly Cracks</h4>
                    <ul class="reflection-list">
                        ${answers.whatTheWorldNeeds.map(a => `<li>${a}</li>`).join('')}
                    </ul>
                </div>
                <div class="reflection-card">
                    <h4>Sustaining Forms</h4>
                    <ul class="reflection-list">
                        ${answers.whatYouCanBePaidFor.map(a => `<li>${a}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </main>

        <footer class="footer-note">
            <p>Your Ikigai is not a static destination, but a living frequency. Let this document be a reminder of your true center as you navigate the noise of existence.</p>
            <div class="footer-meta">TRUBBLX IKIGAI SANCTUARY • ARCHIVAL REPORT</div>
        </footer>
    </div>
</body>
</html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ikigai-discovery-${finalAnalysis.ikigai.toLowerCase().replace(/\s+/g, '-')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
