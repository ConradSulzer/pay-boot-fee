$(document).ready(function () {

    // Side bar visability event listeners===============
    $('#menuIcon').on('click', () => {
        $('#sidebar').removeClass('active');
    });

    $('#dismiss').on('click', () => {
        $('#sidebar').toggleClass('active');
        $('.dark-overlay').removeClass('active');
    })

    $('#menuIcon2, .overlay').on('click', () => {
        // hide sidebar
        $('#sidebar').toggleClass('active');
        // hide overlay
        $('.dark-overlay').toggleClass('active');
    });

    // Side bar a tag event listener. Fetch EJS partial to inject on page
    $('#sidebar a').on('click', (e) => {
        const classname = e.target.className

        if (classname === 'redirect') {
            const url = location.origin + '/admin/' + e.target.id;

            fetch(url, {
                method: 'GET',
                headers: {
                    "fetched": "true"
                }
            }).then((res) => {
                if (res.status === 401 || res.status === 403) {
                    return window.location.href = '/admin/login';
                }
                res.text().then((html) => {
                    $('#dashboardMain').html(html);
                })
            });
        }
    });

    $(document).on('change', 'input[type=checkbox]', function () {
        const checker = this.id
        if ($(this).is(':checked')) {
            $('input[type=checkbox]').each(function () {
                const checkee = this.id
                if (checker !== checkee) {
                    $(this).prop('checked', false);
                }
            });

            app.bootFilter(checker);
        } else {
            app.bootFilter('');
        }
    });

    $(document).on('click', '#filterClick', function () {
        $('#viewBootMenuDiv').toggle();
    });

});