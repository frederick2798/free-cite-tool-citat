import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Link, Plus, CheckCircle, AlertCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Citation } from '@/App'

interface ExtractedMetadata {
  title: string
  authors: string[]
  publishDate: string
  siteName: string
  description?: string
  url: string
}

interface UrlCitationFormProps {
  onCitationAdd: (citation: Citation) => void
}

export function UrlCitationForm({ onCitationAdd }: UrlCitationFormProps) {
  const [url, setUrl] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedMetadata | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    year: '',
    source: '',
    url: '',
    dateAccessed: new Date().toISOString().split('T')[0],
    type: 'website' as const
  })

  const simulateMetadataExtraction = async (inputUrl: string): Promise<ExtractedMetadata> => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const domain = new URL(inputUrl).hostname.replace('www.', '')
    
    const mockData: Record<string, ExtractedMetadata> = {
      'nature.com': {
        title: 'Breakthrough in Quantum Computing Research',
        authors: ['Dr. Sarah Johnson', 'Prof. Michael Chen'],
        publishDate: '2024',
        siteName: 'Nature',
        description: 'Scientists achieve new milestone in quantum computing capabilities',
        url: inputUrl
      },
      'scholar.google.com': {
        title: 'Machine Learning Applications in Medical Diagnosis',
        authors: ['Research Team'],
        publishDate: '2023',
        siteName: 'Google Scholar',
        url: inputUrl
      },
      'arxiv.org': {
        title: 'Novel Approaches to Neural Network Architecture',
        authors: ['Smith, J.', 'Williams, A.'],
        publishDate: '2024',
        siteName: 'arXiv',
        url: inputUrl
      },
      'pubmed.ncbi.nlm.nih.gov': {
        title: 'Clinical Trial Results for New Treatment Protocol',
        authors: ['Medical Research Institute'],
        publishDate: '2023',
        siteName: 'PubMed',
        url: inputUrl
      }
    }
    
    const fallbackData: ExtractedMetadata = {
      title: 'Article Title Could Not Be Extracted',
      authors: [],
      publishDate: '2024',
      siteName: domain.charAt(0).toUpperCase() + domain.slice(1),
      url: inputUrl
    }
    
    return mockData[domain] || fallbackData
  }

  const extractMetadata = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL')
      return
    }

    try {
      new URL(url)
    } catch {
      toast.error('Please enter a valid URL')
      return
    }

    setIsExtracting(true)
    
    try {
      const metadata = await simulateMetadataExtraction(url)
      setExtractedData(metadata)
      
      setFormData({
        title: metadata.title,
        authors: metadata.authors.join(', '),
        year: metadata.publishDate,
        source: metadata.siteName,
        url: metadata.url,
        dateAccessed: new Date().toISOString().split('T')[0],
        type: 'website'
      })
      
      toast.success('Metadata extracted successfully!')
    } catch (error) {
      toast.error('Failed to extract metadata. Please fill in manually.')
      setFormData(prev => ({ ...prev, url }))
    } finally {
      setIsExtracting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setUrl('')
    setExtractedData(null)
    setFormData({
      title: '',
      authors: '',
      year: '',
      source: '',
      url: '',
      dateAccessed: new Date().toISOString().split('T')[0],
      type: 'website'
    })
  }

  const addCitation = () => {
    if (!formData.title.trim() || !formData.source.trim()) {
      toast.error('Please fill in at least the title and source')
      return
    }

    const citation: Citation = {
      id: `citation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: formData.title,
      authors: formData.authors ? formData.authors.split(',').map(a => a.trim()) : [],
      year: formData.year,
      source: formData.source,
      url: formData.url,
      type: formData.type,
      dateAccessed: formData.dateAccessed
    }
    
    onCitationAdd(citation)
    toast.success('Citation added to your bibliography!')
    resetForm()
  }

  const isFormValid = formData.title.trim() && formData.source.trim()

  return (
    <div className="space-y-6">
      {/* URL Input Section */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Paste URL here (e.g., https://nature.com/articles/example)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && extractMetadata()}
              disabled={isExtracting}
              className="text-base"
            />
          </div>
          <Button 
            onClick={extractMetadata}
            disabled={isExtracting || !url.trim()}
            className="min-w-[140px]"
          >
            {isExtracting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <Link size={16} className="mr-2" />
                Extract Data
              </>
            )}
          </Button>
        </div>

        {/* Extraction Status */}
        {extractedData && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle size={16} className="text-secondary" />
            <span className="text-muted-foreground">
              Metadata extracted from {extractedData.siteName}
            </span>
          </div>
        )}
      </div>

      {/* Citation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Citation Details</CardTitle>
          <CardDescription>
            {extractedData ? 'Review and edit the extracted information' : 'Fill in the citation information manually'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Article or page title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </div>

          {/* Authors */}
          <div className="space-y-2">
            <Label htmlFor="authors">Authors</Label>
            <Input
              id="authors"
              placeholder="Separate multiple authors with commas"
              value={formData.authors}
              onChange={(e) => handleInputChange('authors', e.target.value)}
            />
          </div>

          {/* Year and Source Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                placeholder="2024"
                value={formData.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source/Website *</Label>
              <Input
                id="source"
                placeholder="Website name or publication"
                value={formData.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
              />
            </div>
          </div>

          {/* URL and Date Accessed Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="citation-url">URL</Label>
              <Input
                id="citation-url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateAccessed">Date Accessed</Label>
              <Input
                id="dateAccessed"
                type="date"
                value={formData.dateAccessed}
                onChange={(e) => handleInputChange('dateAccessed', e.target.value)}
              />
            </div>
          </div>

          {/* Source Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Source Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: 'website' | 'article' | 'book' | 'journal') => 
                handleInputChange('type', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="article">Online Article</SelectItem>
                <SelectItem value="journal">Online Journal</SelectItem>
                <SelectItem value="book">Online Book</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={addCitation}
              disabled={!isFormValid}
              className="flex-1"
            >
              <Plus size={16} className="mr-2" />
              Add to Bibliography
            </Button>
            <Button 
              variant="outline" 
              onClick={resetForm}
              disabled={!formData.title && !formData.source && !url}
            >
              Clear Form
            </Button>
          </div>

          {/* Form Validation Warning */}
          {!isFormValid && (formData.title || formData.source) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle size={16} />
              <span>Title and source are required to create a citation</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}