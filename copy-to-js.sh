#!/bin/bash
cd /data_n001/wtgehs-static/assets

# Find all .lean.js files recursively and copy to .js
find . -name "*.lean.js" -type f | while read f; do
    # Create .js path by replacing .lean.js with .js
    js_file="${f%.lean.js}.js"
    if [ ! -f "$js_file" ]; then
        cp "$f" "$js_file"
        echo "COPY: $f -> $js_file"
    fi
done

echo "Done!"
