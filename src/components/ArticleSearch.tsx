import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, BookOpen, Plus } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Citation } from '@/App'

interface SearchResult {
  id: string
  title: string
  authors: string[]
  year: string
  journal: string
  doi?: string
  abstract?: string
  confidence: number
  url?: string
}

interface ArticleSearchProps {
  onCitationAdd: (citation: Citation) => void
}

export function ArticleSearch({ onCitationAdd }: ArticleSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const simulateSearch = async (query: string): Promise<SearchResult[]> => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const mockResults: SearchResult[] = [
      {
        id: '1',
        title: query.includes('machine learning') ? 'Machine Learning in Healthcare: A Comprehensive Review' : 
              query.includes('climate') ? 'Climate Change Impacts on Biodiversity' :
              query.includes('covid') ? 'COVID-19 Pandemic Response Strategies' :
              `${query}: A Research Study`,
        authors: ['Smith, J.', 'Johnson, M.', 'Williams, R.'],
        year: '2023',
        journal: 'Nature Medicine',
        doi: '10.1038/s41591-023-01234-5',
        confidence: 0.95,
        url: 'https://nature.com/articles/example',
        abstract: 'This comprehensive study examines the applications and implications...'
      },
      {
        id: '2',
        title: query.includes('machine learning') ? 'Applications of AI in Modern Healthcare Systems' :
              query.includes('climate') ? 'Environmental Changes and Species Adaptation' :
              query.includes('covid') ? 'Global Health Emergency Response Protocols' :
              `Understanding ${query}: Methodological Approaches`,
        authors: ['Brown, A.', 'Davis, K.'],
        year: '2022',
        journal: 'Journal of Medical Research',
        doi: '10.1016/j.jmr.2022.05.123',
        confidence: 0.78,
        url: 'https://sciencedirect.com/article/example'
      },
      {
        id: '3',
        title: query.includes('machine learning') ? 'Deep Learning Techniques for Medical Diagnosis' :
              query.includes('climate') ? 'Ecosystem Resilience in Changing Climates' :
              query.includes('covid') ? 'Vaccine Development and Distribution Challenges' :
              `${query}: Current Trends and Future Directions`,
        authors: ['Wilson, T.'],
        year: '2024',
        journal: 'Proceedings of ACM',
        confidence: 0.52,
        url: 'https://acm.org/proceedings/example'
      }
    ]
    
    return mockResults
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter an article title to search')
      return
    }

    setIsSearching(true)
    setHasSearched(true)
    
    try {
      const searchResults = await simulateSearch(searchQuery)
      setResults(searchResults)
      
      if (searchResults.length === 0) {
        toast.info('No articles found. Try a different search term.')
      } else {
        toast.success(`Found ${searchResults.length} potential matches`)
      }
    } catch (error) {
      toast.error('Search failed. Please try again.')
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return <Badge className="bg-secondary text-secondary-foreground">High Confidence</Badge>
    } else if (confidence >= 0.6) {
      return <Badge variant="outline" className="border-yellow-400 text-yellow-700">Medium Confidence</Badge>
    } else {
      return <Badge variant="outline" className="border-red-400 text-red-700">Low Confidence</Badge>
    }
  }

  const getConfidenceBar = (confidence: number) => {
    const percentage = confidence * 100
    const color = confidence >= 0.8 ? 'bg-secondary' : 
                  confidence >= 0.6 ? 'bg-yellow-400' : 'bg-red-400'
    
    return (
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  }

  const addCitation = (result: SearchResult) => {
    const citation: Citation = {
      id: `citation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: result.title,
      authors: result.authors,
      year: result.year,
      source: result.journal,
      url: result.url,
      doi: result.doi,
      type: 'article',
      confidence: result.confidence
    }
    
    onCitationAdd(citation)
    toast.success('Citation added to your bibliography!')
  }

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Enter article title (e.g., 'machine learning in healthcare')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            disabled={isSearching}
            className="text-base"
          />
        </div>
        <Button 
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          className="min-w-[120px]"
        >
          {isSearching ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search size={16} className="mr-2" />
              Search
            </>
          )}
        </Button>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-4">
          {isSearching ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <Loader2 size={32} className="mx-auto animate-spin text-primary" />
                  <p className="text-muted-foreground">Searching academic databases...</p>
                  <p className="text-sm text-muted-foreground">This may take a few seconds</p>
                </div>
              </CardContent>
            </Card>
          ) : results.length > 0 ? (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen size={16} />
                Found {results.length} potential matches for "{searchQuery}"
              </div>
              
              {results.map((result) => (
                <Card key={result.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg leading-tight">{result.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {result.authors.join(', ')} ({result.year})
                        </CardDescription>
                        <p className="text-sm text-muted-foreground mt-1">
                          <em>{result.journal}</em>
                          {result.doi && (
                            <>
                              {' • '}
                              <span className="font-mono text-xs">DOI: {result.doi}</span>
                            </>
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {getConfidenceBadge(result.confidence)}
                        <Button 
                          size="sm" 
                          onClick={() => addCitation(result)}
                          className="w-full"
                        >
                          <Plus size={14} className="mr-1" />
                          Add Citation
                        </Button>
                      </div>
                    </div>
                    
                    {/* Confidence Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Match Confidence</span>
                        <span className="font-medium">{Math.round(result.confidence * 100)}%</span>
                      </div>
                      {getConfidenceBar(result.confidence)}
                    </div>
                  </CardHeader>
                  
                  {result.abstract && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {result.abstract}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <Search size={32} className="mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">No articles found</p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search terms or check spelling
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}