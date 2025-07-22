```js
let translate = require("translate");

translate("Text in foreign language.");
translate("Text in foreign language.", options);
```

Options is an option with fields

- option.instance
- option.source (can be **auto**)
- option.target (such as **en**)

If not specified, the options takes the value of the **translate** config.
