const app = {
    sendData: function (where, method, data) {

        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(location.origin + where, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (response.status === 403) {
                    return window.location.href = '/admin/login';
                }

                console.log(response);

                const json = await response.json();
                this.formPrintMessage(json);

                resolve(json[0].status);

            } catch (err) {
                console.log(err);
                this.formPrintMessage([{
                    message: 'Error try again!',
                    alert: 'alert-danger'
                }])
                reject('error', e)
            }
        });
    },

    // Takes an array of error messages and prints them to the screen
    formPrintMessage: function (hintMsg) {
        $('#resMessage').html('')
        hintMsg.forEach((msg) => {
            $('#resMessage').append(`<div class="alert ${msg.alert}">*${msg.message}</div>`);
        });
    },

    submitNewAgent: async function () {
        const partialForm = document.querySelector('.partialForm');
        const inputs = partialForm.querySelectorAll('input, select');
        const errorMessages = [];
        const data = {};
        const where = `/admin/add-agent`;
        const method = 'POST';

        inputs.forEach((input) => {
            data[input.name] = input.value.trim()
        });

        for (const prop in data) {
            if (data[prop] === '' || data[prop] === 'Choose...') {
                errorMessages.push({
                    message: `${prop} is required`,
                    alert: 'alert-danger'
                });
            }
        }

        if (data.password !== data.passwordConfirm) {
            errorMessages.push({
                message: 'Passwords do not match',
                alert: 'alert-danger'
            })
            $('#password').value('');
            $('#passwordConfirm').value('');
        }

        if (errorMessages.length !== 0) {
            this.formPrintMessage(errorMessages);
        } else {
            const sendData = await this.sendData(where, method, data)
            if (sendData === 'success') {
                inputs.forEach((input) => {
                    input.value = '';
                });
            }
        }
    },

    deleteAgent: async function (elem) {
        const data = { agentId: elem.parentNode.id }
        const where = '/admin/delete-agent';
        const method = 'DELETE';

        const sendData = await this.sendData(where, method, data);

        if (sendData === 'success') {
            $(elem).closest('li').css('display', 'none');
        }
    },

    toggleEditPassword: function (elem) {
        console.log(elem);
        const parentLi = $(elem).closest('li');
        const toggleDiv = parentLi[0].lastElementChild
        $(toggleDiv).toggle();
    },

    editPassword: async function (elem) {
        const password = $(elem).siblings('input').val()
        const agentId = elem.dataset.id
        const data = {
            agentId,
            password
        }

        const where = '/admin/edit-password';
        const method = 'PUT'

        const sendData = await this.sendData(where, method, data);

        if (sendData === 'success') {
            $(elem).closest('div').toggle();
        }
    },

    addBoot: async function () {
        const where = '/admin/add-boot';
        const method = 'POST';
        const data = {
            bootId: $('#bootId').val().trim(),
            unlock: $('#unlock').val().trim()
        }

        if (data.bootId === '') {
            return this.formPrintMessage([{
                message: 'Must enter boot ID.',
                alert: 'alert-danger'
            }]);
        }

        const sendData = await this.sendData(where, method, data);

        if (sendData === 'success') {
            $('#bootId').val('')
            $('#unlock').val('')
        }
    },

    checkoutBoot: async function () {
        const partialForm = document.querySelector('.partialForm');
        const inputs = partialForm.querySelectorAll('input');
        const errorMessages = [];
        const data = {};
        const where = `/admin/checkout-boot`;
        const method = 'POST';

        inputs.forEach((input) => {
            if (input.value === '') {
                errorMessages.push({
                    message: `${input.name} is required`,
                    alert: 'alert-danger'
                });
            } else {
                data[input.name] = input.value.trim()
            }

        });

        if (errorMessages.length !== 0) {
            this.formPrintMessage(errorMessages);
        } else {
            const sendData = await this.sendData(where, method, data)
            if (sendData === 'success') {
                inputs.forEach((input) => {
                    input.value = '';
                });
            }
        }
    },

    chevronToggle: function (elem) {
        $(elem).toggleClass('active');
        $(elem).closest('.liContain').siblings('.boot-info').toggleClass('active');
    },

    bootFilter: async function (type, elem) {
        let url = location.origin + '/admin/view-boots' 
        if (type === 'not-deployed') {
            url = url + '?deployed=false'
        } else {
            url = url + `?${type}=true`
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                "fetched": "true"
            }
        });

        if (response.status === 401) {
            return window.location.href = '/admin/login';
        }

        response.text().then((html) => {
            $('#dashboardMain').html(html);
        });
    },

    addBootNote: async function (elem) {
        console.log(elem);
        const note = $(elem).siblings('input').val()
        const id = elem.dataset.id;
        const method = 'POST';
        const where = '/admin/boot-note';

        const data = {
            id,
            note
        }
        
        const sendData = await this.sendData(where, method, data);

        if(sendData === 'success') {
            $(elem).siblings('input').val('')
            $(elem).siblings('.boot-notes').find('.note-block').append(`<p>-- ${note}</p>`);
        }
    },

    deleteBoot: async function (elem) {
        console.log(elem);
        const data = { id: elem.getAttribute('data.id') }
        const where = '/admin/delete-boot';
        const method = 'DELETE';

        const sendData = await this.sendData(where, method, data);

        if(sendData === 'success') {
            $(elem).closest('li').hide();
        }
    },

    checkinBoot: async function (elem) {
        const elemId = elem.id;
        const bootId = $(elem).siblings('.form-group').find('#bootId').val().trim()
        const data = {
            action: elemId,
            bootId
        }
        const where = '/admin/checkin-boot';
        const method = 'POST';
        
        const sendData = await this.sendData(where, method, data);

        if(sendData === 'success') {
            $(elem).siblings('.form-group').find('#bootId').val('');
        }
    },

    removeFlag: async function (elem) {
        const bootId = elem.getAttribute('data.id')
        const data = {
            bootId
        }
        const where = '/admin/unflag-boot';
        const method = 'POST';
        
        const sendData = await this.sendData(where, method, data);

        console.log('sendData', sendData);

        if(sendData === 'success') {
            $(elem).hide();
            $(elem).closest('li').find('.boot-status').text('Undeployed');
        }
    },

    changePrice: async function (elem) {
        const mainDiv = document.getElementById('changeBootFee')
        const inputs = mainDiv.querySelectorAll('input');
        const errorMessages = [];
        const data = {};
        const where = `/admin/prices`;
        const method = 'POST';

        inputs.forEach((input) => {
            if (input.value === '') {
                errorMessages.push({
                    message: `${input.name} is required`,
                    alert: 'alert-danger'
                });
            } else {
                data[input.name] = input.value.trim()
            }

        });

        if (errorMessages.length !== 0) {
            this.formPrintMessage(errorMessages);
        } else {
            const sendData = await this.sendData(where, method, data)

            if (sendData === 'success') {
                inputs.forEach((input) => {
                    input.value = '';
                });
                $('#currentFee').html(`Current Fee: $${data.fee}`);
                $('#currentDeposit').html(`Current Deposit: $${data.deposit}`);
            }
        }
    }
}