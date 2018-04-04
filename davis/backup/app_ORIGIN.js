var $IMG = $('.img'),
    $INFO_CHECK = $('.info-check'),
    $CHEVRON = $('.fa-chevron-down'),
    $LOCK = $('.lock'),
    $INTRO_CONTENT = $('.intro-content'),
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
    $DET1_CONTINUE = $('.det1-btn'),
    $SUMMARY_CONTINUE = $('.summary-btn');

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

    // get data from json
    var exp_name = sessionStorage.current_exp;
    if(!experiments[exp_name]) return;

    $INTRO_CONTENT.append(experiments[exp_name].introduction);

    initContinueBtn($INTRO_CONTINUE, 'safety_overview');
});

// safety_overview.html
$(document).ready(function() {

    // get data from json
    var exp_name = sessionStorage.current_exp;
    if(!experiments[exp_name]) return;

    var exp_so = experiments[exp_name].safety_overview;
    for (var key in exp_so) {
      var borderColor = exp_so[key].color;
      var so_content = "<div class='col-sm-9 col-padding'><div class='so-card'><div class='so-title "+
                        borderColor +
                        "'><span>" +
                        key +
                        "</span></div><div class='so-content'>" +
                        exp_so[key].content +
                        "</div></div></div>";
      $SO_CONTINUE.before(so_content);
    }

    initContinueBtn($SO_CONTINUE, 'purpose');
});

// purpose.html
$(document).ready(function() {

  // get data from json
  var exp_name = sessionStorage.current_exp;
  if(!experiments[exp_name]) return;

  var exp_purpose = experiments[exp_name].purpose;
  for(var key in exp_purpose) {
    $PO_CONTENT.append('<h1 class="' +
                        exp_purpose[key].title.class +
                        '">' +
                        exp_purpose[key].title.content +
                        '</h1>');
    $PO_CONTENT.append('<p class="' +
                        exp_purpose[key].class +
                        '">' +
                        exp_purpose[key].content +
                        '</p>');
    if(exp_purpose[key].hasOwnProperty('video')) {
      $PO_CONTENT.append('<iframe class="' +
                          exp_purpose[key].video.class +
                          '" src="' +
                          exp_purpose[key].video.src +
                          '" width="560" height="315" frameborder="0" allowfullscreen></iframe>');
    }
  }

  initTocify($('.purpose-title'), $PO_CONTENT);

  initContinueBtn($PO_CONTINUE, 'procedure');
});

// procedure.html
$(document).ready(function() {

  // get data from json
  var exp_name = sessionStorage.current_exp;
  if(!experiments[exp_name]) return;

  var exp_procedure = experiments[exp_name].procedure;
  for(var key in exp_procedure) {
    $PC_CONTENT.append('<h1 class="' +
                        exp_procedure[key].title.class +
                        '">' +
                        exp_procedure[key].title.content +
                        '</h1>');
    $PC_CONTENT.append('<p class="' +
                        exp_procedure[key].class +
                        '">' +
                        exp_procedure[key].content +
                        '</p>');
    if(exp_procedure[key].hasOwnProperty('imgs')) {
      // non-jQuery Objects each
      $.each(exp_procedure[key].imgs, function(i, v) {
        $PC_CONTENT.append('<img class="' +
                            v.class +
                            '" src="' +
                            v.src +
                            '">');
      });
    }
  }

  initTocify($('.procedure-title'), $PC_CONTENT);

  initContinueBtn($PC_CONTINUE, 'waste_disposal');
});

// waste_disposal.html
$(document).ready(function() {

    // get data from json
    var exp_name = sessionStorage.current_exp;
    if(!experiments[exp_name]) return;

    $WD_CONTENT.append(experiments[exp_name].waste_disposal);

    initContinueBtn($WD_CONTINUE, 'prelab/part1');
});

// prelab/part1.html
$(document).ready(function() {

  // get data from json
  var exp_name = sessionStorage.current_exp;
  if(!experiments[exp_name]) return;

  var exp_pp1 = experiments[exp_name].prelab.pp1.questions;
  for(var question in exp_pp1) {
    var count = 0;
    var card = "";
    card = card + "<div class='pp1-card'><div class='pp1-title add-indent " +
                exp_pp1[question].title.style +
                "'>" +
                exp_pp1[question].title.content +
                "</div><div class='pp1-content'><ul>";
    for(var q in exp_pp1[question]) {
      if(q === "title") continue;
      card = card + '<li><input type="radio" id="' +
                  exp_pp1[question][q].id +
                  '" name="' +
                  exp_pp1[question][q].group +
                  '"><label for="' +
                  exp_pp1[question][q].id +
                  '">' +
                  exp_pp1[question][q].content +
                  '</label><div class="check">';
      if(count === 0) card = card + '</div></li>';
      else card = card + '<div class="inside"></div></div></li>';
      count++;
    }
    card = card + '</ul></div></div>';
    $PP1.append(card);
  }

  initContinueBtn($PP1_CONTINUE, 'part2');
});

