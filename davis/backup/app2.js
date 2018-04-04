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

var $SUMMARY_PRINT = $('#summary_print');

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

  // initContinueBtn($PC_CONTINUE, 'waste_disposal');
// test!!!
  initContinueBtn($PC_CONTINUE, 'lab/new_trial');
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
    $PP1_FORM.submit();
  });

  $PP1_FORM.on('submit', function() {
    $('#submit_cover').show();
  });

  $PP1_CONTINUE.on('click', function() {
    $('#submit_cover').show();
    $.ajax({
      type: 'POST',
      url: 'part1',
      data: $PP1_FORM.serialize(),
      context: document.body
    }).done(function() {
      $(location).attr('href', 'part2');
    });
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
    $PP2_FORM.submit();
  });

  $PP2_FORM.on('submit', function() {
    $('#submit_cover').show();
  });

  $PP2_CONTINUE.on('click', function() {
    $('#submit_cover').show();
    $.ajax({
      type: 'POST',
      url: 'part2',
      data: $PP2_FORM.serialize(),
      context: document.body
    }).done(function() {
      $(location).attr('href', 'complete');
    });
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
    $('#submit_cover').show();
    if(!$('.save-btn').prev().find('.form-control').is(':disabled')) {
      $.ajax({
        type: 'POST',
        url: 'add_trial',
        data: $DET2_FORM.serialize(),
        context: document.body
      }).done(function() {
        $('#submit_cover').hide();
        addTrial(1);
      });
    }else {
      $.ajax({
        type: 'POST',
        url: 'add_trial_w_intime',
        data: '',
        context: document.body
      }).done(function() {
        $('#submit_cover').hide();
        addTrial(1);
      });
    }
  });

  $DET2_FORM.on('click', '#det2_save', function() {
    // at least changed one input
    var allInputs = $('.save-btn').prev().find('input, select').filter(function() {
      return $(this).val() !== '' && $(this).val() !== 'null';
    });
    if(!$('.save-btn').prev().find('.form-control').is(':disabled') && !(allInputs.length == 1 && $(allInputs[0]).val() === 'add'))
      $DET2_FORM.submit();
  });

  $DET2_FORM.on('submit', function() {
    $('#submit_cover').show();
  });

  $DET2_CONTINUE.on('click', function() {
    if(!$('.save-btn').prev().find('.form-control').is(':disabled')) {
      $('#submit_cover').show();
      $.ajax({
        type: 'POST',
        url: 'to_summary',
        data: $DET2_FORM.serialize(),
        context: document.body
      }).done(function() {
        $(location).attr('href', 'summary');
      });
    }else {
      $(location).attr('href', 'summary');
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

  // fix units-select problem
  $('.units-select').attr('disabled', true);
  $('.units-select').addClass('select-disabled');
});

// lab/summary.html
$(document).ready(function() {
  $SUMMARY_PRINT.on('click', function() {
    window.print();
  });

  $('.summary-color-square').each(function() {
    var opacity = parseInt($(this).data('opacity'))/100;
    $(this).css('opacity', opacity);
  });

  initContinueBtn($SUMMARY_CONTINUE, 'postlab');
});

// postlab
$(document).ready(function() {
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

  // set checked using server data
  var data = $POSTLAB_DATA.data("checked");
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
    $POSTLAB_FORM.submit();
  });

  $POSTLAB_FORM.on('submit', function() {
    $('#submit_cover').show();
  });
});

// helper functions
// init tocify
function initTocify($title, $content) {

  $title.tocify({
    extendPage: false
  });

  // adjust tocify position when scrolling
  if(!$content.offset()) return;
  var dist = $content.offset().top;
  $(window).on('scroll', function(){
    var scroll_dist = $(window).scrollTop();
    if(scroll_dist >= dist) {
      $('.tocify').addClass('tocify-stop-scroll');
    }else {
      $('.tocify').removeClass('tocify-stop-scroll');
    }
  });
}

function initContinueBtn($btn, url) {

  // continue onclick
  $btn.on('click', function() {
    if(sessionStorage.current_exp) {
      $(location).attr('href', url);
    }else {
      // wait...
      console.log('Session Expired!');
    }
  });
}

// init continue btn
// prevent destory
function initContinueBtn2($parent, cls, url) {

  // continue onclick
  $parent.on('click', cls, function() {
    if(sessionStorage.current_exp) {
      $(location).attr('href', url);
    }else {
      // wait...
      console.log('Session Expired!');
    }
  });
}

// init unit
function initUnit() {
  // all unit select logic
  var $TYPES_SELECT = $('.types-select'),
      $UNITS_SELECT = $('.units-select');

  // select fill
  $TYPES_SELECT.each(function() {
    for(var type in units) {
      $(this).append("<option>" + type + "</option>");
    }
  });

  // bind onchange
  $TYPES_SELECT.change(function() {
    var $cur_type = $(this);
    var $cur_unit = $(this).next();
    if($cur_type.val() === "null") {
      $cur_unit.empty();
      $cur_unit.append('<option value="null">- Unit -</option>');
      $cur_unit.addClass('select-disabled');
      $cur_unit.prop("disabled", true);
    }else {
      $cur_unit.removeClass('select-disabled');
      $cur_unit.prop("disabled", false);
      $cur_unit.find('option').not(':first').remove();
      $.each(units[$cur_type.val()], function(index, value) {
        $cur_unit.append("<option>" + value + "</option>");
      });
    }
  });
}

