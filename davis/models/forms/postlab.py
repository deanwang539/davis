import math
from itertools import groupby
from davis.models.database.gsdb import Gsdb

class Postlab(object):

    def __init__(self, ws):
        self.worksheet = Gsdb(ws)

    # return string of IDs
    # '1-1, 1-2,'
    def get_selected_postlab_ids(self, uid, pid):
        return self.worksheet.get_selected_ids(uid, pid)

    # return end_trial total
    def get_total_trials(self, uid, pid):
        return len(self.worksheet.get_matched_rows(uid, pid, '3', 'end_trial'))

    # get postlab content text
    # res = {
    #         0: {
    #             card: {
    #               title: 'Trial 1',
    #               type: 'input*basic_slide,1'
    #             }
    #         }
    #         ...
    #       }
    def get_postlab_record(self, col, val, targets):
        res = {}
        rows = self.worksheet.get_matched_rows('', '', col, val, 'text_sheet')
        for i in range(len(rows)):
            values_list = self.worksheet.get_row_values(rows[i], targets)
            card = {}
            card['title'] = values_list[1]
            card['type'] = values_list[2]
            res[i] = card
        return res

    def save(self, uid, page_type, pid, state, form, w_ut_uv=None, w_updates=None):
        self.worksheet.save(uid, page_type, pid, state, form, w_ut_uv, w_updates)
        return

    def update(self, uid, page_type, pid, state, form, w_ut_uv=None):
        self.worksheet.update(uid, page_type, pid, state, form, w_ut_uv)
        return
