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
        const index = this.editor.blocks.getCurrentBlockIndex()
        this.editor.blocks.insert(tool, data, {}, index, true, true);
        this.editor.caret.setToBlock(index);
    }

    addBlock(tool, data = {}, needToFocus = true) {
        const index = this.editor.blocks.getCurrentBlockIndex() + 1
        this.editor.blocks.insert(tool, data, {}, index, needToFocus, false);
        this.editor.caret.setToBlock(index);
    }

    deleteCurrentBlock() {
        this.editor.blocks.delete(this.editor.blocks.getCurrentBlockIndex());
    }
}