#!/usr/bin/env python3
"""
Convert Complete Questionnaire to Backend Format

This script converts the extracted complete questionnaire JSON to the proper
TypeScript backend format with correct types and conditional logic.
"""

import json
from pathlib import Path

def convert_questionnaire_to_backend():
    """Convert the complete questionnaire to backend TypeScript format"""
    
    # Load the complete questionnaire
    questionnaire_path = Path("extracted_fields/complete_questionnaire.json")
    if not questionnaire_path.exists():
        print("❌ complete_questionnaire.json not found")
        return
    
    with open(questionnaire_path, 'r') as f:
        questionnaire = json.load(f)
    
    # Convert to backend format
    backend_questionnaire = {
        "id": questionnaire["id"],
        "title": questionnaire["title"],
        "description": questionnaire["description"],
        "version": questionnaire["version"],
        "transactionType": questionnaire["transactionType"],
        "createdAt": "new Date('2024-01-01')",
        "updatedAt": "new Date()",
        "createdBy": "system",
        "isActive": True,
        "sections": []
    }
    
    # Convert sections
    for section in questionnaire["sections"]:
        backend_section = {
            "id": section["id"],
            "title": section["title"],
            "description": section.get("description", ""),
            "order": section["order"],
            "questions": [],
            "conditionalLogic": convert_conditional_logic(section.get("conditionalLogic"))
        }
        
        # Convert questions
        for question in section["questions"]:
            backend_question = {
                "id": question["id"],
                "type": f"QuestionType.{map_question_type(question['type']).upper()}",
                "title": question["title"],
                "description": question.get("description", ""),
                "required": question["required"],
                "attachmentRequired": False
            }
            
            # Add options if present
            if question.get("options"):
                backend_question["options"] = [
                    {
                        "value": opt["value"],
                        "label": opt["label"],
                        "description": opt.get("description", "")
                    }
                    for opt in question["options"]
                ]
            
            # Add validation if present
            if question.get("validation"):
                backend_question["validation"] = question["validation"]
            
            # Add conditional logic if present
            if question.get("conditionalLogic"):
                backend_question["conditionalLogic"] = convert_conditional_logic(question["conditionalLogic"])
            
            # Add X12 field mapping if present
            if question.get("x12Field"):
                backend_question["x12Field"] = question["x12Field"]
            
            backend_section["questions"].append(backend_question)
        
        # Remove conditionalLogic if None
        if not backend_section["conditionalLogic"]:
            del backend_section["conditionalLogic"]
        
        backend_questionnaire["sections"].append(backend_section)
    
    # Generate TypeScript file
    generate_typescript_file(backend_questionnaire)

def map_question_type(question_type: str) -> str:
    """Map question type to backend enum"""
    type_mapping = {
        "text": "TEXT",
        "email": "EMAIL",
        "url": "URL",
        "textarea": "TEXTAREA",
        "display": "DISPLAY",
        "radio": "RADIO",
        "checkbox": "CHECKBOX",
        "select": "SELECT",
        "multi_select": "MULTI_SELECT",
        "date": "DATE",
        "number": "NUMBER"
    }
    return type_mapping.get(question_type, "TEXT")

def convert_conditional_logic(logic):
    """Convert conditional logic to backend format"""
    if not logic:
        return None
    
    backend_logic = {}
    
    if logic.get("dependsOn"):
        backend_logic["dependsOn"] = logic["dependsOn"]
    
    if logic.get("showWhen"):
        backend_logic["showWhen"] = logic["showWhen"]
    
    if logic.get("hideWhen"):
        backend_logic["hideWhen"] = logic["hideWhen"]
    
    # Handle mode-specific logic
    if logic.get("requiredModes"):
        backend_logic["requiredModes"] = [
            f"ImplementationMode.{mode.upper()}" 
            for mode in logic["requiredModes"]
        ]
    
    return backend_logic if backend_logic else None

