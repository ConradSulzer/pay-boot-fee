$('#enterBoot').on('keyup', (evt) => {
    const reg = new RegExp(`^${evt.target.value}$`);

    for(var i = 0; i < boots.length; i++) {
        if(reg.test(boots[i])) {
            $('button').prop('disabled', false)
            $('.boot-id-next').removeClass('disabled');
            break;
        }else {
            $('button').prop('disabled', true)
            // $('.boot-id-next').addClass('disabled');
        }
    }
});

$('#userInfo').on('submit', (evt) => {
    $('button').prop('disabled', true);
    $('button').toggle();
    $('#loader').toggle();
})