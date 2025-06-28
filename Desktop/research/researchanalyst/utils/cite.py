import re
import json
from datetime import datetime
from typing import List, Dict, Optional

class CitationManager:
    """Manages citations, source snippets, and inline references for deliverables."""
    
    def __init__(self):
        self.citation_style = "apa"  # Default to APA style
        self.footnote_counter = 1
        self.citations = {}
    
    def generate_citation(self, source: Dict, citation_type: str = "inline") -> str:
        """Generate a citation for a source based on the specified style."""
        if citation_type == "inline":
            return self._generate_inline_citation(source)
        elif citation_type == "footnote":
            return self._generate_footnote_citation(source)
        elif citation_type == "reference":
            return self._generate_reference_citation(source)
        else:
            return self._generate_inline_citation(source)
    
    def _generate_inline_citation(self, source: Dict) -> str:
        """Generate an inline citation (e.g., 'According to Smith (2024)...')."""
        title = source.get('title', 'Unknown Source')
        author = source.get('author', 'Unknown Author')
        date = source.get('freshness', datetime.now().isoformat())
        
        # Extract year from date
        try:
            year = datetime.fromisoformat(date.replace('Z', '+00:00')).year
        except:
            year = datetime.now().year
        
        # Create short title for inline citation
        short_title = title.split(' - ')[0] if ' - ' in title else title[:50]
        
        return f"({short_title}, {year})"
    
    def _generate_footnote_citation(self, source: Dict) -> str:
        """Generate a footnote citation."""
        title = source.get('title', 'Unknown Source')
        author = source.get('author', 'Unknown Author')
        url = source.get('url', '')
        date = source.get('freshness', datetime.now().isoformat())
        
        try:
            year = datetime.fromisoformat(date.replace('Z', '+00:00')).year
        except:
            year = datetime.now().year
        
        footnote = f"{self.footnote_counter}. {author} ({year}). {title}"
        if url:
            footnote += f" [Online]. Available: {url}"
        
        self.footnote_counter += 1
        return footnote
    
    def _generate_reference_citation(self, source: Dict) -> str:
        """Generate a reference list citation (APA style)."""
        title = source.get('title', 'Unknown Source')
        author = source.get('author', 'Unknown Author')
        url = source.get('url', '')
        date = source.get('freshness', datetime.now().isoformat())
        
        try:
            year = datetime.fromisoformat(date.replace('Z', '+00:00')).year
        except:
            year = datetime.now().year
        
        reference = f"{author} ({year}). {title}."
        if url:
            reference += f" Retrieved from {url}"
        
        return reference
    
    def extract_snippet(self, source: Dict, keyword: str = None, max_length: int = 200) -> str:
        """Extract a relevant snippet from a source."""
        content = source.get('content', '')
        if not content:
            return "Content not available for this source."
        
        if keyword:
            # Find the sentence containing the keyword
            sentences = re.split(r'[.!?]+', content)
            for sentence in sentences:
                if keyword.lower() in sentence.lower():
                    return sentence.strip() + "."
        
        # Return the first few sentences
        sentences = re.split(r'[.!?]+', content)
        snippet = ""
        for sentence in sentences[:3]:
            if len(snippet + sentence) < max_length:
                snippet += sentence.strip() + ". "
        
        return snippet.strip()
    
    def insert_citation(self, text: str, source: Dict, position: str = "end") -> str:
        """Insert a citation into text at the specified position."""
        citation = self.generate_citation(source, "inline")
        
        if position == "end":
            return f"{text} {citation}"
        elif position == "start":
            return f"{citation} {text}"
        else:
            # Insert at specific position (character index)
            try:
                pos = int(position)
                return text[:pos] + f" {citation} " + text[pos:]
            except:
                return f"{text} {citation}"
    
    def create_source_summary(self, sources: List[Dict]) -> str:
        """Create a summary of all sources used in a deliverable."""
        summary = "## Sources and References\n\n"
        
        for i, source in enumerate(sources, 1):
            title = source.get('title', 'Unknown Source')
            author = source.get('author', 'Unknown Author')
            url = source.get('url', '')
            relevance = source.get('relevance_score', 0)
            
            summary += f"{i}. **{title}**\n"
            summary += f"   - Author: {author}\n"
            if url:
                summary += f"   - URL: {url}\n"
            summary += f"   - Relevance Score: {relevance:.2f}\n\n"
        
        return summary
    
    def validate_citations(self, text: str, sources: List[Dict]) -> Dict:
        """Validate that all citations in text reference valid sources."""
        issues = []
        
        # Check for inline citations
        inline_citations = re.findall(r'\([^)]+\)', text)
        for citation in inline_citations:
            # Simple validation - could be enhanced
            if not any(source.get('title', '').lower() in citation.lower() for source in sources):
                issues.append(f"Unmatched citation: {citation}")
        
        return {
            'valid': len(issues) == 0,
            'issues': issues,
            'citation_count': len(inline_citations)
        }

class SourceSnippetFetcher:
    """Fetches and manages source snippets for inline use in deliverables."""
    
    def __init__(self):
        self.snippets = {}
    
    def get_relevant_snippets(self, source: Dict, keywords: List[str], max_snippets: int = 3) -> List[str]:
        """Get relevant snippets from a source based on keywords."""
        content = source.get('content', '')
        if not content:
            return []
        
        sentences = re.split(r'[.!?]+', content)
        relevant_snippets = []
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
            
            # Check if sentence contains any keywords
            relevance_score = sum(1 for keyword in keywords if keyword.lower() in sentence.lower())
            
            if relevance_score > 0:
                relevant_snippets.append({
                    'text': sentence + ".",
                    'relevance': relevance_score,
                    'source': source.get('title', 'Unknown')
                })
        
        # Sort by relevance and return top snippets
        relevant_snippets.sort(key=lambda x: x['relevance'], reverse=True)
        return [s['text'] for s in relevant_snippets[:max_snippets]]
    
    def create_quote_block(self, snippet: str, source: Dict) -> str:
        """Create a formatted quote block with citation."""
        citation = CitationManager().generate_citation(source, "inline")
        return f'> "{snippet}"\n> \n> — {citation}'
    
    def insert_source_quote(self, text: str, snippet: str, source: Dict) -> str:
        """Insert a source quote into the text."""
        quote_block = self.create_quote_block(snippet, source)
        return f"{text}\n\n{quote_block}\n\n"

# Utility functions for easy access
def generate_citation(source: Dict, style: str = "inline") -> str:
    """Quick function to generate a citation."""
    cm = CitationManager()
    return cm.generate_citation(source, style)

def extract_snippet(source: Dict, keyword: str = None) -> str:
    """Quick function to extract a snippet from a source."""
    cm = CitationManager()
    return cm.extract_snippet(source, keyword)

def insert_citation(text: str, source: Dict) -> str:
    """Quick function to insert a citation into text."""
    cm = CitationManager()
    return cm.insert_citation(text, source) 