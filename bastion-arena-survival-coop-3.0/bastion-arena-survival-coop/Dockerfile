FROM node:20-alpine

WORKDIR /app

# Dépendances d'abord (meilleur cache Docker)
COPY bastion-arena-survival-coop/package.json ./
RUN npm install --omit=dev

# Code du jeu et de l'API
COPY bastion-arena-survival-coop/ ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
