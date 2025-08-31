#!/usr/bin/env python3
"""
Transaction Mode Analyzer for X12 270/271 Implementation Questionnaire

This script analyzes the extracted PDF fields to identify:
1. The three transaction modes (Real-time Web, Real-time B2B, EDI Batch)
2. Mode-specific field requirements and conditional logic
3. Common fields vs mode-specific fields
4. Field dependencies and relationships

Usage:
    python analyze_transaction_modes.py
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Set, Any

class TransactionModeAnalyzer:
    def __init__(self):
        self.modes = {
            'real_time_web': {
                'name': 'Real-time Web',
                'keywords': ['real-time web', 'web', 'real time web'],
                'fields': set(),
                'specific_fields': set(),
                'requirements': []
            },
            'real_time_b2b': {
                'name': 'Real-time B2B',
                'keywords': ['real-time b2b', 'b2b', 'real time b2b', 'business to business'],
                'fields': set(),
                'specific_fields': set(),
                'requirements': []
            },
            'edi_batch': {
                'name': 'EDI Batch',
                'keywords': ['edi batch', 'batch', 'edi', 'electronic data interchange'],
                'fields': set(),
                'specific_fields': set(),
                'requirements': []
            }
        }
        
        self.common_fields = set()
        self.conditional_fields = {}
        self.field_analysis = {}

    def analyze_from_extracted_data(self):
        """Analyze transaction modes from extracted PDF data"""
        
        print("🔍 Analyzing transaction modes from extracted PDF data...")
        
        # Load extracted field data
        fields_data = self._load_extracted_fields()
        form_controls = self._load_form_controls()
        
        # Analyze mode selection fields
        mode_fields = self._identify_mode_selection_fields(fields_data)
        
        # Analyze mode-specific sections
        mode_sections = self._analyze_mode_specific_sections(fields_data, form_controls)
        
        # Identify conditional logic
        conditional_logic = self._analyze_conditional_logic(fields_data, form_controls)
        
        # Generate comprehensive analysis
        analysis = {
            'transaction_modes': self.modes,
            'mode_selection_fields': mode_fields,
            'mode_specific_sections': mode_sections,
            'conditional_logic': conditional_logic,
            'field_distribution': self._analyze_field_distribution(fields_data),
            'recommendations': self._generate_recommendations()
        }
        
        # Save analysis
        self._save_analysis(analysis)
        
        return analysis

    def _load_extracted_fields(self) -> Dict:
        """Load the extracted fields data"""
        try:
            with open('extracted_fields/fields_raw.json', 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print("❌ fields_raw.json not found. Please run field extraction first.")
            return {}

    def _load_form_controls(self) -> Dict:
        """Load the form controls analysis data"""
        try:
            with open('extracted_fields/form_controls_analysis.json', 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print("❌ form_controls_analysis.json not found. Please run form controls analysis first.")
            return {}

    def _identify_mode_selection_fields(self, fields_data: Dict) -> Dict:
        """Identify fields related to mode selection"""
        
        mode_fields = {
            'primary_selector': None,
            'mode_indicators': [],
            'related_fields': []
        }
        
        for field_name, field_data in fields_data.items():
            field_text = f"{field_name} {field_data.get('label', '')}".lower()
            
            # Look for the main mode selection field
            if any(keyword in field_text for keyword in ['real-time web', 'real-time b2b', 'edi batch']):
                if field_name in ['Real-time web', 'Real-time B2B', 'EDI batch']:
                    mode_fields['mode_indicators'].append({
                        'field_name': field_name,
                        'field_type': field_data.get('field_type'),
                        'value': field_data.get('value'),
                        'page': field_data.get('page')
                    })
            
            # Look for conditional text mentioning modes
            if 'please only complete this questionnaire' in field_text:
                mode_fields['primary_selector'] = {
                    'field_name': field_name,
                    'instruction': field_data.get('label', ''),
                    'page': field_data.get('page')
                }
        
        return mode_fields

    def _analyze_mode_specific_sections(self, fields_data: Dict, form_controls: Dict) -> Dict:
        """Analyze sections that are specific to certain modes"""
        
        sections = {
            'common_sections': [],
            'mode_specific_sections': {
                'real_time_web': [],
                'real_time_b2b': [],
                'edi_batch': []
            },
            'conditional_sections': []
        }
        
        # Group fields by page to identify sections
        pages = {}
        for field_name, field_data in fields_data.items():
            page = field_data.get('page', 1)
            if page not in pages:
                pages[page] = []
            pages[page].append({
                'name': field_name,
                'data': field_data
            })
        
        # Analyze each page for mode-specific content
        for page_num, page_fields in pages.items():
            page_text = ' '.join([f['name'] + ' ' + f['data'].get('label', '') for f in page_fields]).lower()
            
            # Check if page mentions specific modes
            mode_mentions = {}
            for mode_key, mode_info in self.modes.items():
                for keyword in mode_info['keywords']:
                    if keyword in page_text:
                        mode_mentions[mode_key] = mode_mentions.get(mode_key, 0) + 1
            
            # Classify the page/section
            if len(mode_mentions) == 1:
                # Page specific to one mode
                mode = list(mode_mentions.keys())[0]
                sections['mode_specific_sections'][mode].append({
                    'page': page_num,
                    'fields': [f['name'] for f in page_fields],
                    'field_count': len(page_fields)
                })
            elif len(mode_mentions) > 1:
                # Page with conditional content
                sections['conditional_sections'].append({
                    'page': page_num,
                    'modes_mentioned': list(mode_mentions.keys()),
                    'fields': [f['name'] for f in page_fields]
                })
            else:
                # Common section
                sections['common_sections'].append({
                    'page': page_num,
                    'fields': [f['name'] for f in page_fields],
                    'field_count': len(page_fields)
                })
        
        return sections

    def _analyze_conditional_logic(self, fields_data: Dict, form_controls: Dict) -> Dict:
        """Analyze conditional field relationships"""
        
        conditional_logic = {
            'if_then_fields': [],
            'mode_dependent_fields': [],
            'field_dependencies': {},
            'validation_rules': {}
        }
        
        for field_name, field_data in fields_data.items():
            field_text = f"{field_name} {field_data.get('label', '')}".lower()
            
            # Look for conditional language
            if any(word in field_text for word in ['if yes', 'if no', 'if you', 'when', 'unless']):
                conditional_logic['if_then_fields'].append({
                    'field_name': field_name,
                    'condition_text': field_text,
                    'field_type': field_data.get('field_type'),
                    'page': field_data.get('page')
                })
            
            # Look for mode-dependent fields
            if any(mode in field_text for mode in ['real-time', 'batch', 'b2b', 'web']):
                conditional_logic['mode_dependent_fields'].append({
                    'field_name': field_name,
                    'dependency': field_text,
                    'page': field_data.get('page')
                })
        
        return conditional_logic

    def _analyze_field_distribution(self, fields_data: Dict) -> Dict:
        """Analyze how fields are distributed across modes"""
        
        distribution = {
            'total_fields': len(fields_data),
            'by_type': {},
            'by_page': {},
            'by_section': {},
            'required_fields': 0,
            'optional_fields': 0
        }
        
        for field_name, field_data in fields_data.items():
            # Count by type
            field_type = field_data.get('field_type', 'unknown')
            distribution['by_type'][field_type] = distribution['by_type'].get(field_type, 0) + 1
            
            # Count by page
            page = field_data.get('page', 1)
            distribution['by_page'][f'page_{page}'] = distribution['by_page'].get(f'page_{page}', 0) + 1
            
            # Count required vs optional
            if field_data.get('required', False):
                distribution['required_fields'] += 1
            else:
                distribution['optional_fields'] += 1
        
        return distribution

    def _generate_recommendations(self) -> List[str]:
        """Generate recommendations for questionnaire implementation"""
        
        return [
            "Implement mode selection at the beginning of the questionnaire",
            "Use conditional logic to show/hide mode-specific sections",
            "Group common fields in shared sections",
            "Implement field validation based on mode requirements",
            "Consider progressive disclosure for complex conditional fields",
            "Add help text for mode-specific technical requirements",
            "Implement field dependencies for 'If Yes, please specify' type questions"
        ]

    def _save_analysis(self, analysis: Dict):
        """Save the analysis results"""
        
        output_dir = Path("extracted_fields")
        output_dir.mkdir(exist_ok=True)
        
        # Save JSON analysis
        with open(output_dir / "transaction_modes_analysis.json", 'w') as f:
            json.dump(analysis, f, indent=2, default=str)
        
        # Generate markdown report
        self._generate_markdown_report(analysis, output_dir / "transaction_modes_report.md")
        
        print(f"📊 Transaction mode analysis saved to:")
        print(f"   - {output_dir / 'transaction_modes_analysis.json'}")
        print(f"   - {output_dir / 'transaction_modes_report.md'}")

    def _generate_markdown_report(self, analysis: Dict, output_path: Path):
        """Generate a markdown report of the analysis"""
        
        with open(output_path, 'w') as f:
            f.write("# Transaction Modes Analysis Report\n\n")
            
            f.write("## Overview\n\n")
            f.write("This report analyzes the three transaction modes for X12 270/271 implementation:\n\n")
            f.write("1. **Real-time Web** - Web-based real-time transactions\n")
            f.write("2. **Real-time B2B** - Business-to-business real-time transactions\n")
            f.write("3. **EDI Batch** - Electronic Data Interchange batch processing\n\n")
            
            # Mode selection fields
            mode_fields = analysis.get('mode_selection_fields', {})
            f.write("## Mode Selection Fields\n\n")
            
            if mode_fields.get('mode_indicators'):
                f.write("### Mode Indicator Fields\n\n")
                for indicator in mode_fields['mode_indicators']:
                    f.write(f"- **{indicator['field_name']}**\n")
                    f.write(f"  - Type: {indicator['field_type']}\n")
                    f.write(f"  - Current Value: `{indicator['value']}`\n")
                    f.write(f"  - Page: {indicator['page']}\n\n")
            
            # Field distribution
            distribution = analysis.get('field_distribution', {})
            f.write("## Field Distribution\n\n")
            f.write(f"- **Total Fields**: {distribution.get('total_fields', 0)}\n")
            f.write(f"- **Required Fields**: {distribution.get('required_fields', 0)}\n")
            f.write(f"- **Optional Fields**: {distribution.get('optional_fields', 0)}\n\n")
            
            f.write("### By Field Type\n\n")
            for field_type, count in distribution.get('by_type', {}).items():
                f.write(f"- **{field_type}**: {count} fields\n")
            
            # Recommendations
            f.write("\n## Implementation Recommendations\n\n")
            for i, rec in enumerate(analysis.get('recommendations', []), 1):
                f.write(f"{i}. {rec}\n")

if __name__ == "__main__":
    analyzer = TransactionModeAnalyzer()
    analysis = analyzer.analyze_from_extracted_data()
    
    if analysis:
        print(f"\n✅ Analysis complete!")
        print(f"📋 Found {len(analysis['mode_selection_fields']['mode_indicators'])} mode indicator fields")
        print(f"📊 Analyzed {analysis['field_distribution']['total_fields']} total fields")
