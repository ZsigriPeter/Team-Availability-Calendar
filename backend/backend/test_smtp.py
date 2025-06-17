import smtplib
import ssl
import certifi

context = ssl.create_default_context(cafile=certifi.where())
try:
    with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.starttls(context=context)
        server.login('zsigri.peter@gmail.com', 'oxgw ryjp jjcn ogsq')
        print("SMTP connection successful")
except Exception as e:
    print(f"SMTP connection failed: {e}")