# ===========================================================================
#  Aiven CA certificate
#
#  Aiven serves MySQL over TLS. To make the JDBC connection safe you have
#  to validate the certificate of the Aiven server - encryption alone
#  (sslMode=REQUIRED) does NOT check who you are talking to.
#
#  The file "ca.crt" in this folder IS the CA certificate of your Aiven
#  project, so the backend can verify the Aiven server certificate.
#
#  Certificate details (check them yourself with):
#      keytool -printcert -file backend/certs/ca.crt
#
#      Owner  : CN=<project-id> Project CA
#      Issuer : CN=<project-id> Project CA   (self signed)
#      CA     : true, PathLen:0
#      Valid  : 2026-01-22  ->  2036-10-19
#      SHA256 : 50:8D:53:A8:9D:3B:38:97:05:D9:21:43:8E:D5:72:DB:A3:5F:BE:6F:4A:4C:E4:ED:50:4F:DD:7B:00:0B:CA:7D
#
#  The Docker build imports this file automatically into the truststore
#  /app/certs/truststore.p12, and the backend uses that truststore with
#  sslMode=VERIFY_IDENTITY.
#
#  THE FILE IS PUBLIC
#  ------------------
#  A CA certificate contains no password and no private key, so it is safe to
#  commit it to Git. The Docker build on Render needs it, therefore it has to
#  be part of the repository.
#
#  WHEN YOU HAVE TO REPLACE IT
#  ---------------------------
#  Aiven rotates the project CA certificate from time to time, and another
#  Aiven project uses a different certificate. Download the current one and
#  overwrite "ca.crt" in this folder:
#
#      1. Aiven dashboard  ->  your project  ->  MySQL service  ->  Overview
#      2. "Connection information"  ->  "CA Certificate"  ->  Download
#      3. Save the downloaded file here as "ca.crt"
#
#  With the Aiven CLI the same file is downloaded with:
#      avn service user-creds-download --username <your-aiven-user> <service>
#
#  After replacing it: rebuild the Docker image and push the new "ca.crt".
#  Symptom of an outdated certificate: the backend starts, but
#  GET /api/health reports "database": "DOWN" and the log shows
#  "PKIX path building failed".
# ===========================================================================
