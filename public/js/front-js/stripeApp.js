const stripeApp = {
    init: function () {
        this.paymentElement();
        this.eventListeners();
    },

    eventListeners: function () {
        $('#card-element').on('change', function (e) {
            const displayError = $('#card-errors')

            if (e.error) {
                displayError.textContent = e.error.message;
            } else {
                displayError.textContent = '';
            }
        });
    },

    paymentElement: function () {
        const pubKey = $('#paymentForm').data('key');
        const stripe = Stripe(pubKey);
        const elements = stripe.elements();

        var style = {
            base: {
                color: "#32325d",

            }
        };

        const card = elements.create('card', { style: style });
        card.mount('#card-element');

        $('#paymentForm').on('submit', async function (event) {
            event.preventDefault();
            // hide buttons and show loader
            $('button').prop('disabled', true);
            $('button').toggle();
            $('#loader').toggle();

            const data = stripeApp.grabCardData();

            const result = await stripe.createToken(card, data);

            if (result.error) {
                console.log(result.error);
            } else {
                stripeApp.tokenHandler(result.token);
            }
        });

    },

    tokenHandler: function (token) {
        const form = document.getElementById('paymentForm');

        const hiddenInput = document.createElement('input');
        hiddenInput.setAttribute('type', 'hidden');
        hiddenInput.setAttribute('name', 'stripeToken');
        hiddenInput.setAttribute('value', token.id);
        form.appendChild(hiddenInput);

        form.submit();
    },

    grabCardData() {
        const data = {}
        const x = $("#paymentForm").find(".card-info");

        $(x).each((index) => {
            data[x[index].id] = $(x[index]).val();
        })

        return data
    }
}

stripeApp.init();