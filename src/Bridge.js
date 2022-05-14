/**
 * editor api 适配层
 */
export class Bridge {

    bindEditor(editor) {
        this.editor = editor;
    }

    isReady() {
        return !!this.editor;
    }

    addEventListener(el, event, call) {
        this.editor.listeners.on(el, event, call, false);
    }

    currentBlock() {
        return this.editor.blocks.getBlockByIndex(this.editor.blocks.getCurrentBlockIndex());
    }

    replaceBlock(tool, data) {
        this.editor.blocks.insert(tool, data, {}, this.editor.blocks.getCurrentBlockIndex(), true, true);
        this.editor.caret.setToBlock(this.editor.blocks.getCurrentBlockIndex());
    }

    deleteCurrentBlock() {
        this.editor.blocks.delete(this.editor.blocks.getCurrentBlockIndex());
    }
}