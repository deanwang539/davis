from davis.models.database.gsdb import Gsdb
from davis.models.utils.crypto import compare_psw

# Users columns
UID_COL = 3
USERNAME_COL = 4
PASSWORD_COL = 5

class Login(object):

    def __init__(self, ws):
        self.worksheet = Gsdb(ws)

    def verify_user(self, username, psw):
        cell = self.worksheet.find_cell(USERNAME_COL, username)
        if not cell:
            return False
        else:
            return compare_psw(psw, self.worksheet.get_cell(cell.row, PASSWORD_COL).value)

    def get_uid(self, username):
        cell = self.worksheet.find_cell(USERNAME_COL, username)
        return self.worksheet.get_cell(cell.row, UID_COL).value

    def get_info(self, username, targets=None):
        cell = self.worksheet.find_cell(USERNAME_COL, username)
        return self.worksheet.get_row_values(cell.row, targets)
