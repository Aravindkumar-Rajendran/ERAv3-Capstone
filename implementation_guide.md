Tasks
[x] Chat History
    [x] Update frontend to display the chat history (view-only, max 10 entries)

[ ] Interactive history
    [ ] Update backend for storage (store up to 10 most recent interactive elements per user)
    [ ] Update backend for providing the route to share the history
    [ ] Update the frontend to display the interactive element history as a sidebar list (max 10, view-only)
    [ ] On click, open modal for specific content type

[x] Source history - Upload page
    - Maintain a history of all previously added sources (text, YouTube URLs, PDF uploads)
    [x] **Backend Phase**
        [x] Update/create source model in the database (fields: id, user_id, source_type, source_name, source_content/source_url, created_at)
        [x] Endpoint to add a new source (text, YouTube URL, PDF) with LLM-based naming
        [x] Endpoint to list sources for the current user (max 10, with id, source_name, source_type, created_at)
        [x] Endpoint to fetch preview of a specific source by id
    [x] **Frontend Phase**
        [x] Display a list of the user's most recent 10 sources with icons and names
        [x] Modal/side panel to preview source content (text, YouTube, PDF)
        [x] UI controls for uploading new sources (text, YouTube URL, PDF)
        [x] Tailwind-based consistent styling for source list and modals

[ ] Revamp UI
    [ ] Create and maintain a continuously updated design notebook (design system) for WhiZardLM
    [ ] Tailwind-based consistent styling
    [ ] Beautify the UI (modern, intuitive, no special accessibility/i18n requirements)
