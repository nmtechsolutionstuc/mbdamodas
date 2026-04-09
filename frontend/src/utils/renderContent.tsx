/**
 * Simple markdown-like renderer for editable page content.
 * Supports: ## headings, ### subheadings, --- separators, numbered lists, paragraphs
 */
export function renderContent(content: string): React.ReactNode[] {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]!.trimEnd()

    // Skip empty lines
    if (line.trim() === '') {
      i++
      continue
    }

    // Separator ---
    if (line.trim() === '---') {
      elements.push(
        <hr key={key++} style={{ border: 'none', borderTop: '1px solid #E8E3D5', margin: '2rem 0' }} />
      )
      i++
      continue
    }

    // ## Heading (h2)
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.35rem',
          fontWeight: 700,
          color: '#1E1914',
          marginTop: elements.length > 0 ? '2rem' : '0',
          marginBottom: '0.75rem',
        }}>
          {line.slice(3)}
        </h2>
      )
      i++
      continue
    }

    // ### Subheading (h3)
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.1rem',
          fontWeight: 700,
          color: '#1E1914',
          marginTop: '1.5rem',
          marginBottom: '0.5rem',
        }}>
          {line.slice(4)}
        </h3>
      )
      i++
      continue
    }

    // Numbered list item (e.g., "1. Title: description")
    const listMatch = line.match(/^(\d+)\.\s+(.+)$/)
    if (listMatch) {
      const items: { n: string; text: string }[] = []
      while (i < lines.length) {
        const m = lines[i]!.trimEnd().match(/^(\d+)\.\s+(.+)$/)
        if (!m) break
        items.push({ n: m[1]!, text: m[2]! })
        i++
      }
      elements.push(
        <div key={key++} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
          {items.map(item => {
            const colonIdx = item.text.indexOf(':')
            const hasTitle = colonIdx > 0 && colonIdx < 60
            return (
              <div key={item.n} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: '#1E1914', color: '#E8E3D5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: 700, flexShrink: 0,
                }}>
                  {item.n}
                </div>
                <div>
                  {hasTitle ? (
                    <>
                      <p style={{ fontWeight: 600, color: '#1E1914', marginBottom: '0.2rem' }}>
                        {item.text.slice(0, colonIdx)}
                      </p>
                      <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.6 }}>
                        {item.text.slice(colonIdx + 1).trim()}
                      </p>
                    </>
                  ) : (
                    <p style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: 1.6 }}>{item.text}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )
      continue
    }

    // Regular paragraph — collect consecutive non-empty, non-special lines
    const paraLines: string[] = []
    while (i < lines.length) {
      const l = lines[i]!.trimEnd()
      if (l.trim() === '' || l.startsWith('## ') || l.startsWith('### ') || l.trim() === '---' || /^\d+\.\s+/.test(l)) break
      paraLines.push(l)
      i++
    }
    elements.push(
      <p key={key++} style={{ color: '#4b5563', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '0.75rem' }}>
        {paraLines.join('\n')}
      </p>
    )
  }

  return elements
}
