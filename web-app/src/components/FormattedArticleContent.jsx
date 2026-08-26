import React from 'react';

// Helper to render bold text inside line (e.g. **Bold Title**: rest of text, or "Title: rest")
function renderFormattedText(text) {
  if (!text) return null;

  // Regex to split by bold syntax **text** or __text__
  const parts = text.split(/(\*\*.*?\*\*|__.*?__)/g);

  return parts.map((part, index) => {
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      return (
        <strong key={index} className="font-extrabold text-darkNavy dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Check for bold lead-in pattern like "Gait & Stride Symmetry:" or "Heart Rate Variability (HRV):"
    const matchLeadIn = part.match(/^([A-Z0-9][A-Za-z0-9\s()&/\-–—]{2,60}:)(.*)$/);
    if (matchLeadIn && index === 0) {
      return (
        <React.Fragment key={index}>
          <strong className="font-extrabold text-darkNavy dark:text-white">{matchLeadIn[1]}</strong>
          {matchLeadIn[2]}
        </React.Fragment>
      );
    }

    return part;
  });
}

export default function FormattedArticleContent({ content, className = '' }) {
  if (!content) return null;

  let raw = String(content);

  // 1. Convert inline bullets (e.g. "... continuously: • Gait & Stride...") into newline bullet points
  raw = raw.replace(/([^\n])\s*•\s*/g, '$1\n• ');

  // 2. Insert newlines before numbered headings if inline (e.g. "...monitoring. 1. The Power...")
  raw = raw.replace(/([.?!])\s+(\d+\.\s+[A-Z])/g, '$1\n\n$2');

  // 3. Insert newlines before section headings ending without period
  raw = raw.replace(/([.?!])\s+([A-Z][A-Za-z0-9\s()&/\-–—]{5,50}\s+(?:Early|Feedback|Care|Team|Tracking|Monitoring|Guidance|Overview|Analysis|Detection|Compensation|Warnings|Metrics|Adjustments|System|Health|Disease|Prevention)\b)/g, '$1\n\n$2');

  // Split into lines
  const lines = raw.split(/\r?\n/);

  return (
    <div className={`space-y-3 font-sans leading-relaxed text-slate-700 dark:text-slate-200 ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />; // Blank paragraph separator
        }

        // Section Headings: e.g., "1. The Power of Continuous Tracking" or short heading lines
        if (/^\d+\.\s+/.test(trimmed) || (/^(?:[A-Z][A-Za-z0-9\s()&/\-–—]{4,60})$/.test(trimmed) && !trimmed.endsWith('.'))) {
          return (
            <h4 key={idx} className="font-poppins font-extrabold text-sm sm:text-base text-darkNavy dark:text-white pt-3 pb-1 tracking-tight">
              {renderFormattedText(trimmed)}
            </h4>
          );
        }

        // Bullet Points: e.g., "• Heart Rate Variability..." or "- ..." or "* ..."
        if (/^[•\-*]\s+/.test(trimmed)) {
          const bulletText = trimmed.replace(/^[•\-*]\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-3 sm:pl-4 my-1.5">
              <span className="text-primary font-black text-sm mt-0.5 shrink-0">•</span>
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex-1 leading-relaxed">
                {renderFormattedText(bulletText)}
              </div>
            </div>
          );
        }

        // Regular Paragraph
        return (
          <p key={idx} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {renderFormattedText(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
