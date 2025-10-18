#!/bin/bash

# LearnSpeak Docker Build Script
# This script helps build and manage Docker containers

set -e

SCRIPT_DIR="$(cd -P -- "$(dirname -- "$0")" && pwd -P)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_speech_sdk() {
    # Check if Linux Speech SDK libraries are available
    if [ -d "backend/lib/speechsdk-linux/amd64" ]; then
        print_info "✓ Azure Speech SDK for Linux found (amd64)"
        return 0
    else
        print_warn "Azure Speech SDK for Linux not found"
        print_info "Run: cd backend && ./setup-speech-sdk-linux.sh"
        print_info "This downloads the SDK for linux/amd64 platform"
        return 1
    fi
}

check_env_file() {
    if [ ! -f ".env" ]; then
        print_warn ".env file not found"
        print_info "Creating .env from backend/.env.example..."
        cp backend/.env.example .env
        print_warn "Please edit .env file with your configuration before deploying"
    else
        print_info "✓ .env file found"
    fi
}

show_usage() {
    cat << EOF
LearnSpeak Docker Build Script

Usage: $0 [COMMAND]

Commands:
    build           Build the production Docker image
    build-dev       Build using development docker-compose
    up              Start production containers (build if needed)
    up-dev          Start development containers
    down            Stop and remove containers
    logs            View container logs
    clean           Stop containers and remove volumes (WARNING: deletes data)
    rebuild         Clean build from scratch
    shell           Open shell in running container
    db-shell        Open PostgreSQL shell
    backup          Backup database and uploads
    restore         Restore from backup
    help            Show this help message

Examples:
    $0 build        # Build production image
    $0 up           # Start production environment
    $0 logs         # View logs
    $0 shell        # Access container shell

EOF
}

build_production() {
    print_info "Building production Docker image..."
    
    # Check if Speech SDK is available
    if [ ! -d "backend/lib/speechsdk-linux/amd64" ]; then
        print_error "Azure Speech SDK for Linux not found"
        print_info "Run the following command first:"
        print_info "  cd backend && ./setup-speech-sdk-linux.sh"
        exit 1
    fi
    
    print_info "Building for linux/amd64 platform..."
    print_info "This may take several minutes..."
    echo ""
    
    # Force build for linux/amd64 platform (important on ARM Macs)
    docker build --platform linux/amd64 -t dannyswat/learnspeak:latest .
    
    print_info "✓ Build complete!"
    print_info "Image supports: linux/amd64"
}

build_dev() {
    print_info "Building development containers..."
    docker-compose build
    print_info "✓ Build complete!"
}

start_production() {
    print_info "Starting production environment..."
    check_env_file
    check_speech_sdk
    docker-compose -f docker-compose.prod.yml up -d
    print_info "✓ Containers started!"
    print_info "Application: http://localhost:8080"
    print_info "API Health: http://localhost:8080/api/v1/health"
}

start_dev() {
    print_info "Starting development environment..."
    docker-compose up -d
    print_info "✓ Containers started!"
    print_info "Frontend: http://localhost:5173"
    print_info "Backend: http://localhost:8080"
}

stop_containers() {
    print_info "Stopping containers..."
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    docker-compose down 2>/dev/null || true
    print_info "✓ Containers stopped"
}

view_logs() {
    print_info "Viewing logs (Ctrl+C to exit)..."
    docker-compose -f docker-compose.prod.yml logs -f 2>/dev/null || \
    docker-compose logs -f
}

clean_all() {
    print_warn "This will delete ALL data including database and uploads!"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning up..."
        docker-compose -f docker-compose.prod.yml down -v 2>/dev/null || true
        docker-compose down -v 2>/dev/null || true
        docker system prune -f
        print_info "✓ Cleanup complete"
    else
        print_info "Cancelled"
    fi
}

rebuild_all() {
    print_info "Rebuilding from scratch..."
    stop_containers
    print_info "Building new image..."
    build_production
    print_info "Starting containers..."
    start_production
    print_info "✓ Rebuild complete!"
}

open_shell() {
    print_info "Opening shell in container..."
    docker-compose -f docker-compose.prod.yml exec app sh 2>/dev/null || \
    docker-compose exec backend sh
}

open_db_shell() {
    print_info "Opening PostgreSQL shell..."
    docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres learnspeak 2>/dev/null || \
    docker-compose exec postgres psql -U learnspeak learnspeak
}

backup_data() {
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    print_info "Creating backup in $BACKUP_DIR..."
    
    # Backup database
    print_info "Backing up database..."
    docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U postgres learnspeak > "$BACKUP_DIR/database.sql" 2>/dev/null || \
    docker-compose exec -T postgres pg_dump -U learnspeak learnspeak > "$BACKUP_DIR/database.sql"
    
    # Backup uploads
    print_info "Backing up uploads..."
    docker run --rm -v learnspeak_uploads_data:/data -v "$(pwd)/$BACKUP_DIR":/backup alpine tar czf /backup/uploads.tar.gz /data
    
    print_info "✓ Backup complete: $BACKUP_DIR"
}

restore_data() {
    if [ -z "$1" ]; then
        print_error "Please specify backup directory"
        echo "Usage: $0 restore <backup_directory>"
        exit 1
    fi
    
    if [ ! -d "$1" ]; then
        print_error "Backup directory not found: $1"
        exit 1
    fi
    
    print_warn "This will replace current data with backup!"
    read -p "Continue? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cancelled"
        exit 0
    fi
    
    print_info "Restoring from $1..."
    
    # Restore database
    if [ -f "$1/database.sql" ]; then
        print_info "Restoring database..."
        cat "$1/database.sql" | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres learnspeak
    fi
    
    # Restore uploads
    if [ -f "$1/uploads.tar.gz" ]; then
        print_info "Restoring uploads..."
        docker run --rm -v learnspeak_uploads_data:/data -v "$(pwd)/$1":/backup alpine tar xzf /backup/uploads.tar.gz -C /
    fi
    
    print_info "✓ Restore complete"
}

# Main command handler
case "${1:-help}" in
    build)
        build_production
        ;;
    build-dev)
        build_dev
        ;;
    up)
        start_production
        ;;
    up-dev)
        start_dev
        ;;
    down)
        stop_containers
        ;;
    logs)
        view_logs
        ;;
    clean)
        clean_all
        ;;
    rebuild)
        rebuild_all
        ;;
    shell)
        open_shell
        ;;
    db-shell)
        open_db_shell
        ;;
    backup)
        backup_data
        ;;
    restore)
        restore_data "$2"
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        show_usage
        exit 1
        ;;
esac
