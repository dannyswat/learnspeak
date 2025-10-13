#!/bin/bash

# Azure Speech SDK Setup Script for macOS
# This script downloads and installs the Azure Speech SDK C library for macOS

set -e

SCRIPT_DIR="$(cd -P -- "$(dirname -- "$0")" && pwd -P)"
LIB_DIR="${SCRIPT_DIR}/lib/speechsdk"
SDK_VERSION="1.43.0"
SDK_URL="https://csspeechstorage.blob.core.windows.net/drop/${SDK_VERSION}/MicrosoftCognitiveServicesSpeech-XCFramework-${SDK_VERSION}.zip"

echo "🎙️  Azure Speech SDK Setup for LearnSpeak"
echo "=========================================="
echo ""

# Check if already installed
if [ -d "${LIB_DIR}/MicrosoftCognitiveServicesSpeech.framework" ]; then
    echo "✅ Azure Speech SDK is already installed at ${LIB_DIR}"
    echo ""
    echo "To reinstall, run:"
    echo "  rm -rf ${LIB_DIR}"
    echo "  ./setup-speech-sdk.sh"
    exit 0
fi

echo "📦 Downloading Azure Speech SDK v${SDK_VERSION}..."
mkdir -p "${LIB_DIR}"
cd "${LIB_DIR}"

# Download SDK
curl -L -o speech-sdk.zip "${SDK_URL}"

echo "📂 Extracting SDK..."
unzip -q speech-sdk.zip

# Copy framework to lib directory
cp -r MicrosoftCognitiveServicesSpeech.xcframework/macos-arm64_x86_64/MicrosoftCognitiveServicesSpeech.framework .

# Cleanup
rm -rf MicrosoftCognitiveServicesSpeech.xcframework speech-sdk.zip

echo ""
echo "✅ Azure Speech SDK installed successfully!"
echo ""
echo "📍 Location: ${LIB_DIR}/MicrosoftCognitiveServicesSpeech.framework"
echo ""
echo "Next steps:"
echo "  1. Configure your Azure credentials in backend/.env"
echo "  2. Run: ./build.sh"
echo ""
echo "See docs/AZURE_TTS_SETUP.md for detailed setup instructions."
