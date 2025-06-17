import ssl
from django.core.mail.backends.smtp import EmailBackend

class CustomEmailBackend(EmailBackend):
    def _get_ssl_context(self):
        context = ssl._create_unverified_context()
        return context