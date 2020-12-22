$('#enterBoot').on('keyup', (e) => {
    const reg = new RegExp(`^${e.target.value}$`);

    for(var i = 0; i < boots.length; i++) {
        if(reg.test(boots[i])) {
            $('.boot-id-next').removeClass('disabled');
            break;
        }else {
            $('.boot-id-next').addClass('disabled');
        }
    }
});