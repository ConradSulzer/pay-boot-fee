var app = {
    cancel: async function () {
        const response = await fetch(location.origin + '/cancel', {
            method: 'GET',
        });

        return window.location.href = '/';
    },

    back: async function () {
        const pathName = location.pathname;

        if (pathName === '/pay') {

        }

        const response = await fetch(location.origin + '/cancel', {
            method: 'GET',
        });

        return window.location.href = '/';
    }
};