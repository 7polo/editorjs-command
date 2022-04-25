import {make} from '../utils';

/**
 * 状态定义
 */
const STATE = {
    NONE: 0, // 未渲染
    HIDE: 1, // 渲染&隐藏
    SHOW: 2  // 渲染&展示
};

export class PopMode {

    constructor({config = {}, bridge}) {

        this.config = Object.assign({tools: {}}, config);

        this.bridge = bridge;

        this.state = STATE.NONE;

        this.tools = null;

        this.grid = {
            colSize: 5,
            pos: {x: 0, y: 0},
            max: {x: 0, y: 0}
        };
    }

    handle(key, text, event) {
        if (this.state !== STATE.SHOW) {
            if ((text + key).startsWith('/')) {
                this.show();
                return true;
            }
            return false;
        }
        if (key === 'Escape') {
            this.hide();
            return false;
        }
        if (key === 'Tab') {
            event.returnValue = false;
            event.preventDefault();
            event.stopPropagation();
            return true;
        }

        if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].indexOf(key) !== -1) {
            this.onArrowKey(key);
            return true;
        }

        if (key === 'Enter') {
            const tool = this.currentTool();
            if (tool) {
                this.transform(tool);
                this.hide();
            }
            event.returnValue = false;
            event.preventDefault();
            event.stopPropagation();
            return true;
        }

        if ((text + key).startsWith('/')) {
            this.show();
            return true;
        }
        return false;
    }

    render() {
        if (this.state !== STATE.NONE) {
            return;
        }
        const wrapper = make('div', ['command-menu', 'show']);

        const html = this.getTools()
            .map(tool => this.getToolItemHtml(tool))
            .join('');

        this.wrapper = wrapper;
        wrapper.innerHTML = `<div class="command-menu-content">${html}</div>`;
        document.body.appendChild(wrapper);
        this.moveSelected(this.grid.pos);

        // bind event
        this.bridge.addEventListener(this.wrapper, 'click', (e) => {
            if (this.state !== STATE.SHOW) {
                return;
            }
            const target = e.path.find(item => item.classList && item.classList.contains('command-menu-item'));
            if (target) {
                this.transform(target.dataset.tool);
                this.hide();
            }
        });
    }

    getToolItemHtml(tool) {
        return `<div class="command-menu-item" data-tool="${tool.type}">
                <div class="_item"><span class="icon">${tool.icon}</span><span>${tool.title}</span></div>
                </div>`;
    }

    getTools() {
        if (this.tools) {
            return this.tools;
        }
        const tools = this.bridge.editor.configuration.tools;
        let cmdTools = [];

        const customerToolTypes = Object.keys(this.config.tools);
        Object.keys(tools).forEach(name => {
            if (name === 'paragraph') {
                return false;
            }
            if (customerToolTypes.indexOf(name) !== -1) {
                return false;
            }
            let tool = tools[name].class ? tools[name].class : tools[name];
            if (tool.isInline || tool.isTune || !tool.toolbox) {
                return false;
            }
            if (typeof tool.getSubTools === 'function') {
                const subs = tool.getSubTools(tool) || [];
                subs.forEach(item => {
                    cmdTools.push({
                        type: item.type,
                        name: name,
                        icon: item.icon,
                        title: tool.toolbox.title,
                        data: item.data || {}
                    });
                });
                return false;
            }

            cmdTools.push({
                type: name,
                name: name,
                icon: tool.toolbox.icon,
                title: tool.toolbox.title
            });
        });

        customerToolTypes.forEach(tool => {
            cmdTools = cmdTools.concat(this.config.tools[tool] || []);
        });

        this.tools = cmdTools;

        // 计算最后一个单元格坐标
        Object.assign(this.grid.max, {
            x: parseInt(((this.tools.length - 1) % this.grid.colSize) + ''),
            y: parseInt(Math.ceil((this.tools.length / this.grid.colSize)) + '') - 1
        });

        // console.log(this.grid.max);
        return cmdTools;
    }

    show() {
        this.render();
        this.state = STATE.SHOW;
        const currentEl = this.bridge.currentBlock().holder;
        const pos = {
            top: currentEl.getBoundingClientRect().top + document.documentElement.scrollTop + 30,
            left: currentEl.getBoundingClientRect().left
        };
        Object.assign(this.wrapper.style, {top: pos.top + 'px', left: pos.left + 'px'});
        this.wrapper.classList.add('show');
    }

    hide() {
        if (this.state === STATE.NONE) {
            return;
        }
        this.state = STATE.HIDE;
        this.wrapper.classList.remove('show');
    }

    transform(type) {
        const tool = this.tools.find(item => item.type === type);
        if (!tool) {
            return;
        }
        this.bridge.replaceBlock(tool.name, tool.data || {});
    }

    currentTool() {
        const toolEL = this.wrapper.querySelectorAll('.command-menu-item.selected')[0];
        if (toolEL) {
            return toolEL.dataset.tool;
        }
    }

    destroy() {
        this.wrapper.remove();
    }

    onArrowKey(key) {
        let {x, y} = this.grid.pos;
        if (key === 'ArrowLeft' || key === 'ArrowRight') {
            x = x + (key === 'ArrowLeft' ? -1 : 1);
            const maxX = (y >= this.grid.max.y) ? this.grid.max.x : this.grid.colSize - 1;
            if (x < 0) {
                x = maxX;
            }
            if (x > maxX) {
                x = 0;
            }
        }
        if (key === 'ArrowDown' || key === 'ArrowUp') {
            y = y + (key === 'ArrowDown' ? 1 : -1);
            if (y < 0) {
                y = x > this.grid.max.x ? this.grid.max.y - 1 : this.grid.max.y;
            }
            if (y > this.grid.max.y) {
                y = 0;
            }
        }
        this.moveSelected({x, y});
    }

    moveSelected({x, y}) {
        this.grid.pos = {x, y};
        // console.log(`move: (${x}, ${y})`);
        const pos = x + y * this.grid.colSize;
        this.wrapper.querySelectorAll('.command-menu-item').forEach((el, index) => {
            if (el.classList && el.classList.contains('selected')) {
                el.classList.remove('selected');
            }
            if (index === pos) {
                el.classList.add('selected');
            }
        });
    }
}