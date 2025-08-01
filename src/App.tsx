import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { BookOpen, Download, Search, FileText, GraduationCap, Plus, FileWord, File } from '@phosphor-icons/react'
import { CombinedCitationForm } from '@/components/CombinedCitationForm'
import { UrlCitationForm } from '@/components/UrlCitationForm'
import { Bibliography } from '@/components/Bibliography'
import { CitationStyleConverter } from '@/components/CitationStyleConverter'

export interface Citation {
  id: string
  title: string
  authors: string[]
  year: string
  source: string
  url?: string
  doi?: string
  pages?: string
  volume?: string
  issue?: string
  publisher?: string
  type: 'article' | 'website' | 'book' | 'journal'
  dateAccessed?: string
  confidence?: number
}

export type CitationStyle = 'apa' | 'mla' | 'chicago' | 'harvard'

function App() {
  const [savedCitations, setSavedCitations] = useKV<Citation[]>('bibliography', [])
  const [activeTab, setActiveTab] = useState('url')
  const [preferredStyle, setPreferredStyle] = useKV<CitationStyle>('preferred-style', 'apa')
  const [showExportDialog, setShowExportDialog] = useState(false)

  const styleNames: Record<CitationStyle, string> = {
    apa: 'APA 7th Edition',
    mla: 'MLA 9th Edition', 
    chicago: 'Chicago Manual',
    harvard: 'Harvard Referencing'
  }

  const addCitation = (citation: Citation) => {
    setSavedCitations((current) => [...current, citation])
  }

  const updateCitation = (id: string, updatedCitation: Citation) => {
    setSavedCitations((current) =>
      current.map(citation => citation.id === id ? updatedCitation : citation)
    )
  }

  const deleteCitation = (id: string) => {
    setSavedCitations((current) => current.filter(citation => citation.id !== id))
  }

  const exportBibliography = (format: 'rtf' | 'txt' | 'zotero' | 'mendeley') => {
    if (savedCitations.length === 0) {
      return
    }

    const formatCitationForExport = (citation: Citation, style: CitationStyle): string => {
      const { title, authors, year, source, url, pages, volume, issue, publisher } = citation
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
            if (url) chicagoResult += ` ${url}.`
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
            if (url) harvardResult += `, available at: ${url}.`
          } else {
            if (publisher) harvardResult += `, ${publisher}`
            harvardResult += '.'
          }
          return harvardResult

        default:
          return 'Unsupported citation style'
      }
    }

    let content = ''
    let filename = ''
    let mimeType = 'text/plain'

    const formattedCitations = savedCitations.map(citation => 
      formatCitationForExport(citation, preferredStyle)
    )

    switch (format) {
      case 'txt':
        content = formattedCitations.join('\n\n')
        filename = `bibliography-${preferredStyle}-${new Date().toISOString().split('T')[0]}.txt`
        mimeType = 'text/plain'
        break

      case 'rtf':
        // RTF format for Word compatibility
        content = '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\\f0\\fs24 '
        content += 'Bibliography\\par\\par '
        content += formattedCitations.map(citation => citation.replace(/\n/g, '\\par ')).join('\\par\\par ')
        content += '}'
        filename = `bibliography-${preferredStyle}-${new Date().toISOString().split('T')[0]}.rtf`
        mimeType = 'application/rtf'
        break

      case 'zotero':
        // Zotero-compatible RDF format
        content = `<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:z="http://www.zotero.org/namespaces/export#"
         xmlns:dc="http://purl.org/dc/elements/1.1/">
${savedCitations.map(citation => `
  <rdf:Description rdf:about="urn:isbn:${citation.id}">
    <dc:title>${citation.title}</dc:title>
    <dc:creator>${citation.authors.join('; ')}</dc:creator>
    <dc:date>${citation.year}</dc:date>
    <dc:source>${citation.source}</dc:source>
    <dc:type>${citation.type}</dc:type>
    ${citation.url ? `<dc:identifier>${citation.url}</dc:identifier>` : ''}
  </rdf:Description>`).join('')}
</rdf:RDF>`
        filename = `bibliography-zotero-${new Date().toISOString().split('T')[0]}.rdf`
        mimeType = 'application/rdf+xml'
        break

      case 'mendeley':
        // Mendeley-compatible format
        content = savedCitations.map(citation => {
          return `Type: Journal Article
Title: ${citation.title}
Authors: ${citation.authors.join('; ')}
Year: ${citation.year}
Journal: ${citation.source}
${citation.volume ? `Volume: ${citation.volume}` : ''}
${citation.issue ? `Issue: ${citation.issue}` : ''}
${citation.pages ? `Pages: ${citation.pages}` : ''}
${citation.doi ? `DOI: ${citation.doi}` : ''}
${citation.url ? `URL: ${citation.url}` : ''}
`
        }).join('\n---\n\n')
        filename = `bibliography-mendeley-${new Date().toISOString().split('T')[0]}.txt`
        mimeType = 'text/plain'
        break
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setShowExportDialog(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen size={24} className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Free Cite Tool</h1>
                <p className="text-muted-foreground text-sm">Smart citation generator for academic research</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Citation Tools */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Ad Placement */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="text-sm font-medium text-blue-800 mb-2">📚 Academic Resources</div>
                <div className="text-xs text-blue-600">
                  Discover the best citation tools and academic writing guides - Learn More
                </div>
              </CardContent>
            </Card>

            {/* Reference Style Selection - More Prominent */}
            <Card className="bg-gradient-to-r from-primary via-primary/90 to-secondary border-2 border-primary shadow-lg">
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-center sm:text-left">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <GraduationCap size={32} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Citation Style</h3>
                      <p className="text-white/90">Choose your preferred referencing format</p>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <Select value={preferredStyle} onValueChange={(value: CitationStyle) => setPreferredStyle(value)}>
                      <SelectTrigger className="w-[280px] bg-white border-0 font-semibold shadow-lg text-lg h-14 citation-style-trigger">
                        <SelectValue className="text-white" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(styleNames).map(([key, name]) => (
                          <SelectItem key={key} value={key} className="text-lg py-3">
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Smart Search and Reference Type - Always Visible */}
            <CombinedCitationForm 
              onCitationAdd={addCitation} 
              preferredStyle={preferredStyle}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <FileText size={16} />
                  <span className="hidden sm:inline">URL Citation</span>
                </TabsTrigger>
                <TabsTrigger value="convert" className="flex items-center gap-2">
                  <Download size={16} />
                  <span className="hidden sm:inline">Convert Style</span>
                </TabsTrigger>
                <TabsTrigger value="bibliography" className="flex items-center gap-2">
                  <BookOpen size={16} />
                  <span className="hidden sm:inline">Bibliography</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="url" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>URL Citation Generator</CardTitle>
                      <CardDescription>
                        Paste a URL to automatically extract citation information
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <UrlCitationForm onCitationAdd={addCitation} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="convert" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Citation Style Converter</CardTitle>
                      <CardDescription>
                        Convert your saved citations between different academic styles
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CitationStyleConverter citations={savedCitations} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="bibliography" className="space-y-6">
                  <Bibliography 
                    citations={savedCitations}
                    onUpdate={updateCitation}
                    onDelete={deleteCitation}
                    preferredStyle={preferredStyle}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Bibliography</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Citations</span>
                    <span className="font-semibold">{savedCitations.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Articles</span>
                    <span className="font-semibold">
                      {savedCitations.filter(c => c.type === 'article').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Websites</span>
                    <span className="font-semibold">
                      {savedCitations.filter(c => c.type === 'website').length}
                    </span>
                  </div>
                  <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-4"
                        disabled={savedCitations.length === 0}
                      >
                        <Download size={16} className="mr-2" />
                        Export Bibliography
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Export Bibliography</DialogTitle>
                        <DialogDescription>
                          Choose your preferred export format
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-3 py-4">
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium">Document Formats</h4>
                          <div className="grid gap-2">
                            <Button
                              variant="outline"
                              className="justify-start h-auto p-3"
                              onClick={() => exportBibliography('rtf')}
                            >
                              <FileWord size={16} className="mr-3 text-blue-600" />
                              <div className="text-left">
                                <div className="font-medium">Word Document (.rtf)</div>
                                <div className="text-xs text-muted-foreground">Compatible with Microsoft Word</div>
                              </div>
                            </Button>
                            <Button
                              variant="outline"
                              className="justify-start h-auto p-3"
                              onClick={() => exportBibliography('txt')}
                            >
                              <File size={16} className="mr-3 text-gray-600" />
                              <div className="text-left">
                                <div className="font-medium">Plain Text (.txt)</div>
                                <div className="text-xs text-muted-foreground">Simple text format</div>
                              </div>
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium">Reference Managers</h4>
                          <div className="grid gap-2">
                            <Button
                              variant="outline"
                              className="justify-start h-auto p-3"
                              onClick={() => exportBibliography('zotero')}
                            >
                              <BookOpen size={16} className="mr-3 text-red-600" />
                              <div className="text-left">
                                <div className="font-medium">Zotero (.rdf)</div>
                                <div className="text-xs text-muted-foreground">Import into Zotero</div>
                              </div>
                            </Button>
                            <Button
                              variant="outline"
                              className="justify-start h-auto p-3"
                              onClick={() => exportBibliography('mendeley')}
                            >
                              <BookOpen size={16} className="mr-3 text-orange-600" />
                              <div className="text-left">
                                <div className="font-medium">Mendeley (.txt)</div>
                                <div className="text-xs text-muted-foreground">Import into Mendeley</div>
                              </div>
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                          Cancel
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Ad Placement Area */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
              <CardContent className="p-6 text-center">
                <div className="text-sm font-medium text-green-800 mb-2">✍️ Writing Tools</div>
                <div className="text-xs text-green-600">
                  Professional grammar checker and writing assistant - Try Free
                </div>
              </CardContent>
            </Card>

            {/* Help & Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium mb-1">Citations</p>
                  <p className="text-muted-foreground text-xs">
                    Search for articles or manually add sources like books, websites, and more
                  </p>
                </div>
                <div className="text-sm">
                  <p className="font-medium mb-1">Edit & Refine</p>
                  <p className="text-muted-foreground text-xs">
                    Click "Edit" on search results to refine details before adding to bibliography
                  </p>
                </div>
                <div className="text-sm">
                  <p className="font-medium mb-1">In-Text Citations</p>
                  <p className="text-muted-foreground text-xs">
                    Copy both full citations and in-text references in your preferred style
                  </p>
                </div>
                <div className="text-sm">
                  <p className="font-medium mb-1">Reference Styles</p>
                  <p className="text-muted-foreground text-xs">
                    Choose from APA, MLA, Chicago, or Harvard formatting styles
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App