import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const formatMarkdown = (text: string) => {
    // Split text into lines for processing
    const lines = text.split('\n');
    const elements: React.ReactElement[] = [];
    
    lines.forEach((line, index) => {
      const key = `line-${index}`;
      
      // Handle headers (##, ###)
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={key} className="text-sm font-semibold text-gray-800 mt-3 mb-1">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={key} className="text-base font-bold text-gray-900 mt-4 mb-2">
            {line.replace('## ', '')}
          </h2>
        );
      }
      // Handle bullet points
      else if (line.startsWith('• ') || line.startsWith('- ')) {
        const bulletText = line.replace(/^[•-]\s*/, '');
        const formattedText = formatInlineMarkdown(bulletText);
        elements.push(
          <div key={key} className="flex items-start ml-2 mb-1">
            <span className="text-availity-600 mr-2 mt-0.5">•</span>
            <span className="text-sm text-gray-700">{formattedText}</span>
          </div>
        );
      }
      // Handle bold sections (starting with **)
      else if (line.startsWith('**') && line.endsWith('**')) {
        const boldText = line.replace(/^\*\*/, '').replace(/\*\*$/, '');
        elements.push(
          <p key={key} className="text-sm font-semibold text-gray-800 mt-2 mb-1">
            {boldText}
          </p>
        );
      }
      // Handle regular paragraphs
      else if (line.trim()) {
        const formattedText = formatInlineMarkdown(line);
        elements.push(
          <p key={key} className="text-sm text-gray-700 mb-2 leading-relaxed">
            {formattedText}
          </p>
        );
      }
      // Handle empty lines (spacing)
      else {
        elements.push(<div key={key} className="h-2" />);
      }
    });
    
    return elements;
  };

  const formatInlineMarkdown = (text: string): React.ReactElement[] => {
    const parts: React.ReactElement[] = [];
    let currentIndex = 0;

    // Combined regex to handle both bold text and HTML links
    const combinedRegex = /(\*\*(.*?)\*\*)|(<a\s+href="([^"]*)"[^>]*>(.*?)<\/a>)/g;
    let match;

    while ((match = combinedRegex.exec(text)) !== null) {
      // Add text before the current match
      if (match.index > currentIndex) {
        parts.push(
          <span key={`text-${currentIndex}`}>
            {text.slice(currentIndex, match.index)}
          </span>
        );
      }

      if (match[1]) {
        // This is a bold match (**text**)
        parts.push(
          <strong key={`bold-${match.index}`} className="font-semibold text-gray-900">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        // This is an HTML link match
        const href = match[4];
        const linkText = match[5];
        parts.push(
          <a
            key={`link-${match.index}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-availity-600 hover:text-availity-700 underline font-medium"
          >
            {linkText}
          </a>
        );
      }

      currentIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(
        <span key={`text-${currentIndex}`}>
          {text.slice(currentIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : [<span key="default">{text}</span>];
  };

  return (
    <div className="space-y-1">
      {formatMarkdown(content)}
    </div>
  );
};
