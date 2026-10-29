from PIL import Image, ImageOps
import base64
import io

source = Image.open('assets/la-isla-logo-original.jpg').convert('RGB')
gray = ImageOps.grayscale(source)
alpha = gray.point(lambda value: 0 if value <= 7 else min(255, int((value - 7) * 255 / 220)))
palm_full = Image.new('RGBA', source.size, (0, 0, 0, 0))
palm_full.putalpha(alpha)
region = palm_full.crop((220, 70, 730, 558))
bbox = region.getbbox()
palm = region.crop((max(0, bbox[0] - 8), max(0, bbox[1] - 8), bbox[2] + 8, bbox[3] + 8))

# Small, crisp, dark palm for the record label.
target_height = 382
target_width = round(palm.width * target_height / palm.height)
palm = palm.resize((target_width, target_height), Image.LANCZOS)
dark = Image.new('RGBA', palm.size, (7, 11, 8, 0))
dark.putalpha(palm.getchannel('A'))
dark.save('assets/la-isla-palm-dark.png', optimize=True)

buffer = io.BytesIO()
dark.save(buffer, format='PNG', optimize=True)
payload = base64.b64encode(buffer.getvalue()).decode('ascii')

svg = open('assets/hero-record.svg', encoding='utf-8').read()
start = svg.index('    <circle r="148" fill="#35f27a"/>')
end = svg.index('  </g>', start)
new_block = f'''    <circle r="148" fill="#35f27a"/>
    <circle r="154" fill="none" stroke="#070b08" stroke-opacity=".32"/>
    <image x="-88" y="-99" width="176" height="191" preserveAspectRatio="xMidYMid meet" opacity=".97" href="data:image/png;base64,{payload}"/>
'''
svg = svg[:start] + new_block + svg[end:]
open('assets/hero-record.svg', 'w', encoding='utf-8').write(svg)
print('updated', target_width, target_height, 'png bytes', len(buffer.getvalue()))
