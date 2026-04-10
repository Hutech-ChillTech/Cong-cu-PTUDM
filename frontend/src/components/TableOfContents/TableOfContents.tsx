import React, { useEffect, useState } from 'react';
import { Anchor } from 'antd';
import './TableOfContents.css';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
  const [items, setItems] = useState<TOCItem[]>([]);

  useEffect(() => {
    if (!content) return;

    // Parse HTML to extract headings
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3');
    
    const tocItems: TOCItem[] = Array.from(headings).map((h, i) => {
      const id = `heading-${i}`;
      
      return {
        id,
        text: h.textContent || '',
        level: parseInt(h.tagName[1])
      };
    });
    
    setItems(tocItems);
  }, [content]);

  if (items.length === 0) return null;

  return (
    <div className="table-of-contents">
      <h4 className="toc-title">📑 Nội dung</h4>
      <Anchor
        affix={false}
        items={items.map(item => ({
          key: item.id,
          href: `#${item.id}`,
          title: item.text,
          className: `toc-level-${item.level}`
        }))}
      />
    </div>
  );
};

export default TableOfContents;
