var $IMG = $('.img'),
    $INFO_CHECK = $('.info-check'),
    $CHEVRON = $('.fa-chevron-down'),
    $LOCK = $('.lock'),
    $PO_CONTENT = $('.purpose-content'),
    $PC_CONTENT = $('.procedure-content'),
    $WD_CONTENT = $('.wd-content'),
    $PP1 = $('.pp1'),
    $PP2 = $('.pp2'),
    $EXP_CONTINUE = $('.exp-btn'),
    $INTRO_CONTINUE = $('.intro-btn'),
    $SO_CONTINUE = $('.so-btn'),
    $PO_CONTINUE = $('.po-btn'),
    $PC_CONTINUE = $('.pc-btn'),
    $WD_CONTINUE = $('.wd-btn'),
    $PP1_CONTINUE = $('.pp1-btn'),
    $PP2_CONTINUE = $('.pp2-btn'),
    $DET2_CONTINUE = $('.det2-btn'),
    $SUMMARY_CONTINUE = $('.summary-btn');

var $PP1_FORM = $('#prelab_part1_form'),
    $PP1_SAVE = $('#prelab_part1_save'),
    $PP2_FORM = $('#prelab_part2_form'),
    $PP2_SAVE = $('#prelab_part2_save'),
    $DET2_SAVE = $('#det2_save'),
    $DET2_FORM = $('#det2_form'),
    $POSTLAB_SAVE = $('#postlab_save'),
    $POSTLAB_FORM = $('#postlab_form');

var $PP1_DATA = $('#pp1_data'),
    $PP2_DATA = $('#pp2_data'),
    $DET2_DATA = $('#det2_data'),
    $POSTLAB_DATA = $('#postlab_data');

var $SUMMARY_PRINT = $('#summary_print'),
    $POSTLAB_PRINT = $('#postlab_print');

// prevent trespassing
$(document).ready(function() {
  var cur_location = $(location).attr('href');
  if(cur_location.indexOf('#') != -1)
    $(location).attr('href', cur_location.split('#').shift());
  if(!sessionStorage.current_exp && cur_location.split('/').pop() !== 'experiment')
    $(location).attr('href', 'experiment');
});

// sidebar init
$(document).ready(function() {
  // check if session
  console.log("Current session: " + sessionStorage.current_exp);
  if(!sessionStorage.current_exp) {
    $CHEVRON.hide();
    $LOCK.show();
    $LOCK.parent().addClass('disabled');
  }else {
    $CHEVRON.show();
    $LOCK.hide();
    $LOCK.parent().removeClass('disabled');
  }
});

// sidebar click listener
$(document).ready(function() {
  var $anchors = $('.side-menu, .child-menu').find('a');
  $anchors.on('click', function() {
    var url = $(this).attr('href');
    if(url) {
      // loading gif
      $('#cover').show().css({'opacity':0.5});
      setTimeout(function() {
        $(location).attr('href', url);
      }, 500);
    }
  });
});

// experiment.html
$(document).ready(function() {
  var temp_session = "";

  // selected img init
  if($IMG) {
    $IMG.each(function() {
      if($('img', this).attr('name') === sessionStorage.current_exp) {
        var $img = $(this);
        var $info = $img.next();
        var $info_content = $info.find('div.info-content');
        var $info_check = $info.find('div.info-check');
        $img.addClass('img-no-scale');
        $info.addClass('info-no-transition info-visible');
        $info_content.toggle();
        $info_check.toggle();

        // set temp_session
        temp_session = sessionStorage.current_exp;
      }
    });
  }

  // img onclick
  $IMG.on('click', function() {
    var $img = $(this);
    var $info = $img.next();
    var $info_content = $info.find('div.info-content');
    var $info_check = $info.find('div.info-check');

    if($info_check.is(':hidden')) {
      // close other checked img
      $INFO_CHECK.each(function() {
        if(!$(this).is(':hidden')) {
          $(this).parent().prev().removeClass('img-no-scale');
          $(this).parent().removeClass('info-no-transition info-visible');
          $(this).toggle();
          $(this).prev().toggle();
        }
      });

      // set temp_session
      temp_session = $('img', this).attr('name');
      $img.addClass('img-no-scale');
      $info.addClass('info-no-transition info-visible');
    }else {
      // set temp_session
      temp_session = "";
      $img.removeClass('img-no-scale');
      $info.removeClass('info-no-transition info-visible');
    }
    $info_content.toggle();
    $info_check.toggle();
  });

  // special !!!
  // continue onclick
  $EXP_CONTINUE.on('click', function() {
    if(temp_session) {
      sessionStorage.current_exp = temp_session;
      $(location).attr('href', 'introduction');
    }else {
      // wait...
      console.log('Must select one experiment');
    }
  });
});

