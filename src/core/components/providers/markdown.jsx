/**
 * @prettier
 */
import React from "react"
import PropTypes from "prop-types"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"
import rehypeRaw from "rehype-raw"
import rehypeHighlight from "rehype-highlight"
import cx from "classnames"
import MermaidBlock from "../MermaidBlock"

// ── Plugin stacks ─────────────────────────────────────────────────────────────
// remark plugins run on the Markdown AST (before HTML)
const REMARK_PLUGINS = [
  remarkGfm,      // tables, task lists, strikethrough, autolinks
  remarkBreaks,   // soft line-breaks → <br>
]

// rehype plugins run on the HTML AST (after Markdown → HTML)
const REHYPE_PLUGINS_SAFE = [
  rehypeHighlight, // syntax highlighting for code blocks
]

const REHYPE_PLUGINS_UNSAFE = [
  rehypeRaw,       // allow raw HTML embedded in Markdown
  rehypeHighlight,
]

// ── Custom component renderers ────────────────────────────────────────────────
function buildComponents() {
  return {
    // All links open in new tab with safe rel
    a({ href, children, ...props }) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      )
    },

    // Code blocks: intercept ```mermaid, otherwise render normally
    code({ className, children, ...props }) {
      const language = /language-(\w+)/.exec(className || "")?.[1] ?? ""

      if (language === "mermaid") {
        return <MermaidBlock source={String(children).trim()} />
      }

      return (
        <code className={cx(className, language && `language-${language}`)} {...props}>
          {children}
        </code>
      )
    },

    // Tables: add wrapper div for horizontal scroll on small screens
    table({ children, ...props }) {
      return (
        <div className="markdown-table-wrapper">
          <table {...props}>{children}</table>
        </div>
      )
    },

    // Task list items: keep checkbox but make label clickable-looking
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

// ── Main component ─────────────────────────────────────────────────────────────
function Markdown({ source, className = "", getConfigs = () => ({ useUnsafeMarkdown: false }) }) {
  if (typeof source !== "string") {
    return null
  }

  const { useUnsafeMarkdown } = getConfigs()
  const rehypePlugins = useUnsafeMarkdown ? REHYPE_PLUGINS_UNSAFE : REHYPE_PLUGINS_SAFE

  return (
    <div className={cx(className, "markdown")}>
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
  source: PropTypes.string.isRequired,
  className: PropTypes.string,
  getConfigs: PropTypes.func,
}

export default Markdown

// Keep sanitizer export for backward-compat (used by oas3 markdown wrapper)
export function sanitizer(str) {
  return str
}
sanitizer.hasWarnedAboutDeprecation = false
