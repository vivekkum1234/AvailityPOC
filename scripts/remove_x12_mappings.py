#!/usr/bin/env python3
"""
Remove X12 Field Mappings from Backend TypeScript File

This script removes all x12Field mappings from the backend TypeScript file
to clean up the UI and remove the yellow highlighting.
"""

from pathlib import Path

def remove_x12_mappings():
    """Remove all x12Field mappings from the backend TypeScript file"""

    backend_file = Path("backend/src/data/x12-270-271-complete.ts")

    if not backend_file.exists():
        print("❌ Backend TypeScript file not found")
        return

    # Read the file line by line
    with open(backend_file, 'r') as f:
        lines = f.readlines()

    # Process lines to remove x12Field blocks
    cleaned_lines = []
    i = 0
    removed_count = 0

    while i < len(lines):
        line = lines[i]

        # Check if this line starts an x12Field block
        if 'x12Field:' in line and '{' in line:
            # Skip this line and find the closing brace
            removed_count += 1
            i += 1
            brace_count = 1

            # Skip lines until we find the matching closing brace
            while i < len(lines) and brace_count > 0:
                current_line = lines[i]
                brace_count += current_line.count('{')
                brace_count -= current_line.count('}')
                i += 1

            # Also remove the comma from the previous line if it exists
            if cleaned_lines and cleaned_lines[-1].rstrip().endswith(','):
                # Check if the line before the comma has content other than whitespace
                prev_line = cleaned_lines[-1].rstrip()
                if prev_line.endswith(','):
                    # Remove the trailing comma
                    cleaned_lines[-1] = prev_line[:-1] + '\n'
        else:
            cleaned_lines.append(line)
            i += 1

    # Write the cleaned content back
    with open(backend_file, 'w') as f:
        f.writelines(cleaned_lines)

    print(f"✅ Removed {removed_count} x12Field mappings from {backend_file}")
    print("🎨 UI should no longer show yellow highlighting for phone/email fields")

if __name__ == "__main__":
    remove_x12_mappings()