// introduction.html
$(document).ready(function() {
    initContinueBtn($INTRO_CONTINUE, 'safety_overview');
});

// safety_overview.html
$(document).ready(function() {
    initContinueBtn($SO_CONTINUE, 'purpose');
});

// purpose.html
$(document).ready(function() {
  initTocify($('.purpose-title'), $PO_CONTENT);

  initContinueBtn($PO_CONTINUE, 'procedure');
});

// procedure.html
$(document).ready(function() {
  initTocify($('.procedure-title'), $PC_CONTENT);

  initContinueBtn($PC_CONTINUE, 'waste_disposal');
});

// waste_disposal.html
$(document).ready(function() {
    initContinueBtn($WD_CONTINUE, 'prelab/part1');
});

// prelab/part1.html
$(document).ready(function() {
  // set checked using server data
  var data = $PP1_DATA.data("checked");
  var radio_checked = data ? data.split(',') : null;
  $.each(radio_checked, function(i, v) {
    $('#' + v).attr('checked', 'checked');
  });

  $PP1_SAVE.on('click', function() {
    save_wo_ut_uv($PP1_FORM, getNotChangedRadios, 'part1', 'part1');
  });

  $PP1_CONTINUE.on('click', function() {
    if(!validMultiChoices($PP1_FORM)) {
      showModal();
    }else {
      continue_w_ut_uv($PP1_FORM, getNotChangedRadios, 'part1', 'part2');
    }
  });
});

// prelab/part2.html
$(document).ready(function() {
  initUnit();

  // set checked using server data
  var data = $PP2_DATA.data("checked");
  var input_checked = data ? data.split(',') : null;
  $.each(input_checked, function(i, v) {
    if(v) {
      var id_val = v.split('*');
      var id = id_val[0];
      var val = id_val[1] ? id_val[1] : null;
      if(val) {
        $('#' + id).val(val).trigger("change");
      }
    }
  });

  $PP2_SAVE.on('click', function() {
    save_w_ut_uv($PP2_FORM, getNotChangedValues, 'part2', 'part2');
  });

  $PP2_CONTINUE.on('click', function() {
    if(!validAllFields($PP2_FORM)) {
      showModal();
    }else {
      // test
      var hypothesis = [];
      $('.pp2-fill-blank').find('select, input').each(function() {
        hypothesis.push($(this).val());
      });
      sessionStorage.hypothesis = hypothesis;

      continue_w_ut_uv($PP2_FORM, getNotChangedValues, 'part2', 'complete');
    }
  });
});

// lab/data_entry.html
$(document).ready(function() {
  // slider color change
  $('.det-slider').slider();
  $('div.det-color-picker div.slider-track .slider-handle.round').append('<i class="fa fa-tag det-color-pointer" aria-hidden="true"></i>');
  $('.det, .trial-accordion').on('slide', '.det-slider', function(ev){
    var arrow = $(this).parent().find('.slider-handle.round');
    arrow.empty();
    arrow.append('<i class="fa fa-tag det-color-pointer" aria-hidden="true"></i>');
    var op = ev.value/100;
    op = op < 0.1 ? 0.1 : op;
    arrow.find('.det-color-pointer').css('opacity', op);
    $(this).parent().siblings('.det-color-square').css('opacity', op);
  });
});

// lab/data_entry.html
$(document).ready(function() {
  // init accordion
  $('.trial-accordion [data-accordion]').accordion();

  // dynamically add trial
  $('.trial-accordion').on('click', '.new-trial-btn', function() {
    if(!validCurrentTrial($DET2_FORM)) {
      showModal();
    }else {
      save_w_ut_uv($DET2_FORM, getNotChangedValues, 'new_trial', 'data_entry', addTrial);
    }
  });

  $DET2_FORM.on('click', '#det2_save', function() {
    $disabled = $('.row').find('input:disabled, select:disabled');
    $disabled.prop('disabled', false);
    save_w_ut_uv($DET2_FORM, getNotChangedValues, 'save_trial', 'data_entry');
    $disabled.prop('disabled', true);
  });

  $DET2_CONTINUE.on('click', function() {
    if(!validAllFields($DET2_FORM)) {
      showModal();
    }else {
      $disabled = $('.row').find('input:disabled, select:disabled');
      $disabled.prop('disabled', false);
      continue_w_ut_uv($DET2_FORM, getNotChangedValues, 'save_trial', 'summary');
      $disabled.prop('disabled', true);
    }
  });

  // set checked using server data
  var data = $DET2_DATA.data('checked');
  var count = parseInt($DET2_DATA.data('count'));
  var input_checked = data ? data.split(',') : null;

  if(!count) return;

  initTrial(count);

  $('.right_col').addClass('no-min-height');

  $.each(input_checked, function(i, v) {
    if(v) {
      var id_val = v.split('*');
      var id = id_val[0];
      var val = id_val[1] ? id_val[1] : null;
      if(val) {
        $('#' + id).val(val).trigger('change');
        if($('#' + id).hasClass('det-slider')) setSliderVal($('#' + id), val);
      }
    }
  });

  $('.trial-accordion .row').not('.open').find('input, select').attr('disabled', true);
  $('.trial-accordion .row').not('.open').find('select').addClass('select-disabled');
});

