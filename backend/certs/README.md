# ===========================================================================
#  Aiven CA certificate
#
#  Aiven serves MySQL over TLS. To make the JDBC connection safe you have
#  to validate the certificate of the Aiven server - encryption alone
#  (sslMode=REQUIRED) does NOT check who you are talking to.
#
#  How to get the certificate:
#    1. Open your Aiven project  ->  MySQL service  ->  Connection
#    2. Download the file "ca.crt"
#    3. Save it in THIS folder as "ca.crt"
#
#  The certificate is PUBLIC (it is a public CA certificate, not a password),
#  so it is safe to commit it to Git. The Docker build imports it into the
#  truststore at /app/certs/truststore.p12 automatically.
#
#  The file is optional: without it the backend still starts, but the health
#  endpoint reports the database as DOWN because the certificate of Aiven
#  cannot be verified.
# ===========================================================================