// prelab/part2.html
$(document).ready(function() {

  // var exp_name = sessionStorage.current_exp;
  // if(!experiments[exp_name]) return;
  //
  // var exp_pp2 = experiments[exp_name].prelab.pp2.questions;
  // for(var question in exp_pp2) {
  //   var card = "";
  //   card += "<div class='pp1-card'>" +
  //           "<div class='pp1-title " +
  //           exp_pp2[question].title.style +
  //           "'>" +
  //           exp_pp2[question].title.content +
  //           "</div><div class='" +
  //           exp_pp2[question].content.style +
  //           "'>" +
  //           exp_pp2[question].content.html +
  //           "</div></div>";
  //   $PP2.append(card);
  // }

  initUnit();

  initContinueBtn($PP2_CONTINUE, 'complete');
});

// data_entry/trial1.html
$(document).ready(function() {

  // slider
  $('.det-slider').slider();
  $('div.det-color-picker div.slider-track .slider-handle.round').append('<i class="fa fa-tag det-color-pointer" aria-hidden="true"></i>');
  $('.det1, .trial-accordion').on('slide', '.det-slider', function(ev){
    var arrow = $(this).parent().find('.slider-handle.round');
    arrow.empty();
    arrow.append('<i class="fa fa-tag det-color-pointer" aria-hidden="true"></i>');
    var op = ev.value/100;
    op = op < 0.1 ? 0.1 : op;
    arrow.find('.det-color-pointer').css('opacity', op);
    $(this).parent().siblings('.det-color-square').css('opacity', op);
  });

  initContinueBtn($DET1_CONTINUE, 'trial2');
});

// data_entry/trial2.html
$(document).ready(function() {

  $('.trial-accordion [data-accordion]').accordion();

  // dynamically add trial
  $('.trial-accordion').on('click', '.new-trial-btn', function() {
    var content = $('.save-btn').prev()[0].outerHTML;
    var nContent = content.replace(' adjust-arrow', '');

    $('.save-btn').before(nContent);
    $('.save-btn').prev().find('.slider.slider-horizontal').remove();
    $('.save-btn').prev().find('.det-img').after('<input class="det-slider" type="text" data-slider-min="0" data-slider-max="100" data-slider-step="1" data-slider-value="50" data-slider-tooltip="hide" data-attr="1" />');
    $('.save-btn').prev().find('.det-color-square').css('opacity', 0.5);

    // refresh
    $('.trial-accordion .row').removeClass('open');
    $('.trial-accordion .row input').attr('disabled', true);
    $('.trial-accordion .row select').addClass('select-disabled');
    $('.save-btn').prev().find('input').attr('disabled', false);
    $('.save-btn').prev().find('select').removeClass('select-disabled');
    $('.save-btn').prev().addClass('open');

    var origin = $('.trial-accordion').html();
    $('.trial-accordion').empty();
    $('.trial-accordion').append(origin);

    $('.trial-accordion [data-accordion]').accordion();

    $('.save-btn').prev().find('.det-slider').slider();
    $('.save-btn').prev().find('div.det-color-picker div.slider-track .slider-handle.round').append('<i class="fa fa-tag det-color-pointer" aria-hidden="true"></i>');
  });

  initContinueBtn2($('.trial-accordion') , '.det2-btn', 'summary');
});

// data_entry/summary.html
$(document).ready(function() {

  // popover
  $("[data-toggle='popover']").popover({
    html: true,
    content: function() {
      return $('#popoverContent').html();
    }
  });

  // $('tr[data-toggle="popover"]').on('mouseover', function() {
  //   $(this).attr('data-content', 'The paragraph within the popover is using <code>data-content</code> attribute.');
  // });

  initContinueBtn($SUMMARY_CONTINUE, 'postlab');
});

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

// init continue btn
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
      $(this).append("<option>&nbsp;&nbsp;&nbsp;" + type + "</option>");
    }
  });

  // select bind onchange
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
      $cur_unit.empty();
      $cur_unit.append('<option value="null">- Unit -</option>');
      $.each(units[$cur_type.val()], function(index, value) {
        $cur_unit.append("<option>&nbsp;&nbsp;&nbsp;" + value + "</option>");
      });
    }
  });
}
