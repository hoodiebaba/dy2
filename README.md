# dy2

`dy2` uses:

- Next.js frontend: `dplus_frontend-devServer`
- Python backend: `dplus_backend-devServer`

## Frontend setup

### Windows

```powershell
cd dplus_frontend-devServer
npm install
copy .env.example .env.local
npm run dev
```

### macOS / Linux

```bash
cd dplus_frontend-devServer
npm install
cp .env.example .env.local
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## Backend setup

See:

- `dplus_backend-devServer/README.md`

## Environment notes

Frontend supports explicit backend base URL override:

```text
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8060
```

If not set, frontend uses the same hostname as the browser and port `8060`.

## GIS notes

For GIS Engine, also set:

```text
NEXT_PUBLIC_GIS_BASE_URL=http://your-gis-host:8060
NEXT_PUBLIC_GIS_TOKEN=your-gis-token
```

GIS may require VPN or network access to the remote GIS host.
