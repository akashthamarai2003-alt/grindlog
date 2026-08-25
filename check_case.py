import os
import re

def check_imports(root_dir):
    tsconfig_paths = {
        "@/": "c:/manage/web/app/"
    }
    
    import_pattern = re.compile(r'import\s+.*?\s+from\s+[\'"](.*?)[\'"]')
    dynamic_import_pattern = re.compile(r'import\([\'"](.*?)[\'"]\)')
    
    errors = []
    
    for dirpath, _, filenames in os.walk(root_dir):
        if 'node_modules' in dirpath or '.next' in dirpath:
            continue
            
        for file in filenames:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                filepath = os.path.join(dirpath, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    imports = import_pattern.findall(content) + dynamic_import_pattern.findall(content)
                    
                    for imp in imports:
                        if imp.startswith('.'):
                            # Relative path
                            target = os.path.normpath(os.path.join(dirpath, imp))
                        elif imp.startswith('@/'):
                            # Absolute path
                            target = os.path.normpath(os.path.join(tsconfig_paths['@/'], imp[2:]))
                        else:
                            continue
                            
                        # Check if it exists with exact casing
                        target_dir = os.path.dirname(target)
                        target_base = os.path.basename(target)
                        
                        if not os.path.exists(target_dir):
                            # Could be an extensionless import
                            pass
                            
                        if os.path.exists(target_dir):
                            # Check files in directory
                            actual_files = os.listdir(target_dir)
                            
                            # Remove extensions for comparison if needed
                            match_found = False
                            for actual in actual_files:
                                actual_no_ext = os.path.splitext(actual)[0]
                                if actual == target_base or actual_no_ext == target_base:
                                    if actual != target_base and actual_no_ext != target_base:
                                        # Case mismatch!
                                        pass
                                    else:
                                        match_found = True
                                        break
                                        
                            if not match_found:
                                # Look for case mismatch
                                for actual in actual_files:
                                    actual_no_ext = os.path.splitext(actual)[0]
                                    if actual.lower() == target_base.lower() or actual_no_ext.lower() == target_base.lower():
                                        errors.append(f"Case mismatch in {filepath}: imported '{imp}' but actual file is '{actual}'")
                except Exception as e:
                    pass
                    
    return errors

if __name__ == '__main__':
    errs = check_imports('c:/manage/web/app')
    if errs:
        for e in errs:
            print(e)
    else:
        print("No case mismatches found.")
