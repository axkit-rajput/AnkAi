/*
 * Shared failure shape for graph nodes.
 *
 * Nodes are not allowed to throw: LangGraph would abort the whole run and the
 * controller would lose the reason. Instead they return this, and the
 * controller turns `failed` into a real HTTP status without persisting the
 * error text as an assistant message.
 */
export const agentFailure = (state, error, fallback, extra = {}) => {
    console.error(
        `${state?.agent || "agent"} failed:`,
        error?.stack || error?.message || error
    )

    return {
        ...state,
        aiResponse: error?.data?.message || fallback,
        failed: true,
        failedStatus: error?.status || 502,
        ...extra
    }
}

/* Marks a node's return value as a successful run, clearing any flag an
   upstream node may have set. */
export const agentSuccess = (state, patch) => ({
    ...state,
    failed: false,
    failedStatus: null,
    ...patch
})
