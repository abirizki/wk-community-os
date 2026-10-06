import re

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove Header Komando Eksekutif RW (from {/* 1. Header Komando Eksekutif RW */} to its closing div before Pesan Sukses Aksi)
    content = re.sub(r'\{\/\*\s*1\.\s*Header Komando Eksekutif (?:RW|RT)\s*\*\/\}.*?(?=\{\/\*\s*Pesan Sukses Aksi\s*\*\/|\{\/\*\s*0\.\s*Persona Mode Switcher)', '', content, flags=re.DOTALL)
    
    # 2. Remove KANAYA AI Strategic Briefing Card (from {/* 1. Hero Section: KANAYA AI Strategic Briefing Card */} to its closing div before {/* 2. Super Apps Bento)
    content = re.sub(r'\{\/\*\s*1\.\s*Hero Section:\s*KANAYA AI Strategic Briefing Card.*?(?=\{\/\*\s*2\.\s*Super Apps Bento)', '', content, flags=re.DOTALL)

    # 3. Remove Sub-Tabs Navigasi (from {/* 2. Sub-Tabs Navigasi Meja Kerja */} to its closing div before {/* TAB 1:)
    content = re.sub(r'\{\/\*\s*2\.\s*Sub-Tabs Navigasi Meja Kerja.*?(?=\{\/\*\s*={10,}\s*\*\/|\{\/\*\s*TAB 1:)', '', content, flags=re.DOTALL)

    # 4. In DashboardKetuaRT.jsx, also check for Action Center or other legacy blocks that might be there
    content = re.sub(r'\{\/\*\s*Toast Notifikasi Berhasil & Error\s*\*\/\}.*?(?=\{\/\*\s*0\.\s*Persona Mode Switcher)', '', content, flags=re.DOTALL)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

process_file('frontend/src/pages/dashboard/DashboardKetuaRW.jsx')
process_file('frontend/src/pages/dashboard/DashboardKetuaRT.jsx')
