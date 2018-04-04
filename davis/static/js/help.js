// radio IDs that need to be disabled
// last value is a flag
function getNotChangedRadios($FORM) {
  var res = [];
  var raw = $FORM.find('[data-checked]').data('checked');
  raw = raw.substring(0, raw.length - 1);
  var data = raw.split(',').sort(function(a, b) {
    return parseInt(a.split('-')[0]) - parseInt(b.split('-')[0]);
  });
  var form = [];
  $.each($FORM.serializeArray(), function(i, v) {
    var temp = [];
    for(var key in v) {
      temp.push(v[key]);
    }
    form.push(temp.join('-'));
  });
  $.each(form, function(i, v) {
    if(data.includes(v)) res.push(v);
  });
  // to see if inputs are changed
  res.push(form.toString() !== data.toString());
  return res;
}

// inputs/selects IDs that need to be disabled
// last value is a flag
function getNotChangedValues($FORM) {
  var res = [];
  var form = [];
  var raw = $FORM.find('[data-checked]').data('checked');
  raw = raw.substring(0, raw.length - 1);
  var data = raw.split(',').sort(function(a, b) {
    a = a.split('*')[0];
    b = b.split('*')[0];
    return parseInt(a.split('-')[0]) - parseInt(b.split('-')[0]) || parseInt(a.split('-')[1]) - parseInt(b.split('-')[1]);
  });

  $.each($FORM.serializeArray(), function(i, v) {
    var temp = [];
    for(var key in v) {
      temp.push(v[key]);
    }
    // replace serialized inputs to match server data structure
    form.push(temp.join('*').replace('null', ''));
  });

  // add empty data to serialized inputs(if not exists) to match server data structure
  $.each(data, function(i, v) {
    if(!form.includes(v) && !v.split('*')[1] && form.reduce(function(total, val) {
      if(val.indexOf(v.split('*')[0]) === -1)
        return ++total;
    }, 0)) form.push(v);
  });

  form = form.sort(function(a, b) {
    a = a.split('*')[0];
    b = b.split('*')[0];
    return parseInt(a.split('-')[0]) - parseInt(b.split('-')[0]) || parseInt(a.split('-')[1]) - parseInt(b.split('-')[1]);
  });

  $.each(form, function(i, v) {
    if(data.includes(v)) {
      res.push(v);
    }else if(!v.split('*')[1]) {
      // delete empty serialized inputs to match server data structure
      delete form[i];
    }
  });
  // filter 'undefined' value
  form = form.filter(function(v) {
    if(v) return v;
  });

  // to see if inputs are changed
  res.push(form.toString() !== data.toString());
  return res;
}

// check if radios checked
function validMultiChoices($FORM) {
  var total = $FORM.find('input[type=radio]').length/4;
  var checked = $FORM.find('input[type=radio]:checked');
  if(checked.length !== total)
      $('.modal-body').data('message', 'Please finish all questions!');
  return checked.length === total;
}

// check if all numbers valid and fields filled
function validAllFields($FORM) {
  var $inputs = $FORM.find('input[type=number]');
  var $selects = $FORM.find('select');
  var flag = true;
  $inputs.each(function() {
    var input_val = $(this).val();
    // $(this).val() returns '' if invalud number
    if(!input_val) {
      $('.modal-body').data('message', 'Please fill with valid numbers!');
      $(this).val('');
      flag = false;
      return flag;
    }
  });
  if(!flag) return flag;
  $selects.each(function() {
    var select_val = $(this).val();
    if(select_val === 'null') {
      $('.modal-body').data('message', 'Please select a(n) type/unit!');
      flag = false;
      return flag;
    }
  });
  return flag;
}

// check if all numbers valid and fields filled in current trial
function validCurrentTrial($FORM) {
  var $inputs = $FORM.find('.open').find('input[type=number]');
  var $selects = $FORM.find('.open').find('select');
  var flag = true;
  $inputs.each(function() {
    var input_val = $(this).val();
    // $(this).val() returns '' if invalud number
    if(!input_val) {
      $('.modal-body').data('message', 'Please fill with valid numbers!');
      $(this).val('');
      flag = false;
      return flag;
    }
  });
  if(!flag) return flag;
  $selects.each(function() {
    var select_val = $(this).val();
    if(select_val === 'null') {
      $('.modal-body').data('message', 'Please select a(n) type/unit!');
      flag = false;
      return flag;
    }
  });
  return flag;
}

