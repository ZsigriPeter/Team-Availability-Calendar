import smtplib
import ssl

context = ssl._create_unverified_context()
try:
    with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.starttls(context=context)
        server.login('zsigri.peter@gmail.com', 'oxgw ryjp jjcn ogsq')
        print("SMTP connection successful")
except Exception as e:
    print(f"SMTP connection failed: {e}")