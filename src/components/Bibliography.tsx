import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Download, 
  Trash2, 
  Edit, 
  BookOpen, 
  FileText, 
  Copy,
  SortAsc,
  SortDesc,
  Filter,
  Quotes
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Citation, CitationStyle } from '@/App'

interface BibliographyProps {
  citations: Citation[]
  onUpdate: (id: string, citation: Citation) => void
  onDelete: (id: string) => void
  preferredStyle: CitationStyle
}

type SortOption = 'title' | 'author' | 'year' | 'type' | 'dateAdded'
type FilterOption = 'all' | 'article' | 'website' | 'book' | 'journal'

export function Bibliography({ citations, onUpdate, onDelete, preferredStyle }: BibliographyProps) {
  const [sortBy, setSortBy] = useState<SortOption>('title')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [editingCitation, setEditingCitation] = useState<Citation | null>(null)
  const [exportFormat, setExportFormat] = useState<CitationStyle>(preferredStyle)

  const filteredAndSortedCitations = citations
    .filter(citation => filterBy === 'all' || citation.type === filterBy)
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'author':
          const aAuthor = a.authors[0] || 'Unknown'
          const bAuthor = b.authors[0] || 'Unknown'
          comparison = aAuthor.localeCompare(bAuthor)
          break
        case 'year':
          comparison = (a.year || '0').localeCompare(b.year || '0')
          break
        case 'type':
          comparison = a.type.localeCompare(b.type)
          break
        default:
          comparison = 0
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

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

  const formatInTextCitation = (citation: Citation, style: CitationStyle): string => {
    const { authors, year, pages } = citation
    const firstAuthor = authors.length > 0 ? authors[0] : 'Unknown Author'
    const authorLastName = firstAuthor.includes(',') ? firstAuthor.split(',')[0] : firstAuthor.split(' ').pop() || 'Unknown'
    
    switch (style) {
      case 'apa':
        if (authors.length === 1) {
          return pages ? `(${authorLastName}, ${year || 'n.d.'}, p. ${pages})` : `(${authorLastName}, ${year || 'n.d.'})`
        } else if (authors.length === 2) {
          const secondAuthor = authors[1].includes(',') ? authors[1].split(',')[0] : authors[1].split(' ').pop() || 'Unknown'
          return pages ? `(${authorLastName} & ${secondAuthor}, ${year || 'n.d.'}, p. ${pages})` : `(${authorLastName} & ${secondAuthor}, ${year || 'n.d.'})`
        } else {
          return pages ? `(${authorLastName} et al., ${year || 'n.d.'}, p. ${pages})` : `(${authorLastName} et al., ${year || 'n.d.'})`
        }

      case 'mla':
        return pages ? `(${authorLastName} ${pages})` : `(${authorLastName})`

      case 'chicago':
        return pages ? `(${authorLastName} ${year || 'n.d.'}, ${pages})` : `(${authorLastName} ${year || 'n.d.'})`

      case 'harvard':
        return pages ? `(${authorLastName} ${year || 'n.d.'}: ${pages})` : `(${authorLastName} ${year || 'n.d.'})`

      default:
        return `(${authorLastName}, ${year || 'n.d.'})`
    }
  }

  const copyInTextCitation = async (citation: Citation) => {
    const inTextCitation = formatInTextCitation(citation, exportFormat)
    try {
      await navigator.clipboard.writeText(inTextCitation)
      toast.success('In-text citation copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy in-text citation')
    }
  }

  const copyFullCitation = async (citation: Citation) => {
    const fullCitation = formatCitationForExport(citation, exportFormat)
    try {
      await navigator.clipboard.writeText(fullCitation)
      toast.success('Full citation copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy citation')
    }
  }

  const copyAllCitations = async () => {
    if (filteredAndSortedCitations.length === 0) {
      toast.error('No citations to copy')
      return
    }

    const formattedCitations = filteredAndSortedCitations.map(citation => 
      formatCitationForExport(citation, exportFormat)
    ).join('\n\n')

    try {
      await navigator.clipboard.writeText(formattedCitations)
      toast.success('All citations copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy citations')
    }
  }

  const exportBibliography = () => {
    if (filteredAndSortedCitations.length === 0) {
      toast.error('No citations to export')
      return
    }

    const formattedCitations = filteredAndSortedCitations.map(citation => 
      formatCitationForExport(citation, exportFormat)
    ).join('\n\n')

    const blob = new Blob([formattedCitations], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bibliography-${exportFormat}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Bibliography exported successfully!')
  }

  const handleEdit = (citation: Citation) => {
    setEditingCitation({ ...citation })
  }

  const saveEdit = () => {
    if (editingCitation) {
      onUpdate(editingCitation.id, editingCitation)
      setEditingCitation(null)
      toast.success('Citation updated successfully!')
    }
  }

  const handleDelete = (citation: Citation) => {
    if (confirm(`Delete citation "${citation.title}"?`)) {
      onDelete(citation.id)
      toast.success('Citation deleted')
    }
  }

  const getTypeIcon = (type: Citation['type']) => {
    switch (type) {
      case 'article':
      case 'journal':
        return <FileText size={16} />
      case 'website':
        return <FileText size={16} />
      case 'book':
        return <BookOpen size={16} />
      default:
        return <FileText size={16} />
    }
  }

  const getConfidenceBadge = (confidence?: number) => {
    if (!confidence) return null
    
    if (confidence >= 0.8) {
      return <Badge className="bg-secondary text-secondary-foreground text-xs">High Confidence</Badge>
    } else if (confidence >= 0.6) {
      return <Badge variant="outline" className="border-yellow-400 text-yellow-700 text-xs">Medium</Badge>
    } else {
      return <Badge variant="outline" className="border-red-400 text-red-700 text-xs">Low</Badge>
    }
  }

  if (citations.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <BookOpen size={32} className="mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Your bibliography is empty</p>
            <p className="text-sm text-muted-foreground">
              Start by searching for articles or adding URL citations
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bibliography Manager</CardTitle>
          <CardDescription>
            Manage, organize, and export your citation collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Filter and Sort */}
            <div className="flex gap-2 flex-1">
              <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
                <SelectTrigger className="w-[120px]">
                  <Filter size={14} className="mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="article">Articles</SelectItem>
                  <SelectItem value="website">Websites</SelectItem>
                  <SelectItem value="journal">Journals</SelectItem>
                  <SelectItem value="book">Books</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="author">Author</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />}
              </Button>
            </div>

            {/* Export Controls */}
            <div className="flex gap-2">
              <Select value={exportFormat} onValueChange={(value: CitationStyle) => setExportFormat(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apa">APA</SelectItem>
                  <SelectItem value="mla">MLA</SelectItem>
                  <SelectItem value="chicago">Chicago</SelectItem>
                  <SelectItem value="harvard">Harvard</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={copyAllCitations}>
                <Copy size={14} className="mr-1" />
                Copy All
              </Button>

              <Button size="sm" onClick={exportBibliography}>
                <Download size={14} className="mr-1" />
                Export
              </Button>
            </div>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredAndSortedCitations.length} of {citations.length} citations
          </div>
        </CardContent>
      </Card>

      {/* Citations List */}
      <div className="space-y-4">
        {filteredAndSortedCitations.map((citation) => (
          <Card key={citation.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(citation.type)}
                    <h3 className="font-medium leading-tight">{citation.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      {citation.type}
                    </Badge>
                    {getConfidenceBadge(citation.confidence)}
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    {citation.authors.length > 0 && (
                      <p>Authors: {citation.authors.join(', ')}</p>
                    )}
                    <p>
                      Source: <em>{citation.source}</em>
                      {citation.year && ` (${citation.year})`}
                    </p>
                    {citation.url && (
                      <p className="text-xs font-mono break-all">URL: {citation.url}</p>
                    )}
                  </div>
                  
                  {/* Formatted Citation Preview */}
                  <div className="mt-3 p-3 bg-muted rounded text-sm font-mono leading-relaxed">
                    {formatCitationForExport(citation, exportFormat)}
                  </div>
                  
                  {/* In-text Citation Preview */}
                  <div className="mt-2 p-2 bg-accent/10 rounded text-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-muted-foreground font-medium">In-text citation:</span>
                        <p className="font-mono text-accent-foreground mt-1">{formatInTextCitation(citation, exportFormat)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyInTextCitation(citation)}
                        className="shrink-0"
                      >
                        <Quotes size={12} className="mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(citation)}>
                        <Edit size={14} className="mr-1" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Edit Citation</DialogTitle>
                        <DialogDescription>
                          Update the citation details below
                        </DialogDescription>
                      </DialogHeader>
                      
                      {editingCitation && (
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                              id="edit-title"
                              value={editingCitation.title}
                              onChange={(e) => setEditingCitation(prev => 
                                prev ? { ...prev, title: e.target.value } : null
                              )}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="edit-authors">Authors (comma-separated)</Label>
                            <Input
                              id="edit-authors"
                              value={editingCitation.authors.join(', ')}
                              onChange={(e) => setEditingCitation(prev => 
                                prev ? { 
                                  ...prev, 
                                  authors: e.target.value.split(',').map(a => a.trim()).filter(Boolean)
                                } : null
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-year">Year</Label>
                              <Input
                                id="edit-year"
                                value={editingCitation.year}
                                onChange={(e) => setEditingCitation(prev => 
                                  prev ? { ...prev, year: e.target.value } : null
                                )}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="edit-source">Source</Label>
                              <Input
                                id="edit-source"
                                value={editingCitation.source}
                                onChange={(e) => setEditingCitation(prev => 
                                  prev ? { ...prev, source: e.target.value } : null
                                )}
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-volume">Volume</Label>
                              <Input
                                id="edit-volume"
                                value={editingCitation.volume || ''}
                                onChange={(e) => setEditingCitation(prev => 
                                  prev ? { ...prev, volume: e.target.value } : null
                                )}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="edit-issue">Issue</Label>
                              <Input
                                id="edit-issue"
                                value={editingCitation.issue || ''}
                                onChange={(e) => setEditingCitation(prev => 
                                  prev ? { ...prev, issue: e.target.value } : null
                                )}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="edit-pages">Pages</Label>
                              <Input
                                id="edit-pages"
                                value={editingCitation.pages || ''}
                                onChange={(e) => setEditingCitation(prev => 
                                  prev ? { ...prev, pages: e.target.value } : null
                                )}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="edit-url">URL</Label>
                            <Input
                              id="edit-url"
                              value={editingCitation.url || ''}
                              onChange={(e) => setEditingCitation(prev => 
                                prev ? { ...prev, url: e.target.value } : null
                              )}
                            />
                          </div>
                        </div>
                      )}
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingCitation(null)}>
                          Cancel
                        </Button>
                        <Button onClick={saveEdit}>
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyFullCitation(citation)}
                  >
                    <Copy size={14} className="mr-1" />
                    Copy
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(citation)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}