FROM node:18-alpine

ARG SHOPIFY_API_KEY
ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY
EXPOSE 8081
WORKDIR /app
COPY web .
# Install with devDeps so the Vite build works (NODE_ENV=production skips devDeps)
RUN npm install --include=dev
RUN cd frontend && npm install --include=dev && npm run build
ENV NODE_ENV=production
CMD ["npm", "run", "serve"]
