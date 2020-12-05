"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.load = void 0;
const converter_1 = require("typedoc/dist/lib/converter");
const comment_1 = require("typedoc/dist/lib/converter/factories/comment");
const abstract_1 = require("typedoc/dist/lib/models/reflections/abstract");
const ts = require('typescript');
function getModuleComment(text) {
    const hasModuleComment = text.slice(0, 3) === '/**';
    if (!hasModuleComment)
        return 0;
    const endCommentIndex = text.indexOf('*/');
    const comment = text.slice(3, endCommentIndex).trim();
    return comment;
    // const parsedComment = comment.split('\n')
    //   .map(line => line.replace(/^\s+\*+\s+/i, ''))
    //   .join('\n')
    // return pase
}
function load({ application }) {
    /** Subscribe on EVENT_CREATE_DECLARATIN. */
    application.converter.on(converter_1.Converter.EVENT_CREATE_DECLARATION, (context, reflection, node) => {
        if (!reflection.comment)
            return;
        if (reflection.getFullName().includes('action-creators/index.ts')) {
            const { text } = node.getSourceFile();
            const moduleComment = getModuleComment(text);
            reflection.comment = comment_1.parseComment(moduleComment);
        }
        /** Re-define all Modules as External. */
        if (reflection.kindOf(abstract_1.ReflectionKind.Module)) {
            reflection.setFlag(abstract_1.ReflectionFlag.External);
            // reflection.kind = reflection.kind === ReflectionKind.EternalModule
        }
        if (!node)
            return;
        /** Get comment from current node, which declaration is being created. */
        const rawComment = comment_1.getRawComment(node);
        if (!rawComment)
            return;
        /** If comment was added (e.g. for function, constants etc) - do nothing, otherwise (for modules without @packageDocumentation tag, which comment property is empty) add parsed comment. */
        reflection.comment = comment_1.parseComment(rawComment);
    });
}
exports.load = load;
