import sys
import re

with open('app/lib/services/supabase/server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('""@supabase/ssr""', '"@supabase/ssr"')
content = content.replace('""next/headers""', '"next/headers"')
content = content.replace('""react""', '"react"')

with open('app/lib/services/supabase/server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
