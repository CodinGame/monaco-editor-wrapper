#!/bin/bash
set -e

mkdir -p extensions
while read extension
do
    publisher=$(echo "$extension" | jq -r '.publisher')
    name=$(echo "$extension" | jq -r '.name')
    version=$(echo "$extension" | jq -r '.version')
    echo "Fetching $publisher.$name:$version"
    file="extensions/$publisher.$name-$version.vsix"

    if test -f "$file"; then
        echo "File already exists"
    else
        rm -f extensions/$publisher.$name-*.vsix
        echo "Downloading..."
        curl -f "https://$publisher.gallery.vsassets.io/_apis/public/gallery/publisher/$publisher/extension/$name/$version/assetbyname/Microsoft.VisualStudio.Services.VSIXPackage" -o $file
    fi
done < <(jq -c '.[]' vscode-extensions.json)