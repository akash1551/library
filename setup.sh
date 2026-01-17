#!/bin/bash

# Text Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Library Setup ===${NC}"

# 1. Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${YELLOW}Error: Docker is not running. Please start Docker Desktop and try again.${NC}"
  exit 1
fi

# 2. Check for .env file
if [ ! -f .env ]; then
  echo -e "${YELLOW}Creating .env file from defaults...${NC}"
  cat <<EOT >> .env
# --- Django Settings ---
DJANGO_SECRET_KEY=django-insecure-1bxqll%q+#aeb0bj_269_6+58ejse=mp@)dojxvxzzx#e22g-v
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost 127.0.0.1 [::1] 0.0.0.0

# --- Database Settings ---
POSTGRES_ENGINE=django.db.backends.postgresql
POSTGRES_DB=library_db
POSTGRES_USER=library_user
POSTGRES_PASSWORD=library_password
POSTGRES_HOST=db
POSTGRES_PORT=5432

# --- Frontend Settings ---
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
EOT
  echo -e "${GREEN}✔ .env file created.${NC}"
else
  echo -e "${GREEN}✔ .env file found.${NC}"
fi

# 3. Build and Start Containers
echo -e "${BLUE}Building and starting containers (this may take a minute)...${NC}"
docker-compose up -d --build

# 4. Wait for Database to be ready
echo -e "${BLUE}Waiting for database to initialize...${NC}"
sleep 5

# 5. Run Migrations
echo -e "${BLUE}Running database migrations...${NC}"
docker-compose exec backend python manage.py migrate

# 6. Success Message
echo -e "${GREEN}=== Setup Complete! ===${NC}"
echo -e "Frontend: ${YELLOW}http://localhost:3000${NC}"
echo -e "Backend:  ${YELLOW}http://localhost:8000/api/v1/${NC}"
echo -e "To stop the app, run: ${YELLOW}docker-compose down${NC}"