import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, BookOpen } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Citation, CitationStyle } from '@/App'

interface CitationStyleConverterProps {
  citations: Citation[]
}

const styleNames: Record<CitationStyle, string> = {
  apa: 'APA 7th Edition',
  mla: 'MLA 9th Edition',
  chicago: 'Chicago Manual of Style',
  harvard: 'Harvard Referencing'
}

export function CitationStyleConverter({ citations }: CitationStyleConverterProps) {
  const [selectedCitation, setSelectedCitation] = useState<string>('')
  const [selectedStyle, setSelectedStyle] = useState<CitationStyle>('apa')

  const formatCitation = (citation: Citation, style: CitationStyle): string => {
    const { title, authors, year, source, url, pages, volume, issue, publisher, dateAccessed } = citation
    const authorStr = authors.length > 0 ? authors.join(', ') : 'Unknown Author'
    
    switch (style) {
      case 'apa':
        let apaResult = `${authorStr} (${year || 'n.d.'}). ${title}.`
        if (citation.type === 'journal' && source) {
          apaResult += ` *${source}*`
          if (volume) apaResult += `, ${volume}`
          if (issue) apaResult += `(${issue})`
          if (pages) apaResult += `, ${pages}`
          apaResult += '.'
        } else if (citation.type === 'website') {
          if (source) apaResult += ` *${source}*.`
          if (url) apaResult += ` ${url}`
        } else {
          if (source) apaResult += ` *${source}*.`
          if (publisher) apaResult += ` ${publisher}.`
        }
        return apaResult

      case 'mla':
        let mlaResult = `${authorStr}. "${title}."`
        if (citation.type === 'journal' && source) {
          mlaResult += ` *${source}*`
          if (volume) mlaResult += `, vol. ${volume}`
          if (issue) mlaResult += `, no. ${issue}`
          if (year) mlaResult += `, ${year}`
          if (pages) mlaResult += `, pp. ${pages}`
          mlaResult += '.'
        } else if (citation.type === 'website') {
          if (source) mlaResult += ` *${source}*`
          if (year) mlaResult += `, ${year}`
          if (url) mlaResult += `. Web.`
          if (dateAccessed) mlaResult += ` ${new Date(dateAccessed).toLocaleDateString()}.`
        } else {
          if (source) mlaResult += ` *${source}*.`
          if (publisher) mlaResult += ` ${publisher}`
          if (year) mlaResult += `, ${year}`
          mlaResult += '.'
        }
        return mlaResult

      case 'chicago':
        let chicagoResult = `${authorStr}. "${title}."`
        if (citation.type === 'journal' && source) {
          chicagoResult += ` *${source}*`
          if (volume) chicagoResult += ` ${volume}`
          if (issue) chicagoResult += `, no. ${issue}`
          if (year) chicagoResult += ` (${year})`
          if (pages) chicagoResult += `: ${pages}`
          chicagoResult += '.'
        } else if (citation.type === 'website') {
          if (source) chicagoResult += ` *${source}*.`
          if (year) chicagoResult += ` ${year}.`
          if (url) chicagoResult += ` ${url}`
          if (dateAccessed) chicagoResult += ` (accessed ${new Date(dateAccessed).toLocaleDateString()}).`
        } else {
          if (publisher) chicagoResult += ` ${publisher}`
          if (year) chicagoResult += `, ${year}`
          chicagoResult += '.'
        }
        return chicagoResult

      case 'harvard':
        let harvardResult = `${authorStr} (${year || 'n.d.'}) '${title}'`
        if (citation.type === 'journal' && source) {
          harvardResult += `, *${source}*`
          if (volume) harvardResult += `, vol. ${volume}`
          if (issue) harvardResult += `, no. ${issue}`
          if (pages) harvardResult += `, pp. ${pages}`
          harvardResult += '.'
        } else if (citation.type === 'website') {
          if (source) harvardResult += `, *${source}*`
          if (url) harvardResult += `, available at: ${url}`
          if (dateAccessed) harvardResult += ` (Accessed: ${new Date(dateAccessed).toLocaleDateString()}).`
        } else {
          if (publisher) harvardResult += `, ${publisher}`
          harvardResult += '.'
        }
        return harvardResult

      default:
        return 'Unsupported citation style'
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Citation copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy citation')
    }
  }

  const exportCitation = (citation: Citation, style: CitationStyle) => {
    const formattedCitation = formatCitation(citation, style)
    const blob = new Blob([formattedCitation], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `citation-${style}-${citation.title.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Citation exported successfully!')
  }

  const selectedCitationData = citations.find(c => c.id === selectedCitation)

  if (citations.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <BookOpen size={32} className="mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">No citations available</p>
            <p className="text-sm text-muted-foreground">
              Add some citations first to use the style converter
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Selection Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Citation</label>
          <Select value={selectedCitation} onValueChange={setSelectedCitation}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a citation to convert" />
            </SelectTrigger>
            <SelectContent>
              {citations.map((citation) => (
                <SelectItem key={citation.id} value={citation.id}>
                  <div className="flex items-center gap-2">
                    <span className="truncate">{citation.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {citation.type}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Citation Style</label>
          <Select value={selectedStyle} onValueChange={(value: CitationStyle) => setSelectedStyle(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(styleNames).map(([key, name]) => (
                <SelectItem key={key} value={key}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Formatted Citation Display */}
      {selectedCitationData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Formatted Citation</CardTitle>
                <CardDescription>
                  {styleNames[selectedStyle]} format
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(formatCitation(selectedCitationData, selectedStyle))}
                >
                  <Copy size={14} className="mr-1" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportCitation(selectedCitationData, selectedStyle)}
                >
                  <Download size={14} className="mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm leading-relaxed font-mono">
                {formatCitation(selectedCitationData, selectedStyle)}
              </p>
            </div>
            
            {/* Citation Details */}
            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="text-sm font-medium mb-3">Source Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Title:</span>
                  <p className="mt-1">{selectedCitationData.title}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Authors:</span>
                  <p className="mt-1">
                    {selectedCitationData.authors.length > 0 
                      ? selectedCitationData.authors.join(', ')
                      : 'Not specified'
                    }
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Year:</span>
                  <p className="mt-1">{selectedCitationData.year || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Source:</span>
                  <p className="mt-1">{selectedCitationData.source}</p>
                </div>
                {selectedCitationData.url && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">URL:</span>
                    <p className="mt-1 text-xs font-mono break-all">{selectedCitationData.url}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Style Comparison */}
      {selectedCitationData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Citation Styles</CardTitle>
            <CardDescription>
              Compare how this citation appears in different formats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(styleNames).map(([styleKey, styleName]) => (
              <div key={styleKey} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{styleName}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(formatCitation(selectedCitationData, styleKey as CitationStyle))}
                  >
                    <Copy size={12} className="mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="p-3 bg-muted rounded text-sm font-mono leading-relaxed">
                  {formatCitation(selectedCitationData, styleKey as CitationStyle)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}