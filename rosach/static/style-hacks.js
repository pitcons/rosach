function clubTextHack() {
  for(var i = 1;;i++) {
    var maxHeight = 0;
    $('.club-line-'+ i +' .club-text').each(function(){
      var height = $(this).height();
      if (maxHeight < height) {
        maxHeight = height;
      }
    });

    if (maxHeight == 0) {
      break;
    } else {
      $('.club-line-'+ i +' .club-text').height(maxHeight);
    }
  }
}

function libImgHack() {

  var diff = $('.scool-img').height() - $('.lib-img').height();
  $('.lib-header').css('margin-top', diff);
  if (diff == 0) {
    setTimeout(function(){ libImgHack(); }, 500);
  }

}

function contentLeftHack() {
  $('#content').css('left', $("#logo-image").width() / -17);
}

function clubHeaderHack() {
  $('.club-header p').each(function(){

    if ($(this).height() > 100) {
      $(this).closest('div').css("top", "-140px");
    } else if ($(this).height() > 44) {
      $(this).closest('div').css("top", "-100px");
    } else {
      $(this).closest('div').css("top", "-60px");
    }
  });
}


function runHacks() {
  clubTextHack();
  libImgHack();
  clubHeaderHack();
  contentLeftHack();
}

function menuScroll() {
  if ($(".disable-menu-scroll").length == 0) {
    $('.menu-wrap').css('top', $(window).scrollTop());
  }
}

jQuery(document).ready(function($) {
  runHacks();
  $(window).resize(runHacks);
  $(window).scroll(function() {
    menuScroll();
  });

  // $('.filer_image').addClass('img-resonsive');
  // $('.filer_image').removeClass('filer_image');

});
