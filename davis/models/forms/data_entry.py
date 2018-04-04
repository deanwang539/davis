import math
from itertools import groupby
from davis.models.database.gsdb import Gsdb

class DataEntry(object):

    def __init__(self, ws):
        self.worksheet = Gsdb(ws)

    # return string of IDs
    def get_selected_det_ids(self, uid, pid):
        return self.worksheet.get_selected_ids(uid, pid)

    # return new_trial total
    def get_total_trials(self, uid, pid):
        return len(self.worksheet.get_matched_rows(uid, pid, '3', 'new_trial'))

    # get data_entry content text
    # res = {
    #     'cards': {
    #         1: {
    #             'ans':
    #                 { 1: 'input*Acid Unknown #,1',
    #                   ...
    #                 },
    #             'title': 'Observations'
    #         },
    #     ...
    #     },
    #    'title': 'A titration'
    # }
    def get_det_record(self, col, val, targets):
        res = {}
        cards = {}
        index = 1
        rows = self.worksheet.get_matched_rows('', '', col, val, 'text_sheet')
        res['title'] = self.worksheet.get_row_values(rows[0], targets)[1]
        values_list = [self.worksheet.get_row_values(row, targets) for row in rows[1:]]
        group_values = [list(g) for k, g in groupby(values_list, key=lambda x: x[1])]

        for group in group_values:
            ans = {}
            cards[index] = {}
            for line in group:
                ans[int(line[0])] = line[2]
            ans = self.clean_duplicate(ans)
            cards[index]['title'] = group[0][1]
            cards[index]['ans'] = ans
            index += 1
        res['cards'] = cards
        return res

    def get_det_summary_record(self, col, val, targets):
        res = {}
        theads = {}
        rows = self.worksheet.get_matched_rows('', '', col, val, 'text_sheet')
        title = self.worksheet.get_row_values(rows[0], targets)[0]
        values_list = self.worksheet.get_row_values(rows[1], targets)[0].split(',')
        for i in range(len(values_list)):
            theads[i] = values_list[i]
        res['title'] = title
        res['theads'] = theads
        return res

    def get_det_summary_values(self, uid, pid):
        res = {}
        start, end = self.worksheet.get_start_end_trials(uid, pid)
        count = len(start)
        for i in range(count):
            content = {}
            tbase = i*100
            vb = self.worksheet.get_matched_rows(uid, pid, '4', str(1+tbase))
            va = self.worksheet.get_matched_rows(uid, pid, '4', str(2+tbase))
            sc = self.worksheet.get_matched_rows(uid, pid, '4', str(6+tbase))
            vb_row = ''
            va_row = ''
            sc_row = ''
            for row in vb:
                if self.worksheet.get_row_values(row)[10] == 'selected':
                    vb_row = row
            for row in va:
                if self.worksheet.get_row_values(row)[10] == 'selected':
                    va_row = row
            for row in sc:
                if self.worksheet.get_row_values(row)[10] == 'selected':
                    sc_row = row
            vb_content = ''
            va_content = ''
            sc_content = ''
            if vb and va and sc:
                vb_content = str(self.worksheet.get_cell(vb_row, '5').value) + ' ' + str(self.worksheet.get_cell(vb_row, '7').value)
                va_content = str(self.worksheet.get_cell(va_row, '5').value) + ' ' + str(self.worksheet.get_cell(va_row, '7').value)
                sc_content = str(self.worksheet.get_cell(sc_row, '5').value)
            content[i] = i+1
            content[i+1] = vb_content
            content[i+2] = va_content
            content[i+3] = '<div class="summary-color-square" data-opacity="' + sc_content + '"></div>'
            content[i+4] = self.worksheet.get_row_values(start[i])[0].split(' ')[0] if len(start)-1 >= i else ''
            content[i+5] = self.worksheet.get_row_values(start[i])[0].split(' ')[1] if len(start)-1 >= i else ''
            content[i+6] = self.worksheet.get_row_values(end[i])[0].split(' ')[1] if len(end)-1 >= i else ''
            res[i] = content
        return res

    # clean duplicate values in dict, keep smallest key
    def clean_duplicate(self, target):
        res = {}
        values = target.values()
        values_set = set(values)
        if len(values) != len(values_set):
            res[min(target.keys())] = values_set.pop()
        else:
            return target
        return res

    def update(self, uid, page_type, pid, state, form, w_ut_uv=None):
        self.worksheet.update(uid, page_type, pid, state, form, w_ut_uv)
        return

    def save_time(self, data):
        self.worksheet.save_time(data)
        return
