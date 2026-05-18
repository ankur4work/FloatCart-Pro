# Production deploy notes

This repo is prepared for a Git-based deploy to the dedicated FloatCart Pro domain without building the frontend directly on the VPS.

## Expected server layout

- App root: `/var/www/floatcart-pro`
- Active release symlink: `/var/www/floatcart-pro/current`
- PM2 app name: `floatcart-pro`
- Reverse proxy target: `127.0.0.1:3106`

## Required VPS software

- Node.js 20+
- npm
- PM2
- nginx

## GitHub Actions secrets

- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`
- `VPS_PORT`
- `VPS_APP_ROOT`
- `PRODUCTION_ENV`

`PRODUCTION_ENV` should contain the full contents of `web/.env.production.example` with real production values.

## Shopify production config

Use `shopify.app.production.toml` when you want to deploy Shopify config changes for the live app:

```bash
npm run deploy:prod
```

## Nginx

Install the vhost from the FloatCart Pro nginx config, then issue SSL with Certbot after the final domain is chosen.

```bash
sudo ln -s /var/www/floatcart-pro/current/deploy/nginx/REPLACE-WITH-FLOATCART-PRO-DOMAIN.conf /etc/nginx/sites-enabled/REPLACE-WITH-FLOATCART-PRO-DOMAIN.conf
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d REPLACE-WITH-FLOATCART-PRO-DOMAIN
```
