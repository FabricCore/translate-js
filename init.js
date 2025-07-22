let text = require("text");
let command = require("command");
let toggle = require("toggle");
let translate = module.require("./");

toggle.register({
    name: "Translater",

    clientModifyReceiveGameMessageEvent(msg) {
        let content = msg.getString().replaceAll(/§./g, "");
        if (content.trim().length == 0) return;

        let words = content.split(" ");
        let isPlayer = /<.*>|.*:/.test(words[0]);

        if (isPlayer) content = words.slice(1).join(" ");

        return text.createText([
            msg,
            " ",
            {
                content: "[T]",
                color: isPlayer ? "#cba6f7" : "#6c7086",
                hover: `Translate "${content}"`,
                click: `/translate auto ${content}`,
            },
        ]);
    },
});

function autoTranslate(content) {
    let options = getOptions();
    console.print("\u00A78Translating...");
    fetch(`https://${options.instance}/translate`, {
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
    })
        .then((res) => {
            let json = res.json();
            if (json.error) {
                console.error(`Could not translate message: ${json.error}`);
                return;
            }
            console.print(`\u00A77Translated: ${json.translatedText}`);
        })
        .catch((e) => console.error(`Could not translate message: ${e}`));
}

command.register({
    name: "translate",

    subcommands: {
        auto: {
            args: {
                content: {
                    type: "greedy",
                    execute: (content) => {
                        translate(content)
                            .then((msg) =>
                                console.print(`\u00A77Translated: ${msg}`),
                            )
                            .catch((e) =>
                                console.error(
                                    `Could not translate message: ${e}`,
                                ),
                            );
                    },
                },
            },
        },
    },
});
