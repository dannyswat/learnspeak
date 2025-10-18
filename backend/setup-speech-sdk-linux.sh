#!/bin/bash

# Setup Azure Speech SDK for Linux (Docker builds)
# Downloads amd64 version only (ARM64 not available from Azure)

set -e

SCRIPT_DIR="$(cd -P -- "$(dirname -- "$0")" && pwd -P)"
cd "$SCRIPT_DIR"

SDK_VERSION="1.43.0"
LIB_DIR="$SCRIPT_DIR/lib/speechsdk-linux"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Setting up Azure Speech SDK for Linux (amd64)...${NC}"

# Create lib directory
mkdir -p "$LIB_DIR"

# Download amd64 version
echo -e "${YELLOW}Downloading Speech SDK for Linux amd64...${NC}"
AMD64_URL="https://csspeechstorage.blob.core.windows.net/drop/${SDK_VERSION}/SpeechSDK-Linux-${SDK_VERSION}.tar.gz"
AMD64_TAR="$LIB_DIR/SpeechSDK-Linux-amd64-${SDK_VERSION}.tar.gz"

if [ ! -f "$AMD64_TAR" ]; then
    curl -L "$AMD64_URL" -o "$AMD64_TAR"
    echo -e "${GREEN}✓ Downloaded amd64 SDK${NC}"
else
    echo -e "${GREEN}✓ amd64 SDK already downloaded${NC}"
fi

# Extract amd64
AMD64_DIR="$LIB_DIR/amd64"
if [ ! -d "$AMD64_DIR/lib" ]; then
    echo "Extracting amd64 SDK..."
    mkdir -p "$AMD64_DIR"
    tar -xzf "$AMD64_TAR" -C "$AMD64_DIR"
    echo -e "${GREEN}✓ Extracted amd64 SDK${NC}"
else
    echo -e "${GREEN}✓ amd64 SDK already extracted${NC}"
fi

echo ""
echo -e "${GREEN}✓ Azure Speech SDK for Linux (amd64) setup complete!${NC}"
echo ""
echo "SDK location:"
echo "  - amd64: $AMD64_DIR"
echo ""
echo "You can now build the Docker image:"
echo "  cd .. && ./docker-build.sh build"
