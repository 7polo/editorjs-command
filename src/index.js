import {Bridge} from './Bridge';
import {DirectMode} from './mode/DirectMode';
import {PopMode} from './mode/PopMode';

import './index.less';

export default class Command {
    /**
     * todo 销毁事件
     * todo 键盘事件拦截
     * @param api
     */
    constructor(config={}) {
        const bridge = new Bridge();
        this.modes = [new DirectMode({config, bridge}), new PopMode({config, bridge})];
        this.bridge = bridge;
    }

    bindEditor(editor) {
        this.bridge.bindEditor(editor);
    }

    onKeyUp(event) {
        if (!this.bridge.isReady()) {
            return;
        }
        const block = this.bridge.currentBlock();
        if (block.name !== 'paragraph') {
            return;
        }

        // 获取当前数据 和数据
        const text = block.holder.innerText;
        const key = event.key;
        // console.log(`handle: key=${key} , text=${text}`);
        let consumed = false;
        for (let i = 0; i < this.modes.length; i++) {
            const mode = this.modes[i];

            try {
                consumed = mode.handle(key, text, event);
                if (consumed === true) {
                    break;
                }
            } catch (e) {
                console.warn(e);
                break;
            }
        }
        // consumed === true 说明事件被消费了
        return consumed;
    }

    destroy() {
        this.modes.forEach(mode => {
            mode.destroy && mode.destroy();
        });
    }
}