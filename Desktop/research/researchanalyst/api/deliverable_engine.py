import json
import os
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import re
from urllib.parse import urlparse
import feedparser
from bs4 import BeautifulSoup
import yaml

class DeliverableEngine:
    """Comprehensive deliverable creation engine with multi-source integration."""
    
    def __init__(self):
        self.load_configurations()
        self.setup_external_apis()
    
    def load_configurations(self):
        """Load all configuration files for the deliverable engine."""
        # Load format detection rules
        try:
            with open('data/format_rules.json', 'r') as f:
                self.format_rules = json.load(f)
        except FileNotFoundError:
            self.format_rules = self._create_default_format_rules()
        
        # Load prompt profiles
        try:
            with open('data/prompt_profiles.json', 'r') as f:
                self.prompt_profiles = json.load(f)
        except FileNotFoundError:
            self.prompt_profiles = self._create_default_prompt_profiles()
        
        # Load source configurations
        try:
            with open('data/source_config.json', 'r') as f:
                self.source_config = json.load(f)
        except FileNotFoundError:
            self.source_config = self._create_default_source_config()
    
    def setup_external_apis(self):
        """Setup external API connections and configurations."""
        self.api_keys = {
            'news_api': os.getenv('NEWS_API_KEY', ''),
            'bloomberg': os.getenv('BLOOMBERG_API_KEY', ''),
            'pitchbook': os.getenv('PITCHBOOK_API_KEY', ''),
            'openai': os.getenv('OPENAI_API_KEY', '')
        }
        
        # RSS feeds for news aggregation
        self.rss_feeds = [
            'https://feeds.bbci.co.uk/news/business/rss.xml',
            'https://www.ft.com/rss/home',
            'https://feeds.reuters.com/reuters/businessNews',
            'https://www.economist.com/finance-and-economics/rss.xml'
        ]
    
    def _create_default_format_rules(self) -> Dict:
        """Create default format detection rules."""
        return {
            "format_detection": {
                "executive_brief": {
                    "triggers": ["executive", "brief", "summary", "overview", "dashboard"],
                    "stakeholder_levels": ["executive", "vp", "director", "c-suite"],
                    "urgency_levels": ["high", "critical"],
                    "task_categories": ["strategy", "overview", "summary"],
                    "estimated_length": "2-3 pages",
                    "output_formats": ["pdf", "docx"]
                },
                "market_analysis": {
                    "triggers": ["market", "analysis", "research", "trends", "competitive", "industry"],
                    "stakeholder_levels": ["strategy", "marketing", "product", "business"],
                    "urgency_levels": ["medium", "high"],
                    "task_categories": ["research", "analysis", "market"],
                    "estimated_length": "10-15 pages",
                    "output_formats": ["pdf", "docx", "pptx"]
                },
                "policy_memo": {
                    "triggers": ["policy", "regulatory", "compliance", "legal", "government"],
                    "stakeholder_levels": ["legal", "compliance", "regulatory", "government"],
                    "urgency_levels": ["high", "critical"],
                    "task_categories": ["policy", "regulatory", "compliance"],
                    "estimated_length": "3-5 pages",
                    "output_formats": ["pdf", "docx"]
                },
                "regulatory_roadmap": {
                    "triggers": ["regulatory", "compliance", "roadmap", "timeline", "deadline"],
                    "stakeholder_levels": ["compliance", "legal", "regulatory"],
                    "urgency_levels": ["medium", "high"],
                    "task_categories": ["compliance", "regulatory"],
                    "estimated_length": "5-8 pages",
                    "output_formats": ["pdf", "docx", "pptx"]
                },
                "strategy_deck": {
                    "triggers": ["strategy", "presentation", "deck", "pitch", "proposal"],
                    "stakeholder_levels": ["executive", "strategy", "business"],
                    "urgency_levels": ["medium", "high"],
                    "task_categories": ["strategy", "presentation"],
                    "estimated_length": "15-20 slides",
                    "output_formats": ["pptx", "pdf"]
                }
            }
        }
    
    def _create_default_prompt_profiles(self) -> Dict:
        """Create default prompt profiles for different deliverable formats."""
        return {
            "prompt_profiles": {
                "executive_brief": {
                    "name": "Executive Brief",
                    "description": "Concise summary for executive stakeholders",
                    "prompt_chain": [
                        {
                            "step": "context_analysis",
                            "prompt": "Analyze the task context and stakeholder requirements to understand the key information needs."
                        },
                        {
                            "step": "source_synthesis",
                            "prompt": "Synthesize key insights from all available sources, prioritizing the most relevant and recent information."
                        },
                        {
                            "step": "executive_summary",
                            "prompt": "Create a concise executive summary that highlights the most critical findings and implications."
                        },
                        {
                            "step": "key_findings",
                            "prompt": "Extract and present the 3-5 most important findings with clear business impact."
                        },
                        {
                            "step": "recommendations",
                            "prompt": "Provide 2-3 actionable recommendations with clear ownership and timelines."
                        }
                    ],
                    "tone": "professional, concise, actionable",
                    "target_audience": "executive leadership"
                },
                "market_analysis": {
                    "name": "Market Analysis Report",
                    "description": "Comprehensive market research and analysis",
                    "prompt_chain": [
                        {
                            "step": "market_overview",
                            "prompt": "Provide a comprehensive overview of the target market, including size, growth, and key dynamics."
                        },
                        {
                            "step": "competitive_landscape",
                            "prompt": "Analyze the competitive landscape, identifying key players, market shares, and competitive advantages."
                        },
                        {
                            "step": "trend_analysis",
                            "prompt": "Identify and analyze key market trends, drivers, and emerging opportunities."
                        },
                        {
                            "step": "data_analysis",
                            "prompt": "Present quantitative analysis with relevant metrics, growth rates, and market data."
                        },
                        {
                            "step": "strategic_insights",
                            "prompt": "Generate strategic insights and implications for business decision-making."
                        },
                        {
                            "step": "recommendations",
                            "prompt": "Provide detailed strategic recommendations with implementation considerations."
                        }
                    ],
                    "tone": "analytical, data-driven, strategic",
                    "target_audience": "strategy and business teams"
                },
                "policy_memo": {
                    "name": "Policy Memo",
                    "description": "Policy analysis and recommendations",
                    "prompt_chain": [
                        {
                            "step": "policy_context",
                            "prompt": "Analyze the policy context and regulatory environment relevant to the issue."
                        },
                        {
                            "step": "stakeholder_analysis",
                            "prompt": "Identify key stakeholders and their positions on the policy issue."
                        },
                        {
                            "step": "impact_analysis",
                            "prompt": "Assess the potential impact of policy changes on business operations and stakeholders."
                        },
                        {
                            "step": "risk_assessment",
                            "prompt": "Evaluate risks and opportunities associated with different policy options."
                        },
                        {
                            "step": "recommendations",
                            "prompt": "Provide policy recommendations with clear rationale and implementation strategy."
                        }
                    ],
                    "tone": "objective, analytical, policy-focused",
                    "target_audience": "legal and compliance teams"
                }
            }
        }
    
    def _create_default_source_config(self) -> Dict:
        """Create default source configuration for external integrations."""
        return {
            "external_sources": {
                "news_apis": {
                    "news_api": {
                        "enabled": True,
                        "base_url": "https://newsapi.org/v2",
                        "endpoints": {
                            "search": "/everything",
                            "headlines": "/top-headlines"
                        }
                    }
                },
                "financial_apis": {
                    "alpha_vantage": {
                        "enabled": True,
                        "base_url": "https://www.alphavantage.co/query"
                    },
                    "yahoo_finance": {
                        "enabled": True,
                        "base_url": "https://query1.finance.yahoo.com/v8/finance"
                    }
                },
                "rss_feeds": [
                    "https://feeds.bbci.co.uk/news/business/rss.xml",
                    "https://www.ft.com/rss/home",
                    "https://feeds.reuters.com/reuters/businessNews"
                ],
                "web_scraping": {
                    "enabled": True,
                    "user_agent": "ResearchAnalyst/1.0",
                    "timeout": 10
                }
            },
            "internal_sources": {
                "slack": {
                    "enabled": False,
                    "channels": ["strategy", "research", "compliance"]
                },
                "sharepoint": {
                    "enabled": False,
                    "sites": ["research", "strategy", "compliance"]
                },
                "notion": {
                    "enabled": False,
                    "databases": ["research_notes", "strategy_docs"]
                }
            }
        }
    
    def detect_format(self, task: Dict, manual_override: str = None) -> Dict:
        """Intelligent format detection based on task characteristics."""
        if manual_override:
            return {
                'format': manual_override,
                'confidence': 1.0,
                'reasoning': 'Manually overridden by user'
            }
        
        task_text = f"{task.get('title', '')} {task.get('description', '')}".lower()
        stakeholders = task.get('stakeholders', [])
        category = task.get('category', '').lower()
        urgency = task.get('urgency', 'medium').lower()
        
        best_match = None
        best_score = 0
        reasoning = []
        
        for format_key, rules in self.format_rules.get('format_detection', {}).items():
            score = 0
            
            # Check triggers in task text
            triggers = rules.get('triggers', [])
            for trigger in triggers:
                if trigger.lower() in task_text:
                    score += 3
                    reasoning.append(f"Trigger '{trigger}' found in task")
            
            # Check stakeholder levels
            stakeholder_levels = rules.get('stakeholder_levels', [])
            for stakeholder in stakeholders:
                if any(level.lower() in stakeholder.lower() for level in stakeholder_levels):
                    score += 2
                    reasoning.append(f"Stakeholder '{stakeholder}' matches level requirements")
            
            # Check urgency
            urgency_levels = rules.get('urgency_levels', [])
            if urgency in urgency_levels:
                score += 1
                reasoning.append(f"Urgency '{urgency}' matches format requirements")
            
            # Check category
            task_categories = rules.get('task_categories', [])
            if category in task_categories:
                score += 2
                reasoning.append(f"Category '{category}' matches format requirements")
            
            if score > best_score:
                best_score = score
                best_match = format_key
        
        confidence = min(best_score / 10.0, 1.0)  # Normalize to 0-1
        
        return {
            'format': best_match or 'executive_brief',
            'confidence': confidence,
            'reasoning': reasoning,
            'estimated_length': self.format_rules.get('format_detection', {}).get(best_match, {}).get('estimated_length', 'Unknown'),
            'output_formats': self.format_rules.get('format_detection', {}).get(best_match, {}).get('output_formats', ['pdf'])
        }
    
    def aggregate_sources(self, task: Dict, existing_sources: List[Dict] = None) -> List[Dict]:
        """Aggregate sources from multiple platforms and APIs."""
        aggregated_sources = existing_sources or []
        
        # Get external news and data
        external_sources = self._fetch_external_sources(task)
        aggregated_sources.extend(external_sources)
        
        # Get RSS feed content
        rss_sources = self._fetch_rss_sources(task)
        aggregated_sources.extend(rss_sources)
        
        # Get web scraping results
        web_sources = self._scrape_web_sources(task)
        aggregated_sources.extend(web_sources)
        
        # Get internal sources
        internal_sources = self._fetch_internal_sources(task)
        aggregated_sources.extend(internal_sources)
        
        # Rank and filter sources by relevance
        ranked_sources = self._rank_sources_by_relevance(task, aggregated_sources)
        
        return ranked_sources[:20]  # Limit to top 20 most relevant sources
    
    def _fetch_external_sources(self, task: Dict) -> List[Dict]:
        """Fetch sources from external APIs."""
        sources = []
        
        # News API
        if self.api_keys.get('news_api'):
            try:
                query = self._extract_search_terms(task)
                url = f"{self.source_config['external_sources']['news_apis']['news_api']['base_url']}/everything"
                params = {
                    'q': query,
                    'apiKey': self.api_keys['news_api'],
                    'language': 'en',
                    'sortBy': 'relevancy',
                    'pageSize': 10
                }
                
                response = requests.get(url, params=params, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    for article in data.get('articles', []):
                        sources.append({
                            'id': f"news-{len(sources)}",
                            'title': article.get('title', ''),
                            'description': article.get('description', ''),
                            'url': article.get('url', ''),
                            'source': article.get('source', {}).get('name', ''),
                            'published_at': article.get('publishedAt', ''),
                            'type': 'news_article',
                            'media_type': 'article',
                            'relevance_score': 0.0,  # Will be calculated later
                            'tags': [],
                            'access_status': 'Available'
                        })
            except Exception as e:
                print(f"Error fetching news: {e}")
        
        return sources
    
    def _fetch_rss_sources(self, task: Dict) -> List[Dict]:
        """Fetch sources from RSS feeds."""
        sources = []
        query_terms = self._extract_search_terms(task)
        
        for feed_url in self.source_config['external_sources']['rss_feeds']:
            try:
                feed = feedparser.parse(feed_url)
                for entry in feed.entries[:5]:  # Limit to 5 entries per feed
                    # Check if entry is relevant to task
                    entry_text = f"{entry.get('title', '')} {entry.get('summary', '')}".lower()
                    relevance = sum(1 for term in query_terms if term.lower() in entry_text)
                    
                    if relevance > 0:
                        sources.append({
                            'id': f"rss-{len(sources)}",
                            'title': entry.get('title', ''),
                            'description': entry.get('summary', ''),
                            'url': entry.get('link', ''),
                            'source': feed.feed.get('title', 'RSS Feed'),
                            'published_at': entry.get('published', ''),
                            'type': 'rss_feed',
                            'media_type': 'article',
                            'relevance_score': relevance / len(query_terms),
                            'tags': [],
                            'access_status': 'Available'
                        })
            except Exception as e:
                print(f"Error fetching RSS feed {feed_url}: {e}")
        
        return sources
    
    def _scrape_web_sources(self, task: Dict) -> List[Dict]:
        """Scrape web sources for additional content."""
        sources = []
        query_terms = self._extract_search_terms(task)
        
        # This is a simplified web scraping implementation
        # In production, you'd want to use proper web scraping libraries
        # and respect robots.txt and rate limiting
        
        return sources
    
    def _fetch_internal_sources(self, task: Dict) -> List[Dict]:
        """Fetch sources from internal platforms (mock implementation)."""
        sources = []
        
        # Mock Slack messages
        slack_sources = [
            {
                'id': f"slack-{len(sources)}",
                'title': 'Internal Strategy Discussion - BNPL Trends',
                'description': 'VP Strategy mentioned in Slack: "Gen Z prefers BNPL over credit cards due to convenience and cashback offers. Need to analyze this trend for Q3 strategy."',
                'url': 'https://company.slack.com/archives/strategy',
                'source': 'Slack - Strategy Channel',
                'published_at': datetime.now().isoformat(),
                'type': 'slack_message',
                'media_type': 'chat',
                'relevance_score': 0.9,
                'tags': ['internal', 'strategy', 'gen-z'],
                'access_status': 'Available'
            },
            {
                'id': f"slack-{len(sources)}",
                'title': 'Analyst Note on BNPL Market',
                'description': 'Research analyst shared: "BNPL delinquency rates increasing in Q2. Regulatory scrutiny expected to intensify."',
                'url': 'https://company.slack.com/archives/research',
                'source': 'Slack - Research Channel',
                'published_at': datetime.now().isoformat(),
                'type': 'slack_message',
                'media_type': 'chat',
                'relevance_score': 0.8,
                'tags': ['internal', 'research', 'regulatory'],
                'access_status': 'Available'
            }
        ]
        sources.extend(slack_sources)
        
        # Mock SharePoint documents
        sharepoint_sources = [
            {
                'id': f"sharepoint-{len(sources)}",
                'title': 'Visa LATAM Digital Wallet Overview',
                'description': 'Internal deck v2: Analysis of digital wallet adoption in Latin America, including BNPL integration opportunities.',
                'url': 'https://company.sharepoint.com/documents/latam-wallet-overview-v2',
                'source': 'SharePoint - Strategy Documents',
                'published_at': datetime.now().isoformat(),
                'type': 'sharepoint_document',
                'media_type': 'presentation',
                'relevance_score': 0.7,
                'tags': ['internal', 'latam', 'digital-wallets'],
                'access_status': 'Available'
            }
        ]
        sources.extend(sharepoint_sources)
        
        return sources
    
    def _extract_search_terms(self, task: Dict) -> List[str]:
        """Extract relevant search terms from task."""
        text = f"{task.get('title', '')} {task.get('description', '')}"
        
        # Extract key terms (simplified - in production, use NLP)
        words = re.findall(r'\b\w+\b', text.lower())
        # Filter out common words and keep meaningful terms
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
        key_terms = [word for word in words if word not in stop_words and len(word) > 3]
        
        return key_terms[:5]  # Return top 5 terms
    
    def _rank_sources_by_relevance(self, task: Dict, sources: List[Dict]) -> List[Dict]:
        """Rank sources by relevance to the task."""
        task_text = f"{task.get('title', '')} {task.get('description', '')}".lower()
        
        for source in sources:
            source_text = f"{source.get('title', '')} {source.get('description', '')}".lower()
            
            # Calculate relevance score based on text similarity
            relevance_score = self._calculate_text_similarity(task_text, source_text)
            
            # Boost score for recent sources
            if source.get('published_at'):
                try:
                    pub_date = datetime.fromisoformat(source['published_at'].replace('Z', '+00:00'))
                    days_old = (datetime.now() - pub_date).days
                    if days_old <= 7:
                        relevance_score *= 1.2  # 20% boost for recent sources
                    elif days_old <= 30:
                        relevance_score *= 1.1  # 10% boost for recent sources
                except:
                    pass
            
            source['relevance_score'] = min(relevance_score, 1.0)
        
        # Sort by relevance score
        return sorted(sources, key=lambda x: x.get('relevance_score', 0), reverse=True)
    
    def _calculate_text_similarity(self, text1: str, text2: str) -> float:
        """Calculate simple text similarity score."""
        words1 = set(text1.split())
        words2 = set(text2.split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union)
    
    def generate_deliverable(self, task: Dict, sources: List[Dict], format_type: str = None) -> Dict:
        """Generate a comprehensive deliverable using the detected format and aggregated sources."""
        # Detect format if not provided
        if not format_type:
            format_detection = self.detect_format(task)
            format_type = format_detection['format']
        
        # Get prompt profile for the format
        prompt_profile = self.prompt_profiles.get('prompt_profiles', {}).get(format_type, {})
        
        # Generate content using the prompt chain
        content = self._execute_prompt_chain(task, sources, prompt_profile)
        
        # Create deliverable structure
        deliverable = {
            'id': f"deliverable-{task.get('id', 'unknown')}",
            'task_id': task.get('id'),
            'title': f"{prompt_profile.get('name', 'Deliverable')}: {task.get('title')}",
            'format_type': format_type,
            'status': 'Draft',
            'content': content,
            'created_at': datetime.now().isoformat(),
            'last_updated': datetime.now().isoformat(),
            'sources_used': [s.get('id') for s in sources[:10]],  # Top 10 sources
            'estimated_length': prompt_profile.get('estimated_length', 'Unknown'),
            'output_formats': self.format_rules.get('format_detection', {}).get(format_type, {}).get('output_formats', ['pdf']),
            'metadata': {
                'format_detection': self.detect_format(task),
                'source_count': len(sources),
                'generation_method': 'ai_enhanced',
                'tone': prompt_profile.get('tone', 'professional'),
                'target_audience': prompt_profile.get('target_audience', 'general')
            }
        }
        
        return deliverable
    
    def _execute_prompt_chain(self, task: Dict, sources: List[Dict], prompt_profile: Dict) -> Dict:
        """Execute the prompt chain for content generation."""
        prompt_chain = prompt_profile.get('prompt_chain', [])
        content = {}
        
        for step in prompt_chain:
            step_name = step.get('step')
            prompt = step.get('prompt')
            
            # Generate content for each step
            if step_name == 'context_analysis':
                content['context_analysis'] = self._generate_context_analysis(task, sources, prompt)
            elif step_name == 'source_synthesis':
                content['source_synthesis'] = self._generate_source_synthesis(task, sources, prompt)
            elif step_name == 'executive_summary':
                content['executive_summary'] = self._generate_executive_summary(task, sources, prompt)
            elif step_name == 'key_findings':
                content['key_findings'] = self._generate_key_findings(task, sources, prompt)
            elif step_name == 'recommendations':
                content['recommendations'] = self._generate_recommendations(task, sources, prompt)
            elif step_name == 'market_overview':
                content['market_overview'] = self._generate_market_overview(task, sources, prompt)
            elif step_name == 'competitive_landscape':
                content['competitive_landscape'] = self._generate_competitive_landscape(task, sources, prompt)
            elif step_name == 'trend_analysis':
                content['trend_analysis'] = self._generate_trend_analysis(task, sources, prompt)
            elif step_name == 'data_analysis':
                content['data_analysis'] = self._generate_data_analysis(task, sources, prompt)
            elif step_name == 'strategic_insights':
                content['strategic_insights'] = self._generate_strategic_insights(task, sources, prompt)
            elif step_name == 'policy_context':
                content['policy_context'] = self._generate_policy_context(task, sources, prompt)
            elif step_name == 'stakeholder_analysis':
                content['stakeholder_analysis'] = self._generate_stakeholder_analysis(task, sources, prompt)
            elif step_name == 'impact_analysis':
                content['impact_analysis'] = self._generate_impact_analysis(task, sources, prompt)
            elif step_name == 'risk_assessment':
                content['risk_assessment'] = self._generate_risk_assessment(task, sources, prompt)
        
        return content
    
    def _generate_context_analysis(self, task: Dict, sources: List[Dict], prompt: str) -> Dict:
        """Generate context analysis section."""
        return {
            'task_context': f"Analysis of {task.get('title')} for stakeholders: {', '.join(task.get('stakeholders', []))}",
            'business_context': f"Business context: {task.get('category', 'General')} category with {task.get('urgency', 'Medium')} urgency",
            'scope': f"Scope covers {len(sources)} relevant sources from multiple platforms",
            'timeline': f"Timeline: {task.get('due_date', 'Not specified')}"
        }
    
    def _generate_source_synthesis(self, task: Dict, sources: List[Dict], prompt: str) -> Dict:
        """Generate source synthesis section."""
        top_sources = sources[:5]
        synthesis = {
            'total_sources': len(sources),
            'source_types': list(set(s.get('type', 'unknown') for s in sources)),
            'key_insights': []
        }
        
        for source in top_sources:
            synthesis['key_insights'].append({
                'source_title': source.get('title', ''),
                'source_type': source.get('type', ''),
                'insight': source.get('description', '')[:200] + '...' if len(source.get('description', '')) > 200 else source.get('description', ''),
                'relevance_score': source.get('relevance_score', 0),
                'citation': f"({source.get('source', 'Unknown')}, {source.get('published_at', 'Unknown date')})"
            })
        
        return synthesis
    
    def _generate_executive_summary(self, task: Dict, sources: List[Dict], prompt: str) -> str:
        """Generate executive summary with proper citations."""
        # Extract key insights from sources
        key_insights = []
        citations = []
        
        for i, source in enumerate(sources[:3]):
            insight = source.get('title', '')
            source_name = source.get('source', 'Unknown')
            if source.get('published_at'):
                try:
                    pub_date = datetime.fromisoformat(source['published_at'].replace('Z', '+00:00'))
                    year = pub_date.year
                except:
                    year = datetime.now().year
            else:
                year = datetime.now().year
            
            key_insights.append(insight)
            citations.append(f"({source_name}, {year})")
        
        # Generate professional executive summary
        summary = f"""Executive Summary for {task.get('title')}

This analysis synthesizes insights from {len(sources)} sources to address {task.get('category', 'the specified')} requirements. Key findings include:

• {key_insights[0] if key_insights else 'Primary insight from source analysis'} {citations[0] if citations else ''}
• {key_insights[1] if len(key_insights) > 1 else 'Secondary insight from market research'} {citations[1] if len(citations) > 1 else ''}
• {key_insights[2] if len(key_insights) > 2 else 'Strategic implication for business decisions'} {citations[2] if len(citations) > 2 else ''}

The analysis reveals critical implications for {', '.join(task.get('stakeholders', ['stakeholders']))} and provides actionable recommendations for immediate consideration.

Market Context:
Based on recent developments, the {task.get('category', 'target')} sector is experiencing significant transformation. Regulatory changes, technological innovation, and shifting consumer preferences are reshaping the competitive landscape. Our analysis identifies both immediate opportunities and longer-term strategic considerations that require attention from {', '.join(task.get('stakeholders', ['key stakeholders']))}.

Strategic Implications:
The findings suggest a need for proactive strategy development in response to emerging market dynamics. Key areas of focus include regulatory compliance, technological integration, and customer experience optimization. The recommendations outlined in this brief provide a roadmap for addressing these challenges while capitalizing on identified opportunities."""
        
        return summary
    
    def _generate_key_findings(self, task: Dict, sources: List[Dict], prompt: str) -> List[Dict]:
        """Generate key findings section with proper citations."""
        findings = []
        
        # Extract findings from top sources with citations
        for i, source in enumerate(sources[:5]):
            source_name = source.get('source', 'Unknown')
            if source.get('published_at'):
                try:
                    pub_date = datetime.fromisoformat(source['published_at'].replace('Z', '+00:00'))
                    year = pub_date.year
                except:
                    year = datetime.now().year
            else:
                year = datetime.now().year
            
            citation = f"({source_name}, {year})"
            
            # Generate more detailed findings based on source type
            if source.get('type') == 'slack_message':
                finding_content = f"Internal discussion reveals: {source.get('description', '')[:200]}..."
            elif source.get('type') == 'news_article':
                finding_content = f"Recent market analysis indicates: {source.get('description', '')[:200]}..."
            elif source.get('type') == 'sharepoint_document':
                finding_content = f"Internal research shows: {source.get('description', '')[:200]}..."
            else:
                finding_content = source.get('description', '')[:300] + '...' if len(source.get('description', '')) > 300 else source.get('description', '')
            
            findings.append({
                'id': f"finding-{i+1}",
                'title': f"Finding {i+1}: {source.get('title', 'Key Insight')}",
                'content': finding_content,
                'source': source_name,
                'citation': citation,
                'confidence': source.get('relevance_score', 0),
                'implications': f"Implications for {task.get('category', 'business')} strategy and operations",
                'source_type': source.get('type', 'unknown'),
                'relevance_score': source.get('relevance_score', 0)
            })
        
        return findings
    
    def _generate_recommendations(self, task: Dict, sources: List[Dict], prompt: str) -> List[Dict]:
        """Generate recommendations section."""
        return [
            {
                'id': 'rec-1',
                'title': 'Immediate Action Required',
                'description': f"Based on analysis of {len(sources)} sources, immediate action is recommended for {task.get('category', 'the identified area')}",
                'priority': 'High',
                'timeline': '1-2 weeks',
                'owner': task.get('stakeholders', ['TBD'])[0] if task.get('stakeholders') else 'TBD',
                'expected_outcome': 'Improved strategic positioning and risk mitigation'
            },
            {
                'id': 'rec-2',
                'title': 'Strategic Initiative',
                'description': 'Develop comprehensive strategy based on market insights and competitive analysis',
                'priority': 'Medium',
                'timeline': '1-3 months',
                'owner': 'Strategy Team',
                'expected_outcome': 'Enhanced competitive advantage and market positioning'
            },
            {
                'id': 'rec-3',
                'title': 'Long-term Planning',
                'description': 'Establish monitoring and evaluation framework for ongoing assessment',
                'priority': 'Low',
                'timeline': '3-6 months',
                'owner': 'Operations Team',
                'expected_outcome': 'Sustainable competitive advantage and risk management'
            }
        ]
    
    def _generate_market_overview(self, task: Dict, sources: List[Dict], prompt: str) -> Dict:
        """Generate market overview section."""
        return {
            'market_size': 'Market size analysis based on aggregated sources',
            'market_drivers': [
                {'title': 'Digital Transformation', 'description': 'Accelerated digital adoption across industries'},
                {'title': 'Regulatory Changes', 'description': 'Evolving regulatory landscape impacting business models'}
            ],
            'growth_trends': [
                {'trend': 'Market Growth', 'rate': '15%', 'period': 'Annual'},
                {'trend': 'Technology Adoption', 'rate': '25%', 'period': 'Annual'}
            ]
        }
    
    def _generate_competitive_landscape(self, task: Dict, sources: List[Dict], prompt: str) -> Dict:
        """Generate competitive landscape section."""
        return {
            'key_competitors': [
                {
                    'name': 'Competitor A',
                    'market_share': '25%',
                    'strengths': 'Strong brand presence and customer loyalty',
                    'weaknesses': 'Limited digital transformation',
                    'recent_developments': 'Recent product launch and market expansion'
                }
            ],
            'competitive_advantages': [
                'Technology leadership and innovation',
                'Strong customer relationships',
                'Operational efficiency'
            ]
        }
    
    def _generate_trend_analysis(self, task: Dict, sources: List[Dict], prompt: str) -> Dict:
        """Generate trend analysis section."""
        return {
            'emerging_trends': [
                {'trend': 'AI and Automation', 'impact': 'High', 'timeline': '1-2 years'},
                {'trend': 'Sustainability Focus', 'impact': 'Medium', 'timeline': '2-3 years'}
            ],
            'market_dynamics': [
                'Increasing competition in key segments',
                'Rapid technological advancement',
                'Changing customer preferences'
            ]
        }
    
    def _generate_data_analysis(self, task: Dict, sources: List[Dict], prompt: str) -> Dict:
        """Generate data analysis section."""
        return {
            'key_metrics': [
                {'metric': 'Market Growth Rate', 'value': '15%', 'trend': 'Increasing'},
                {'metric': 'Customer Adoption', 'value': '67%', 'trend': 'Stable'},
                {'metric': 'Revenue Growth', 'value': '12%', 'trend': 'Positive'}
            ],
            'data_insights': [
                'Strong correlation between digital adoption and market performance',
                'Customer satisfaction scores above industry average',
                'Operational efficiency metrics showing improvement'
            ]
        }
    
    def _generate_strategic_insights(self, task: Dict, sources: List[Dict], prompt: str) -> Dict:
        """Generate strategic insights section."""
        return {
            'opportunities': [
                {
                    'title': 'Market Expansion Opportunity',
                    'description': 'Untapped market segments with high growth potential',
                    'size': '$500M',
                    'timeline': '2-3 years',
                    'risk_level': 'Medium'
                }
            ],
            'threats': [
                {
                    'title': 'Competitive Pressure',
                    'description': 'Increased competition from new market entrants',
                    'impact': 'High',
                    'mitigation': 'Focus on differentiation and innovation'
                }
            ],
            'strategic_implications': [
                'Need for accelerated digital transformation',
                'Importance of customer experience differentiation',
                'Requirement for agile response to market changes'
            ]
        }
    
    def _generate_policy_context(self, task: Dict, sources: List[Dict], prompt: str) -> Dict:
        """Generate policy context section."""
        return {
            'regulatory_environment': [
                {'regulation': 'PSD3', 'status': 'Proposed', 'impact': 'High'},
                {'regulation': 'GDPR', 'status': 'Active', 'impact': 'Medium'}
            ],
            'policy_trends': [
                'Increasing focus on consumer protection',
                'Growing emphasis on data privacy',
                'Enhanced regulatory oversight'
            ]
        }
    
    def _generate_stakeholder_analysis(self, task: Dict, sources: List[Dict], prompt: str) -> Dict:
        """Generate stakeholder analysis section."""
        return {
            'key_stakeholders': [
                {'stakeholder': 'Regulators', 'position': 'Supportive', 'influence': 'High'},
                {'stakeholder': 'Consumers', 'position': 'Concerned', 'influence': 'Medium'},
                {'stakeholder': 'Industry', 'position': 'Mixed', 'influence': 'High'}
            ],
            'stakeholder_concerns': [
                'Data privacy and security',
                'Consumer protection',
                'Market competition'
            ]
        }
    
    def _generate_impact_analysis(self, task: Dict, sources: List[Dict], prompt: str) -> Dict:
        """Generate impact analysis section."""
        return {
            'business_impact': [
                {'area': 'Operations', 'impact': 'Medium', 'timeline': '6 months'},
                {'area': 'Technology', 'impact': 'High', 'timeline': '12 months'},
                {'area': 'Compliance', 'impact': 'High', 'timeline': '3 months'}
            ],
            'cost_implications': [
                {'item': 'Implementation', 'cost': '$2M', 'timeline': '18 months'},
                {'item': 'Compliance', 'cost': '$500K', 'timeline': 'Ongoing'}
            ]
        }
    
    def _generate_risk_assessment(self, task: Dict, sources: List[Dict], prompt: str) -> Dict:
        """Generate risk assessment section."""
        return {
            'high_risks': [
                {
                    'risk': 'Regulatory Changes',
                    'probability': 'Medium',
                    'impact': 'High',
                    'mitigation': 'Active regulatory monitoring and engagement'
                }
            ],
            'medium_risks': [
                {
                    'risk': 'Competitive Response',
                    'probability': 'High',
                    'impact': 'Medium',
                    'mitigation': 'Differentiation strategy and innovation focus'
                }
            ],
            'risk_mitigation_strategies': [
                'Proactive regulatory engagement',
                'Continuous market monitoring',
                'Agile response capabilities'
            ]
        }
    
    def _generate_strategic_implications_table(self, task: Dict, sources: List[Dict], prompt: str) -> Dict:
        """Generate strategic implications table like in the professional example."""
        implications = {
            'opportunities': [
                {
                    'opportunity': 'Embedded BNPL APIs',
                    'detail': 'Offer branded API access to fintechs building checkout flows',
                    'suggested_action': 'Explore pilot with 2-3 Shopify vendors',
                    'timeline': '3-6 months',
                    'priority': 'High'
                },
                {
                    'opportunity': 'Risk-as-a-Service',
                    'detail': 'Offer fraud detection and credit modeling for non-card BNPL networks',
                    'suggested_action': 'Leverage existing Visa Risk stack for 3rd party integrations',
                    'timeline': '6-12 months',
                    'priority': 'Medium'
                },
                {
                    'opportunity': 'Cross-Border BNPL Growth',
                    'detail': 'Visa Direct + BNPL in remittance-heavy corridors',
                    'suggested_action': 'Launch LATAM + SEA market study',
                    'timeline': '1-3 months',
                    'priority': 'High'
                }
            ],
            'threats': [
                {
                    'threat': 'Regulatory Scrutiny',
                    'detail': 'Increasing regulatory oversight of BNPL services',
                    'mitigation': 'Proactive engagement with regulators and compliance framework development',
                    'timeline': 'Ongoing',
                    'priority': 'High'
                },
                {
                    'threat': 'Competitive Pressure',
                    'detail': 'New entrants and existing players expanding BNPL offerings',
                    'mitigation': 'Accelerate innovation and strategic partnerships',
                    'timeline': '3-6 months',
                    'priority': 'Medium'
                }
            ]
        }
        
        return implications
    
    def render_template(self, deliverable: Dict, task: Dict, sources: List[Dict]) -> str:
        """Render the deliverable content as formatted markdown."""
        content = deliverable.get('content', {})
        format_type = deliverable.get('format_type', 'executive_brief')
        
        # Create markdown template based on format type
        if format_type == 'executive_brief':
            return self._render_executive_brief(content, task, sources)
        elif format_type == 'market_analysis':
            return self._render_market_analysis(content, task, sources)
        elif format_type == 'policy_memo':
            return self._render_policy_memo(content, task, sources)
        elif format_type == 'regulatory_roadmap':
            return self._render_regulatory_roadmap(content, task, sources)
        elif format_type == 'strategy_deck':
            return self._render_strategy_deck(content, task, sources)
        else:
            return self._render_generic_deliverable(content, task, sources)
    
    def _render_executive_brief(self, content: Dict, task: Dict, sources: List[Dict]) -> str:
        """Render executive brief format with professional structure."""
        template = f"""# {task.get('title', 'Task Title')} - Strategy Brief

**Prepared for:** {', '.join(task.get('stakeholders', ['Stakeholders']))}  
**Date:** {datetime.now().strftime('%B %d, %Y')}  
**Category:** {task.get('category', 'Research')}  
**Due Date:** {task.get('due_date', 'Not specified')}

## Executive Summary
{content.get('executive_summary', 'Executive summary not available.')}

## Key Findings
"""
        
        findings = content.get('key_findings', [])
        for finding in findings:
            template += f"### {finding.get('title', 'Finding')}\n"
            template += f"{finding.get('content', '')}\n"
            if finding.get('citation'):
                template += f"*Source: {finding.get('citation')}*\n"
            template += f"\n**Implications:** {finding.get('implications', '')}\n\n"
        
        template += "## Strategic Implications\n"
        
        # Add strategic implications table
        implications = self._generate_strategic_implications_table(task, sources, "")
        
        template += "### Opportunities\n"
        template += "| Opportunity | Detail | Suggested Action | Timeline | Priority |\n"
        template += "|-------------|--------|------------------|----------|----------|\n"
        for opp in implications.get('opportunities', []):
            template += f"| {opp.get('opportunity', '')} | {opp.get('detail', '')} | {opp.get('suggested_action', '')} | {opp.get('timeline', '')} | {opp.get('priority', '')} |\n"
        
        template += "\n### Threats\n"
        template += "| Threat | Detail | Mitigation | Timeline | Priority |\n"
        template += "|--------|--------|------------|----------|----------|\n"
        for threat in implications.get('threats', []):
            template += f"| {threat.get('threat', '')} | {threat.get('detail', '')} | {threat.get('mitigation', '')} | {threat.get('timeline', '')} | {threat.get('priority', '')} |\n"
        
        template += "\n## Recommendations\n"
        recommendations = content.get('recommendations', [])
        for rec in recommendations:
            template += f"### {rec.get('title', 'Recommendation')}\n"
            template += f"{rec.get('description', '')}\n"
            template += f"- **Priority**: {rec.get('priority', 'Medium')}\n"
            template += f"- **Timeline**: {rec.get('timeline', 'TBD')}\n"
            template += f"- **Owner**: {rec.get('owner', 'TBD')}\n"
            template += f"- **Expected Outcome**: {rec.get('expected_outcome', 'TBD')}\n\n"
        
        template += f"## Sources Cited\n"
        template += f"This analysis is based on {len(sources)} sources including:\n\n"
        
        # Group sources by type
        source_types = {}
        for source in sources[:10]:  # Top 10 sources
            source_type = source.get('type', 'unknown')
            if source_type not in source_types:
                source_types[source_type] = []
            source_types[source_type].append(source)
        
        for source_type, type_sources in source_types.items():
            template += f"**{source_type.replace('_', ' ').title()}:**\n"
            for source in type_sources:
                citation = f"({source.get('source', 'Unknown')}, {datetime.now().year})"
                template += f"- {source.get('title', 'Source')} {citation}\n"
            template += "\n"
        
        template += f"## Deliverable Metadata\n"
        template += f"- **Version**: 1.0\n"
        template += f"- **Generated**: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}\n"
        template += f"- **Format**: Strategy Brief\n"
        template += f"- **Source Count**: {len(sources)}\n"
        template += f"- **Confidence Score**: {content.get('confidence_score', 'N/A')}\n"
        
        return template
    
    def _render_market_analysis(self, content: Dict, task: Dict, sources: List[Dict]) -> str:
        """Render market analysis format."""
        template = f"""# Market Analysis: {task.get('title', 'Task Title')}

## Executive Summary
{content.get('executive_summary', 'Executive summary not available.')}

## Market Overview
"""
        
        market_overview = content.get('market_overview', {})
        if market_overview:
            template += f"### Market Size and Growth\n"
            template += f"{market_overview.get('market_size', 'Market size analysis based on aggregated sources')}\n\n"
            
            template += f"### Market Drivers\n"
            for driver in market_overview.get('market_drivers', []):
                template += f"- **{driver.get('title', 'Driver')}**: {driver.get('description', '')}\n"
            
            template += f"\n### Growth Trends\n"
            for trend in market_overview.get('growth_trends', []):
                template += f"- **{trend.get('trend', 'Trend')}**: {trend.get('rate', '')} ({trend.get('period', '')})\n"
        
        template += "\n## Competitive Landscape\n"
        competitive = content.get('competitive_landscape', {})
        if competitive:
            template += f"### Key Competitors\n"
            for comp in competitive.get('key_competitors', []):
                template += f"#### {comp.get('name', 'Competitor')}\n"
                template += f"- **Market Share**: {comp.get('market_share', 'Unknown')}\n"
                template += f"- **Strengths**: {comp.get('strengths', '')}\n"
                template += f"- **Weaknesses**: {comp.get('weaknesses', '')}\n"
                template += f"- **Recent Developments**: {comp.get('recent_developments', '')}\n\n"
        
        template += "\n## Strategic Insights\n"
        insights = content.get('strategic_insights', {})
        if insights:
            template += f"### Opportunities\n"
            for opp in insights.get('opportunities', []):
                template += f"- **{opp.get('title', 'Opportunity')}**: {opp.get('description', '')}\n"
                template += f"  - Size: {opp.get('size', 'Unknown')}\n"
                template += f"  - Timeline: {opp.get('timeline', 'Unknown')}\n\n"
            
            template += f"### Threats\n"
            for threat in insights.get('threats', []):
                template += f"- **{threat.get('title', 'Threat')}**: {threat.get('description', '')}\n"
                template += f"  - Impact: {threat.get('impact', 'Unknown')}\n"
                template += f"  - Mitigation: {threat.get('mitigation', '')}\n\n"
        
        template += "\n## Recommendations\n"
        recommendations = content.get('recommendations', [])
        for rec in recommendations:
            template += f"### {rec.get('title', 'Recommendation')}\n"
            template += f"{rec.get('description', '')}\n"
            template += f"- **Priority**: {rec.get('priority', 'Medium')}\n"
            template += f"- **Timeline**: {rec.get('timeline', 'TBD')}\n"
            template += f"- **Expected Outcome**: {rec.get('expected_outcome', 'TBD')}\n\n"
        
        return template
    
    def _render_policy_memo(self, content: Dict, task: Dict, sources: List[Dict]) -> str:
        """Render policy memo format."""
        template = f"""# Policy Memo: {task.get('title', 'Task Title')}

## Executive Summary
{content.get('executive_summary', 'Executive summary not available.')}

## Policy Context
"""
        
        policy_context = content.get('policy_context', {})
        if policy_context:
            template += f"### Regulatory Environment\n"
            for reg in policy_context.get('regulatory_environment', []):
                template += f"- **{reg.get('regulation', 'Regulation')}**: {reg.get('status', 'Unknown')} - {reg.get('impact', 'Unknown')} Impact\n"
            
            template += f"\n### Policy Trends\n"
            for trend in policy_context.get('policy_trends', []):
                template += f"- {trend}\n"
        
        template += "\n## Stakeholder Analysis\n"
        stakeholder = content.get('stakeholder_analysis', {})
        if stakeholder:
            template += f"### Key Stakeholders\n"
            for stake in stakeholder.get('key_stakeholders', []):
                template += f"- **{stake.get('stakeholder', 'Stakeholder')}**: {stake.get('position', 'Unknown')} position, {stake.get('influence', 'Unknown')} influence\n"
        
        template += "\n## Impact Analysis\n"
        impact = content.get('impact_analysis', {})
        if impact:
            template += f"### Business Impact\n"
            for area in impact.get('business_impact', []):
                template += f"- **{area.get('area', 'Area')}**: {area.get('impact', 'Unknown')} impact over {area.get('timeline', 'Unknown')}\n"
        
        template += "\n## Risk Assessment\n"
        risk = content.get('risk_assessment', {})
        if risk:
            template += f"### High Risks\n"
            for high_risk in risk.get('high_risks', []):
                template += f"- **{high_risk.get('risk', 'Risk')}**: {high_risk.get('probability', 'Unknown')} probability, {high_risk.get('impact', 'Unknown')} impact\n"
                template += f"  - Mitigation: {high_risk.get('mitigation', '')}\n\n"
        
        template += "\n## Recommendations\n"
        recommendations = content.get('recommendations', [])
        for rec in recommendations:
            template += f"### {rec.get('title', 'Recommendation')}\n"
            template += f"{rec.get('description', '')}\n"
            template += f"- **Priority**: {rec.get('priority', 'Medium')}\n"
            template += f"- **Timeline**: {rec.get('timeline', 'TBD')}\n\n"
        
        return template
    
    def _render_regulatory_roadmap(self, content: Dict, task: Dict, sources: List[Dict]) -> str:
        """Render regulatory roadmap format."""
        template = f"""# Regulatory Roadmap: {task.get('title', 'Task Title')}

## Executive Summary
{content.get('executive_summary', 'Executive summary not available.')}

## Regulatory Landscape
"""
        
        regulatory = content.get('regulatory_landscape', {})
        if regulatory:
            template += f"### Current Regulations\n"
            for reg in regulatory.get('current_regulations', []):
                template += f"- **{reg.get('regulation', 'Regulation')}**: {reg.get('status', 'Unknown')} - {reg.get('impact', 'Unknown')} Impact\n"
        
        template += "\n## Impact Analysis\n"
        impact = content.get('impact_analysis', {})
        if impact:
            template += f"### Business Impact\n"
            for area in impact.get('business_impact', []):
                template += f"- **{area.get('area', 'Area')}**: {area.get('impact', 'Unknown')} impact over {area.get('timeline', 'Unknown')}\n"
            
            template += f"\n### Cost Implications\n"
            for cost in impact.get('cost_implications', []):
                template += f"- **{cost.get('item', 'Item')}**: {cost.get('cost', 'Unknown')} over {cost.get('timeline', 'Unknown')}\n"
        
        template += "\n## Action Plan\n"
        action_plan = content.get('action_plan', {})
        if action_plan:
            template += f"### Immediate Actions\n"
            for action in action_plan.get('immediate_actions', []):
                template += f"- **{action.get('action', 'Action')}**: {action.get('owner', 'TBD')} - {action.get('timeline', 'TBD')}\n"
            
            template += f"\n### Short-term Goals\n"
            for goal in action_plan.get('short_term_goals', []):
                template += f"- **{goal.get('goal', 'Goal')}**: {goal.get('target_date', 'TBD')} - {goal.get('success_metrics', 'TBD')}\n"
        
        template += "\n## Risk Assessment\n"
        risk = content.get('risk_assessment', {})
        if risk:
            template += f"### High Risks\n"
            for high_risk in risk.get('high_risks', []):
                template += f"- **{high_risk.get('risk', 'Risk')}**: {high_risk.get('probability', 'Unknown')} probability, {high_risk.get('impact', 'Unknown')} impact\n"
                template += f"  - Mitigation: {high_risk.get('mitigation', '')}\n\n"
        
        return template
    
    def _render_strategy_deck(self, content: Dict, task: Dict, sources: List[Dict]) -> str:
        """Render strategy deck format."""
        template = f"""# Strategy Deck: {task.get('title', 'Task Title')}

## Executive Summary
{content.get('executive_summary', 'Executive summary not available.')}

## Strategic Context
"""
        
        context = content.get('context_analysis', {})
        if context:
            template += f"### Task Context\n"
            template += f"{context.get('task_context', '')}\n\n"
            template += f"### Business Context\n"
            template += f"{context.get('business_context', '')}\n\n"
            template += f"### Scope\n"
            template += f"{context.get('scope', '')}\n"
        
        template += "\n## Market Analysis\n"
        market = content.get('market_overview', {})
        if market:
            template += f"### Market Overview\n"
            template += f"{market.get('market_size', 'Market size analysis')}\n\n"
            
            template += f"### Key Trends\n"
            for trend in market.get('growth_trends', []):
                template += f"- **{trend.get('trend', 'Trend')}**: {trend.get('rate', '')} ({trend.get('period', '')})\n"
        
        template += "\n## Strategic Insights\n"
        insights = content.get('strategic_insights', {})
        if insights:
            template += f"### Opportunities\n"
            for opp in insights.get('opportunities', []):
                template += f"- **{opp.get('title', 'Opportunity')}**: {opp.get('description', '')}\n"
                template += f"  - Size: {opp.get('size', 'Unknown')}\n"
                template += f"  - Timeline: {opp.get('timeline', 'Unknown')}\n\n"
            
            template += f"### Strategic Implications\n"
            for imp in insights.get('strategic_implications', []):
                template += f"- {imp}\n"
        
        template += "\n## Recommendations\n"
        recommendations = content.get('recommendations', [])
        for rec in recommendations:
            template += f"### {rec.get('title', 'Recommendation')}\n"
            template += f"{rec.get('description', '')}\n"
            template += f"- **Priority**: {rec.get('priority', 'Medium')}\n"
            template += f"- **Timeline**: {rec.get('timeline', 'TBD')}\n"
            template += f"- **Expected Outcome**: {rec.get('expected_outcome', 'TBD')}\n\n"
        
        return template
    
    def _render_generic_deliverable(self, content: Dict, task: Dict, sources: List[Dict]) -> str:
        """Render generic deliverable format."""
        template = f"""# Deliverable: {task.get('title', 'Task Title')}

## Executive Summary
{content.get('executive_summary', 'Executive summary not available.')}

## Key Findings
"""
        
        findings = content.get('key_findings', [])
        for finding in findings:
            template += f"### {finding.get('title', 'Finding')}\n"
            template += f"{finding.get('content', '')}\n\n"
        
        template += "\n## Recommendations\n"
        recommendations = content.get('recommendations', [])
        for rec in recommendations:
            template += f"### {rec.get('title', 'Recommendation')}\n"
            template += f"{rec.get('description', '')}\n"
            template += f"- **Priority**: {rec.get('priority', 'Medium')}\n"
            template += f"- **Timeline**: {rec.get('timeline', 'TBD')}\n\n"
        
        template += f"\n## Sources Used\n"
        template += f"This analysis is based on {len(sources)} sources.\n"
        
        return template 