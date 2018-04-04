$(document).ready(function() {
  jQuery.validator.setDefaults({
    debug: true,
    success: "valid"
  });

  $('#login-form').validate({
    rules: {
      username: {
        required: true
      },
      password: {
        required: true,
        minlength: 5
      }
    },
    highlight: function(element) {
      $(element).closest('.form-group').addClass('has-error');
    },
    unhighlight: function(element) {
      $(element).closest('.form-group').removeClass('has-error');
    },
    errorElement: 'span',
    errorClass: 'help-block',
    errorPlacement: function(error, element) {
      if (element.parent('.input-group').length) {
        error.insertAfter(element.parent());
      } else {
        error.insertAfter(element);
      }
    },
    submitHandler: function(form) {
      // test html session
      sessionStorage.current_exp = "";
      $('#submit_cover').show();
      form.submit();
    }
  });

  $('input').focus(function() {
    $('.flash-msg').remove();
  });
});
