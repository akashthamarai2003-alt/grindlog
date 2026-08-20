import os
import re

for root, dirs, files in os.walk('app'):
    if 'node_modules' in root or '.next' in root:
        continue
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Find all await supabase...
            matches = re.findall(r'await\s+supabase\.', content)
            if len(matches) > 1:
                # check if there's no Promise.all
                if 'Promise.all' not in content:
                    print(f"Potential waterfall in {filepath} ({len(matches)} awaits)")
