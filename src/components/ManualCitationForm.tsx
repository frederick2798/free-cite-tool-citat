import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Globe, FileText, Newspaper, Book, Plus, Save } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Citation } from '@/App'

interface ManualCitationFormProps {
  onCitationAdd: (citation: Citation) => void
}

type SourceType = 'article' | 'book' | 'website' | 'journal' | 'newspaper' | 'thesis' | 'conference' | 'report'

interface FormData {
  type: SourceType
  title: string
  authors: string
  year: string
  source: string
  url: string
  doi: string
  pages: string
  volume: string
  issue: string
  publisher: string
  edition: string
  city: string
  isbn: string
  dateAccessed: string
  abstract: string
}

const sourceTypeInfo: Record<SourceType, {
  name: string
  icon: React.ReactNode
  description: string
  requiredFields: string[]
  optionalFields: string[]
}> = {
  article: {
    name: 'Journal Article',
    icon: <FileText size={20} />,
    description: 'Peer-reviewed journal articles and academic papers',
    requiredFields: ['title', 'authors', 'year', 'source'],
    optionalFields: ['volume', 'issue', 'pages', 'doi', 'url']
  },
  book: {
    name: 'Book',
    icon: <Book size={20} />,
    description: 'Published books, textbooks, and monographs',
    requiredFields: ['title', 'authors', 'year', 'publisher'],
    optionalFields: ['edition', 'city', 'isbn', 'pages']
  },
  website: {
    name: 'Website',
    icon: <Globe size={20} />,
    description: 'Web pages, online articles, and digital resources',
    requiredFields: ['title', 'url', 'dateAccessed'],
    optionalFields: ['authors', 'year', 'source']
  },
  journal: {
    name: 'Journal',
    icon: <BookOpen size={20} />,
    description: 'Academic journals and periodical publications',
    requiredFields: ['title', 'authors', 'year', 'source'],
    optionalFields: ['volume', 'issue', 'pages', 'doi']
  },
  newspaper: {
    name: 'Newspaper',
    icon: <Newspaper size={20} />,
    description: 'Newspaper articles and news reports',
    requiredFields: ['title', 'authors', 'year', 'source'],
    optionalFields: ['pages', 'url', 'dateAccessed']
  },
  thesis: {
    name: 'Thesis/Dissertation',
    icon: <FileText size={20} />,
    description: 'Academic theses and dissertations',
    requiredFields: ['title', 'authors', 'year', 'publisher'],
    optionalFields: ['city', 'pages', 'url']
  },
  conference: {
    name: 'Conference Paper',
    icon: <FileText size={20} />,
    description: 'Conference proceedings and presentations',
    requiredFields: ['title', 'authors', 'year', 'source'],
    optionalFields: ['pages', 'city', 'doi', 'url']
  },
  report: {
    name: 'Report',
    icon: <FileText size={20} />,
    description: 'Technical reports and government publications',
    requiredFields: ['title', 'authors', 'year', 'publisher'],
    optionalFields: ['pages', 'city', 'url']
  }
}

