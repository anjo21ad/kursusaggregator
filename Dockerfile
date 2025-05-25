# Base image med Node.js (slim Alpine variant for mindre størrelse)
FROM node:18-alpine

# Definér arbejdsdirectory i containeren
WORKDIR /app

# Kopiér package.json og lock-filen ind i containeren
COPY frontend/package*.json ./

# Installer afhængigheder
RUN npm install

# Kopiér resten af app-koden
COPY frontend/. .

# Byg Next.js appen (produktion build)
RUN npm run build

# Exponér port 3000
EXPOSE 3000

# Start app i production mode
CMD ["npm", "run", "start"]
