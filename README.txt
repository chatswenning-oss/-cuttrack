CutTrack v47 — Stability Fix (audited)

Critical stability repair:
- Removed two document-wide MutationObservers left over from layered target UI versions.
- These observers watched the entire app DOM and repeatedly re-ran target wiring/unification whenever any screen rendered or changed.
- This could create heavy main-thread churn on iPhone Safari and make the UI appear frozen/unresponsive.
- No visual redesign in this repair.
- Existing cuttrack_v9 local data remains compatible.
