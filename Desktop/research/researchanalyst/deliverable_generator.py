import json
import os
from datetime import datetime
from typing import Dict, List, Optional

class DeliverableGenerator:
    """Handles the generation of deliverables from tasks and sources."""
    
    def __init__(self):
        self.load_prompt_profiles()
    
    def load_prompt_profiles(self):
        """Load prompt profiles from JSON configuration."""
        try:
            with open('prompt_profiles.json', 'r') as f:
                self.prompt_profiles = json.load(f)
        except FileNotFoundError:
            # Fallback configuration if file not found
            self.prompt_profiles = {
                "deliverable_formats": {
                    "executive_brief": {
                        "name": "Executive Brief",
                        "estimated_length": "2-3 pages",
                        "output_formats": ["pdf", "docx"],
                        "prompt_chain": [
                            {"step": "content_structure", "prompt": "Create executive summary structure"},
                            {"step": "strategic_insights", "prompt": "Generate strategic insights"},
                            {"step": "recommendation", "prompt": "Provide actionable recommendations"}
                        ]
                    },
                    "market_analysis": {
                        "name": "Market Analysis Report",
                        "estimated_length": "10-15 pages",
                        "output_formats": ["pdf", "docx"],
                        "prompt_chain": [
                            {"step": "market_overview", "prompt": "Analyze market landscape"},
                            {"step": "data_analysis", "prompt": "Present data analysis"},
                            {"step": "strategic_insights", "prompt": "Generate strategic insights"}
                        ]
                    },
                    "policy_memo": {
                        "name": "Policy Memo",
                        "estimated_length": "3-5 pages",
                        "output_formats": ["pdf", "docx"],
                        "prompt_chain": [
                            {"step": "policy_analysis", "prompt": "Analyze policy implications"},
                            {"step": "risk_assessment", "prompt": "Assess risks and opportunities"},
                            {"step": "recommendation", "prompt": "Provide policy recommendations"}
                        ]
                    },
                    "regulatory_roadmap": {
                        "name": "Regulatory Roadmap",
                        "estimated_length": "5-8 pages",
                        "output_formats": ["pdf", "docx"],
                        "prompt_chain": [
                            {"step": "regulatory_landscape", "prompt": "Map regulatory landscape"},
                            {"step": "impact_analysis", "prompt": "Analyze compliance impact"},
                            {"step": "action_plan", "prompt": "Create compliance roadmap"}
                        ]
                    }
                },
                "format_detection_rules": {
                    "executive_brief": {
                        "triggers": ["executive", "brief", "summary", "overview"],
                        "stakeholder_levels": ["executive", "vp", "director", "manager"]
                    },
                    "market_analysis": {
                        "triggers": ["market", "analysis", "research", "trends", "competitive"],
                        "stakeholder_levels": ["strategy", "marketing", "product"]
                    },
                    "policy_memo": {
                        "triggers": ["policy", "regulatory", "compliance", "legal"],
                        "stakeholder_levels": ["legal", "compliance", "regulatory"]
                    },
                    "regulatory_roadmap": {
                        "triggers": ["regulatory", "compliance", "roadmap", "timeline"],
                        "stakeholder_levels": ["compliance", "legal", "regulatory"]
                    }
                }
            }
    
    def detect_format(self, task: Dict) -> str:
        """Detect the appropriate deliverable format based on task characteristics."""
        task_text = f"{task.get('title', '')} {task.get('description', '')}".lower()
        stakeholders = task.get('stakeholders', [])
        category = task.get('category', '').lower()
        output_type = task.get('output_type', '').lower()
        
        # If output_type is specified, use it
        if output_type in ['executive_brief', 'market_analysis', 'policy_memo', 'regulatory_roadmap']:
            return output_type
        
        best_match = None
        best_score = 0
        
        for format_key, rules in self.prompt_profiles.get('format_detection_rules', {}).items():
            score = 0
            
            # Check triggers
            triggers = rules.get('triggers', [])
            for trigger in triggers:
                if trigger.lower() in task_text:
                    score += 2
            
            # Check stakeholder levels
            stakeholder_levels = rules.get('stakeholder_levels', [])
            for stakeholder in stakeholders:
                if any(level.lower() in stakeholder.lower() for level in stakeholder_levels):
                    score += 1
            
            # Check category match
            if category in triggers:
                score += 1
            
            if score > best_score:
                best_score = score
                best_match = format_key
        
        return best_match or 'executive_brief'  # Default fallback
    
    def generate_deliverable(self, task: Dict, sources: List[Dict], format_type: str = None) -> Dict:
        """Generate a complete deliverable for a task."""
        if not format_type:
            format_type = self.detect_format(task)
        
        # Get format configuration
        format_config = self.prompt_profiles.get('deliverable_formats', {}).get(format_type, {})
        
        # Generate content using prompt chain
        content = self._execute_prompt_chain(task, sources, format_config)
        
        # Create deliverable structure
        deliverable = {
            'id': f"deliverable-{task.get('id', 'unknown')}",
            'task_id': task.get('id'),
            'title': f"{format_config.get('name', 'Deliverable')}: {task.get('title')}",
            'format_type': format_type,
            'status': 'Draft',
            'content': content,
            'created_at': datetime.now().isoformat(),
            'last_updated': datetime.now().isoformat(),
            'sources_used': [s.get('id') for s in sources],
            'estimated_length': format_config.get('estimated_length', 'Unknown'),
            'output_formats': format_config.get('output_formats', ['pdf'])
        }
        
        return deliverable
    
    def _execute_prompt_chain(self, task: Dict, sources: List[Dict], format_config: Dict) -> Dict:
        """Execute the prompt chain for a specific format."""
        prompt_chain = format_config.get('prompt_chain', [])
        content = {}
        
        for step in prompt_chain:
            step_name = step.get('step')
            prompt = step.get('prompt')
            
            if step_name == 'content_structure':
                content['content_structure'] = self._generate_content_structure(task, sources, prompt)
            elif step_name == 'source_integration':
                content['source_integration'] = self._generate_source_integration(task, sources, prompt)
            elif step_name == 'market_overview':
                content['market_overview'] = self._generate_market_overview(task, sources, prompt)
            elif step_name == 'data_analysis':
                content['data_analysis'] = self._generate_data_analysis(task, sources, prompt)
            elif step_name == 'strategic_insights':
                content['strategic_insights'] = self._generate_strategic_insights(task, sources, prompt)
            elif step_name == 'regulatory_landscape':
                content['regulatory_landscape'] = self._generate_regulatory_landscape(task, sources, prompt)
            elif step_name == 'impact_analysis':
                content['impact_analysis'] = self._generate_impact_analysis(task, sources, prompt)
            elif step_name == 'action_plan':
                content['action_plan'] = self._generate_action_plan(task, sources, prompt)
            elif step_name == 'policy_analysis':
                content['policy_analysis'] = self._generate_policy_analysis(task, sources, prompt)
            elif step_name == 'recommendation':
                content['recommendation'] = self._generate_recommendation(task, sources, prompt)
            elif step_name == 'risk_assessment':
                content['risk_assessment'] = self._generate_risk_assessment(task, sources, prompt)
        
        return content
    
    def _generate_content_structure(self, task: Dict, sources: List[Dict], prompt: str) -> Dict:
        """Generate structured content for the deliverable."""
        return {
            'executive_summary': f"Executive summary for {task.get('title')} based on {len(sources)} sources.",
            'key_findings': [
                {'title': 'Finding 1', 'content': 'Key finding based on source analysis'},
                {'title': 'Finding 2', 'content': 'Another important finding'}
            ],
            'strategic_implications': [
                {'title': 'Implication 1', 'content': 'Strategic implication', 'impact_level': 'High', 'timeline': '3-6 months'}
            ],
            'recommendations': [
                {'title': 'Recommendation 1', 'content': 'Actionable recommendation', 'priority': 'High', 'owner': 'TBD', 'timeline': '1-3 months'}
            ],
            'next_steps': [
                {'action': 'Review findings', 'description': 'Stakeholder review of key findings', 'due_date': 'Next week'}
            ]
        }
    
    def _generate_source_integration(self, task: Dict, sources: List[Dict], prompt: str) -> Dict:
        """Generate source integration with citations."""
        integrated_sources = []
        
        for source in sources[:3]:  # Limit to top 3 sources
            integrated_sources.append({
                'source_id': source.get('id'),
                'title': source.get('title'),
                'snippet': f"Key insight from {source.get('title')}",
                'citation': f"({source.get('title')}, {datetime.now().year})",
                'relevance_score': source.get('relevance_score', 0)
            })
        
        return {'integrated_sources': integrated_sources}
    
    def _generate_market_overview(self, task: Dict, sources: List[Dict], prompt: str) -> Dict:
        """Generate market overview section."""
        return {
            'market_size': 'Market size analysis based on available sources',
            'market_drivers': [
                {'title': 'Digital Transformation', 'description': 'Accelerated digital adoption'},
                {'title': 'Regulatory Changes', 'description': 'New compliance requirements'}
            ],
            'competitors': [
                {
                    'name': 'Competitor A',
                    'market_share': '25%',
                    'strengths': 'Strong brand presence',
                    'developments': 'Recent product launch'
                }
            ]
        }
    
    def _generate_data_analysis(self, task: Dict, sources: List[Dict], prompt: str) -> Dict:
        """Generate data analysis section."""
        return {
            'trends': [
                {
                    'title': 'Market Growth Trend',
                    'description': 'Steady growth in target market',
                    'data_points': [
                        {'label': '2023', 'value': '$1.2B', 'period': 'Q4'},
                        {'label': '2024', 'value': '$1.4B', 'period': 'Q4'}
                    ]
                }
            ],
            'key_metrics': [
                {'metric': 'Market Growth Rate', 'value': '15%', 'trend': 'Increasing'},
                {'metric': 'Customer Adoption', 'value': '67%', 'trend': 'Stable'}
            ]
        }
    
    def _generate_strategic_insights(self, task: Dict, sources: List[Dict], prompt: str) -> Dict:
        """Generate strategic insights section."""
        return {
            'market_opportunities': [
                {
                    'title': 'Emerging Market Opportunity',
                    'description': 'Untapped market segment with high growth potential',
                    'size': '$500M',
                    'timeline': '2-3 years'
                }
            ],
            'competitive_advantages': [
                {
                    'title': 'Technology Leadership',
                    'description': 'Advanced technology stack provides competitive edge',
                    'sustainability': 'Long-term'
                }
            ],
            'strategic_risks': [
                {
                    'title': 'Regulatory Uncertainty',
                    'description': 'Potential regulatory changes could impact business model',
                    'mitigation': 'Active engagement with regulators'
                }
            ]
        }
    
    def _generate_regulatory_landscape(self, task: Dict, sources: List[Dict], prompt: str) -> Dict:
        """Generate regulatory landscape section."""
        return {
            'current_regulations': [
                {'regulation': 'PSD3', 'status': 'Proposed', 'impact': 'High'},
                {'regulation': 'GDPR', 'status': 'Active', 'impact': 'Medium'}
            ],
            'compliance_requirements': [
                {'requirement': 'Data Protection', 'deadline': 'Ongoing', 'status': 'Compliant'}
            ]
        }
    
    def _generate_impact_analysis(self, task: Dict, sources: List[Dict], prompt: str) -> Dict:
        """Generate impact analysis section."""
        return {
            'business_impact': [
                {'area': 'Operations', 'impact': 'Medium', 'timeline': '6 months'},
                {'area': 'Technology', 'impact': 'High', 'timeline': '12 months'}
            ],
            'cost_implications': [
                {'item': 'Implementation', 'cost': '$2M', 'timeline': '18 months'},
                {'item': 'Compliance', 'cost': '$500K', 'timeline': 'Ongoing'}
            ]
        }
    
    def _generate_action_plan(self, task: Dict, sources: List[Dict], prompt: str) -> Dict:
        """Generate action plan section."""
        return {
            'immediate_actions': [
                {'action': 'Stakeholder Review', 'owner': 'Project Manager', 'timeline': '2 weeks'},
                {'action': 'Resource Allocation', 'owner': 'Finance', 'timeline': '1 month'}
            ],
            'short_term_goals': [
                {'goal': 'Complete Analysis', 'target_date': 'Q2 2025', 'success_metrics': 'Report approved'}
            ],
            'long_term_objectives': [
                {'objective': 'Market Leadership', 'target_date': '2026', 'success_metrics': 'Market share >30%'}
            ]
        }
    
    def _generate_policy_analysis(self, task: Dict, sources: List[Dict], prompt: str) -> Dict:
        """Generate policy analysis section."""
        return {
            'policy_implications': [
                {'policy': 'Data Privacy', 'implication': 'Enhanced consumer protection', 'impact': 'Positive'}
            ],
            'stakeholder_analysis': [
                {'stakeholder': 'Consumers', 'impact': 'Benefit', 'concerns': 'Data usage transparency'}
            ]
        }
    
    def _generate_recommendation(self, task: Dict, sources: List[Dict], prompt: str) -> Dict:
        """Generate recommendation section."""
        return {
            'primary_recommendations': [
                {
                    'title': 'Strategic Partnership',
                    'description': 'Form strategic partnerships to accelerate market entry',
                    'priority': 'High',
                    'timeline': '3-6 months',
                    'expected_outcome': 'Faster market penetration'
                }
            ],
            'supporting_actions': [
                {
                    'action': 'Market Research',
                    'description': 'Conduct detailed market research',
                    'owner': 'Research Team',
                    'timeline': '2 months'
                }
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
                    'mitigation': 'Active regulatory monitoring'
                }
            ],
            'medium_risks': [
                {
                    'risk': 'Competitive Response',
                    'probability': 'High',
                    'impact': 'Medium',
                    'mitigation': 'Differentiation strategy'
                }
            ]
        }
    
    def render_template(self, deliverable: Dict, task: Dict, sources: List[Dict]) -> str:
        """Render the deliverable content as formatted text."""
        content = deliverable.get('content', {})
        
        # Create a simple markdown template
        template = f"""# {deliverable.get('title', 'Deliverable')}

## Executive Summary
{content.get('content_structure', {}).get('executive_summary', 'Executive summary not available.')}

## Key Findings
"""
        
        for finding in content.get('content_structure', {}).get('key_findings', []):
            template += f"- **{finding.get('title', 'Finding')}**: {finding.get('content', '')}\n"
        
        template += "\n## Strategic Insights\n"
        insights = content.get('strategic_insights', {})
        if insights.get('market_opportunities'):
            template += "### Market Opportunities\n"
            for opp in insights['market_opportunities']:
                template += f"- **{opp.get('title', 'Opportunity')}**: {opp.get('description', '')}\n"
        
        template += "\n## Recommendations\n"
        for rec in content.get('recommendation', {}).get('primary_recommendations', []):
            template += f"- **{rec.get('title', 'Recommendation')}**: {rec.get('description', '')}\n"
        
        return template
    
    def export_deliverable(self, deliverable: Dict, task: Dict, sources: List[Dict], format: str = 'markdown') -> str:
        """Export deliverable in the specified format."""
        if format == 'markdown':
            return self.render_template(deliverable, task, sources)
        else:
            # For other formats, return the markdown version for now
            return self.render_template(deliverable, task, sources) 