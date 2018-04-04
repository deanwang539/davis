from passlib.hash import pbkdf2_sha256

def encrypt_psw(psw):
    return pbkdf2_sha256.hash(psw)

def compare_psw(current, saved):
    return pbkdf2_sha256.verify(current, saved)
