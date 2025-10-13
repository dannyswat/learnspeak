SCRIPT_DIR="$(cd -P -- "$(dirname -- "$0")" && pwd -P)"
cd "$SCRIPT_DIR"

# Set CGO flags for Azure Speech SDK
export CGO_CFLAGS="-I${SCRIPT_DIR}/lib/speechsdk/MicrosoftCognitiveServicesSpeech.framework/Headers"
export CGO_LDFLAGS="-F${SCRIPT_DIR}/lib/speechsdk -framework MicrosoftCognitiveServicesSpeech -Wl,-rpath,${SCRIPT_DIR}/lib/speechsdk"

go build -o learnspeak-api main.go