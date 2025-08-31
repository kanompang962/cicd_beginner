# CI/CD Beginner Project

This project demonstrates a full CI/CD pipeline for deploying a web application consisting of an Angular frontend and a .NET 8 backend, containerized using Docker, and deployed to a VPS with Nginx as a reverse proxy. The application is accessible at [tainchaidev.online](https://tainchaidev.online).

## Project Overview

The project is a simple web application with:
- **Frontend**: An Angular application (`cicd-beginner-web`) serving a user interface.
- **Backend**: A .NET 8 API (`cicd-beginner-api`) providing RESTful endpoints, including `/` and `/health`.
- **Infrastructure**: Docker containers managed by Docker Compose, deployed on a VPS with Nginx as a reverse proxy.
- **CI/CD Pipeline**: Automated build, test, and deployment using GitHub Actions.

The application is deployed to a VPS and accessible via:
- Frontend: `https://tainchaidev.online`
- Backend API: `https://tainchaidev.online/api`

## Architecture

- **Frontend (Angular)**:
  - Built with Angular and served via an Nginx-based Docker container.
  - Hosted on port 8080 (mapped to port 80 inside the container).
  - Configured to communicate with the backend API at `https://tainchaidev.online/api`.

- **Backend (.NET 8)**:
  - A .NET 8 REST API with endpoints:
    - `/`: Returns a welcome message (`"Hello from .NET 8 API!"`).
    - `/health`: Returns health status (`"Healthy"`).
  - Hosted on port 5208 (mapped to port 8080 inside the container).
  - Configured with CORS to allow requests from `https://tainchaidev.online` and `http://localhost:8080`.

- **Docker Compose**:
  - Manages two services: `web` (Angular) and `api` (.NET).
  - Uses a bridge network (`cicd_beginner-network`) for communication between containers.
  - Includes health checks to ensure the API is healthy before the frontend starts.

- **Nginx**:
  - Acts as a reverse proxy on the VPS.
  - Routes requests:
    - `/` to the Angular frontend (`http://localhost:8080`).
    - `/api/` to the .NET API (`http://localhost:5208`).
  - Configured to support HTTPS using Let's Encrypt (optional).

## CI/CD Pipeline

The CI/CD pipeline is implemented using GitHub Actions and consists of three main jobs:

1. **Build and Test**:
   - Runs on every push or pull request to the `main` branch.
   - Sets up Node.js (v20) for the Angular frontend and .NET 8 for the backend.
   - Installs dependencies, builds, and runs tests for both frontend and backend.
   - Frontend tests use `ChromeHeadless` for headless browser testing.

2. **Build and Push Docker Images**:
   - Triggered on push to the `main` branch.
   - Builds Docker images for the frontend (`kanompang962/cicd-beginner-web:latest`) and backend (`kanompang962/cicd-beginner-api:latest`).
   - Pushes images to Docker Hub using credentials stored in GitHub Secrets.

3. **Deploy**:
   - Triggered after successful Docker image builds.
   - Copies the `docker-compose.yml` file to the VPS using `appleboy/scp-action`.
   - SSHs into the VPS using `appleboy/ssh-action` to:
     - Pull the latest Docker images.
     - Start the containers with `docker-compose up -d`.

## Deployment Setup

- **VPS Configuration**:
  - Ubuntu server with Docker and Docker Compose installed.
  - Nginx configured as a reverse proxy to route traffic to the Docker containers.
  - Firewall (e.g., `ufw`) configured to allow ports 80, 8080, and 5208.

- **Nginx Configuration** (`/etc/nginx/sites-available/tainchai`):
  ```nginx
  server {
      listen 80;
      server_name tainchaidev.online;

      location / {
          proxy_pass http://localhost:8080;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
      }

      location /api/ {
          proxy_pass http://localhost:5208;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
      }
  }
  ```

- **Docker Compose** (`docker-compose.yml`):
  ```yaml
  version: '3.8'
  services:
    api:
      image: kanompang962/cicd-beginner-api:latest
      container_name: dotnet-api
      ports:
        - "5208:8080"
      environment:
        - ASPNETCORE_ENVIRONMENT=Production
        - ASPNETCORE_URLS=http://+:8080
        - CORS_ORIGINS=http://tainchaidev.online,http://localhost:8080,https://tainchaidev.online
      networks:
        - cicd_beginner-network
      healthcheck:
        test: ["CMD-SHELL", "curl -f http://localhost:8080/ || wget -q --spider http://localhost:8080/ || timeout 5s bash -c '</dev/tcp/localhost/8080' || exit 1"]
        interval: 30s
        timeout: 10s
        retries: 3
        start_period: 40s
    web:
      image: kanompang962/cicd-beginner-web:latest
      container_name: angular-web
      ports:
        - "8080:80"
      depends_on:
        api:
          condition: service_healthy
      networks:
        - cicd_beginner-network
      environment:
        - NODE_ENV=production
        - API_URL=http://tainchaidev.online:5208
  networks:
    cicd_beginner-network:
      driver: bridge
  ```

## Setup and Deployment Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/<your-username>/cicd_beginner.git
   cd cicd_beginner
   ```

2. **Set Up GitHub Secrets**:
   - Add the following secrets in your GitHub repository settings:
     - `DOCKER_USERNAME`: Docker Hub username.
     - `DOCKER_PASSWORD`: Docker Hub password or access token.
     - `VPS_HOST`: IP address of the VPS.
     - `VPS_USERNAME`: SSH username for the VPS.
     - `VPS_SSH_KEY`: SSH private key for the VPS.

3. **VPS Setup**:
   - Install Docker, Docker Compose, and Nginx on the VPS.
   - Configure Nginx with the provided `tainchai` configuration.
   - Ensure firewall settings allow ports 80, 8080, and 5208.

4. **Run Locally (Optional)**:
   - Copy `docker-compose.yml` to your VPS or local machine.
   - Run:
     ```bash
     docker-compose up -d
     ```
   - Access the application at `http://localhost:8080` (frontend) and `http://localhost:5208` (API).

5. **Access the Deployed Application**:
   - Frontend: `https://tainchaidev.online`
   - API: `https://tainchaidev.online/api`

## Troubleshooting

- **Nginx shows default page**:
  - Remove `/etc/nginx/sites-enabled/default` and restart Nginx:
    ```bash
    sudo rm /etc/nginx/sites-enabled/default
    sudo systemctl restart nginx
    ```

- **API endpoint issues**:
  - Check container logs:
    ```bash
    docker logs dotnet-api
    ```
  - Test endpoints directly:
    ```bash
    curl -I http://localhost:5208
    curl -I http://localhost:5208/health
    ```

- **DNS issues**:
  - Verify DNS resolution for `tainchaidev.online`:
    ```bash
    ping tainchaidev.online
    ```
  - Update DNS records with your domain provider if needed.

- **Pipeline failures**:
  - Check GitHub Actions logs for errors in `build-and-test`, `build-and-push-docker`, or `deploy` jobs.
  - Verify GitHub Secrets are correctly configured.

## Future Improvements

- **HTTPS**: Configure Let's Encrypt for SSL:
  ```bash
  sudo apt install certbot python3-certbot-nginx
  sudo certbot --nginx -d tainchaidev.online
  ```
- **Monitoring**: Add Prometheus and Grafana for monitoring container performance.
- **Scaling**: Use Docker Swarm or Kubernetes for horizontal scaling.
- **Logging**: Implement centralized logging with ELK Stack or similar.

## License

This project is licensed under the MIT License.