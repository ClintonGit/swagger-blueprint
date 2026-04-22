/**
 * @prettier
 */
import React from "react"
import PropTypes from "prop-types"
import cx from "classnames"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"
import rehypeRaw from "rehype-raw"
import rehypeHighlight from "rehype-highlight"
import { OAS3ComponentWrapFactory } from "../helpers"
import MermaidBlock from "core/components/MermaidBlock"

const REMARK_PLUGINS = [remarkGfm, remarkBreaks]
const REHYPE_PLUGINS_SAFE = [rehypeHighlight]
const REHYPE_PLUGINS_UNSAFE = [rehypeRaw, rehypeHighlight]

function buildComponents() {
  return {
    a({ href, children, ...props }) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      )
    },

    code({ className, children, ...props }) {
      const language = /language-(\w+)/.exec(className || "")?.[1] ?? ""

      if (language === "mermaid") {
        return <MermaidBlock source={String(children).trim()} />
      }

      return (
        <code className={cx(className)} {...props}>
          {children}
        </code>
      )
    },

    table({ children, ...props }) {
      return (
        <div className="markdown-table-wrapper">
          <table {...props}>{children}</table>
        </div>
      )
    },

    input({ type, checked, ...props }) {
      if (type === "checkbox") {
        return (
          <input
            type="checkbox"
            checked={checked}
            readOnly
            className="markdown-task-checkbox"
            {...props}
          />
        )
      }
      return <input type={type} {...props} />
    },
  }
}

export const Markdown = ({
  source,
  className = "",
  getConfigs = () => ({ useUnsafeMarkdown: false }),
}) => {
  if (typeof source !== "string" || !source) {
    return null
  }

  const { useUnsafeMarkdown } = getConfigs()
  const rehypePlugins = useUnsafeMarkdown ? REHYPE_PLUGINS_UNSAFE : REHYPE_PLUGINS_SAFE

  return (
    <div className={cx(className, "renderedMarkdown")}>
      <ReactMarkdown
        remarkPlugins={REMARK_PLUGINS}
        rehypePlugins={rehypePlugins}
        components={buildComponents()}
      >
        {source}
      </ReactMarkdown>
    </div>
  )
}

Markdown.propTypes = {
  source: PropTypes.string,
  className: PropTypes.string,
  getConfigs: PropTypes.func,
}

export default OAS3ComponentWrapFactory(Markdown)
