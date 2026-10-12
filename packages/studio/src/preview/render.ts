import type { Composition } from "@hypit/composition";
import { compileHtmlProgram } from "@hypit/html-program";
import type { HtmlProgram } from "@hypit/html-program";
import { compileAudioProgramPlan } from "@hypit/media-operations";
import type { Timeline } from "@hypit/timeline";

import { renderHtmlDocumentProgram } from "@hypit/html-document";

export type RenderInput = {
  readonly composition: Composition;
  readonly timeline: Timeline;
  /** Resources Studio can serve for material selected by the Run. */
  readonly served?: ReadonlySet<string>;
};

/**
 * Compile the interpreted Tracks into the same HTML renderer document the real
 * renderer photographs frame by frame, and hand it back as an `iframe` srcdoc.
 *
 * Nothing is approximated here: placement, stacking, clipping, motion and
 * material all come from the projection selected by the Run.
 */
export function renderPreview(input: RenderInput): string {
  return renderStudioHtmlProgram(input).preview;
}

/** The same compiled picture serves immediate frame capture and interactive playback. */
export function renderStudioHtmlProgram(input: RenderInput): { readonly document: HtmlProgram; readonly html: string; readonly preview: string } {
  const document = compileHtmlProgram(input.composition, input.timeline);
  const rendered = renderHtmlDocumentProgram(document, compileAudioProgramPlan(input.composition, input.timeline), (artifact) => {
    if (input.served?.has(artifact.resource) !== true) {
      throw new Error(`Preview references unavailable Artifact ${artifact.resource}.`);
    }
    return `/__studio/material/${artifact.resource}`;
  });
  return { document, ...rendered };
}
