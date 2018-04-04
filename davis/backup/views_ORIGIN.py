import jinja2
from flask import Blueprint, redirect, url_for, request, render_template
from davis.settings import TARGETS, PRELAB, LAB, EXPERIMENTS
from davis.models.prelab import Prelab
from davis.models.qrcode import create_qr
from datetime import datetime
# from itertools import groupby
# import timeit
# start_time = timeit.default_timer()
# print("\nTime consumed: {} ms".format((timeit.default_timer() - start_time)*1000))


views = Blueprint('views', __name__, static_folder = 'static', template_folder = 'templates')

textsheet = Prelab('Titration_text')
PP1_QUESTIONS = textsheet.get_pp1_record('3', '11')
PP2_QUESTIONS = textsheet.get_pp2_record('3', '12')
DET1_QUESTIONS = textsheet.get_det1_record('3', '13')
DET_SUMMARY_QUESTIONS = textsheet.get_det_summary_record('3', '14')
PL_QUESTIONS = textsheet.get_postlab_record('3', '15')

@views.route('/<target>', methods=['GET', 'POST'])
def to_page(target):
	# prevent trespassing
	if target in PRELAB:
		return redirect('prelab/' + target)
	if target in LAB:
		return redirect('lab/' + target)
	if target not in TARGETS:
		return redirect('experiment')

	if target == 'experiment':
		return render_template(target + '.html', experiments = EXPERIMENTS)

	if target == 'postlab':
		if request.method == 'POST':
			worksheet = Prelab('Titration')
			worksheet.save('1', 'postlab', '14', 'selected', request.form, 'w_ut_uv')
			return redirect(target)
		elif request.method == 'GET':
			worksheet = Prelab('Titration')
			start, end = worksheet.get_start_end_trials('1', '13')
			checked = worksheet.get_selected_pp2_values('1', '14')
			return render_template(target + '.html', questions = PL_QUESTIONS, checked=checked, count=len(end))

	return render_template(target + '.html')

@views.route('/prelab/<target>', methods=['GET', 'POST'])
def to_prelab(target):
	global PP1_QUESTIONS
	global PP2_QUESTIONS

	if target not in PRELAB:
		return redirect(target)

	# prelab part1
	if target == 'part1':
		if request.method == 'POST':
			worksheet = Prelab('Titration')
			worksheet.save('1', 'prelab_safety', '11', 'selected', request.form)
			return redirect('prelab/' + target)
		elif request.method == 'GET':
			worksheet = Prelab('Titration')
			checked = worksheet.get_selected_pp1_id('1', '11')
			return render_template('prelab/' + target + '.html', questions=PP1_QUESTIONS, checked=checked)
	elif target == 'part2':
		if request.method == 'POST':
			worksheet = Prelab('Titration')
			worksheet.save('1', 'prelab_cal', '12', 'selected', request.form, 'w_ut_uv')
			return redirect('prelab/' + target)
		elif request.method == 'GET':
			worksheet = Prelab('Titration')
			checked = worksheet.get_selected_pp2_values('1', '12')
			return render_template('prelab/' + target + '.html', questions=PP2_QUESTIONS, checked=checked)
	elif target == 'complete':
		create_qr(12345)
		return render_template('prelab/' + target + '.html')

	return render_template('prelab/' + target + '.html')

@views.route('/lab/<target>', methods=['GET', 'POST'])
def to_lab(target):
	global DET1_QUESTIONS

	if target not in LAB:
		return redirect(target)

	# lab/data_entry
	if target == 'data_entry':
		if request.method == 'POST':
			worksheet = Prelab('Titration')
			worksheet.save_wo_updates('1', 'data_entry', '13', 'selected', request.form, 'w_ut_uv')

			# insert data and out time
			checked, count = worksheet.get_selected_det1_values('1', '13')
			worksheet.worksheet.append_row([datetime.now().strftime("%Y-%m-%d %H:%M:%S"), '1', 'end_trial', count, '', '', '', '13'])

			return redirect('lab/' + target)
		elif request.method == 'GET':
			worksheet = Prelab('Titration')
			checked, count = worksheet.get_selected_det1_values('1', '13')
			return render_template('lab/' + target + '.html', questions=DET1_QUESTIONS, checked=checked, count=count)
	elif target == 'summary':
		worksheet = Prelab('Titration')
		trials = worksheet.get_trial_summary_values('1', '13')
		return render_template('lab/' + target + '.html', questions=DET_SUMMARY_QUESTIONS, trials=trials)
	return render_template('lab/' + target + '.html')

# first time on trial
@views.route('/lab/new_trial', methods=['GET'])
def init_trial():
	ws = Prelab('Titration')
	ws.worksheet.append_row([datetime.now().strftime("%Y-%m-%d %H:%M:%S"), '1', 'new_trial', '1', '', '', '', '13'])
	return redirect('lab/data_entry')

# add trial
@views.route('/lab/add_trial', methods=['POST'])
def add_trial():
	# insert data, out time and in time
	worksheet = Prelab('Titration')
	worksheet.save_wo_updates('1', 'data_entry', '13', 'selected', request.form, 'w_ut_uv')
	checked, count = worksheet.get_selected_det1_values('1', '13')
	worksheet.worksheet.append_row([datetime.now().strftime("%Y-%m-%d %H:%M:%S"), '1', 'end_trial', count, '', '', '', '13'])
	worksheet.worksheet.append_row([datetime.now().strftime("%Y-%m-%d %H:%M:%S"), '1', 'new_trial', count+1, '', '', '', '13'])
	return redirect('lab/data_entry')

@views.route('/lab/add_trial_w_intime', methods=['POST'])
def add_trial_w_intime():
	worksheet = Prelab('Titration')
	checked, count = worksheet.get_selected_det1_values('1', '13')
	worksheet.worksheet.append_row([datetime.now().strftime("%Y-%m-%d %H:%M:%S"), '1', 'new_trial', count+1, '', '', '', '13'])
	return redirect('lab/data_entry')

# continue to summary
@views.route('/lab/to_summary', methods=['POST'])
def to_summary():
	# insert data and out time
	worksheet = Prelab('Titration')
	worksheet.save_wo_updates('1', 'data_entry', '13', 'selected', request.form, 'w_ut_uv')
	checked, count = worksheet.get_selected_det1_values('1', '13')
	worksheet.worksheet.append_row([datetime.now().strftime("%Y-%m-%d %H:%M:%S"), '1', 'end_trial', count, '', '', '', '13'])
	return redirect('lab/data_entry')