// lab/summary.html
$(document).ready(function() {
  $SUMMARY_PRINT.on('click', function() {
    window.print();
  });

  $('.summary-color-square').each(function() {
    var opacity = parseInt($(this).data('opacity'))/100;
    opacity = opacity < 0.1? 0.1 : opacity;
    $(this).css('opacity', opacity);
  });

  initContinueBtn($SUMMARY_CONTINUE, 'postlab');
});

// postlab
$(document).ready(function() {
  $POSTLAB_PRINT.on('click', function() {
    // var preview = window.open('', '');
    // var data = $POSTLAB_FORM[0].outerHTML;
    // preview.document.write(data);
    // $(preview.document).find('.exp-title').hide();
    window.print();
  });
  var count = parseInt($POSTLAB_DATA.data('count'));
  if(count > 1) {
    $('.formula-card').each(function() {
      var cur = $(this);
      var base = parseInt($(this).find('.formula-unit:last').find('.custom-select:first').attr('id').split('-')[0]);
      for(var i=0; i<count-1; i++) {
        var new_content = cur[0].outerHTML;
        cur.after(new_content);

        // change title number
        var title = cur.find('.formula-title').text().split(' '),
            title_text = title[0],
            title_no = parseInt(title[1]);
        cur.next().find('.formula-title').text(title_text + " " + (title_no+1));

        // change id
        cur.next().find('[id]').each(function() {
          var str_id = this.id,
              qid = parseInt(str_id.split('-')[0])%100,
              afix = parseInt(str_id.split('-')[1]);
          this.id = (qid + base) + "-" + afix;
          this.name = this.id;
        });

        // point to current card
        cur = cur.next();
      }
    });

    $('.postlab-chkbox').each(function() {
      var cur = $(this);
      for(var i=0; i<count-1; i++) {
        var new_content = cur[0].outerHTML;
        cur.after(new_content);

        // change title number
        var title = cur.find('label').text().split(' '),
            title_text = title[0],
            title_no = parseInt(title[1]);
        cur.next().find('label').text(title_text + " " + (title_no+1));

        // change id
        cur.next().find('[id]').each(function(index) {
          var str_id = $(this).attr('id'),
              qid = parseInt(str_id.split('-')[0]),
              afix = parseInt(str_id.split('-')[1]);
          $(this).attr('id', (qid+index+1) + "-" + afix);
          $(this).attr('name', $(this).attr('id'));
          cur.next().find('label').attr('for', $(this).attr('id'));
        });
        // point to current card
        cur = cur.next();
      }
    });
    reinitUnit($('.postlab-container').find('.types-select'), $('.postlab-container').find('.units-select'));
  }

  // test
  if(sessionStorage.hypothesis) {
    var hypothesis = sessionStorage.hypothesis.split(',');
    $('.postlab-fill-blank').find('span').each(function() {
      $(this).text(hypothesis.shift());
    });
  }

  // set checked using server data
  var data = $POSTLAB_DATA.data('checked');
  var input_checked = data ? data.split(',') : null;
  $.each(input_checked, function(i, v) {
    if(v) {
      var id_val = v.split('*');
      var id = id_val[0];
      var val = id_val[1] ? id_val[1] : null;
      if(val) {
        if(val != 'on') {
          $('#' + id).val(val).trigger('change');
        }else
          $('#' + id).attr('checked', 'checked');
      }
    }
  });

  $POSTLAB_SAVE.on('click', function() {
    save_w_ut_uv($POSTLAB_FORM, getNotChangedValues, 'postlab', 'postlab');
  });
});
