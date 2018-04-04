import pyqrcode
import random

"""
temp create QR based on fixed number
"""
def create_qr(prefix, digits):
    # random n digits number
    number = random.randrange(10**(digits-1), 10**digits)
    qr = pyqrcode.create(number)
    qr_name = prefix + '-' + str(number) + '.svg'
    qr.svg('davis/static/images/qrcodes/' + qr_name, scale=20, quiet_zone=0)
    return qr_name
