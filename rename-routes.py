import os

def rename_routes(directory):
    for root, _, files in os.walk(directory):
        if 'node_modules' in root or '.next' in root:
            continue
        for file in files:
            if file.endswith('.ts') or file.endswith('.tsx'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    new_content = content
                    # Double quotes
                    new_content = new_content.replace('"/fitness/', '"/')
                    new_content = new_content.replace('"/fitness"', '"/"')
                    new_content = new_content.replace('"/fitness?', '"/?')
                    
                    # Single quotes
                    new_content = new_content.replace("'/fitness/", "'/")
                    new_content = new_content.replace("'/fitness'", "'/'")
                    new_content = new_content.replace("'/fitness?", "'/?")
                    
                    # Backticks
                    new_content = new_content.replace('`/fitness/', '`/')
                    new_content = new_content.replace('`/fitness`', '`/`')
                    new_content = new_content.replace('`/fitness?', '`/?')
                    
                    if content != new_content:
                        with open(path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Updated {path}")
                except Exception as e:
                    print(f"Error reading {path}: {e}")

if __name__ == '__main__':
    rename_routes('c:/manage/web/app')
