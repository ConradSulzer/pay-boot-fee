let boots = []

const getBoots = async () => {
    try {
        const response = await fetch(location.origin + '/get-boots', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const json = await response.json();
        json.forEach((boot) => {
            boots.push(boot);
        })

    } catch (e) {
        console.log(e);
    }
}

getBoots();