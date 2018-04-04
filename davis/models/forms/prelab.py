import math
from itertools import groupby
from davis.models.database.gsdb import Gsdb, QID_COL, VALUE_COL, STATE_COL

class Prelab(object):

    def __init__(self, ws):
        self.worksheet = Gsdb(ws)

    # return string of IDs
    # '1-1, 1-2,'
    def get_selected_pp1_ids(self, uid, pid):
        res = ""
        rows = self.worksheet.get_matched_rows(uid, pid, STATE_COL, 'selected')
        for row in rows:
            values_list = self.worksheet.get_row_values(row)
            res += values_list[QID_COL-1] + '-' + values_list[VALUE_COL-1] + ','
        return res

    # return string of IDs
    def get_selected_pp2_ids(self, uid, pid):
        return self.worksheet.get_selected_ids(uid, pid)

    # get pp1 content text
    # res = {
    #         1: {
    #             text: 'title',
    #             ans: {
    #                 1: 'questionA',
    #                 ...
    #             }
    #         }
    #         ...
    #       }
    def get_pp1_record(self, col, val, targets):
        res = {}
        rows = self.worksheet.get_matched_rows('', '', col, val, 'text_sheet')
        for i in range(len(rows)):
            values_list = self.worksheet.get_row_values(rows[i], targets)
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

    # get pp2 content text
    # res = {
    #         0: {
    #             title: 'A titration',
    #             type: 'input*basic_slide,1'
    #         }
    #         ...
    #       }
    def get_pp2_record(self, col, val, targets):
        res = {}
        rows = self.worksheet.get_matched_rows('', '', col, val, 'text_sheet')
        for i in range(len(rows)):
            values_list = self.worksheet.get_row_values(rows[i], targets)
            question = {}
            question['title'] = values_list[1]
            question['type'] = values_list[2]
            res[int(values_list[0])] = question
        return res

    def save(self, uid, page_type, pid, state, form, w_ut_uv=None, w_updates=None):
        self.worksheet.save(uid, page_type, pid, state, form, w_ut_uv, w_updates)
        return

    def save_qr(self, data):
        self.worksheet.save_time(data)
        return

    def update(self, uid, page_type, pid, state, form, w_ut_uv=None):
        self.worksheet.update(uid, page_type, pid, state, form, w_ut_uv)
        return

    def is_complete(self, uid, pid, col, val):
        if self.worksheet.get_matched_rows(uid, pid, col, val):
            return self.worksheet.get_row_values(self.worksheet.get_matched_rows(uid, pid, col, val)[0], [5])[0]
        else:
            return []
