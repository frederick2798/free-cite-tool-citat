import type { Citation } from '@/App'

/**
 * Export utilities for bibliography management software
 */

export type ExportFormat = 'text' | 'ris' | 'bibtex' | 'endnote' | 'zotero' | 'mendeley'

/**
 * Generate RIS format for Zotero and Mendeley import
 */
export function generateRISFormat(citations: Citation[]): string {
  const risEntries = citations.map(citation => {
    const lines: string[] = []
    
    // Type of reference
    const typeMap = {
      'article': 'JOUR',
      'journal': 'JOUR', 
      'book': 'BOOK',
      'website': 'ELEC'
    }
    
    lines.push(`TY  - ${typeMap[citation.type] || 'GEN'}`)
    
    // Title
    lines.push(`TI  - ${citation.title}`)
    
    // Authors
    citation.authors.forEach(author => {
      lines.push(`AU  - ${author}`)
    })
    
    // Publication year
    if (citation.year) {
      lines.push(`PY  - ${citation.year}`)
    }
    
    // Journal/Source
    if (citation.source) {
      if (citation.type === 'journal' || citation.type === 'article') {
        lines.push(`JO  - ${citation.source}`)
      } else {
        lines.push(`T2  - ${citation.source}`)
      }
    }
    
    // Volume
    if (citation.volume) {
      lines.push(`VL  - ${citation.volume}`)
    }
    
    // Issue
    if (citation.issue) {
      lines.push(`IS  - ${citation.issue}`)
    }
    
    // Pages
    if (citation.pages) {
      lines.push(`SP  - ${citation.pages.split('-')[0]}`)
      if (citation.pages.includes('-')) {
        lines.push(`EP  - ${citation.pages.split('-')[1]}`)
      }
    }
    
    // Publisher
    if (citation.publisher) {
      lines.push(`PB  - ${citation.publisher}`)
    }
    
    // URL
    if (citation.url) {
      lines.push(`UR  - ${citation.url}`)
    }
    
    // DOI
    if (citation.doi) {
      lines.push(`DO  - ${citation.doi}`)
    }
    
    // Date accessed (for websites)
    if (citation.dateAccessed && citation.type === 'website') {
      lines.push(`Y2  - ${citation.dateAccessed}`)
    }
    
    // End of record
    lines.push('ER  - ')
    
    return lines.join('\n')
  })
  
  return risEntries.join('\n\n')
}

/**
 * Generate BibTeX format
 */
export function generateBibTeXFormat(citations: Citation[]): string {
  const bibEntries = citations.map(citation => {
    const citationKey = generateCitationKey(citation)
    const lines: string[] = []
    
    // Entry type
    const typeMap = {
      'article': 'article',
      'journal': 'article',
      'book': 'book', 
      'website': 'misc'
    }
    
    lines.push(`@${typeMap[citation.type] || 'misc'}{${citationKey},`)
    
    // Title
    lines.push(`  title={${citation.title}},`)
    
    // Authors
    if (citation.authors.length > 0) {
      lines.push(`  author={${citation.authors.join(' and ')}},`)
    }
    
    // Year
    if (citation.year) {
      lines.push(`  year={${citation.year}},`)
    }
    
    // Journal/Source specific fields
    if (citation.type === 'journal' || citation.type === 'article') {
      if (citation.source) {
        lines.push(`  journal={${citation.source}},`)
      }
      if (citation.volume) {
        lines.push(`  volume={${citation.volume}},`)
      }
      if (citation.issue) {
        lines.push(`  number={${citation.issue}},`)
      }
      if (citation.pages) {
        lines.push(`  pages={${citation.pages}},`)
      }
    } else if (citation.type === 'book') {
      if (citation.publisher) {
        lines.push(`  publisher={${citation.publisher}},`)
      }
    } else if (citation.type === 'website') {
      if (citation.source) {
        lines.push(`  howpublished={\\url{${citation.url || citation.source}}},`)
      }
      if (citation.dateAccessed) {
        lines.push(`  note={Accessed: ${citation.dateAccessed}},`)
      }
    }
    
    // URL
    if (citation.url) {
      lines.push(`  url={${citation.url}},`)
    }
    
    // DOI
    if (citation.doi) {
      lines.push(`  doi={${citation.doi}},`)
    }
    
    lines.push('}')
    
    return lines.join('\n')
  })
  
  return bibEntries.join('\n\n')
}

/**
 * Generate EndNote format
 */
export function generateEndNoteFormat(citations: Citation[]): string {
  const endnoteEntries = citations.map(citation => {
    const lines: string[] = []
    
    // Reference type
    const typeMap = {
      'article': '0',
      'journal': '0',
      'book': '6',
      'website': '12'
    }
    
    lines.push(`%0 ${typeMap[citation.type] || '13'}`)
    
    // Title
    lines.push(`%T ${citation.title}`)
    
    // Authors
    citation.authors.forEach(author => {
      lines.push(`%A ${author}`)
    })
    
    // Date
    if (citation.year) {
      lines.push(`%D ${citation.year}`)
    }
    
    // Journal/Source
    if (citation.source) {
      if (citation.type === 'journal' || citation.type === 'article') {
        lines.push(`%J ${citation.source}`)
      } else {
        lines.push(`%B ${citation.source}`)
      }
    }
    
    // Volume
    if (citation.volume) {
      lines.push(`%V ${citation.volume}`)
    }
    
    // Issue
    if (citation.issue) {
      lines.push(`%N ${citation.issue}`)
    }
    
    // Pages
    if (citation.pages) {
      lines.push(`%P ${citation.pages}`)
    }
    
    // Publisher
    if (citation.publisher) {
      lines.push(`%I ${citation.publisher}`)
    }
    
    // URL
    if (citation.url) {
      lines.push(`%U ${citation.url}`)
    }
    
    return lines.join('\n')
  })
  
  return endnoteEntries.join('\n\n')
}

/**
 * Generate a citation key for BibTeX
 */
function generateCitationKey(citation: Citation): string {
  const firstAuthor = citation.authors[0] || 'unknown'
  const authorLastName = firstAuthor.includes(',') 
    ? firstAuthor.split(',')[0].trim()
    : firstAuthor.split(' ').pop() || 'unknown'
  
  const year = citation.year || 'nd'
  const titleWords = citation.title.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(' ')
    .slice(0, 3)
    .join('')
  
  return `${authorLastName.toLowerCase()}${year}${titleWords}`
}

/**
 * Export citations to file with specified format
 */
export function exportToFile(citations: Citation[], format: ExportFormat, filename?: string): void {
  if (citations.length === 0) {
    throw new Error('No citations to export')
  }
  
  let content: string
  let fileExtension: string
  let mimeType: string
  
  switch (format) {
    case 'ris':
    case 'zotero':
    case 'mendeley':
      content = generateRISFormat(citations)
      fileExtension = 'ris'
      mimeType = 'application/x-research-info-systems'
      break
      
    case 'bibtex':
      content = generateBibTeXFormat(citations)
      fileExtension = 'bib'
      mimeType = 'text/plain'
      break
      
    case 'endnote':
      content = generateEndNoteFormat(citations)
      fileExtension = 'enw'
      mimeType = 'text/plain'
      break
      
    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
  
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `bibliography-${format}-${new Date().toISOString().split('T')[0]}.${fileExtension}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}