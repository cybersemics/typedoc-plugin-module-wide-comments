import {PluginHost} from 'typedoc/dist/lib/utils'
import { Converter, Context } from 'typedoc/dist/lib/converter'
import { getRawComment, parseComment } from "typedoc/dist/lib/converter/factories/comment"
import { ReflectionFlag, ReflectionKind } from 'typedoc/dist/lib/models/reflections/abstract'
import { DeclarationReflection } from 'typedoc'
const ts = require('typescript')


function getModuleComment(text) {
  const hasModuleComment = text.slice(0, 3) === '/**'
  if (!hasModuleComment) return 0
  const endCommentIndex = text.indexOf('*/')
  const comment = text.slice(3, endCommentIndex).trim()
  return comment
  // const parsedComment = comment.split('\n')
  //   .map(line => line.replace(/^\s+\*+\s+/i, ''))
  //   .join('\n')

  // return pase
}

export function load({application}: PluginHost) {
  /** Subscribe on EVENT_CREATE_DECLARATIN. */
  application.converter.on(Converter.EVENT_CREATE_DECLARATION, (context: Context, reflection: DeclarationReflection, node) => {

    if (!reflection.comment) return

    if (reflection.getFullName().includes('action-creators/index.ts')) {
      const { text}  = node.getSourceFile()
      const moduleComment = getModuleComment(text)
      reflection.comment = parseComment(moduleComment)
    }

    /** Re-define all Modules as External. */
    if (reflection.kindOf(ReflectionKind.Module)) {
      reflection.setFlag(ReflectionFlag.External)
      // reflection.kind = reflection.kind === ReflectionKind.EternalModule
    }
    if (!node) return

    /** Get comment from current node, which declaration is being created. */
    const rawComment = getRawComment(node)
    if (!rawComment) return 
    /** If comment was added (e.g. for function, constants etc) - do nothing, otherwise (for modules without @packageDocumentation tag, which comment property is empty) add parsed comment. */
    reflection.comment = parseComment(rawComment)
  })
}