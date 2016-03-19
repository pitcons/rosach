function clubTextHack() {
  var maxHeight = 0;
  $('.club-text').each(function(){
    var height = $(this).height();
    if (maxHeight < height) {
      maxHeight = height;
    }
  });

  $('.club-text').height(maxHeight);
}

function libImgHack() {
  var diff = $('.scool-img').height() - $('.lib-img').height();
  $('.lib-header').css('margin-top', diff);
}

function runHacks() {
  clubTextHack();
  libImgHack();
}

jQuery(document).ready(function($) {
  runHacks();
});
