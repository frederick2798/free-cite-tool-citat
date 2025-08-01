import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookOpen, Download, Search, FileText, GraduationCap } from '@phosphor-icons/react'
import { ArticleSearch } from '@/components/ArticleSearch'
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
  const [activeTab, setActiveTab] = useState('search')
  const [preferredStyle, setPreferredStyle] = useKV<CitationStyle>('preferred-style', 'apa')

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
            
            {/* Global Reference Style Selection */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <GraduationCap size={22} className="text-primary" />
                  <span className="text-sm font-semibold text-primary">Reference Style:</span>
                </div>
                <Select value={preferredStyle} onValueChange={(value: CitationStyle) => setPreferredStyle(value)}>
                  <SelectTrigger className="w-[200px] bg-white border-primary/30 font-medium">
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Citation Tools */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="search" className="flex items-center gap-2">
                  <Search size={16} />
                  <span className="hidden sm:inline">Smart Search</span>
                </TabsTrigger>
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
                <TabsContent value="search" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Smart Article Search</CardTitle>
                      <CardDescription>
                        Enter an article title and we'll find matching articles with confidence scores
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ArticleSearch 
                        onCitationAdd={addCitation} 
                        preferredStyle={preferredStyle}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4"
                    onClick={() => setActiveTab('bibliography')}
                    disabled={savedCitations.length === 0}
                  >
                    <Download size={16} className="mr-2" />
                    Export Bibliography
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ad Placement Area */}
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="p-6 text-center">
                <div className="text-xs text-muted-foreground">Advertisement</div>
                <div className="mt-2 text-xs text-muted-foreground opacity-60">
                  300x250 Ad Space
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
                  <p className="font-medium mb-1">Smart Search</p>
                  <p className="text-muted-foreground text-xs">
                    Enter article titles - our AI finds and auto-fills citation details with confidence scores
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