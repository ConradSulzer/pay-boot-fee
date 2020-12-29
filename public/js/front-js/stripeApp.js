const stripeApp = {
    init: function () {
        this.paymentElement();
        this.eventListeners();
    },

    eventListeners: function () {
        $('#card-element').on('change', function (e) {
            const displayError = $('#card-errors')
        
            if(e.error) {
                displayError.textContent = e.error.message;
            } else {
                displayError.textContent = '';
            }
        });        
    },

    // getClientSecret: function () {
    //   return new Promise(async (resolve, reject) => {
    //     try {
    //         const response = await fetch(location.origin + '/client-secret', { method: 'GET'});
    //         json = await response.json();

    //         return resolve(json.clientSecret);
    //     } catch (e) {
    //         console.log(e);
    //         reject(e);
    //     }
    //   });
    // },

    // confirmPayment: async function () {
    //     const pubKey = $('#paymentForm').data('key');
    //     const stripe = Stripe(pubKey);
    //     const clientSecret = await stripeApp.getClientSecret();
           
    //     stripeResult = await stripe.confirmCardPayment(clientSecret, {
    //         payment_method: {
    //             card: card,
    //             billing_details: {
    //                 address: {
    //                     postal_code: $('#postalCode')
    //                 }
    //                 }
    //         }
    //     });

    //     if(stripeResult.error) {
    //         console.log('Stripe Error', stripeResult.error);
    //     } else {
    //         if(stripeResult.paymentIntent.status === 'suceeded'){
    //             console.log('Payment Success');
    //         }
    //     }
    // },

    paymentElement: function () {
        const pubKey = $('#paymentForm').data('key');
        const stripe = Stripe(pubKey);
        const elements = stripe.elements();

        var style = {
            base: {
                color: "#32325d",

            }
        };

        const card = elements.create('card', {style: style});
        card.mount('#card-element');
        
        $('#paymentForm').on('submit', async function (event) {
            event.preventDefault();

            const result = await stripe.createToken(card);

            if(result.error) {
                // Show customer an error
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
    }
}

stripeApp.init();