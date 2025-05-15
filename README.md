# AGA Plot Watcher @ netCup Webhosting

Dieses Repository enthält ein TypeScript-basiertes Node.js-Projekt zur Beobachtung einer externen Quelle (z. B. Verfügbarkeiten) mit SMTP-Benachrichtigung – optimiert für Shared Hosting ohne direkten Node-Support.

## ⚙️ Setup-Schritte

1. Projekt clonen
2. `.env` ausfüllen (SMTP etc.)
3. `npm install`
4. `npm run build`
5. Alles nach `httpdocs/aga-watcher/` auf den Webspace hochladen

## 🌐 trigger-watcher.php

```php
<?php
$output = shell_exec('/opt/plesk/node/21/bin/node aga-watcher/dist/index.js 2>&1');
echo "<pre>$output</pre>";
?>
```

## 📧 .env

```dotenv
USER_EMAIL='your-email@gmail.com'
USER_PASSWORD= 'your-email-password'
RECIPIENT_EMAIL='recipient@email.com'
SMTP_PORT=587
SMTP_HOST=smtp.yourProvider.com
```
