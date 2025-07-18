let { StringArgumentType } = com.mojang.brigadier.arguments;
let { createText } = require("text");
let command = require("command");
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

addEventListener("clientModifyReceiveGameMessageEvent", (text) => {
    let content = text.getString().replaceAll(/§./g, "");
    if (content.trim().length == 0) return;

    let words = content.split(" ");
    let isPlayer = /<.*>|.*:/.test(words[0]);

    if (isPlayer) content = words.slice(1).join(" ");

    return createText([
        text,
        " ",
        {
            content: "[T]",
            color: isPlayer ? "#cba6f7" : "#6c7086",
            hover: `Translate "${content}"`,
            click: `/translate auto ${content}`,
        },
    ]);
});

function autoTranslate(ctx) {
    let content = StringArgumentType.getString(ctx, "content");
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
                    type: StringArgumentType.greedyString(),
                    execute: autoTranslate,
                },
            },
        },
    },
});