export function ManualCitationForm({ onCitationAdd }: ManualCitationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    type: 'article',
    title: '',
    authors: '',
    year: '',
    source: '',
    url: '',
    doi: '',
    pages: '',
    volume: '',
    issue: '',
    publisher: '',
    edition: '',
    city: '',
    isbn: '',
    dateAccessed: '',
    abstract: ''
  })

  const currentSourceInfo = sourceTypeInfo[formData.type]

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const isFieldRequired = (field: string) => {
    return currentSourceInfo.requiredFields.includes(field)
  }

  const isFieldVisible = (field: string) => {
    return currentSourceInfo.requiredFields.includes(field) || 
           currentSourceInfo.optionalFields.includes(field)
  }

  const validateForm = () => {
    const missingFields = currentSourceInfo.requiredFields.filter(field => {
      const value = formData[field as keyof FormData]
      return !value || value.trim() === ''
    })

    if (missingFields.length > 0) {
      toast.error(`Please fill in required fields: ${missingFields.join(', ')}`)
      return false
    }

    return true
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const citation: Citation = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: formData.title,
      authors: formData.authors.split(',').map(a => a.trim()).filter(Boolean),
      year: formData.year,
      source: formData.source || formData.publisher,
      url: formData.url || undefined,
      doi: formData.doi || undefined,
      pages: formData.pages || undefined,
      volume: formData.volume || undefined,
      issue: formData.issue || undefined,
      publisher: formData.publisher || undefined,
      type: formData.type === 'journal' ? 'article' : 
            formData.type === 'newspaper' ? 'article' :
            formData.type === 'conference' ? 'article' :
            formData.type === 'thesis' ? 'article' :
            formData.type === 'report' ? 'article' :
            formData.type,
      dateAccessed: formData.dateAccessed || new Date().toISOString()
    }

    onCitationAdd(citation)
    toast.success('Citation added to your bibliography!')
    
    // Reset form
    setFormData({
      type: 'article',
      title: '',
      authors: '',
      year: '',
      source: '',
      url: '',
      doi: '',
      pages: '',
      volume: '',
      issue: '',
      publisher: '',
      edition: '',
      city: '',
      isbn: '',
      dateAccessed: '',
      abstract: ''
    })
  }

  return (
    <div className="space-y-6">
      {/* Source Type Selection */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen size={20} />
            Select Source Type
          </CardTitle>
          <CardDescription>
            Choose the type of source you want to cite
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(sourceTypeInfo).map(([type, info]) => (
              <Button
                key={type}
                variant={formData.type === type ? "default" : "outline"}
                className={`h-auto p-4 flex flex-col items-center gap-2 text-center ${
                  formData.type === type ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => updateField('type', type as SourceType)}
              >
                <div className="text-primary">{info.icon}</div>
                <div className="text-sm font-medium">{info.name}</div>
              </Button>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {currentSourceInfo.icon}
              <span className="font-medium">{currentSourceInfo.name}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {currentSourceInfo.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {currentSourceInfo.requiredFields.map(field => (
                <Badge key={field} variant="secondary" className="text-xs">
                  {field} (required)
                </Badge>
              ))}
              {currentSourceInfo.optionalFields.map(field => (
                <Badge key={field} variant="outline" className="text-xs">
                  {field} (optional)
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Citation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Citation Details</CardTitle>
          <CardDescription>
            Fill in the details for your {currentSourceInfo.name.toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase text-muted-foreground tracking-wide">
              Basic Information
            </h4>
            
            <div className="grid gap-4">
              {isFieldVisible('title') && (
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center gap-1">
                    Title
                    {isFieldRequired('title') && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="Enter the full title"
                    className={isFieldRequired('title') && !formData.title ? 'border-red-300' : ''}
                  />
                </div>
              )}

              {isFieldVisible('authors') && (
                <div className="space-y-2">
                  <Label htmlFor="authors" className="flex items-center gap-1">
                    Authors
                    {isFieldRequired('authors') && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="authors"
                    value={formData.authors}
                    onChange={(e) => updateField('authors', e.target.value)}
                    placeholder="Enter authors separated by commas"
                    className={isFieldRequired('authors') && !formData.authors ? 'border-red-300' : ''}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isFieldVisible('year') && (
                  <div className="space-y-2">
                    <Label htmlFor="year" className="flex items-center gap-1">
                      Year
                      {isFieldRequired('year') && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id="year"
                      value={formData.year}
                      onChange={(e) => updateField('year', e.target.value)}
                      placeholder="2024"
                      className={isFieldRequired('year') && !formData.year ? 'border-red-300' : ''}
                    />
                  </div>
                )}

                {isFieldVisible('source') && (
                  <div className="space-y-2">
                    <Label htmlFor="source" className="flex items-center gap-1">
                      {formData.type === 'book' ? 'Publisher' : 
                       formData.type === 'website' ? 'Website Name' : 'Journal/Source'}
                      {isFieldRequired('source') && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id="source"
                      value={formData.source}
                      onChange={(e) => updateField('source', e.target.value)}
                      placeholder={
                        formData.type === 'book' ? 'Academic Press' :
                        formData.type === 'website' ? 'Website Name' :
                        'Journal Name'
                      }
                      className={isFieldRequired('source') && !formData.source ? 'border-red-300' : ''}
                    />
                  </div>
                )}

                {isFieldVisible('publisher') && formData.type !== 'book' && (
                  <div className="space-y-2">
                    <Label htmlFor="publisher" className="flex items-center gap-1">
                      Publisher
                      {isFieldRequired('publisher') && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id="publisher"
                      value={formData.publisher}
                      onChange={(e) => updateField('publisher', e.target.value)}
                      placeholder="Publisher name"
                      className={isFieldRequired('publisher') && !formData.publisher ? 'border-red-300' : ''}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Publication Details */}
          {(isFieldVisible('volume') || isFieldVisible('issue') || isFieldVisible('pages') || 
            isFieldVisible('edition') || isFieldVisible('city') || isFieldVisible('isbn')) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase text-muted-foreground tracking-wide">
                  Publication Details
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {isFieldVisible('volume') && (
                    <div className="space-y-2">
                      <Label htmlFor="volume">Volume</Label>
                      <Input
                        id="volume"
                        value={formData.volume}
                        onChange={(e) => updateField('volume', e.target.value)}
                        placeholder="Vol. 15"
                      />
                    </div>
                  )}

                  {isFieldVisible('issue') && (
                    <div className="space-y-2">
                      <Label htmlFor="issue">Issue</Label>
                      <Input
                        id="issue"
                        value={formData.issue}
                        onChange={(e) => updateField('issue', e.target.value)}
                        placeholder="No. 3"
                      />
                    </div>
                  )}

                  {isFieldVisible('pages') && (
                    <div className="space-y-2">
                      <Label htmlFor="pages">Pages</Label>
                      <Input
                        id="pages"
                        value={formData.pages}
                        onChange={(e) => updateField('pages', e.target.value)}
                        placeholder="123-145"
                      />
                    </div>
                  )}

                  {isFieldVisible('edition') && (
                    <div className="space-y-2">
                      <Label htmlFor="edition">Edition</Label>
                      <Input
                        id="edition"
                        value={formData.edition}
                        onChange={(e) => updateField('edition', e.target.value)}
                        placeholder="2nd ed."
                      />
                    </div>
                  )}

                  {isFieldVisible('city') && (
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        placeholder="New York"
                      />
                    </div>
                  )}

                  {isFieldVisible('isbn') && (
                    <div className="space-y-2">
                      <Label htmlFor="isbn">ISBN</Label>
                      <Input
                        id="isbn"
                        value={formData.isbn}
                        onChange={(e) => updateField('isbn', e.target.value)}
                        placeholder="978-0-123456-78-9"
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Digital/Web Details */}
          {(isFieldVisible('url') || isFieldVisible('doi') || isFieldVisible('dateAccessed')) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase text-muted-foreground tracking-wide">
                  Digital Access
                </h4>
                
                <div className="grid gap-4">
                  {isFieldVisible('url') && (
                    <div className="space-y-2">
                      <Label htmlFor="url" className="flex items-center gap-1">
                        URL
                        {isFieldRequired('url') && <span className="text-red-500">*</span>}
                      </Label>
                      <Input
                        id="url"
                        value={formData.url}
                        onChange={(e) => updateField('url', e.target.value)}
                        placeholder="https://example.com/article"
                        className={isFieldRequired('url') && !formData.url ? 'border-red-300' : ''}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isFieldVisible('doi') && (
                      <div className="space-y-2">
                        <Label htmlFor="doi">DOI</Label>
                        <Input
                          id="doi"
                          value={formData.doi}
                          onChange={(e) => updateField('doi', e.target.value)}
                          placeholder="10.1000/journal.2024.12345"
                        />
                      </div>
                    )}

                    {isFieldVisible('dateAccessed') && (
                      <div className="space-y-2">
                        <Label htmlFor="dateAccessed" className="flex items-center gap-1">
                          Date Accessed
                          {isFieldRequired('dateAccessed') && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                          id="dateAccessed"
                          type="date"
                          value={formData.dateAccessed}
                          onChange={(e) => updateField('dateAccessed', e.target.value)}
                          className={isFieldRequired('dateAccessed') && !formData.dateAccessed ? 'border-red-300' : ''}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Abstract (optional for all types) */}
          <Separator />
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase text-muted-foreground tracking-wide">
              Additional Information
            </h4>
            <div className="space-y-2">
              <Label htmlFor="abstract">Abstract/Summary (optional)</Label>
              <Textarea
                id="abstract"
                value={formData.abstract}
                onChange={(e) => updateField('abstract', e.target.value)}
                placeholder="Brief summary or abstract of the source..."
                rows={3}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSubmit} className="min-w-[160px]">
              <Plus size={16} className="mr-2" />
              Add Citation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}