def generate_typescript_file(questionnaire):
    """Generate the TypeScript file"""
    
    output_path = Path("backend/src/data/x12-270-271-complete.ts")
    
    # Generate TypeScript content
    ts_content = f'''import {{ Questionnaire, QuestionType, ImplementationMode }} from '../types/questionnaire';

export const x12270271CompleteQuestionnaire: Questionnaire = {{
  id: '{questionnaire["id"]}',
  title: '{questionnaire["title"]}',
  description: '{questionnaire["description"]}',
  version: '{questionnaire["version"]}',
  transactionType: '{questionnaire["transactionType"]}',
  createdAt: {questionnaire["createdAt"]},
  updatedAt: {questionnaire["updatedAt"]},
  createdBy: '{questionnaire["createdBy"]}',
  isActive: {str(questionnaire["isActive"]).lower()},
  sections: [
'''
    
    # Add sections
    for i, section in enumerate(questionnaire["sections"]):
        ts_content += f'''    {{
      id: '{section["id"]}',
      title: '{section["title"]}',
      description: '{section["description"]}',
      order: {section["order"]},'''
        
        # Add conditional logic if present
        if section.get("conditionalLogic"):
            logic = section["conditionalLogic"]
            ts_content += f'''
      conditionalLogic: {{'''
            
            if logic.get("dependsOn"):
                ts_content += f'''
        dependsOn: '{logic["dependsOn"]}','''
            
            if logic.get("showWhen"):
                show_when = "', '".join(logic["showWhen"])
                ts_content += f'''
        showWhen: ['{show_when}'],'''
            
            if logic.get("requiredModes"):
                modes = ", ".join(logic["requiredModes"])
                ts_content += f'''
        requiredModes: [{modes}],'''
            
            ts_content += '''
      },'''
        
        ts_content += f'''
      questions: [
'''
        
        # Add all questions
        for j, question in enumerate(section["questions"]):
            ts_content += f'''        {{
          id: '{question["id"]}',
          type: {question["type"]},
          title: '{escape_string(question["title"])}',
          description: '{escape_string(question.get("description", ""))}',
          required: {str(question["required"]).lower()},
          attachmentRequired: false'''
            
            # Add options if present
            if question.get("options"):
                ts_content += f''',
          options: [
'''
                for option in question["options"]:
                    ts_content += f'''            {{ value: '{option["value"]}', label: '{escape_string(option["label"])}' }},
'''
                ts_content += '''          ]'''
            
            # Add validation if present
            if question.get("validation"):
                validation = question["validation"]
                ts_content += f''',
          validation: {{'''
                
                if validation.get("maxLength"):
                    ts_content += f'''
            maxLength: {validation["maxLength"]},'''
                
                if validation.get("pattern"):
                    ts_content += f'''
            pattern: '{validation["pattern"]}','''
                
                ts_content += '''
          }'''
            
            # Add conditional logic if present
            if question.get("conditionalLogic"):
                logic = question["conditionalLogic"]
                ts_content += f''',
          conditionalLogic: {{
            dependsOn: '{logic["dependsOn"]}',
            showWhen: ['{("', '".join(logic["showWhen"]))}']
          }}'''
            
            # Add X12 field if present
            if question.get("x12Field"):
                x12 = question["x12Field"]
                ts_content += f''',
          x12Field: {{
            segment: '{x12.get("segment", "")}',
            description: '{escape_string(x12.get("description", ""))}'
          }}'''
            
            ts_content += f'''
        }}{',' if j < len(section["questions"]) - 1 else ''}
'''
        
        ts_content += f'''      ]
    }}{',' if i < len(questionnaire["sections"]) - 1 else ''}
'''
    
    ts_content += '''  ]
};
'''
    
    # Write the file
    with open(output_path, 'w') as f:
        f.write(ts_content)
    
    print(f"✅ Generated TypeScript questionnaire: {output_path}")
    print(f"📊 {len(questionnaire['sections'])} sections")
    print(f"📋 {sum(len(s['questions']) for s in questionnaire['sections'])} total questions")

def escape_string(text: str) -> str:
    """Escape string for TypeScript"""
    if not text:
        return ""
    return text.replace("'", "\\'").replace('"', '\\"').replace('\n', '\\n')

if __name__ == "__main__":
    convert_questionnaire_to_backend()
