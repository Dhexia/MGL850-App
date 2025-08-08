// Re-export all functions from modular API
export * from './api';

// Ensure fetchBoatsFromBackend is exported for backward compatibility
export { fetchBoatsFromBackend, clearBoatsCache } from './api/boats-ui.api';