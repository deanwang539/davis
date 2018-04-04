import math
from itertools import groupby
from davis.models.utils.crypto import encrypt_psw
from davis.models.database.gsdb import Gsdb, QID_COL, VALUE_COL, STATE_COL

class SignUp(object):

    def __init__(self, ws):
        self.worksheet = Gsdb(ws)

    def register_user(self, time, school_id, user_id, user_name, password, first_name, last_name, email, picture, semester):
        self.worksheet.register_user(time, school_id, user_id, user_name, encrypt_psw(password), first_name, last_name, email, picture, semester)
        return