// init unit on current accordion
function reinitUnit($TYPES_SELECT, $UNITS_SELECT) {
  $TYPES_SELECT.empty();

  // select fill
  $TYPES_SELECT.each(function() {
    $(this).append("<option value='null'>- Unit Type -</option>");
    for(var type in units) {
      $(this).append("<option>" + type + "</option>");
    }
  });

  // bind onchange
  $TYPES_SELECT.change(function() {
    var $cur_type = $(this);
    var $cur_unit = $(this).next();
    if($cur_type.val() === "null") {
      $cur_unit.empty();
      $cur_unit.append('<option value="null">- Unit -</option>');
      $cur_unit.addClass('select-disabled');
      $cur_unit.prop("disabled", true);
    }else {
      $cur_unit.removeClass('select-disabled');
      $cur_unit.prop("disabled", false);
      $cur_unit.find('option').not(':first').remove();
      $.each(units[$cur_type.val()], function(index, value) {
        $cur_unit.append("<option>" + value + "</option>");
      });
    }
  });
  $TYPES_SELECT.trigger('change');
}

// set slider value
function setSliderVal(sid, val) {
  sid.slider("setValue", val);
  var arrow = sid.parent().find('.slider-handle.round');
  arrow.empty();
  arrow.append('<i class="fa fa-tag det-color-pointer" aria-hidden="true"></i>');
  var op = val/100;
  op = op < 0.1 ? 0.1 : op;
  arrow.find('.det-color-pointer').css('opacity', op);
  sid.parent().siblings('.det-color-square').css('opacity', op);
}

function addTrial(n) {
  for(var i=0; i<n; i++) {
    var content = $('.save-btn').prev()[0].outerHTML;
    var nContent = content.replace(' adjust-arrow', '');

    // reset color picker
    $('.save-btn').before(nContent);
    var nSliderHtml = $('.save-btn').prev().find('.slider.slider-horizontal').find('.det-slider')[0].outerHTML;
    $('.save-btn').prev().find('.slider.slider-horizontal').remove();
    $('.save-btn').prev().find('.det-img').after(nSliderHtml);
    $('.save-btn').prev().find('.det-color-square').css('opacity', 0.5);

    // increment title and id
    var title = $('.save-btn').prev().find('.exp-title > p').text().split(' '),
        title_text = title[0],
        title_no = parseInt(title[1]);
    $('.save-btn').prev().find('.exp-title > p').text(title_text + " " + (title_no+1));

    var increment = (title_no)*100;
    $('.save-btn').prev().find('[id]').each(function() {
      var str_id = this.id,
          qid = parseInt(str_id.split('-')[0])%100,
          afix = parseInt(str_id.split('-')[1]);
      this.id = (qid + increment) + "-" + afix;
      this.name = this.id;
    });

    // disable everything in prev accordion
    $('.trial-accordion .row').removeClass('open');
    $('.trial-accordion .row input').attr('disabled', true);
    $('.trial-accordion .row select').attr('disabled', true);
    $('.trial-accordion .row select').addClass('select-disabled');

    $('.det-color-square').siblings().hide();
    $('.det-color-square').addClass('det-color-square-left');

    // enable everything in new accordion
    $('.save-btn').prev().find('input').attr('disabled', false);
    $('.save-btn').prev().find('select').attr('disabled', false);
    $('.save-btn').prev().find('select').removeClass('select-disabled');
    $('.save-btn').prev().find('.det-color-square').siblings().not('.det-slider').show();
    $('.save-btn').prev().find('.det-color-square').removeClass('det-color-square-left');
    $('.save-btn').prev().addClass('open');

    // init accordion and slider
    $('.trial-accordion [data-accordion]').accordion();
    // fix refresh !!!
    $('.trial-accordion .row').not('.open').find('> [data-content]').animate({'max-height': 0, 'overflow': 'hidden'}, 0);
    $('.save-btn').prev().find('.det-slider').slider();
    $('.save-btn').prev().find('div.det-color-picker div.slider-track .slider-handle.round').append('<i class="fa fa-tag det-color-pointer" aria-hidden="true"></i>');

    // re-init unit
    reinitUnit($('.save-btn').prev().find('.types-select'), $('.save-btn').prev().find('.units-select'));
  }
}

function initTrial(n) {
  addTrial(n);

  // remove last one
  var height = $('.save-btn').prev().find('[data-content]').height();
  $('.trial-accordion .row').removeClass('open');

  $('.save-btn').prev().remove();

  $('.save-btn').prev().addClass('open');

  $('.trial-accordion [data-accordion]').accordion();
  $('.trial-accordion .row.open').find('> [data-content]').animate({'max-height': height, 'overflow': 'auto'}, 0);
}
