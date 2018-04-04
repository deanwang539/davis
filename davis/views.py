from flask import Blueprint, redirect, url_for, request, render_template, flash, session
from datetime import datetime
from davis.settings import LOGIN, TARGETS, PRELAB, LAB, EXPERIMENTS
from davis.models.forms.prelab import Prelab
from davis.models.forms.data_entry import DataEntry
from davis.models.forms.postlab import Postlab
from davis.models.forms.login import Login
from davis.models.forms.sign_up import SignUp
from davis.models.utils.qrcode import create_qr

views = Blueprint('views', __name__, static_folder = 'static', template_folder = 'templates')

prelab_sheet = Prelab('Titration_text')
det_sheet = DataEntry('Titration_text')
postlab_sheet = Postlab('Titration_text')
PP1_QUESTIONS = prelab_sheet.get_pp1_record('3', '11', [5, 10, 11, 12, 13])
PP2_QUESTIONS = prelab_sheet.get_pp2_record('3', '12', [4, 5, 6])
DET_QUESTIONS = det_sheet.get_det_record('3', '14', [4, 5, 6, 7, 8, 9])
DET_SUMMARY_QUESTIONS = det_sheet.get_det_summary_record('3', '15', [5])
PL_QUESTIONS = postlab_sheet.get_postlab_record('3', '16', [4, 5, 6])

@views.route('/<target>', methods=['GET', 'POST'])
def to_page(target):
	# prevent trespassing
	if target in LOGIN:
		return redirect('login/' + target)
	if target in PRELAB:
		return redirect('prelab/' + target)
	if target in LAB:
		return redirect('lab/' + target)
	if target not in TARGETS:
		return redirect('experiment')

	if target == 'experiment':
		# test !!!
		print session['uid']
		return render_template(target + '.html', experiments=EXPERIMENTS)
	elif target == 'postlab':
		worksheet = Postlab('Titration')
		if request.method == 'GET':
			count = worksheet.get_total_trials('1', '14')
			checked = worksheet.get_selected_postlab_ids('1', '16')
			return render_template(target + '.html', questions=PL_QUESTIONS, checked=checked, count=count)
		elif request.method == 'POST':
			worksheet.update('1', 'postlab', '16', 'selected', request.form, 'w_ut_uv')
			return redirect(target)

	return render_template(target + '.html')

@views.route('/prelab/<target>', methods=['GET', 'POST'])
def to_prelab(target):
	if target not in PRELAB:
		return redirect(target)
	# prelab part1
	worksheet = Prelab('Titration')
	if target == 'part1':
		if request.method == 'GET':
			checked = worksheet.get_selected_pp1_ids('1', '11')
			return render_template('prelab/' + target + '.html', questions=PP1_QUESTIONS, checked=checked)
		elif request.method == 'POST':
			worksheet.update('1', 'prelab_safety', '11', 'selected', request.form)
			return redirect('prelab/' + target)
	elif target == 'part2':
		if request.method == 'GET':
			checked = worksheet.get_selected_pp2_ids('1', '12')
			return render_template('prelab/' + target + '.html', questions=PP2_QUESTIONS, checked=checked)
		elif request.method == 'POST':
			worksheet.update('1', 'prelab_cal', '12', 'selected', request.form, 'w_ut_uv')
			return redirect('prelab/' + target)
	elif target == 'complete' and request.method == 'GET':
		qr_name = worksheet.is_complete(session['uid'], '13', '8', '13')
		if not qr_name:
			qr_name = create_qr(session['uid'], 12)
			worksheet.save_qr([datetime.now().strftime("%Y-%m-%d %H:%M:%S"), session['uid'], 'page', '0', qr_name, '', '', '13'])
		return render_template('prelab/' + target + '.html', qr_name=qr_name,
								first_name=session['first_name'], last_name=session['last_name'], semester=session['semester'],
								course_id=session['course_id'], section_id=session['section_id'])

@views.route('/lab/<target>', methods=['GET', 'POST'])
def to_lab(target):
	if target not in LAB:
		return redirect(target)
	# lab/data_entry
	if request.method == 'GET':
		worksheet = DataEntry('Titration')
		if target == 'data_entry':
			count = worksheet.get_total_trials('1', '14')
			checked = worksheet.get_selected_det_ids('1', '14')
			return render_template('lab/' + target + '.html', questions=DET_QUESTIONS, checked=checked, count=count)
		elif target == 'summary':
			trials = worksheet.get_det_summary_values('1', '14')
			return render_template('lab/' + target + '.html', questions=DET_SUMMARY_QUESTIONS, trials=trials,
									first_name=session['first_name'], last_name=session['last_name'], semester=session['semester'],
									course_id=session['course_id'], section_id=session['section_id'])

# save trial
@views.route('/lab/save_trial', methods=['POST'])
def save_trial():
	worksheet = DataEntry('Titration')
	count = worksheet.get_total_trials('1', '14')
	worksheet.update('1', 'data_entry', '14', 'selected', request.form, 'w_ut_uv')
	return redirect('lab/data_entry')

# new trial
@views.route('/lab/new_trial', methods=['POST'])
def new_trial():
	worksheet = DataEntry('Titration')
	count = worksheet.get_total_trials('1', '14')
	worksheet.update('1', 'data_entry', '14', 'selected', request.form, 'w_ut_uv')
	worksheet.save_time([datetime.now().strftime("%Y-%m-%d %H:%M:%S"), '1', 'end_trial', count, '', '', '', '14'])
	worksheet.save_time([datetime.now().strftime("%Y-%m-%d %H:%M:%S"), '1', 'new_trial', count+1, '', '', '', '14'])
	return redirect('lab/data_entry')

@views.route('/login/<target>', methods=['GET', 'POST'])
def to_login(target):
	if target not in LOGIN:
		return redirect(target)

	if target == 'login':
		if request.method == 'GET':
			return render_template('login/' + target + '.html')
		elif request.method == 'POST':
			# worksheet = SignUp('Users')
			# worksheet.register_user(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), '1839', '1',
			# 						'jakepie', '12345', 'Jake', 'Peralta', 'jakeP@gmail.com',
			# 						'https://vignette3.wikia.nocookie.net/brooklynnine-nine/images/f/fa/Andy-509.jpg/revision/latest/scale-to-width-down/250?cb=20130516221328', 'F17')
			worksheet = Login('Users')
			isUser = worksheet.verify_user(request.form['username'], request.form['password'])
			if isUser:
				# session data
				info = worksheet.get_info(request.form['username'], [6, 7, 10, 11, 12])
				session['uid'] = worksheet.get_uid(request.form['username'])
				session['first_name'] = info[0]
				session['last_name'] = info[1]
				session['semester'] = info[2]
				session['course_id'] = info[3]
				session['section_id'] = info[4]
				return redirect('experiment')
			else:
				flash('*WRONG USERNAME OR PASSWORD!')
				return redirect(target)
	return render_template('login/' + target + '.html')

# # continue to summary
# @views.route('/lab/to_summary', methods=['POST'])
# def to_summary():
# 	# insert data and out time
# 	worksheet = Prelab('Titration')
# 	worksheet.save_wo_updates('1', 'data_entry', '13', 'selected', request.form, 'w_ut_uv')
# 	checked, count = worksheet.get_selected_det1_values('1', '13')
# 	worksheet.worksheet.append_row([datetime.now().strftime("%Y-%m-%d %H:%M:%S"), '1', 'end_trial', count, '', '', '', '13'])
# 	return redirect('lab/data_entry')
