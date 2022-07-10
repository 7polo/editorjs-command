const DEFAULT_MAPPING = {
    'header': {
        regex: /^(#{1,6}) $/g,
        matched: (regex, text) => {
            const matched = text.match(regex);
            if (matched && matched.length > 0) {
                const level = matched[0].trim().length;
                return {text: '', level: level};
            }
            return null;
        }
    },
    'delimiter': {
        regex: /^---/g,
        create: true
    },
    'code': {
        regex: /^\/code/g
    },
    'image': {
        regex: /^\/img/g
    },
    'Alert': {
        regex: /^\/a/g
    },
    'table': {
        regex: /^\/t/g
    }
};

export class DirectMode {

    constructor({config = {}, bridge}) {
        this.mapping = this.mergeConfig(config.mapping, DEFAULT_MAPPING);
        this.bridge = bridge;
    }

    mergeConfig(config1, config2) {
        return Object.assign({}, config1, config2);
    }

    defaultMatched(regex, text) {
        const matched = text.match(regex);
        if (matched && matched.length > 0) {
            return {};
        }
        return null;
    }

    handle(key, text) {
        text = text + event.key;
        const result = {match: false};

        if (event.key === 'Backspace') {
            return result.match;
        }

        Object.keys(this.mapping).find(tool => {
            const map = this.mapping[tool];
            let func = map.matched;
            if (typeof func !== 'function') {
                func = this.defaultMatched;
            }
            try {
                let matched = func(map.regex, text);
                if (matched) {
                    Object.assign(result, {create: !!map.create, match: true, block: {tool: tool, data: matched}});
                }
                return matched;
            } catch (e) {
                return false;
            }
        });

        if (result.match) {
            const newBlock = result.block;
            this.bridge.replaceBlock(newBlock.tool, newBlock.data);
            if (result.create) {
                this.bridge.addBlock('paragraph')
            }
        }
        return result.match;
    }
}