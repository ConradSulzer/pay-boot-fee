const stripeApp = {
    init: function () {
        this.paymentElements();
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

        $('#paymentForm').on('submit', async function (e) {
            e.preventDefault();
            stripeApp.confirmPayment();
        })         
    },

    getClientSecret: function () {
      return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch(location.origin + '/client-secret', { method: 'GET'});
            json = await response.json();

            return resolve(json.clientSecret);
        } catch (e) {
            console.log(e);
            reject(e);
        }
      });
    },

    confirmPayment: async function () {
        const pubKey = $('#paymentForm').data('key');
        const stripe = Stripe(pubKey);
        const clientSecret = await stripeApp.getClientSecret();
        const card = {
            cardNumber: $('#cardNumber'),
            cardCvc: $('#cardCvc'),
            cardExpiry: $('cardExpiry')
        }
            
        stripeResult = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: card,
                billing_details: {
                    address: {
                        postal_code: $('#postalCode')
                    }
                    }
            }
        });

        if(stripeResult.error) {
            console.log('Stripe Error', stripeResult.error);
        } else {
            if(stripeResult.paymentIntent.status === 'suceeded'){
                console.log('Payment Success');
            }
        }
    },

    paymentElements: function () {
        const pubKey = $('#paymentForm').data('key');
        console.log('PubKey', pubKey);
        const stripe = Stripe(pubKey);
        const elements = stripe.elements();

        var style = {
            base: {
                lineHeight: '1.429',
                color: "#32325d",

            }
        };

        const cardNumber = elements.create('cardNumber', { style });
        cardNumber.mount('#cardNumber');

        const cardExpiry = elements.create('cardExpiry', { style });
        cardExpiry.mount('#cardExpiry');

        const cardCvc = elements.create('cardCvc', { style, placeholder: 'CVC' });
        cardCvc.mount('#cardCvc');

        const postalCode = elements.create('postalCode', { style, placeholder: 'Zip code' });
        postalCode.mount('#postalCode');
    }
}

stripeApp.init();