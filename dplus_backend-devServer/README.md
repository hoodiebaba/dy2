# dy2 Python Backend

This backend serves authentication, profile-related data, and GIS/data APIs for the `dy2` portal.

## Required files

- Copy `.env.example` to `.env`
- Install Python dependencies from `requirements.txt`

## Backend setup

### Windows

```powershell
cd dplus_backend-devServer
py -m venv .venv312
.venv312\Scripts\python.exe -m pip install --upgrade pip
.venv312\Scripts\python.exe -m pip install -r requirements.txt
copy .env.example .env
.venv312\Scripts\python.exe -u main.py
```

### macOS / Linux

```bash
cd dplus_backend-devServer
python3 -m venv .venv312
./.venv312/bin/python -m pip install --upgrade pip
./.venv312/bin/python -m pip install -r requirements.txt
cp .env.example .env
./.venv312/bin/python -u main.py
```

## Default backend URL

```text
http://127.0.0.1:8060
```

## Quick health check

```bash
curl -I http://127.0.0.1:8060
```

## Notes

- Frontend login and profile will not work unless this backend is running.
- GIS endpoints may additionally require VPN/network access to the external GIS host.
- No database schema changes are required for startup, but valid `.env` values are required.
