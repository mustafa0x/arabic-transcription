let $ = s => document.querySelector(s);
Node.prototype.on = Node.prototype.addEventListener;

let translate = (map, val) => map.reduce((v, p) => v.replace(new RegExp(p[0], 'g'), p[1]), val);

let debounce = (() => {
    let timer = 0;
    return (cb, ms) => {
        clearTimeout(timer);
        timer = setTimeout(cb, ms);
    };
})();

function speak(text, voice) {
    if (!window.speechSynthesis)
        return;

    let msg = new SpeechSynthesisUtterance();
    msg.text = text;
    msg.voice = speechSynthesis.getVoices().find(v => v.name === voice);
    speechSynthesis.speak(msg);
}

function preprocess(val) {
    let repls = [
        // Replace shaddah with letter preceding it
        [/([ء-ي])ّ/g, '$1$1'],

        // Remove dagger-alif preceded by alif maksoorah
        [/ىٰ/g, 'ى'],
        // Remove fatha followed by alif
        [/َا/g, 'ا'],

        // Add kasrah to alif with hamzah below
        [/إ[^ِ]/g, 'إِ$1'],

        // Remove alif after waaw al-jama'ah
        [/وْ?ا( |$)/g, 'و$1'],

        // Remove alif after tanween fath
        [/ًا/g, 'ً'],
    ];
    repls.forEach(r => val = val.replace(r[0], r[1]));
    return val;
}

fetch('ar-transcription-schemes.json').then(r => r.json()).then(json => {
    for (const scheme of Object.keys(json))
        $('main').innerHTML += `<h2>${scheme}</h2><textarea id="${scheme}"></textarea>`;

    $('#in').on('keyup', e => debounce(() => {
        let val = $('#in').value;
        if (val.length > 1000){
            alert('The text is too long; aborting.');
            return;
        }

        val = preprocess(val);
        for (const [scheme, map] of Object.entries(json))
            $('#' + scheme).value = translate(map, val);
    }, 450));

    $('#in').on('click', () => speak($('#in').value, 'Maged'));
    $('#Simple').on('click', () => speak($('#Simple').value, 'Damayanti'));

    // Sample Arabic
    $('#in').value = 'مَرحَبا';
    $('#in').dispatchEvent(new CustomEvent('keyup'));
});
