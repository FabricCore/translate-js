let config = require("config");

function getOptions() {
    let got = config.load("translate");
    let changed = false;

    if (got == undefined) {
        changed = true;
        got = {};
    }
    if (got.instance == undefined) {
        changed = true;
        got.instance = "translate.siri.ws";
    }
    if (got.source == undefined) {
        changed = true;
        got.source = "auto";
    }
    if (got.target == undefined) {
        changed = true;
        got.target = "en";
    }

    if (changed) config.save("translate", got);
    return got;
}

getOptions();

function translate(content, userOptions = {}) {
    let options = getOptions();
    Object.assign(options, userOptions);
    if (options.print ?? true) console.print("\u00A78Translating...");
    return fetch(`https://${options.instance}/translate`, {
        method: "POST",
        body: JSON.stringify({
            q: content,
            source: options.source,
            target: options.target,
            format: "text",
            alternatives: 1,
            api_key: "",
        }),
        headers: { "Content-Type": "application/json" },
    }).then((res) => {
        let json = res.json();
        if (json.error) {
            console.error(`Could not translate message: ${json.error}`);
            return;
        }

        return json.translatedText;
    });
}

module.exports = translate;
