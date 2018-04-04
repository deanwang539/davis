import gspread
from oauth2client.service_account import ServiceAccountCredentials
from itertools import groupby

# Titration columns
UID_COL = 2
TYPE_COL = 3
QID_COL = 4
VALUE_COL = 5
PID_COL = 8
STATE_COL = 11

STATE_CHAR = 'K'

class Gsdb(object):
    # new connection
    # row, col index starts from 1
    def __init__(self, ws):
        self.scope = ['https://spreadsheets.google.com/feeds']
        self.credential = 'config/DAVIS-v01-05aaa1aae8a7.json'
        self.sh = 'Devis_v0.1'
        self.worksheet = gspread.authorize(ServiceAccountCredentials.from_json_keyfile_name(self.credential, self.scope)).open(self.sh).worksheet(ws)

    # get whole row values
    # or give target list to narrow down which cols need to be in results
    def get_row_values(self, row, targets=None):
        values = self.worksheet.row_values(row)
        if targets:
            res = []
            for index in targets:
                res.append(values[index-1])
            return res
        return values

    # use to get rows that has specific value on a specific col
    # dist switch fetching dist from Titration to Titration_text
    def get_matched_rows(self, uid, pid, col, val, dist=None):
        if not dist:
            uid_list = list(filter(None, self.worksheet.col_values(UID_COL)))
            pid_list = self.worksheet.col_values(PID_COL)
            col_list = self.worksheet.col_values(col)

            # resize sheet
            self.worksheet.resize(len(uid_list))

            index = 0
            res = []
            for i in uid_list:
                if i == uid and pid_list[index] == pid and col_list[index] == val:
                    res.append(index + 1)
                index += 1
            return res
        elif dist == 'text_sheet':
            col_list = list(filter(None, self.worksheet.col_values(col)))
            index = 0
            res = []
            for i in col_list:
                if i == val:
                    res.append(index + 1)
                index += 1
            return res

    def get_selected_ids(self, uid, pid):
        res = ""
        rows = self.get_matched_rows(uid, pid, STATE_COL, 'selected')
        for row in rows:
            values_list = self.get_row_values(row)
            res += values_list[QID_COL-1] + '-1*' + values_list[VALUE_COL-1] + ','
            res += values_list[QID_COL-1] + '-2*' + values_list[VALUE_COL] + ','
            res += values_list[QID_COL-1] + '-3*' + values_list[VALUE_COL+1] + ','
        return res

    # change specific cells from 'selected' to 'updated'
    def update_cell_states(self, res):
        cell_list = []
        for row in res:
            cell = self.worksheet.acell(STATE_CHAR + str(row))
            cell.value = 'updated'
            cell_list.append(cell)
        self.worksheet.update_cells(cell_list)
        return

    # insert data to sheet w/wo types and units
    # only insert if value/type/unit are not all empty
    def insert_rows(self, uid, page_type, pid, state, form, w_ut_uv=None):
        if w_ut_uv is None:
            for key in form.keys():
                self.worksheet.append_row(['', uid, page_type, key, form[key], '', '', pid, '', '', state])
        elif w_ut_uv == 'w_ut_uv':
            # sort and group by first and last number in XX-X
            # eg: ['6-1', '4-3', '4-2'] => ['4-1', '4-2', '6-1']
            keys = form.keys()
            keys.sort(key=lambda x: (int(x.split('-')[0]), int(x.split('-')[1])))
            group_keys = [list(g) for k, g in groupby(keys, key=lambda x: x.split('-')[0])]
            for group in group_keys:
                temp = ['']*3
                for i in range(len(group)):
                    if form[group[i]] and form[group[i]] != 'null':
                        temp[i] = form[group[i]]
                if any(temp):
                    self.worksheet.append_row(['', uid, page_type, group[0].split('-')[0], temp[0], temp[1], temp[2], pid, '', '', state])
        return

    # change specific rows from 'selected' to 'updated'
    def update(self, uid, page_type, pid, state, form, w_ut_uv=None):
        res = []
        keys = [x.split('-')[0] for x in form.keys()]
        keys = list(set(keys))
        keys.sort()
        rows = self.get_matched_rows(uid, pid, TYPE_COL, page_type)

        for row in rows:
            if self.worksheet.row_values(row) and self.worksheet.row_values(row)[3] in keys:
                res.append(row)
        if res:
            self.update_cell_states(res)
        self.insert_rows(uid, page_type, pid, state, form, w_ut_uv)
        return

    # change everything on page from 'selected' to 'updated'
    def save(self, uid, page_type, pid, state, form, w_ut_uv=None, w_updates=None):
        if w_updates == 'w_updates':
            res = self.get_matched_rows(uid, pid, STATE_COL, state)
            if res:
                self.update_cell_states(res)
        self.insert_rows(uid, page_type, pid, state, form, w_ut_uv)
        return

    # similar to append_row
    def save_time(self, data):
        self.worksheet.append_row(data)
        return

    # user sign up
    def register_user(self, time, school_id, user_id, user_name, password, first_name, last_name, email, picture, semester):
        self.worksheet.append_row([time, school_id, user_id, user_name, password, first_name, last_name, email, picture, semester])
        return

    def find_cell(self, col, val):
        cell = self.worksheet.find(val)
        return cell if cell.col == col else None

    def get_cell(self, row, col):
        return self.worksheet.cell(row, col)

    def get_start_end_trials(self, uid, pid):
        uid_list = list(filter(None, self.worksheet.col_values(UID_COL)))
        type_list = self.worksheet.col_values(TYPE_COL)
        pid_list = self.worksheet.col_values(PID_COL)

        # resize sheet
        self.worksheet.resize(len(uid_list))

        index = 0
        res1 = []
        res2 = []
        for i in uid_list:
            if i == uid and pid_list[index] == pid and type_list[index] == 'new_trial':
                res1.append(index + 1)
            if i == uid and pid_list[index] == pid and type_list[index] == 'end_trial':
                res2.append(index + 1)
            index += 1
        return [res1, res2]
