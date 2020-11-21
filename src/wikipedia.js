const axios = require('axios');

const wikipedia = {

    lang: 'en',

    host: 'wikipedia.org',

    getRandomPage: function() {
        return new Promise ((resolve, reject) => {
            axios.get(`https://${this.lang}.${this.host}/api/rest_v1/page/random/summary`)
                .then(response => {
                    resolve({
                        title: response.data.titles.display,
                        summary: response.data.extract,
                        link: response.data.content_urls.desktop.page 
                    });
                }).catch(error => {
                    reject(error);
                });
        });
    },

    setLang: function(lang) {
        this.lang = lang;
    }

}

module.exports = wikipedia