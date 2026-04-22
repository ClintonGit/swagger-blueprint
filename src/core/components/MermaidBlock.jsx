/**
 * @prettier
 */
import React, { useEffect, useLayoutEffect, useRef, useState, useId } from "react"
import PropTypes from "prop-types"

// Lazy-load mermaid — ~2.5MB, only fetched when a diagram is present
async function renderMermaidDiagram(id, code) {
  const { default: mermaid } = await import(
    /* webpackChunkName: "mermaid" */
    /* webpackMode: "lazy" */
    "mermaid"
  )

  mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    useMaxWidth: false,
    themeVariables: {
      // ── Base / flowchart ──────────────────────────────────────────────
      background:          "#0a0f1e",
      primaryColor:        "#1e1b4b",
      primaryTextColor:    "#e2e8f0",
      primaryBorderColor:  "#6366f1",
      secondaryColor:      "#0f1623",
      tertiaryColor:       "#161e2e",
      lineColor:           "#818cf8",
      textColor:           "#e2e8f0",
      mainBkg:             "#0f1623",
      nodeBorder:          "#6366f1",
      clusterBkg:          "#161e2e",
      titleColor:          "#e2e8f0",
      edgeLabelBackground: "#0f1623",
      // ── Sequence diagram ──────────────────────────────────────────────
      actorBkg:            "#1e1b4b",
      actorBorder:         "#6366f1",
      actorTextColor:      "#e2e8f0",
      actorLineColor:      "#6366f1",
      signalColor:         "#818cf8",
      signalTextColor:     "#e2e8f0",
      labelBoxBkgColor:    "#0f1623",
      labelBoxBorderColor: "#6366f1",
      labelTextColor:      "#e2e8f0",
      loopTextColor:       "#e2e8f0",
      noteBorderColor:     "#6366f1",
      noteBkgColor:        "#1e1b4b",
      noteTextColor:       "#e2e8f0",
      activationBorderColor: "#818cf8",
      activationBkgColor:  "#1e1b4b",
      sequenceNumberColor: "#e2e8f0",
      // ── ER diagram ────────────────────────────────────────────────────
      attributeBackgroundColorOdd:  "#0f1623",
      attributeBackgroundColorEven: "#161e2e",
    },
    securityLevel: "strict",
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  })

  const { svg } = await mermaid.render(id, code)

  // Strip hardcoded width/height — getBBox() will set the real viewBox after DOM paint
  return svg
    .replace(/\s+width="[^"]*"/, "")
    .replace(/\s+height="[^"]*"/, "")
    .replace(/\bmax-width:[^;";]+;?/g, "")
}

export default function MermaidBlock({ source }) {
  const [state, setState] = useState("loading") // loading | rendered | error | raw
  const [svg, setSvg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [showRaw, setShowRaw] = useState(false)
  const diagramRef = useRef(null)
  const uid = useId().replace(/:/g, "")
  const diagramId = `mermaid-${uid}`

  useEffect(() => {
    let cancelled = false

    renderMermaidDiagram(diagramId, source)
      .then((rendered) => {
        if (!cancelled) {
          setSvg(rendered)
          setState("rendered")
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setErrorMsg(err?.message || "Invalid diagram syntax")
          setState("error")
        }
      })

    return () => {
      cancelled = true
    }
  }, [source, diagramId])

  // After SVG is painted to real DOM, getBBox() gives the actual drawn content
  // bounding box — use it to tighten the viewBox and eliminate blank whitespace.
  useLayoutEffect(() => {
    if (state !== "rendered" || !diagramRef.current) return
    const svgEl = diagramRef.current.querySelector("svg")
    if (!svgEl) return
    try {
      const bbox = svgEl.getBBox()
      if (bbox.width > 0 && bbox.height > 0) {
        // Tighten viewBox to actual drawn content — eliminates blank padding
        svgEl.setAttribute("viewBox", `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`)
        // Use natural content width; CSS max-width: 100% prevents overflow
        svgEl.setAttribute("width", String(Math.ceil(bbox.width)))
        svgEl.setAttribute("height", String(Math.ceil(bbox.height)))
        svgEl.style.cssText = "display: block; max-width: 100%; height: auto;"
      }
    } catch (_) {
      // SVG not yet in layout (display:none, detached) — skip silently
    }
  }, [state, svg])

  const toggleRaw = () => setShowRaw((v) => !v)

  if (state === "loading") {
    return (
      <div className="mermaid-block mermaid-block--loading" aria-label="Loading diagram">
        <div className="mermaid-block__skeleton">
          <div className="mermaid-block__shimmer" />
        </div>
      </div>
    )
  }

  if (state === "error") {
    return (
      <div className="mermaid-block mermaid-block--error" role="alert">
        <div className="mermaid-block__error-banner">
          <span className="mermaid-block__error-icon">⚠</span>
          <span>Could not render diagram — {errorMsg}</span>
          <button
            className="mermaid-block__toggle-btn"
            onClick={toggleRaw}
            aria-expanded={showRaw}
          >
            {showRaw ? "Hide source" : "Show source"}
          </button>
        </div>
        {showRaw && (
          <pre className="mermaid-block__raw-code">
            <code>{source}</code>
          </pre>
        )}
      </div>
    )
  }

  return (
    <div className="mermaid-block mermaid-block--rendered">
      <div className="mermaid-block__corner mermaid-block__corner--tl" />
      <div className="mermaid-block__corner mermaid-block__corner--tr" />
      <div className="mermaid-block__corner mermaid-block__corner--bl" />
      <div className="mermaid-block__corner mermaid-block__corner--br" />

      <div
        ref={diagramRef}
        className="mermaid-block__diagram"
        dangerouslySetInnerHTML={{ __html: svg }} // eslint-disable-line react/no-danger
        aria-label="Diagram"
      />

      <div className="mermaid-block__toolbar" aria-label="Diagram actions">
        <button
          className="mermaid-block__toolbar-btn"
          onClick={toggleRaw}
          title={showRaw ? "Show diagram" : "Show source"}
          aria-label={showRaw ? "Show diagram" : "Show Mermaid source"}
        >
          {"</>"}
        </button>
      </div>

      {showRaw && (
        <pre className="mermaid-block__raw-code">
          <code>{source}</code>
        </pre>
      )}
    </div>
  )
}

MermaidBlock.propTypes = {
  source: PropTypes.string.isRequired,
}
