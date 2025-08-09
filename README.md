# Shine API Proxy

Questo progetto fornisce due endpoint proxy per interagire con il servizio Growatt/"ShinePhone".

## Variabili d'ambiente
Le credenziali e le informazioni dell'impianto non vengono codificate nel sorgente, ma lette da variabili d'ambiente:

- `SHINE_USERNAME`
- `SHINE_PASSWORD`
- `SHINE_DEVCODE`
- `SHINE_SERIAL`
- `SHINE_REGION` (opzionale, predefinito `romania`)

Impostare queste variabili prima di avviare l'applicazione.

## Endpoint

### `/api/shinephone`
Effettua il login al servizio ShinePhone usando le credenziali fornite tramite variabili d'ambiente e restituisce alcune informazioni di debug.

### `/api/energyTrend`
Recupera l'andamento energetico di un impianto. Richiede i seguenti parametri query:

- `plantId`: identificativo dell'impianto
- `type`: tipo di intervallo (ad es. `day`)
- `date`: data di riferimento (formato `YYYY-MM-DD`)
- `token`: token ottenuto dal login

Esempio:
```bash
curl "https://<host>/api/energyTrend?plantId=123&type=day&date=2024-01-01&token=<TOKEN>"
```

## Esecuzione
Installare le dipendenze nella cartella `api` ed avviare il server secondo l'ambiente scelto (ad es. Vercel).