// save without type/unit
function save_wo_ut_uv($FORM, getData, url, dist) {
  var data = getData($FORM);
  var isChanged = data.pop();
  if(isChanged) {
    $.each(data, function(i, v) {
      $('#'+v.split('*')[0]).prop('disabled', true);
    });
    $('#submit_cover').show();
    $.ajax({
      type: 'POST',
      url: url,
      data: $FORM.serialize(),
      context: document.body
    }).done(function() {
      $.each(data, function(i, v) {
        $('#'+v.split('*')[0]).prop('disabled', false);
      });
      // PRG pattern
      $(location).attr('href', dist);
    });
  }else {
    // fake saving
    $('#submit_cover').show();
    setTimeout(function() {
      $('#submit_cover').hide();
    }, 500);
  }
}

// save with type/unit
function save_w_ut_uv($FORM, getData, url, dist, callback) {
  var data = getData($FORM);
  var isChanged = data.pop();
  if(isChanged) {
    // make sure 3 values to insert
    data = group(data);
    new_data = [];
    $.each(data, function(i, v) {
      if(v.length == 3) new_data.push(v);
    });
    data = ungroup(new_data);
    $.each(data, function(i, v) {
      $('#'+v.split('*')[0]).prop('disabled', true);
      $('#'+v.split('*')[0]).addClass('select-disabled');
    });

    $('#submit_cover').show();
    $.ajax({
      type: 'POST',
      url: url,
      data: $FORM.serialize(),
      context: document.body
    }).done(function() {
      $.each(data, function(i, v) {
        $('#'+v.split('*')[0]).prop('disabled', false);
        $('#'+v.split('*')[0]).removeClass('select-disabled');
      });
      if(callback) callback(1);
      // PRG pattern
      $(location).attr('href', dist);
    });
  }else {
    // fake saving
    $('#submit_cover').show();
    setTimeout(function() {
      $('#submit_cover').hide();
    }, 500);
  }
}

// continue with type/unit
function continue_w_ut_uv($FORM, getData, url, dist, callback) {
  var data = getData($FORM);
  var isChanged = data.pop();
  $('#submit_cover').show();
  if(isChanged) {
    // make sure 3 values to insert
    data = group(data);
    new_data = [];
    $.each(data, function(i, v) {
      if(v.length == 3) new_data.push(v);
    });
    data = ungroup(new_data);

    $.each(data, function(i, v) {
      $('#'+v.split('*')[0]).prop('disabled', true);
      $('#'+v.split('*')[0]).addClass('select-disabled');
    });
    $.ajax({
      type: 'POST',
      url: url,
      data: $FORM.serialize(),
      context: document.body
    }).done(function() {
      $.each(data, function(i, v) {
        $('#'+v.split('*')[0]).prop('disabled', false);
        $('#'+v.split('*')[0]).removeClass('select-disabled');
      });
      if(callback) callback();
    });
  }
  $(location).attr('href', dist);
}

// init modal with msg
function showModal() {
  $('#msg_modal').modal({
    backdrop: 'static',
    keyboard: false
  });
  $('.modal-body > p').text($('.modal-body').data('message'));
}

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
      // loading gif
      $('#cover').show().css({'opacity':0.5});
      setTimeout(function() {
        $(location).attr('href', url);
      }, 500);
    }else {
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

    // disable everything in prev accordions
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

    // init accordion
    $('.trial-accordion [data-accordion]').accordion();
    // fix refresh !!!
    $('.trial-accordion .row').not('.open').find('> [data-content]').animate({'max-height': 0, 'overflow': 'hidden'}, 0);
    // init current slider
    $('.save-btn').prev().find('.det-slider').slider();
    $('.save-btn').prev().find('div.det-color-picker div.slider-track .slider-handle.round').append('<i class="fa fa-tag det-color-pointer" aria-hidden="true"></i>');

    // re-init current unit
    reinitUnit($('.save-btn').prev().find('.types-select'), $('.save-btn').prev().find('.units-select'));
  }
}

function initTrial(n) {
  if(n <= 1) return;
  addTrial(n-1);
}

// group up based on ID1 ('ID1-ID2*value')
// return 2D array
function group(data) {
  new_data = [];
  temp = [];
  for(var i in data) {
    if(!temp || (temp[0] && temp[0].split('-')[0] === data[i].split('-')[0])) {
      temp.push(data[i]);
    }else {
      new_data.push(temp);
      temp = [];
      temp.push(data[i]);
    }
  }
  new_data.push(temp);
  new_data.shift();
  return new_data;
}

// ungroup to 1D array
function ungroup(data) {
  var res = [];
  for(var i in data) {
    for(var j in data[i]) {
      res.push(data[i][j]);
    }
  }
  return res;
}

function buildPreview($content) {
}
