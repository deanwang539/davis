import gspread
import math
from oauth2client.service_account import ServiceAccountCredentials
from itertools import groupby

UID_COL = 2
TYPE = 3
QID = 4
VALUE = 5
PID_COL = 8
STATE = 11

class Prelab(object):

    def __init__(self, ws):
        self.scope = ['https://spreadsheets.google.com/feeds']
        self.credential = 'config/DAVIS-v01-05aaa1aae8a7.json'
        self.sh = 'Devis_v0.1'
        self.worksheet = gspread.authorize(ServiceAccountCredentials.from_json_keyfile_name(self.credential, self.scope)).open(self.sh).worksheet(ws)

    # return list of 'selected' row indices
    def get_selected(self, uid, pid):
        uid_list = list(filter(None, self.worksheet.col_values(UID_COL)))
        pid_list = self.worksheet.col_values(PID_COL)
        state_list = self.worksheet.col_values(STATE)

        # resize sheet
        self.worksheet.resize(len(uid_list))

        index = 0
        res = []
        for i in uid_list:
            if i == uid and pid_list[index] == pid and state_list[index] == 'selected':
                res.append(index + 1)
            index += 1
        return res

    # update current 'selected' to 'updated'
    def update_cells(self, res):
    	cell_list = self.worksheet.range('K' + str(res[0]) + ':K' + str(res[-1]))
        for cell in cell_list:
        	cell.value = 'updated'
        self.worksheet.update_cells(cell_list)
        return

    # insert data to sheet
    def insert_rows(self, uid, page_type, pid, state, form, w_ut_uv=None):
        if w_ut_uv is None:
            for key in form.keys():
                self.worksheet.append_row(['', uid, page_type, key, form[key], '', '', pid, '', '', state])
        else:
            # sort by first and last character
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

    # save and stay function
    def save(self, uid, page_type, pid, state, form, w_ut_uv=None):
        # get existing input index
        res = self.get_selected(uid, pid)
        # update cell
        if res:
            self.update_cells(res)
        # insert row
        self.insert_rows(uid, page_type, pid, state, form, w_ut_uv)
        return

    # save without updates function
    def save_wo_updates(self, uid, page_type, pid, state, form, w_ut_uv=None):
        self.insert_rows(uid, page_type, pid, state, form, w_ut_uv)
        return

    # return list of row indices
    def get_rows(self, col, val):
        col_list = list(filter(None, self.worksheet.col_values(col)))
        print self.worksheet.col_values('1')
        index = 0
        res = []
        for i in col_list:
            if i == val:
                res.append(index + 1)
            index += 1
        return res

    # filter useful values save to list
    def get_pp1_row_values(self, row):
        res = []
        values = list(filter(None, self.worksheet.row_values(row)))
        # ans 1-4
        res = [values[-1]] + res
        res = [values[-2]] + res
        res = [values[-3]] + res
        res = [values[-4]] + res
        # question text
        res = [values[-6]] + res
        return res

    def get_pp2_rows_values(self, row):
        res = []
        values = self.worksheet.row_values(row)
        res.append(values[3])
        res.append(values[4])
        res.append(values[5])
        return res

    def get_det1_rows_values(self, row):
        res = []
        values = self.worksheet.row_values(row)
        res.append(values[3])
        res.append(values[4])
        res.append(values[5])
        res.append(values[6])
        res.append(values[7])
        res.append(values[8])
        return res

    def get_det_summary_rows_values(self, row):
        res = ''
        values = self.worksheet.row_values(row)
        res = res + values[4]
        return res

    def get_postlab_rows_values(self, row):
        res = []
        values = self.worksheet.row_values(row)
        res.append(values[3])
        res.append(values[4])
        res.append(values[5])
        return res

    # return string of ids
    def get_selected_pp1_id(self, uid, pid):
        res = ""
        rows = self.get_selected(uid, pid)
        for row in rows:
            values_list = self.worksheet.row_values(row)
            res += values_list[QID-1] + '-' + values_list[VALUE-1] + ','
        return res

    # return string of values
    def get_selected_pp2_values(self, uid, pid):
        res = ""
        rows = self.get_selected(uid, pid)
        for row in rows:
            values_list = self.worksheet.row_values(row)
            res += values_list[QID-1] + '-1*' + values_list[VALUE-1] + ','
            res += values_list[QID-1] + '-2*' + values_list[VALUE] + ','
            res += values_list[QID-1] + '-3*' + values_list[VALUE+1] + ','
        return res

    # return string of values
    def get_selected_det1_values(self, uid, pid):
        res = self.get_selected_pp2_values(uid, pid)
        res = res[0:-1]
        if not res:
            return ['', 0]
        return [res, len([list(g) for k, g in groupby(res.split(','), key=lambda x: math.floor(int(x.split('-')[0])/100))])]

    def get_start_end_trials(self, uid, pid):
        uid_list = list(filter(None, self.worksheet.col_values(UID_COL)))
        type_list = self.worksheet.col_values(TYPE)
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

    def get_trial_summary_values(self, uid, pid):
        res = {}
        start, end = self.get_start_end_trials(uid, pid)
        count = len(start)

        for i in range(len(start)):
            content = {}
            tid = int(self.worksheet.row_values(start[i])[3])
            tbase = (tid-1)*100
            vb = self.worksheet.row_values(start[i]+2)
            va = self.worksheet.row_values(start[i]+10)
            sc = self.worksheet.row_values(start[i]+6)
            vb_content = ''
            va_content = ''
            sc_content = ''
            if int(vb[3]) == tbase+2:
                vb_content = str(vb[4]) + ' ' + str(vb[6])
            if int(va[3]) == tbase+10:
                va_content = str(va[4]) + ' ' + str(va[6])
            if int(sc[3]) == tbase+6:
                sc_content = sc[4]
            content[i] = tid
            content[i+1] = vb_content
            content[i+2] = va_content
            content[i+3] = '<div class="summary-color-square" data-opacity="' + sc_content + '"></div>'
            content[i+4] = self.worksheet.row_values(start[i])[0]
            content[i+5] = self.worksheet.row_values(end[i])[0]
            res[i] = content
        return res

    # return dict format for pp1
    def get_pp1_record(self, col, val):
        res = {}
        rows = self.get_rows(col, val)
        for i in range(len(rows)):
            values_list = self.get_pp1_row_values(rows[i])
            question = {}
            ans = {}
            for j in range(len(values_list)):
                if j == 0:
                    question['text'] = values_list[j]
                    continue
                ans[j] = values_list[j]
            question['ans'] = ans
            res[i+1] = question
        return res

    # return dict format for pp2
    def get_pp2_record(self, col, val):
        res = {}
        rows = self.get_rows(col, val)
        for i in range(len(rows)):
            values_list = self.get_pp2_rows_values(rows[i])
            question = {}
            question['title'] = values_list[1]
            question['type'] = values_list[2]
            res[int(values_list[0])] = question
        return res

    # return dict format for det1
    def get_det1_record(self, col, val):
        res = {}
        cards = {}
        index = 1
        rows = self.get_rows(col, val)
        res['title'] = self.get_det1_rows_values(rows[0])[1]
        values_list = [self.get_det1_rows_values(row) for row in rows[1:]]
        group_values = [list(g) for k, g in groupby(values_list, key=lambda x: x[1])]

        for group in group_values:
            ans = {}
            cards[index] = {}
            for line in group:
                ans[int(line[0])] = line[2]
            ans = self.det_clean_duplicate(ans)
            cards[index]['title'] = group[0][1]
            cards[index]['ans'] = ans
            index += 1
        res['cards'] = cards
        return res

    # return dict format for det summary
    def get_det_summary_record(self, col, val):
        res = {}
        theads = {}
        rows = self.get_rows(col, val)
        title = self.get_det_summary_rows_values(rows[0])
        values = self.get_det_summary_rows_values(rows[1]).split(',')

        for i in range(len(values)):
            theads[i] = values[i]
        res['title'] = title
        res['theads'] = theads
        return res

    # return dict format for postlab
    def get_postlab_record(self, col, val):
        res = {}
        rows = self.get_rows(col, val)
        for i in range(len(rows)):
            values_list = self.get_postlab_rows_values(rows[i])
            card = {}
            card['title'] = values_list[1]
            card['type'] = values_list[2]
            res[i] = card
        return res

    # clean duplicate values in dict, keep smallest key
    def det_clean_duplicate(self, target):
        res = {}
        values = target.values()
        values_set = set(values)
        if len(values) != len(values_set):
            res[min(target.keys())] = values_set.pop()
        else:
            return target
        return res
